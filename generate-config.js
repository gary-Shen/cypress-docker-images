// this script generates CircleCI config file by looking at the "base/*" folders
// for each subfolder it creates a separate job
const globby = require('globby');
const fs = require('fs')
const path = require('path')

const preamble = `
# WARNING: this file is automatically generated by ${path.basename(__filename)}
# info on building Docker images on Circle
# https://circleci.com/docs/2.0/building-docker-images/
version: 2.1

buildFilters: &buildFilters
  filters:
    branches:
      only:
        - master
        - add-circle-build

commands:
  halt-on-branch:
    description: Halt current CircleCI job if not on master branch
    steps:
      - run:
          name: Halting job if not on master branch
          command: |
            if [[ "$CIRCLE_BRANCH" != "master" ]]; then
              echo "Not master branch, will skip the rest of commands"
              circleci-agent step halt
            else
              echo "On master branch, can continue"
            fi

  docker-push:
    description: Log in and push a given image to Docker hub
    parameters:
      imageName:
        type: string
        description: Docker image name to push
    steps:
      - run:
          name: Pushing image << parameters.imageName >> to Docker Hub
          command: |
            echo "$DOCKERHUB_PASS" | docker login -u "$DOCKERHUB_USERNAME" --password-stdin
            docker push << parameters.imageName >>

jobs:
  build-base-image:
    machine: true
    parameters:
      dockerName:
        type: string
        description: Image name to build
        default: cypress/base
      dockerTag:
        type: string
        description: Image tag to build like "12.14.0"
    steps:
      - checkout
      - run:
          name: Check if image exists
          # using https://github.com/mishguruorg/docker-image-exists
          # to check if Docker hub has the image already
          command: |
            if npx docker-image-exists --quiet --repo << parameters.dockerName >>:<< parameters.dockerTag >>; then
              echo Found image << parameters.dockerName >>:<< parameters.dockerTag >>
              circleci-agent step halt
            else
              echo Did not find Docker image << parameters.dockerName >>:<< parameters.dockerTag >>
            fi
      - run:
          name: building Docker image << parameters.dockerName >>:<< parameters.dockerTag >>
          command: |
            docker build -t << parameters.dockerName >>:<< parameters.dockerTag >> .
          working_directory: base/<< parameters.dockerTag >>

      - run:
          name: test built image
          command: |
            docker build -t cypress/test -\\<<EOF
            FROM << parameters.dockerName >>:<< parameters.dockerTag >>
            RUN echo "current user: $(whoami)"
            ENV CI=1
            RUN npm init --yes
            RUN npm install --save-dev cypress
            RUN ./node_modules/.bin/cypress verify
            RUN npx @bahmutov/cly init
            RUN ./node_modules/.bin/cypress run
            EOF

      - halt-on-branch
      - docker-push:
          imageName: << parameters.dockerName >>:<< parameters.dockerTag >>

workflows:
  version: 2
`

const formBaseWorkflow = (baseImages) => {
  const yml = baseImages.map(imageAndTag => {
    // important to have indent
    const job = '      - build-base-image:\n' +
      `          name: "${imageAndTag.tag}"\n` +
      `          dockerTag: "${imageAndTag.tag}"\n` +
      '          <<: *buildFilters\n'
    return job
  })

  // indent is important
  const baseWorkflowName = '  build-base-images:\n' +
    '    jobs:\n'

  const text = baseWorkflowName + yml.join('')
  return text
}

const writeConfigFile = (baseImages) => {
  const base = formBaseWorkflow(baseImages)
  const text = preamble + base
  fs.writeFileSync('circle.yml', text, 'utf8')
  console.log('generated circle.yml')
}

(async () => {
  const paths = await globby('base/*', {onlyDirectories: true});

  const namePlusTag = paths.map(path => {
    const [name, tag] = path.split('/')
    return {
      name,
      tag
    }
  })
  console.log(namePlusTag)
  writeConfigFile(namePlusTag)
})();