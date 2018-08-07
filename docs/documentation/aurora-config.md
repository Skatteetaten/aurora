---
icon: "bookmark"
title: "Aurora Config"
description: "Opinionated way of configuring cloud applications"
---

## What is Aurora Config?

TLDR; [Take me to the Configuration Reference!](#configuration-reference)

Aurora Config is a custom file based configuration format developed by the Norwegian Tax Administration designed to be a concise
representation of how applications are configured and deployed across environments and clusters in an OpenShift
based infrastructure. Parts of the configuration format is generally reusable by anybody deploying to OpenShift, while
other parts of it are designed to simplify integrations with specific third party components in our infrastructure.

The conciseness of the format is derived from a highly opinionated way of deploying applications to OpenShift,
providing override options only when necessary.

Config files are written either as Json or Yaml.

Aurora Config is structured around a four level file structure with the top level being the most general and the bottom
level, representing an application in a given environment, being the most specific - potentially overriding options set
at higher levels. Each environment has its own folder with a separate file for each application in that environment,
in addition to an about.yaml file describing the environment itself. The following table describes the different files;

| File             | Name in AC | Description                                                                                                                                                                                                                                        |
| ---------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| about.yaml       | global     | The _global_ file is the most general file in an Aurora Config. All applications will inherit options set in this file.                                                                                                                            |
| {app}.yaml       | base       | The _base_ file contains general configuration for all instances of application {app} across all environments. All instances will inherit options set in this file and will potentially override options set in the _global_ file.                 |
| {env}/about.yaml | env        | The _env_ file contains general configuration for all applications in environment {env}. All applications in the environment will inherit options set in this file and potentially override options set in both the _base_ file and _global_ file. |
| {env}/{app}.yaml | app        | The _app_ file contains specific configuration for application {app} in environment {env}. All options set in this file will potentially override options set in other files.                                                                      |

For the applications App1 and App2, and the environments test and prod, a typical Aurora Config could then look like;

    ├── about.yaml     (Configuration for all applications in all environments)
    ├── App1.yaml      (General configuration for App1)
    ├── App2.yaml      (General configuration for App2)
    ├── prod           (A folder named prod, representing the environment prod)
    │  ├── about.yaml  (Configuration for all applications in environment prod)
    │  ├── App1.yaml   (Configuration for App1 in environment prod)
    │  └── App2.yaml   (Configuration for App2 in environment prod)
    └── test           (A folder named test, representing the environment test)
       ├── about.yaml  (Configuration for all applications in environment test)
       ├── about-alternative.yaml  (Alternative Configuration for all applications in environment test)
       ├── App1.yaml   (Configuration for App1 in environment test)
       └── App2.yaml   (Configuration for App2 in environment test)

For a given _app_ file, it is possible to change the _base_ and _env_ file if you want to compose your configuration
differently than the default. For instance, you may need to deploy the same application in the same environment with
different name and configuration;

File named "test/App1Beta.yaml"

```yaml
baseFile: App1.yaml
envFile: about-alternative.yaml

```

In this scenario 'App1.yaml' would be used instead of 'App1Beta.yaml' (which does not exist) as the base file for the
App1Beta in the environment test. The env file about-alternative will be used instead of the standard about file. 
Note that env files must start with the prefix `about`

## DeploymentSpec and ApplicationId

When the Aurora Config is processed a new object is generated for each _app_ file, representing the configuration
collected from the _global_ file, the _base_ file for that application, the _env_ file for the environment, and finally
the _app_ file itself. This object is called the DeploymentSpec for the given application. The identifier for a
DeploymentSpec, called ApplicationId, is the combination of environment name and application name. From the example
above we would get four DeploymentSpecs with the following ApplicationIds;

- prod/App1
- prod/App2
- test/App1
- test/App2

## Configuration Reference

The following sections will describe the different configuration options that are available in each of the files. The
examples will use the YAML format for the config files since it is terser and easier on the eyes than JSON.

### Header

Some options are considered header options and are read in a separate step during the configuration parsing process.
This allows us to set defaults and make available values in the header for variable substitution in the other
configuration options. In order to include these into a field surround them with '@', for instance.

```
config/cluster : "@cluster@"
```

Which options are available for substitution is indicated in the following tables.

Some configuration options can only be set in the _global_ about file and the _env_ file. These are typically options that
are only relevant for configuring the environment, for instance environment name, permissions and env.ttl (time to live).
Since environments have their own folder and the environment is configured in an own about-file, it is not allowed for an
_app_-file to override any of the environment specific options. Options that can only be set in the _global_ file or in
an _env_ file will be described in a section called "About files" and options that can also be set in the _base_ files
and _app_ files will be describe in a section called "Application files".

#### About files

| path                            | required | default     | substitution | description                                                                                                                                                                                            |
| ------------------------------- | -------- | ----------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| affiliation                     | Yes      |             | affiliation  | Used to group the project for resource monitoring. All projects start with affiliation. lower case letters max length 10. Required.                                                                    |
| envName                         |          | $folderName | env          | Change the name of the project. Note that the default value here is the actual name of the folder where the app file is. This option must be specified in either global or env file.                   |
| env/name                        |          |             | env          | An alias for envName                                                                                                                                                                                   |
| env/ttl                         |          |             | No           | Set a time duration in format 1d, 12h aso that indicate how long until this namespace should be deleted                                                                                                |
| permissions/admin               | Yes      |             | No           | The groups in OpenShift that will have the admin role for the given project. Can either be an array or a space delimited string. This option must be specified in either global or env file. Required. |
| permissions/view                |          |             | No           | The groups in OpenShift that will have the view role for the given project. Can either be an array or a space delimited string. This option must be specified in either global or env file.            |
| permissions/adminServiceAccount |          |             | No           | The service accounts in OpenShift that will have the admin role for the given project. Can either be an array or a space delimited string. This option must be specified in either global or env file. |

#### Application files

| path                | required | default   | substitution | description                                                                                                                                                                                                           |
| ------------------- | -------- | --------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| schemaVersion       | Yes      |           | No           | All files in a given AuroraConfig must share a schemaVersion. For now only v1 is supported, it is here in case we need to break compatibility. Required.                                                              |
| type                | Yes      |           | No           | [See Deployment Types](#deployment_types)                                                                                                                                                                             |
| applicationPlatform |          | java      | No           | Specify application platform. java or web are valid platforms. Is only used if type is deploy/development.                                                                                                            |
| name                |          | $fileName | name         | The name of the application. All objects created in the cluster will get an app label with this name. Cannot be longer then 40 (alphanumeric -). Note that the default value here is the actual name of the app file. |
| cluster             | Yes      |           | cluster      | What cluster should the application be deployed to. Must be a valid cluster name.                                                                                                                                     |
| ttl                 |          |           | No           | Set a time duration in format 1d, 12h aso that indicate how long until this application should be deleted                                                                                                             |
| version             | Yes      |           | No           | Version of the application to run. Can be set to any of the [valid version strategies](https://skatteetaten.github.io/aurora/documentation/openshift/#deployment-and-patching-strategy)                               |
| segment             |          |           | segment      | The segment the application exist in.                                                                                                                                                                                 |

### <a name="deployment_types" ></a>Deployment Types

The configuration option `type` indicates the deployment type the application has. The value of this field affects
what other configuration options are available for that application. The deployment type determines primarily how
the objects that supports the application on OpenShift are generated, but it also affects the different types of
integrations that are supported.

#### deploy

The deploy deployment type is used for deploying applications using the conventions from the Aurora Platform. You can
read more about these conventions here: [How we Develop and Build our Applications](https://skatteetaten.github.io/aurora/documentation/openshift/#how-we-develop-and-build-our-applications).
This is the deployment type that will be most commonly used when deploying internally built applications. This will
provide integrations with the rest of the NTAs infrastructure and generate the necessary objects to OpenShift to support
the application.

#### development

The development deployment type is similar to the release deployment type but it will not deploy a prebuilt image and
instead create an OpenShift BuildConfig that can be used to build ad hoc images from DeliveryBundles from your local
development machine.

This will usually significantly reduce the time needed to get code from a development machine running on OpenShift
compared to, for instance, a CI/CD pipeline.

#### template

Supports deploying an application from a template available on the cluster. See [Guidelines for developing templates](#template_dev_guidelines).

#### localTemplate

Supports deploying an application from a template available in the AuroraConfig folder. See [Guidelines for developing templates](#template_dev_guidelines).

### Configuration for Deployment Types "deploy" and "development"

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
| liveness/delay         | 10          | Number of seconds to wait before running liveness check                                                                                                      |
| liveness/timeout       | 1           | Number of seconds timeout before giving up liveness                                                                                                          |
| replicas               | 1           | Number of replicas of this application to run.                                                                                                               |
| pause                  | false       | Toggle to pause an application. This will scale it down to 0 and add a label showing it is paused.                                                           |
| toxiproxy              | false       | Toxiproxy feature toggle using default version                                                                                                               |
| toxiproxy/version      | 2.1.3       | Toxiproxy version                                                                                                                                            |

### Configuration for Deployment Types "template" and "localTemplate"

| path             | default | description                                                                                                                                   |
| ---------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| template         |         | Name of template in default namespace to use. This is required if type is template                                                            |
| templateFile     |         | Set the location of a local template file. It should be in the templates subfolder. This is required if type is localTemplate                 |
| parameters/<KEY> |         | set value for a parameter in the template.                                                                                                    |
| version          |         | If the template has the VERSION parameter set this version will be used for its value.. This enables updating of the application in web tools |
| name             |         | If the template has the NAME parameter this field will be used for its value.                                                                 |
| replicas         |         | If the template has the REPLICAS parameter this field will be used for its value.                                                             |

### Exposing an application via HTTP

The default behavior is that the application is only visible to other application in the same namespace using
its service name.

In order to control routes into the application the following fields can be used.

| path                                | default                                                                                                                                                         | description                                                                                                                                                                                                                                                                                                         |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| route                               | false                                                                                                                                                           | Toggle to expose application via HTTP. Routes can also be configured with expanded syntax. And routeDefault can be set for all routes. See below.                                                                                                                                                                   |
| route/<routename>/host              |                                                                                                                                                                 | Set the host of a route according to the given pattern. If not specified the default will be routeDefault/host                                                                                                                                                                                                      |
| route/<routename>/path              |                                                                                                                                                                 | Set to create a path based route. You should use the same name/affiliation/env/separator combination for all path based routes to get the same URL                                                                                                                                                                  |
| route/<routename>/annotations/<key> |                                                                                                                                                                 | Set annotations for a given route. Note that you should use &#124; instead of / in annotation keys. so 'haproxy.router.openshift.io &#124; balance'. See [route annotations](https://docs.openshift.com/container-platform/3.5/architecture/core_concepts/routes.html#route-specific-annotations) for some options. |
| routeDefaults/host                  | @name@-@affiliation@-@env@ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | Set the host of a route according to the given pattern.                                                                                                                                                                                                                                                             |
| routeDefaults/path                  |                                                                                                                                                                 | Set to create a path based route. You should use the same name/affiliation/env/separator combination for all path based routes to get the same URL                                                                                                                                                                  |
| routeDefaults/annotations/<key>     |                                                                                                                                                                 | Set annotations for a given route. Note that you should use &#124; instead of / in annotation keys. so 'haproxy.router.openshift.io &#124; balance'. See [route annotations](https://docs.openshift.com/container-platform/3.5/architecture/core_concepts/routes.html#route-specific-annotations) for some options. |

Route annotations are usable for template types but you need to create a Service with name after the NAME parameter yourself.

### Managing Secrets
In order to provide secret data AuroraConfig has a concept called SecretVault. Data is by default stored encrypted in git. TODO: refer to AO documentation on how to create secrets

If a secretVault mounted in this way contains a latest.properties file the contents of that file will be made available as ENV vars.

If you want to mount additional secretVaults this can be done with mounting it as a volume.

| path                          | default | description                                                                                          |                                                                      |
| ----------------------------- | ------------ | ------------------------------------------------------------------------------------------------|
| secretVault                   |              | Specify full secret vault that will be mounted under default secret location.                   |
| secretVault/name              |              | Used instead of secretVault if you want advanced configuration                                  |
| secretVault/keys              |              | An array of keys from the latest.properties file in the vault you want to include.              |
| secretVault/keyMapping        |              | An map of key -> value that will rewrite the key in the secret to another ENV var name          |

### Mounting volumes

| path                          | default | description                                                                                          |
| ----------------------------- | ------------ | ----------------------------------------------------------------------------------------------- |
| mount/<mountName>/type        |              | One of Secret, ConfigMap, PVC. Required for each mount.                                         |  
| mount/<mountName>/path        |              | Path to the volume in the container. Required for each mount.                                   |
| mount/<mountName>/mountName   | <mountName>  | Override the name of the mount in the container.                                                |
| mount/<mountName>/volumeName  | <mountName>  | Override the name of the volume in the DeploymentConfig.                                        |
| mount/<mountName>/exists      | false        | If this is set to true the existing resource must exist already.                                |
| mount/<mountName>/content     |              | If type is ConfigMap, set this to a content that will be put in that Volume. Exist must be true |
| mount/<mountName>/content     |              | If type is ConfigMap, set this to a content that will be put in that Volume. Exist must be true |
| mount/<mountName>/secretVault |              | The name of the secretVault to use for populating a Secret. Type must be secret, Exist false.   |
  

### NTA specific integrations

| path                   | default | description                                                                                                                         |
| ---------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| webseal                | false   | Toggle to expose application through WebSeal.                                                                                       |
| webseal/host           |         | Set this to change the default prefix in WebSeal                                                                                    |
| webseal/roles          |         | Set roles required to access this route. This can either be set as CSV or as an array of strings                                    |
| certificate            | false   | Toggle to add a certificate with CommonName $groupId.$artifactId.                                                                   |
| certificate/commonName |         | Generate an STS certificate with the given commonName.                                                                              |
| database               | false   | Toggle this to add a database with $name to your application.                                                                       |
| database/<name>        |         | If you want to add multiple databases specify a name for each. Set the value to 'auto' for auto generation or a given ID to pin it. |

NTA has the following technologies that can be automated with the above fields

- Webseal is used for client traffic from within NTA to reach an application. Internal tax workers have roles that can be added to limit who can access the application
- STS certificate: An SSL certificate with a given commonName is used to identify applications to secure traffic between them
- Oracle Databases: We haven a DBH-api that expose functionality to auto provision a Oracle schema on a shared server. The API can also handle manual SQL connections for you so the application can get the credentials in one way

These integrations are available for all types however note that if you want to use webseal with a template type you need to create a Service with default ports named after the name parameter

## Example configuration

### Simple reference-application

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

### Applying template with NTA integrations

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
template: aurora-atomhopper-1.0.0
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
template: aurora-atomhopper-1.0.0
database: true
route: true
parameters:
  FEED_NAME: feed
  DB_NAME: atomhopper
  DOMAIN_NAME: localhost
```

## <a name="template_dev_guidelines"></a>Guidelines for developing templates

When creating templates the following guidelines should be followed:

- include the following parameters VERSION, NAME and if appropriate REPLICAS. They will be populated from relevant AuroraConfig fields
- the following labels will be added to the template: app, affiliation, updatedBy
- if the template does not have a VERSION parameter it will not be upgradable from internal web tools
- Each container in the template will get aditional ENV variables applied if NTA specific integrations are applied.
