# WARNING: this file was autogenerated by generate-browser-image.js
# using
#   yarn add:browser -- 16.16.0 --chrome=105.0.5195.125 --firefox=99.0.1 --edge
set e+x

LOCAL_NAME=cypress/browsers:node16.16.0-chrome105-ff99-edge
echo "Building $LOCAL_NAME"
docker build -t $LOCAL_NAME .