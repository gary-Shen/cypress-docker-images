# WARNING: this file was autogenerated by generate-included-image.js
# using
#   npm run add:included -- 12.0.2 cypress/browsers:node16.16.0-chrome107-ff107-edge
set e+x

LOCAL_NAME=cypress/included:12.0.2
echo "Building $LOCAL_NAME"
docker build -t $LOCAL_NAME .
