#!/usr/bin/env groovy

Map<String, Object> props = [
  credentialsId                : 'github',
  nodeVersion                  : null  //possible values are 'node-6' and 'node-8', or whatever various node versions have been defined as in jenkins-master
]

def withGitCredentials(operations) {
  try {
    withCredentials([[$class: 'UsernamePasswordMultiBinding',
                      credentialsId: props.credentialsId,
                      usernameVariable: 'GIT_USERNAME',
                      passwordVariable: 'GIT_PASSWORD']]) {
      git.setGitConfig()
      sh("git config credential.username ${env.GIT_USERNAME}")
      sh("git config credential.helper '!echo password=\$GIT_PASSWORD; echo'")

      operations()
    }
  } finally {
    sh("git config --unset credential.username")
    sh("git config --unset credential.helper")
  }
}

def git
def npm

fileLoader.withGit('https://git.aurora.skead.no/scm/ao/aurora-pipeline-scripts.git', 'v4') {
  git = fileLoader.load('git/git')
  npm = fileLoader.load('node.js/npm')
}

node {
  if (env.BRANCH_NAME != "master") {
    currentBuild.result = 'ABORTED'
    error('Branch is not master')
  }

  if (props.nodeVersion) {
    echo 'Using Node version: ' + props.nodeVersion
    npm.setVersion(props.nodeVersion)
  }

  stage('Clean Workspace') {
    deleteDir()
    sh 'ls -lah'
  }

  stage('Checkout') {
    checkout scm
  }


  stage('Init git submodule') {
    withGitCredentials {
      sh("git submodule init")
      sh("git submodule update")
    }
  }

  stage('Install') {
    npm.install()
  }

  stage('Build') {
    dir('gatsby-starter-skatteetaten/') {
      npm.build()
    }
  }

  stage('Deploy to GitHub') {
    String version = git.getTagFromCommit()
    currentBuild.displayName = "${version} (${currentBuild.number})"
    withGitCredentials {
      npm.run('run deploy:ci')
    }
  }

  stage('Clear workspace') {
    step([$class: 'WsCleanup'])
  }
}