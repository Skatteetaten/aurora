#!/usr/bin/env groovy
def jenkinsfile

def overrides = [
    scriptVersion  : 'v7',
    pipelineScript: 'https://git.aurora.skead.no/scm/ao/aurora-pipeline-scripts.git',
    iqOrganizationName: "Team AOS",
    iqBreakOnUnstable: false,
    iqEmbedded: true,
    lineCoverageReport: false,
    npmInstallCommand: "ci",
    nodeVersion: "16",
    credentialsId: "github",
    versionStrategy: [
      [ branch: 'master', versionHint: '0']
    ],
    github: [
      enabled: env.BRANCH_NAME == "master",
      deployToGHPagesCmd: "npm run deploy"
    ]
]

fileLoader.withGit(overrides.pipelineScript, overrides.scriptVersion) {
  jenkinsfile = fileLoader.load('templates/webleveransepakke')
}

jenkinsfile.run(overrides.scriptVersion, overrides)