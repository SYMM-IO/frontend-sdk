#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

cd ./apps/ 

for folder in */ ; do
    echo "Dvelopment Processing $folder..."

    cd "$folder"

    echo "removed .next"

    rm -rf .next

    yarn build

    cd ..

    echo "$folder processing complete."
done

cd ../ 

node ./useful_script/pre_build.js

cd ./packages/core

yalc publish

cd ../../apps

for folder in */ ; do
    echo "Production Processing $folder..."

    cd "$folder"

    rm -rf .next

    echo "removed .next"
    
    yalc add @symmio/frontend-sdk
    yarn build

    cd ..

    echo "$folder processing complete."
done

echo "All folders processed."

cd ../

node ./useful_script/post_build.js
