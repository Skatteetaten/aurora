---
icon: "subject"
title: "Aurora Config"
description: "Opinoinated way of configuring cloud applications"
---

Aurora Config is an opinoinated way of configuring how namespaces and applications are applied to an OpenShift cluster.

Config files are written either as Json or Yaml. All the examples will use YAML since it is easier on the eyes.

The process for parsing an AuroraConfig is as follows

* find relevant files
* extract and validate header
* extract DeploymentSpec

Extracting is done in a process where the paths from the below tables are matched against the available files. The most specific location is chosen.

### Dictionary

AuroraConfig: A set of files that share the same schemaVersion and affiliation. Files are either json or yaml.
LocalTemplate: An AuroraConfig can contain a templates folder with OpenShift template files.
Template: Other templates are referenced from the default namespace in your cluster.
ApplicationId: Indentify an Application. Contains the name of the application and an environment(affiliation and env name)
DeploymentSpec: Result of applying an ApplicationId to a given AuroraConfig

### Files

Given that you have an application with name 'reference' in the environment 'dev' the following files will be present

Note that the suffix of the file can be either json or yaml

| filename     | name   | reason                                                                      |
| ------------ | ------ | --------------------------------------------------------------------------- |
| about.yaml   | global | All applications in a given AuroraConfig will inherit from it               |
| foo.yaml     | base   | All applications named 'reference' in all environments will inherit from it |
| dev.yaml     | env    | All applications in the env 'dev' inhert from it                            |
| dev/foo.yaml | app    | Instructons on how to deploy the application 'reference' in 'dev'           |

In order to generate an DeploymentSpec for a given ApplicationId files are read in the order specified above and merged together.
Information about what file contains what instruction is recorded so that it is possible to get a birds eye view over a DeploymentSpec and where the different instructions come from.

It is possible to change the base and env file in a given app file if you want to compose your configuration.

utv/reference.yaml

```yaml
baseFile: foo.yaml
envFile: about-template.yaml
```

In this scenario 'foo.yaml' would be used instead of 'reference.yaml' as the base file and the 'about-template.yaml' file would be used instead of 'about.yaml'

### Header

Some instructions are read as a header. This is done in order to provide sane defaults for the rest of the process.

Some of the header fields must be specified in an about file. The environment and permissions must be the same for all applications.

| path                            | default     | description                                                                                                                                                                                              |
| ------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| _affiliation_                   |             | Used to group the project for resource monitoring. All projects start with affiliation. lower case letters max length 10. Required.                                                                      |
| envName                         | $folderName | Change the name of the project. Note that the default value here is the actual name of the folder where the app file is. This option must be specified in either global or env file.                     |
| env/name                        |             | An alias for envName                                                                                                                                                                                     |
| env/ttl                         |             | Set a time duration in format 1d, 12h aso that indicate how long until this namespace should be deleted                                                                                                  |
| _permissions/admin_             |             | The groups in OpenShift that will have the admin role for the given project. Can either be an array or a space delimitered string. This option must be specified in either global or env file. Required. |
| permissions/view                |             | The groups in OpenShift that will have the view role for the given project. Can either be an array or a space delimitered string. This option must be specified in either global or env file.            |
| permissions/adminServiceAccount |             | The serviceaccounts in OpenShift that will have the admin role for the given project. Can either be an array or a space delimitered string. This option must be specified in either global or env file.  |

Other fields can be specified in any file

| path                | default   | description                                                                                                                                                                                                           |
| ------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| _schemaVersion_     |           | All files in a given AuroraConfig must share a schemaVersion. For now only v1 is supported, it is here incase we need to break compatability. Required.                                                               |
| _type_              |           | What type of flow does this application follow. Options here are [deploy, development, template, localTemplate]                                                                                                       |
| applicationPlatform | java      | Specify application platform. java or web are valid plattforms. Is only used if type is deploy/development.                                                                                                           |
| name                | $fileName | The name of the application. All objects created in the cluster will get an app label with this name. Cannot be longer then 40 (alphanumeric -). Note that the default value here is the actual name of the app file. |
| _cluster_           |           | What cluster should the application be deployed to. Must be a valid cluster name.                                                                                                                                     |
| ttl                 |           | Set a time duration in format 1d, 12h aso that indicate how long until this application should be deleted                                                                                                             |
| _version_           |           | Version of the application to run. Can be set to any of the valid version strategies. TODO: Link to them                                                                                                              |
| segment             |           | The segment the application exist in. 

### Substitution

Some fields fromt header are available as substitutions when specifying the rest of the configuration

* affiliation
* cluster
* env
* name
* segment

In order to include these into a field surround them with '@'. An example

```
config/cluster : "@cluster@"
```

This will create a config value with the actual value of the cluster.

### Extracting DeploymentSpec

#### Generate application from Delivery Bundle

If you use the type deploy og development the application objects are generated using a Kotlin DSL from the following fields

| path                   | default     | description                                                                                                                                                  |
| ---------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| releaseTo              |             | Used to release a given version as a shared tag in the docker registry. Other env can then use it in 'version'. NB! Must be manually updated with ao/console |
| path                   | default     | description                                                                                                                                                  |
| debug                  | false       | Toggle to enable remote debugging on port 5005. Port forward this port locally and setup remote debugging in your Java IDE.                                  |
| deployStrategy/type    | rolling     | Specify type of deployment, either rolling or recreate                                                                                                       |
| deployStrategy/timeout | 180         | Set timeout value in seconds for deployment process                                                                                                          |
| resources/cpu/min      | 100m        | Specify minimum/request cpu. 1000m is 1 core.                                                                                                                |
| resources/cpu/max      | 2000m       | Specify maximum/limit cpu.                                                                                                                                   |
| resources/memory/min   | 128Mi       | Specify minimum/request memory.                                                                                                                              |
| resources/memory/max   | 512Mi       | Specify maximum/limit memory. By default 25% of this will be set to XMX in java.                                                                             |
| groupId                |             | groupId for your application. Max 200 length. Required if deploy/development                                                                                 |
| artifactId             | $fileName   | artifactId for your application. Max 50 length                                                                                                               |
| splunkIndex            |             | Set to a valid splunk-index to log to splunk. Only valid if splunk is enabled in the Aurora API                                                              |
| serviceAccount         |             | Set to an existing serviceAccount if you need special privileges                                                                                             |
| prometheus             | true        | Toggle to false if application do not have Prometheus metrics                                                                                                |
| prometheus/path        | /prometheus | Change the path of where prometheus is exposed                                                                                                               |
| prometheus/port        | 8081        | Change the port of where prometheus is exposed                                                                                                               |
| management             | true        | Toggle of if your application does not expose an management interface                                                                                        |
| management/path        | /actuator   | Change the path of where the management interface is exposed                                                                                                 |
| management/port        | 8081        | Change the port of where the management interface is exposed                                                                                                 |
| readiness              | true        | Toggle to false to turn off default readiness check                                                                                                          |
| readiness/path         |             | Set to a path to do a GET request to that path as a readiness check                                                                                          |
| readiness/port         | 8080        | If no path present readiness will check if this port is open                                                                                                 |
| readiness/delay        | 10          | Number of seconds to wait before running readiness check                                                                                                     |
| readiness/timeout      | 1           | Number of seconds timeout before giving up readiness                                                                                                         |
| liveness               | false       | Toggle to true to enable liveness check                                                                                                                      |
| liveness/path          |             | Set to a path to do a GET request to that path as a liveness check                                                                                           |
| liveness/port          | 8080        | If no path present liveness will check if this port is open                                                                                                  |
| liveness/delay         | 10          | Number of seconds to wait before running livenss check                                                                                                       |
| liveness/timeout       | 1           | Number of seconds timeout before giving up livenss                                                                                                           |
| replicas               | 1           | Number of replicas of this application to run.                                                                                                               |
| pause                  | false       | Toggle to pause an application. This will scale it down to 0 and add a label showing it is paused.                                                           |

#### Generate application from template

If type is template or local template the application objects are generated by applying the template from the following fields.

| path             | default | description                                                                                                                   |
| ---------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------- |
| template         |         | Name of template in default namespace to use. This is required if type is template                                            |
| templateFile     |         | Set the location of a local template file. It should be in the templates subfolder. This is required if type is localTemplate |
| parameters/<KEY> |         | set value for a parameter in the template.                                                                                    |

When creating templates the following guidelines should be followed:
 - include the following parameters VERSION, NAME and if apropritate REPLICAS. They will be populated from relevant AuroaConfig fields
 - the following labels will be added to the template: app, affiliation, updatedBy
 - if the template does not have a VERSION parameter it will not be upgradable from internal web tools
  

### Encrich the application with provisioning NTA resources

| path                   | default                     | description                                                                                                                         |
| ---------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| webseal                | false                       | Toggle to expose application through WebSeal.                                                                                       |
| webseal/host           | $name-$affiliation-$envName | Set this to change the default prefix in WebSeal                                                                                    |
| webseal/roles          |                             | Set roles required to access this route. This can either be set as CSV or as an array of strings                                    |
| certificate            | false                       | Toggle to add a certificate with CommonName $groupId.$artifactId.                                                                   |
| certificate/commonName |                             | Generate an STS certificate with the given commonName.                                                                              |
| database               | false                       | Toggle this to add a database with $name to your application.                                                                       |
| database/<name>        |                             | If you want to add multiple databases specify a name for each. Set the value to 'auto' for auto generation or a given ID to pin it. |

NTA has the following technologies that can be automated with the above fields

* Webseal is used for client trafic from within NTA to reach an application. Internal tax workers have roles that can be added to limit who can access the application
* STS certificate: An SSL certificate with a given commonName is used to identify applications to secure trafic between them
* Oracle Databases: We haven a DBH-api that expose functionality to auto provision a Oracle schema on a shared server. The API can also handle manual SQL connections for you so the application can get the crendentials in one way

These integrations are avilable for all types however note that if you want to use webseal with a template type you need to create a Service with default ports named after the name parameter

#### Exposing an application via HTTP

The default behavior is that the application is only visible to other application in the same namespace using
its service name.  

In order to control routes into the application the following fields can be used.

| path                                | default                    | description                                                                                                                                        |
| ----------------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| route                               | false                      | Toggle to expose application via HTTP. Routes can also be configured with expanded syntax. And routeDefault can be set for all routes. See below.  |
| route/<routename>/host              |                            | Set the host of a route according to the given pattern. If not specified the default will be routeDefault/host                                                                                            |
| route/<routename>/path              |                            | Set to create a path based route. You should use the same name/affiliation/env/seperator combination for all path based routes to get the same URL |
| route/<routename>/annotations/<key> |                            | Set annotations for a given route. Note that you should use                                                                                        | instead of / in annotation keys. so 'haproxy.router.openshift.io | balance'. See https://docs.openshift.com/container-platform/3.5/architecture/core_concepts/routes.html#route-specific-annotations[route annotations] for some options. |
| routeDefaults/host                  | @name@-@affiliation@-@env@ | Set the host of a route according to the given pattern.                                                                                            |
| routeDefaults/path                  |                            | Set to create a path based route. You should use the same name/affiliation/env/seperator combination for all path based routes to get the same URL |
| routeDefaults/annotations/<key>     |                            | Set annotations for a given route. Note that you should use                                                                                        | instead of / in annotation keys. so 'haproxy.router.openshift.io | balance'. See https://docs.openshift.com/container-platform/3.5/architecture/core_concepts/routes.html#route-specific-annotations[route annotations] for some options. |

Route annotations are usable for template types but you need to create a Service with name after the NAME parameter yourself.

### Example configuration

#### Simple reference-application

Below is an example of how you could configure an instance of the [reference application](https://github.com/skatteetaten/openshift-reference-springboot-server)

about.yaml

```yaml
schemaVersion: v1
affiliation: paas
permissions :
  group : [PAAS_OPS, PAAS_DEV]
splunkIndex : paas-test
```

reference.yaml

```yaml
groupId: no.skatteetaten.aurora.openshift
artifactId: openshift-reference-springboot-server
version: 1
type: deploy
replicas: 3
certificate: true
route: true
database: true
config:
  FOO: BAR
```

dev/about.yaml

```yaml
cluster: dev
```

dev/reference.yaml

```yaml
config:
  FOO: BAZ
```

The complete config is then evaluated as

```yaml
schemaVersion: v1
affiliation: paas
permissions :
  group : [PAAS_OPS, PAAS_DEV]
splunkIndex : paas-test
groupId: no.skatteetaten.aurora.openshift
artifactId: openshift-reference-springboot-server
version: 1
type: deploy
replicas: 3
certificate: true
route: true
database: true
config:
  FOO: BAZ
cluster: dev
```

#### Applying template with NTA integrations

about.yaml
```yaml
schemaVersion: v1
affiliation: paas
permissions :
  group : [PAAS_OPS, PAAS_DEV]
splunkIndex : paas-test
```

sample-atomhopper.yaml

```yaml
type: template
template: aurora-atomhopper
database: true
route: true
parameters:
  FEED_NAME: feed
  DB_NAME: atomhopper
  DOMAIN_NAME: localhost
```

dev/about.yaml

```yaml
cluster: dev
```

dev/sample-atomhopper.yaml

empty file

The complete config is then evaluated as

```yaml
schemaVersion: v1
affiliation: paas
permissions :
  group : [PAAS_OPS, PAAS_DEV]
splunkIndex : paas-test
type: template
template: aurora-atomhopper
database: true
route: true
parameters:
  FEED_NAME: feed
  DB_NAME: atomhopper
  DOMAIN_NAME: localhost
```
