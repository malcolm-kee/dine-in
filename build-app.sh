#!/bin/sh -e

usage() {
  echo "OVERVIEW: Build apps according to BUILD_ENV value. Meant to be used for Heroku deployment"
  exit
}

if [ "$1" = '-h' ] || [ "$1" = '--help' ]; then
  usage
fi

if [ "$BUILD_ENV" = "rest" ]; then
    yarn build:rest
elif [ "$BUILD_ENV" = "queue" ]; then
    yarn build:queue
elif [ "$BUILD_ENV" = "socket" ]; then
    yarn build:socket
else
    echo "Error: no build config for BUILD_ENV";
    exit 1;
fi