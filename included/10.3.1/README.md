<!--
WARNING: this file was autogenerated by generate-included-image.js using

    npm run add:included -- 10.3.1 cypress/browsers:node16.14.2-slim-chrome100-ff99-edge
-->

# cypress/included:10.3.1

Read [Run Cypress with a single Docker command][blog post url]

## Run tests

```shell
$ docker run -it -v $PWD:/e2e -w /e2e cypress/included:10.3.1
# runs Cypress tests from the current folder
```

**Note:** Currently, the linux/arm64 build of this image does not contain any browsers except Electron. See https://github.com/cypress-io/cypress-docker-images/issues/695 for more information.

[blog post url]: https://www.cypress.io/blog/2019/05/02/run-cypress-with-a-single-docker-command/