#!/bin/bash

build_args=""
version=$1

# while IFS='=' read -r key value; do
#     if [[ -n "$key" && -n "$value" ]]; then
#         build_args="$build_args --build-arg $key=$value"
#     fi
# done < .env

echo "Building Docker image with: $build_args"

docker build $build_args -t symmio:$version .