#!/bin/sh

TAG=${1:-latest}

docker buildx build --platform=linux/amd64 -t rasztabigab/fo:"${TAG}" . --push
