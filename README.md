# Aurora

Documentation for The Aurora Platform

## Initial setup

## How to build

The project is built using npm from the current Node LTS. Install with [nvm](https://github.com/creationix/nvm);

    nvm install --lts

Then run

    npm ci

to install the dependencies.

    npm start

will start a local web server and continuously build the documentation as you make changes.

## Deploying to github pages

To update the gh-pages branch and in turn publish to https://skatteetaten.github.io/aurora/ run

    npm deploy
