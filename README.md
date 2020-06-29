# Aurora

Documentation for The Aurora Platform

## Initial setup

Getting the gatsby-starter-skatteetaten module (TODO: Add more docs)

    git submodule init
    git submodule update

## How to build

The project is built using npm from the current Node LTS. Install with [nvm](https://github.com/creationix/nvm);

    nvm install --lts

Then run

    npm install

to install the dependencies.

    npm start

will start a local web server and continuously build the documentation as you make changes.

## Deploying to github pages

Before deploying, you need to set a jekyll theme in the GitHub Pages settings (see https://github.community/t/github-pages-are-not-published-after-following-the-documentation/10555). The "minimal" theme works fine.

To update the gh-pages branch and in turn publish to https://skatteetaten.github.io/aurora/ run

    npm deploy
