---
icon: "bookmark"
title: "Aurora Config"
description: "Opinionated way of configuring cloud applications"
---

## What is Aurora Config?

TLDR; [Take me to the Configuration Reference!](#configuration-reference)

Aurora Config is a custom file based configuration format developed by the Norwegian Tax Administration designed to be a
concise
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
| about.yaml       | global     | The _global_ file is the most general file in an Aurora Config. All applications will inherit options set in this file, unless _globalFile_ is specifically set in the base or env file.                                                           |
| {app}.yaml       | base       | The _base_ file contains general configuration for all instances of application {app} across all environments. All instances will inherit options set in this file and will potentially override options set in the _global_ file.                 |
| {env}/about.yaml | env        | The _env_ file contains general configuration for all applications in environment {env}. All applications in the environment will inherit options set in this file and potentially override options set in both the _base_ file and _global_ file. |
| {env}/{app}.yaml | app        | The _app_ file contains specific configuration for application {app} in environment {env}. All options set in this file will potentially override options set in other files.                                                                      |

For the applications App1 and App2, and the environments test and prod, a typical Aurora Config could then look like;

    ├── about.yaml     (Configuration for all applications in all environments)
    ├── about-alternative.yaml (Alternative global configuration)
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

_File named 'test/App1Beta.yaml'_

```yaml
baseFile: App1.yaml
envFile: about-alternative.yaml
```

In this scenario 'App1.yaml' would be used instead of 'App1Beta.yaml' (which does not exist) as the base file for the
App1Beta in the environment test. The env file about-alternative will be used instead of the standard about file.
Note that env files must start with the prefix `about`

For a given env file, it is possible to include another env file that is read right before you using the configuration.

_In prod/about.yaml_

```yaml
includeEnvFile: test/about.yaml
```

In this scenario 'test/about.yaml' will be read right before 'prod/about.yaml'. This will make it possible to have an
environment that is a template for other environments.

_In App1.yaml_

```yaml
globalFile: about-alternative.yaml
```

In this scenario 'prod/App1.yaml' and 'test/App1.yaml' will inherit from 'about-alternative.yaml' at root level,
replacing the default _global_ file. This makes it possible to have alternative global configurations for particular
applications.

_In prod/about.yaml_

```yaml
globalFile: about-alternative.yaml
```

In this scenario 'prod/about.yaml' will inherit from 'about-alternative.yaml' at root level. This makes it possible to
have alternative global configurations for entire environments.

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

Substitutions should be used with care especially if they occur in a file that applies to multiple application
instances, e.g. env files and base files.

Some configuration options can only be set in the _global_ about file and the _env_ file. These are typically options
that
are only relevant for configuring the environment, for instance environment name, permissions and env.ttl (time to
live).
Since environments have their own folder and the environment is configured in an own about-file, it is not allowed for
an
_app_-file to override any of the environment specific options. Options that can only be set in the _global_ file or in
an _env_ file will be described in a section called "About files" and options that can also be set in the _base_ files
and _app_ files will be describe in a section called "Application files".

#### About files

| path                            | required | default      | substitution | description                                                                                                                                                                                                                                                                    |
| ------------------------------- | -------- | ------------ | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| affiliation                     | Yes      |              | affiliation  | Used to group the project for resource monitoring. All projects start with affiliation. lower case letters max length 10. Required.                                                                                                                                            |
| envName                         |          | \$folderName | env          | Change the name of the project. Note that the default value here is the actual name of the folder where the app file is. This option must be specified in either global or env file.                                                                                           |
| env/name                        |          |              | env          | An alias for envName                                                                                                                                                                                                                                                           |
| env/ttl                         |          |              | No           | Set a time duration in format 1d, 12h that indicate how long until this namespace should be deleted                                                                                                                                                                            |
| permissions/admin               | Yes      |              | No           | The groups in OpenShift that will have the admin role for the given project. Can either be an array or a space delimited string. This option must be specified in either global or env file. Required.                                                                         |
| permissions/view                |          |              | No           | The groups in OpenShift that will have the view role for the given project. Can either be an array or a space delimited string. This option must be specified in either global or env file.                                                                                    |
| permissions/edit                |          |              | No           | The groups in OpenShift that will have the edit role for the given project. Can either be an array or a space delimited string. This option must be specified in either global or env file.                                                                                    |
| permissions/adminServiceAccount |          |              | No           | The service accounts in OpenShift that will have the admin role for the given project. Can either be an array or a space delimited string. This option must be specified in either global or env file.                                                                         |
| globalFile                      | No       | about.yaml   | globalFile   | Replaces the global file of the project. Note that the default file is the _global_ about file. This option can only be specified in either the _base_ file or _env_ file.                                                                                                     |
| dataclassification              | No       |              | No           | Sets data classification on the namespace, based on the sensitivity level of the data present in the environment. The value can be set to either synt, skarp, or anon and cannot be changed once set. If it needs to be changed, assistance from an administrator is required. |

At least one of the groups in permissions/admin must have a user in it.

#### Application files

| path                | required | default        | substitution | description                                                                                                                                                                                                                                       |
| ------------------- | -------- | -------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| schemaVersion       | Yes      |                | No           | All files in a given AuroraConfig must share a schemaVersion. For now only v1 is supported, it is here in case we need to break compatibility. Required.                                                                                          |
| type                | Yes      |                | No           | [See Deployment Types](#deployment-types)                                                                                                                                                                                                         |
| applicationPlatform |          | java           | No           | Specify application platform. java, web, python or doozer are valid platforms. Is only used if type is deploy/development.                                                                                                                        |
| name                |          | \$baseFileName | name         | The name of the application. All objects created in the cluster will get an app label with this name. Cannot be longer then 40 (alphanumeric -). Note that the default value here is the actual name of the base file.                            |
| cluster             | Yes      |                | cluster      | What cluster should the application be deployed to. Must be a valid cluster name.                                                                                                                                                                 |
| ttl                 |          |                | No           | Set a time duration in format 1d, 12h that indicate how long until this application should be deleted                                                                                                                                             |
| version             | Yes      |                | No           | Version of the application to run. Can be set to any of the [valid version strategies](https://skatteetaten.github.io/aurora/documentation/openshift/#deployment-and-patching-strategy). Version is not required for template/localTemplate files |
| segment             |          |                | segment      | The segment the application exist in.                                                                                                                                                                                                             |
| message             |          |                | message      | A message that will be added to the ApplicationDeployment CRD.                                                                                                                                                                                   |
| globalFile          | No       | about.yaml     | globalFile   | Replaces the global file of the application. Note that the default file is the _global_ about file. This option can only be specified in either the _base_ file or _env_ file.                                                                    |

### Notifications

Get notification messages when an application or environment/namespace has been deployed.

#### Mattermost

In order to use this feature
one has to use the channelId, which is not the same as the channel name. The channelId can be retrieved by going to a
channel, then hitting view
info in the channel header. At the bottom of the dialog box you will find a greyed out channel id.

| path                                          | default | description                                                                                                |
| --------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------- |
| `notification/mattermost/<channelId>`         |         | Simplified config for enabling a mattermost notification for the given channelId. This requires a boolean. |
| `notification/mattermost/<channelId>/enabled` | true    | Set to false to disable notification for the given channel.                                                |

#### Email

Notifications can also be sent to mailing groups by configuring the email option in the notification field

| path                                     | default | description                                                                      |
| ---------------------------------------- | ------- | -------------------------------------------------------------------------------- |
| `notification/email/<emailAddr>`         |         | Simplified config for enabling an email notification for the given email address |
| `notification/email/<emailAddr>/enabled` | true    | Set to false to disable notification for the given email address.                |

### Deployment Types

The configuration option `type` indicates the deployment type the application has. The value of this field affects
what other configuration options are available for that application. The deployment type determines primarily how
the objects that supports the application on OpenShift are generated, but it also affects the different types of
integrations that are supported.

#### deploy

The deploy deployment type is used for deploying applications using the conventions from the Aurora Platform. You can
read more about these conventions
here: [How we Develop and Build our Applications](https://skatteetaten.github.io/aurora/documentation/openshift/#how-we-develop-and-build-our-applications).
This is the deployment type that will be most commonly used when deploying internally built applications. This will
provide integrations with the rest of the NTAs infrastructure and generate the necessary objects to OpenShift to support
the application.

#### development

The development deployment type is similar to the deploy deployment type but it will not deploy a prebuilt image from
container registry.
Instead an OpenShift ImageStream will be created that can be used to send images created from DeliveryBundles from your
local
development machine (see `ao dev rollout`).

This will usually significantly reduce the time needed to get code from a development machine running on OpenShift
compared to, for instance, a CI/CD pipeline.

#### template

Supports deploying an application from a template available on the cluster.
See [Guidelines for developing templates](#guidelines-for-developing-templates).

#### localTemplate

Supports deploying an application from a template available in the AuroraConfig folder.
See [Guidelines for developing templates](#guidelines-for-developing-templates).

#### cronjob

Supports running a scheduled job as a CronJob resource on Kubernetes

#### job

Supports running a job as a Job resource on Kubernetes

### Configuration for Deployment Types "deploy" and "development"

| path                                                | default     | description                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| --------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| releaseTo                                           |             | Used to release a given version as a shared tag in the docker registry. Other env can then use it in 'version'. NB! Must be manually updated with AO/Aurora Konsoll                                                                                                                                                                                                                                                                                                                 |
| debug                                               | false       | Toggle to enable remote debugging on port 5005. Port forward this port locally and setup remote debugging in your Java IDE.                                                                                                                                                                                                                                                                                                                                                         |
| deployStrategy/type                                 | rolling     | Specify type of deployment, either rolling or recreate                                                                                                                                                                                                                                                                                                                                                                                                                              |
| deployStrategy/timeout                              | 180         | Set timeout value in seconds for deployment process                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| resources/cpu/min                                   | 10m         | Specify minimum/request cpu. See [kubernetes_docs](https://kubernetes.io/docs/concepts/configuration/manage-compute-resources-container/#meaning-of-cpu) for potential values                                                                                                                                                                                                                                                                                                       |
| resources/cpu/max                                   | 2000m       | Specify maximum/limit cpu. A value of "0" indicates that no CPU limit should be configured.                                                                                                                                                                                                                                                                                                                                                                                         |
| resources/memory/min                                | 128Mi       | Specify minimum/request memory. See [kubernetes docs](https://kubernetes.io/docs/concepts/configuration/manage-compute-resources-container/#meaning-of-memory) for potential values                                                                                                                                                                                                                                                                                                 |
| resources/memory/max                                | 512Mi       | Specify maximum/limit memory. By default 25% of this will be set to heap in java8 and 75% in java11.                                                                                                                                                                                                                                                                                                                                                                                |
| `config/JAVA_MAX_MEM_RATIO`                         | 25          | Specify heap percentage for Java 8 applications                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `config/JAVA_MAX_RAM_PERCENTAGE`                    | 75.0        | Specify heap percentage for Java 11 or Java 17 applications                                                                                                                                                                                                                                                                                                                                                                                                                         |
| groupId                                             |             | groupId for your application. Max 200 length. Required if deploy/development                                                                                                                                                                                                                                                                                                                                                                                                        |
| artifactId                                          | \$fileName  | artifactId for your application. Max 50 length                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| version                                             |             | The version of the image you want to run.                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| splunkIndex                                         |             | Set to a valid splunk-index to log to splunk. Only valid if splunk is enabled in the Aurora API                                                                                                                                                                                                                                                                                                                                                                                     |
| serviceAccount                                      |             | Set to an existing serviceAccount if you need special privileges                                                                                                                                                                                                                                                                                                                                                                                                                    |
| prometheus                                          | true        | Toggle to false if application do not have Prometheus metrics                                                                                                                                                                                                                                                                                                                                                                                                                       |
| prometheus/path                                     | /prometheus | Change the path of where prometheus is exposed                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| prometheus/port                                     | 8081        | Change the port of where prometheus is exposed                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| management                                          | true        | Toggle of if your application does not expose an management interface                                                                                                                                                                                                                                                                                                                                                                                                               |
| management/path                                     | /actuator   | Change the path of where the management interface is exposed                                                                                                                                                                                                                                                                                                                                                                                                                        |
| management/port                                     | 8081        | Change the port of where the management interface is exposed                                                                                                                                                                                                                                                                                                                                                                                                                        |
| nodeSelector                                        |             | Note: This property will be removed, it is replaced by `nodeProperties`. Configure node-selector to use specific node. Takes map-value e.g. `nodeSelector/<label>/<value>`. Note that this must only be used in agreement with operations who will provide the label name and value.                                                                                                                                                                                                |
| readiness                                           | true        | Toggle to false to turn off default readiness check                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| readiness/path                                      |             | Set to a path to do a GET request to that path as a readiness check                                                                                                                                                                                                                                                                                                                                                                                                                 |
| readiness/port                                      | 8080        | If no path present readiness will check if this port is open                                                                                                                                                                                                                                                                                                                                                                                                                        |
| readiness/delay                                     | 10          | Number of seconds to wait before running readiness check                                                                                                                                                                                                                                                                                                                                                                                                                            |
| readiness/timeout                                   | 1           | Number of seconds timeout before giving up readiness                                                                                                                                                                                                                                                                                                                                                                                                                                |
| readiness/periodSeconds                             | 10          | Number of seconds between each readiness check                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| readiness/failureThreshold                          | 3           | Number of times to retry readiness check on failure                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| liveness                                            | false       | Toggle to true to enable liveness check                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| liveness/path                                       |             | Set to a path to do a GET request to that path as a liveness check                                                                                                                                                                                                                                                                                                                                                                                                                  |
| liveness/port                                       | 8080        | If no path present liveness will check if this port is open                                                                                                                                                                                                                                                                                                                                                                                                                         |
| liveness/delay                                      | 10          | Number of seconds to wait before running liveness check                                                                                                                                                                                                                                                                                                                                                                                                                             |
| liveness/timeout                                    | 1           | Number of seconds timeout before giving up liveness                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| liveness/periodSeconds                              | 10          | Number of seconds between each liveness check                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| liveness/failureThreshold                           | 3           | Number of times to retry liveness check on failure                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| replicas                                            | 1           | Number of replicas of this application to run.                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| pause                                               | false       | Toggle to pause an application. This will scale it down to 0 and add a label showing it is paused.                                                                                                                                                                                                                                                                                                                                                                                  |
| toxiproxy                                           | false       | Toxiproxy feature toggle using default version                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| toxiproxy/version                                   | 2.1.3       | Toxiproxy version                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| toxiproxy/proxies/\<proxyname\>/enabled             | true        | Set to `true` to create a Toxiproxy proxy with the name \<proxyname\>. If set to `false`, it will be skipped. Not to be confused with the _enabled_ state of the proxy, which is set by _initialEnabledState_.                                                                                                                                                                                                                                                                      |
| toxiproxy/proxies/\<proxyname\>/initialEnabledState | true        | Set the _enabled_ state of the proxy named \<proxyname\>.                                                                                                                                                                                                                                                                                                                                                                                                                           |
| toxiproxy/proxies/\<proxyname\>/urlVariableKey      |             | Name of the environment variable that holds the URL to the service that is to be manipulated, given that such a variable exists and contains a valid URL. \<proxyname\> is the name of the Toxiproxy proxy that will be created.                                                                                                                                                                                                                                                    |
| toxiproxy/proxies/\<proxyname\>/serverVariableKey   |             | Name of the environment variable that holds the host, given that the host and port of the service that is to be manipulated are given in separate environment variables. This variable must be present in the config section and contain a valid host name. \<proxyname\> is the name of the Toxiproxy proxy that will be created.                                                                                                                                                  |
| toxiproxy/proxies/\<proxyname\>/portVariableKey     |             | Name of the environment variable that holds the port, given that the host and port of the service that is to be manipulated are given in separate environment variables. This variable must be present in the config section and contain a valid port number. \<proxyname\> is the name of the Toxiproxy proxy that will be created.                                                                                                                                                |
| toxiproxy/proxies/\<proxyname\>/databaseName        |             | Name of the database that is to be manipulated, given that this name is present in the database config section. \<proxyname\> is the name of the Toxiproxy proxy that will be created.                                                                                                                                                                                                                                                                                              |
| toxiproxy/proxies/\<proxyname\>/database            | false       | Set to `true` to create a proxy with the name \<proxyname\> for the application's database if the database uses default configuration.                                                                                                                                                                                                                                                                                                                                              |
| config                                              |             | Contains a collection of application configuration variables. Keys are normalized according to [XCU](https://pubs.opengroup.org/onlinepubs/007908799/xbd/envvar.html). More specifically we replace "-. " with \_. If a key will be normalized there will be an warning emitted for that key. The value of the env vars is passed as is. Note: If you are using JSON string as the value of the config field, then all quotes in the json value must be escaped. See example below. |

Example specification of an json env var

```yaml
config:
  FOO: '{"BAR": "BAZ"}'
```

This will result in a json object with the key BAR and the value BAZ

For development flow the following configuration properties are available to specify how to build the image locally

| path              | default | description                                                                         |
| ----------------- | ------- | ----------------------------------------------------------------------------------- |
| baseImage/name    |         | Name of the baseImage to use,                                                       |
| baseImage/version |         | Version of the baseImage to use.NB! This must be a tag in the baseImage imagestream |

The following baseImage are in use at NTA

| name      | version | description      |
| --------- | ------- | ---------------- |
| wrench10  | 2       | Nodejs10 & Nginx |
| wrench12  | 2       | Nodejs12 & Nginx |
| wrench14  | 2       | Nodejs14 & Nginx |
| wrench16  | 1       | Nodejs16 & Nginx |
| wingnut8  | 2       | OpenJdk 8        |
| wingnut11 | 2       | OpenJDK 11       |
| wingnut17 | 1       | OpenJDK 17       |

### Configuration specific for Deployment Type "localTemplate"

| path         | default | description                                                                                                                                                                                       |
| ------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| releaseTo    |         | Used to release a given version as a shared tag in the docker registry. Other env can then use it in 'version'. NB! Must be manually updated with AO/Aurora Konsoll . Requires groupId to be set. |
| templateFile |         | Set the location of a local template file. It should be in the templates subfolder. This is required if type is localTemplate                                                                     |

### Configuration specific for Deployment Type "template"

| path     | default | description                                                                        |
| -------- | ------- | ---------------------------------------------------------------------------------- |
| template |         | Name of template in default namespace to use. This is required if type is template |

### Common configuration for Deployment Types "template" and "localTemplate"

| path                 | default | description                                                                                                                                                                                                                                                                     |
| -------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `parameters/<KEY>`   |         | The parameters option is used to set values for parameters in the template. If the template has either of the parameters VERSION, NAME, SPLUNK_INDEX or REPLICAS, the values of these parameters will be set from the standard version, name and replicas AuroraConfig options. |
| replicas             |         | If set will override replicas in template                                                                                                                                                                                                                                       |
| resources/cpu/min    |         | Specify minimum/request cpu. 1000m is 1 core. see [kubernetes_docs](https://kubernetes.io/docs/concepts/configuration/manage-compute-resources-container/#meaning-of-cpu)                                                                                                       |
| resources/cpu/max    |         | Specify maximum/limit cpu.                                                                                                                                                                                                                                                      |
| resources/memory/min |         | Specify minimum/request memory. See [kubernetes docs](https://kubernetes.io/docs/concepts/configuration/manage-compute-resources-container/#meaning-of-memory)                                                                                                                  |
| resources/memory/max |         | Specify maximum/limit memory. By default 25% of this will be set to XMX in java.                                                                                                                                                                                                |

Note that resources and replicas have no default values for templates. If they are set they will be applied if not the
value in the template will be used.

### Configuration for job and cronjobs

For jobs and cronjobs you have to create an application that terminates when it is done and point to it using the normal
groupId/artifactId:version semantics

| path                      | default              | description                                                                  |
| ------------------------- | -------------------- | ---------------------------------------------------------------------------- |
| groupId                   |                      | groupId for your application. Max 200 length. Required if deploy/development |
| artifactId                | \$fileName           | artifactId for your application. Max 50 length                               |
| version                   |                      | The version of the image you want to run.                                    |
| liveness                  | false                | Toggle to true to enable liveness check                                      |
| liveness/path             |                      | Set to a path to do a GET request to that path as a liveness check           |
| liveness/port             | 8080                 | If no path present liveness will check if this port is open                  |
| liveness/delay            | 10                   | Number of seconds to wait before running liveness check                      |
| liveness/timeout          | 1                    | Number of seconds timeout before giving up liveness                          |
| liveness/periodSeconds    | 10                   | Number of seconds between each liveness check                                |
| liveness/failureThreshold | 3                    | Number of times to retry liveness check on failure                           |
| prometheus                | false                | Toggle to false if application do not have Prometheus metrics                |
| prometheus/path           | /actuator/prometheus | Change the path of where prometheus is exposed                               |
| prometheus/port           | 8081                 | Change the port of where prometheus is exposed                               |

#### Aditional configuration for cronjobs

| path              | default | description                                                                                                                            |
| ----------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| schedule          |         | Cron scheduel validated against http://cron-parser.com/                                                                                |
| failureCount      | 1       | Number of failed jobs to keep                                                                                                          |
| successCount      | 3       | Number of successfull jobs to keep                                                                                                     |
| concurrencyPolicy | Forbid  | Any of [concurrencyPolicy](https://kubernetes.io/docs/tasks/job/automated-tasks-with-cron-jobs/#concurrency-policy)                    |
| startingDeadline  | 60      | Override the starting deadline for the cronjob, see suspend below                                                                      |
| suspend           | false   | Suspend/stop the job. Nb! See [suspend](https://kubernetes.io/docs/tasks/job/automated-tasks-with-cron-jobs/#suspend) docs for caveats |

#### Supported integrations

Jobs and Cronjobs can have

- secrets
- databases
- STS tokens
- mounts
- logging
- prometheus metrics

### Enable deployment on special nodes

Some deployments may require nodes with extended properties, such as larger available memory.
For the deployment to be able to deploy on special nodes they must be configured with `nodeProperties`.

| path                            | default | description                                                                          |
| ------------------------------- | ------- | ------------------------------------------------------------------------------------ |
| nodeProperties/largeMem/enabled |         | Configures the deployment so it can be deployed on nodes with more available memory. |

Note: using nodeProperties should be in agreement with operations.

### Exposing an application via HTTP

The default behavior is that the application is only visible to other application in the same namespace using
its service name.

By using routes and CNAME entries, the application can be exposed in a cluster-independent way both on-premise and to
Azure resources.

In order to control routes into the application the following fields can be used.

| path                                   | default                             | description                                                                                                                                                                                                                                                                                                                                                             |
| -------------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| route                                  | false                               | Toggle to expose application via HTTP. Routes can also be configured with expanded syntax. And routeDefault can be set for all routes. See below.                                                                                                                                                                                                                       |
| `route/<routename>/enabled`            | true                                | Set to false to turn off route                                                                                                                                                                                                                                                                                                                                          |
| `route/<routename>/host`               |                                     | Set the host of a route according to the given pattern. If not specified the default will be `routeDefault/host`. If you specify `cname.enabled` or `azure.enabled`, this should be a fully qualified host name.                                                                                                                                                        |
| `route/<routename>/path`               |                                     | Set to create a path based route. You should use the same name/affiliation/env/separator combination for all path based routes to get the same URL                                                                                                                                                                                                                      |
| `route/<routename>/annotations/<key>`  |                                     | Set annotations for a given route. Note that you should use &#124; instead of / in annotation keys. so 'haproxy.router.openshift.io &#124; balance'. See [route annotations](https://docs.openshift.com/container-platform/3.10/architecture/networking/routes.html#route-specific-annotations) for some options. If the value is empty the annotation will be ignored. |
| `route/<routename>/cname/enabled`      |                                     | If set to `true`, a CNAME entry is created on-prem, allowing for cluster-independent access to the application. If not set for a route `routeDefaults/cname/enabled` will be used.                                                                                                                                                                                      |
| `route/<routename>/cname/ttl`          |                                     | Time to live for the CNAME entry, after which the client should discard or refresh its cache. If not set for a route `routeDefaults/cname/ttl` will be used.                                                                                                                                                                                                            |
| `route/<routename>/azure/enabled`      |                                     | If set to `true`, the application is exposed to Azure resources, and a CNAME entry is created in Azure, allowing for cluster-independent access to the application from Azure. If not set for a route `routeDefaults/azure/enabled` will be used. The Azure route is always exposed with TLS, regardless of the TLS settings on the route.                              |
| `route/<routename>/azure/cnameTtl`     |                                     | Time to live for the CNAME entry, after which the client should discard or refresh its cache. If not set for a route `routeDefaults/azure/cnameTtl` will be used.                                                                                                                                                                                                       |
| `route/<routename>/tls/enabled`        |                                     | Turn on/off tls for this route. Note that Azure routes always have TLS enabled, regardless of this setting.                                                                                                                                                                                                                                                             |
| `route/<routename>/tls/insecurePolicy` |                                     | When TLS is enabled how do you handle insecure traffic. Allow/Redirect/None. If not set for a route `routeDefaults/tls/insecurePolicy` will be used.                                                                                                                                                                                                                    |
| `route/<routename>/tls/termination`    |                                     | Where to terminate TLS for this route. Edge/Passthrough. If not set use the default value from routeDefaults/tls/termination.                                                                                                                                                                                                                                           |
| `route/<routename>/annotations/<key>`  |                                     | Set annotations for a given route. Note that you should use &#124; instead of / in annotation keys. so 'haproxy.router.openshift.io &#124; balance'. See [route annotations](https://docs.openshift.com/container-platform/3.10/architecture/networking/routes.html#route-specific-annotations) for some options. If the value is empty the annotation will be ignored. |
| routeDefaults/host                     | @name@-@affiliation@-@env@          | Set the host of a route according to the given pattern. If you specify `cname.enabled` or `azure.enabled`, this should be a fully qualified host name.                                                                                                                                                                                                                  |
| routeDefaults/annotations/\<key\>      |                                     | Set annotations for a given route. Note that you should use &#124; instead of / in annotation keys. so 'haproxy.router.openshift.io &#124; balance'. See [route annotations](https://docs.openshift.com/container-platform/3.10/architecture/networking/routes.html#route-specific-annotations) for some options.                                                       |
| routeDefaults/cname/enabled            | false                               | If set to `true`, a CNAME entry is created on-prem, allowing for cluster-independent access to the application for all routes.                                                                                                                                                                                                                                          |
| routeDefaults/cname/ttl                |                                     | Default time to live for the CNAME entry for all routes, after which the client should discard or refresh its cache.                                                                                                                                                                                                                                                    |
| routeDefaults/azure/enabled            | false                               | If set to `true`, the application is exposed to Azure resources, and a CNAME entry is created in Azure, allowing for cluster-independent access to the application from Azure for all routes. The Azure route is always exposed with TLS, regardless of the TLS settings on the route.                                                                                  |
| routeDefaults/azure/cnameTtl           |                                     | Default time to live for the CNAME entry of all routes, after which the client should discard or refresh its cache.                                                                                                                                                                                                                                                     |
| routeDefaults/tls/enabled              | false                               | Enable/disable tls for all routes. Note that Azure routes always have TLS enabled, regardless of this setting.                                                                                                                                                                                                                                                          |
| routeDefaults/tls/insecurePolicy       | \<varies for applicationPlattform\> | For Java the default is None for Web the default is Redirect                                                                                                                                                                                                                                                                                                            |
| routeDefaults/tls/termination          | edge                                | Where do you terminate TLS? Edge or Passthrough. Reencrypt is not supported for now.                                                                                                                                                                                                                                                                                    |

If tls is used the host of the route cannot include the '.' key, since we do not support wildcard TLS cert.

Route annotations are usable for template types, but you need to create a Service with name after the NAME parameter
yourself.

### Exposing an external API

For details and context, see internal link https://wiki.sits.no/x/cAH-Kg. We only list the general syntax here.

Note that a route exposed to Azure is needed. That is, with `azure.enabled` set on the route.

| path                                                                       | required | description                                                                                                                                                                                                                   |
|----------------------------------------------------------------------------|----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `azure/apim/<apiname>/enabled`                                             | no       | Set to false to not expose the api.                                                                                                                                                                                           |
| `azure/apim/<apiname>/externalHost`                                        | yes      | The host name the API is exposed with. The combination with `path` must be globally unique. This field can not be changed after the API is created.                                                                           |
| `azure/apim/<apiname>/path`                                                | no       | The path to the API up until the version identifier, if needed. Note that both the path and the version identifier is removed when backend requests are executed. If they are needed, add them to the `serviceUrl` parameter. |
| `azure/apim/<apiname>/versions/<version>`                                  | yes      | The version of the API, it is appended to `path`. It should be with the pattern vXXX.                                                                                                                                         |
| `azure/apim/<apiname>/versions/<version>/enabled`                          | no       | Set to false to not expose this version of the api.                                                                                                                                                                           |
| `azure/apim/<apiname>/versions/<version>/openApiUrl`                       | yes      | HTTPS address of where the openapi schema (json or yaml) is located                                                                                                                                                           |
| `azure/apim/<apiname>/versions/<version>/serviceUrl`                       | yes      | The service backing the API. It might include path elements. This must match a route with `azure.enabled` set.                                                                                                                |
| `azure/apim/<apiname>/versions/<version>/policies/<policyName>/enabled`    | no       | Set to false to disable this policy. See the internal documentation for possible policies and parameters.                                                                                                                     |
| `azure/apim/<apiname>/versions/<version>/policies/<policyName>/parameters` | no       | Map with parameters specific to the policy, if needed. See the internal documentation for possible policies and parameters.                                                                                                   |


### Managing Secrets

In order to provide sensitive data to an application (i.e. passwords that cannot be stored directly in the configuration
block of the AuroraConfig) it is possible to
access Vaults that has been created with the `ao vault` command (see internal link
https://wiki.sits.no/pages/viewpage.action?pageId=143517331#AO(AuroraOpenShiftCLI)-AOVault). You can access the vaults
in two different ways; as a
_mount_ or via the _secretVault_ option.

If a Vault is accessed via the secretVault option and the vault contains a properties file the contents of that file
will be made available as
environment variables for the application. Example;

```
PASSWORD=s3cr3t
ENCRYPTION_KEY=8cdca234-9a3b-11e8-9eb6-529269fb1459
```

If you want to mount additional Vaults or access vault files directly this can be done with mounting it as a volume. See
the next section for more details.

| path                                | default           | description                                                                            |
| ----------------------------------- | ----------------- | -------------------------------------------------------------------------------------- |
| `secretVaults/<svName>/name`        | \$svName          | Specify full secret vault that will be mounted under default secret location.          |
| `secretVaults/<svName>/enabled`     | true              | Set this to false to disable.                                                          |
| `secretVaults/<svName>/file`        | latest.properties | File in vault that will be used for fetching properties.                               |
| `secretVaults/<svName>/keys`        |                   | An array of keys from the latest.properties file in the vault you want to include.     |
| `secretVaults/<svName>/keyMappings` |                   | An map of key -> value that will rewrite the key in the secret to another ENV var name |

Note that it is possible to fetch multiple files from the same vault, the `svName` must be different for each one and
you must set name to the same.

The old way of specifying secretVaults (detailed below is deprecated). There will be a migration feature soon. This
configuration pattern only suppored
a single vault/file.

| path                    | default | description                                                                            |
| ----------------------- | ------- | -------------------------------------------------------------------------------------- |
| secretVault             |         | Specify full secret vault that will be mounted under default secret location.          |
| secretVault/name        |         | Used instead of secretVault if you want advanced configuration                         |
| secretVault/keys        |         | An array of keys from the latest.properties file in the vault you want to include.     |
| secretVault/keyMappings |         | An map of key -> value that will rewrite the key in the secret to another ENV var name |

It is possible to use substitutions in keys/keyMappings but it should be used with care and doublechecked.

### Mounting volumes

| path                             | default       | description                                                                                                                                         |
| -------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mounts/<mountName>/type`        |               | One of Secret, PVC. Required for each mount.                                                                                                        |
| `mounts/<mountName>/enabled`     | true          | Set this to false to disable this mount                                                                                                             |
| `mounts/<mountName>/path`        |               | Path to the volume in the container. Required for each mount.                                                                                       |
| `mounts/<mountName>/mountName`   | `<mountName>` | Override the name of the mount in the container.                                                                                                    |
| `mounts/<mountName>/volumeName`  | `<mountName>` | Override the name of the volume in the DeploymentConfig.                                                                                            |
| `mounts/<mountName>/exist`       | false         | If this is set to true the existing resource must exist already.                                                                                    |
| `mounts/<mountName>/secretVault` |               | The name of the Vault to mount. This will mount the entire contents of the specified vault at the specified path. Type must be Secret, Exist false. |

The combination of type=PVC and exist=true is not supported by policy. We do not want normal java/web applications to
use PVC mounts unnless strictly neccesary.

### NTA webseal integration

Note: Webseal integration is being replaced by AzureAD integration. You should user either one or the other, even though
they can both be used during the transition from Webseal to AzureAD.

Webseal is used for client traffic from within NTA to reach an application. Internal tax workers have roles that can be
added to limit who can access the application

| path                   | default | description                                                                                                                                                                                                                                                 |
| ---------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| webseal                | false   | Toggle or assign an object to expose application through WebSeal.                                                                                                                                                                                           |
| webseal/host           |         | Set the hostname of the WebSEAL route (domain varies by cluster). Default is `@name@-@affiliation@-@env@`                                                                                                                                                   |
| webseal/roles          |         | Set roles required to access this route. This can either be set as CSV or as an array of strings                                                                                                                                                            |
| webseal/strict         | true    | If the application relies on WebSEAL security it should not have an OpenShift Route, as clients may then be able to bypass the authorization. Strict will only generate warnings when both routes will be created. Set strict to false to disable warnings. |
| webseal/clusterTimeout |         | Set he timeout of the openshift route for this webseal junction. Should be valid durationString. Example 1s                                                                                                                                                 |

If you want to use webseal with a template type you need to create a Service with default ports named after the name
parameter

### NTA AzureAD integration

When migrating from webseal to AzureAD integration, first leave in the webseal configuration.
After the azureAD integration is set up, you will receive a mail telling you to remove the webseal configuration.
This will ensure that your application will be available during the transition.

AzureAD is used for client traffic from within NTA to reach an application. Internal tax workers have roles that
must be added to limit who can access the application. Use ATS for authorization against data.

Example:

    azure:
        azureAppFqdn: "<service>-<affiliation>-<env>.amutv.skead.no"
        groups:
        - "list"
        - "of"
        - "security_groups"
        jwtToStsConverter:
            enabled: true

| path                            | default                                                                                | description                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| azure                           | false                                                                                  | Toggle or assign an object to expose application through Azure.                                                                                                                                                                                                                                                                                                    |
| azure/azureAppFqdn              | -                                                                                      | Fully qualified domain name for the exposed service. If you are migrating from webseal, this should be the same hostname use to access the application on webseal. This supports hostnames on the form "service-name.am\[utv&#124;test&#124;\].skead.no". service-name cannot contain periods. For tests, use service-name.funkyutv.skead.no and set azureAppTest. |
| azure/azureAppTest              | false                                                                                  | Set to true to avoid exposing the application over the internet. The application will be exposed over a special internal route.                                                                                                                                                                                                                                    |
| azure/groups                    | []                                                                                     | List of groups that are granted access to the application. An empty list means everyone in the organisation can access the application.                                                                                                                                                                                                                            |
| azure/jwtToStsConverter/enabled | true                                                                                   | Whether a clinger instance should be deployed as a sidecar proxy for the service. This is a simple way of making the application available after moving from webseal. The clinger proxy will be set up with correct application ID and will validate the token from Azure and convert it into an iv-user header as if the request came from webseal.               |
| azure/jwtToStsConverter/jwksUrl | http://login-microsoftonline-com.app2ext.intern-preprod.skead.no/common/discovery/keys | The url for the JWKS used to sign keys in AzureAD. This will typically be a general setting per environment. When testing, use the internal address https://funky-appsikk.apps.utv04.paas.skead.no/api/keys.                                                                                                                                                       |

Note: this feature is currently in beta testing and should only be used in cooporation with the platform team.

### NTA STS integration

STS certificate: An SSL certificate with a given commonName is used to identify applications to secure traffic between
them

For v1 of the STS service use:

| path                   | default | description                                                 |
| ---------------------- | ------- | ----------------------------------------------------------- |
| certificate            | false   | Toggle to add a certificate with CommonName $groupId.$name. |
| certificate/commonName |         | Generate an STS certificate with the given commonName.      |

For v2 use:

| path   | default | description                                                 |
| ------ | ------- | ----------------------------------------------------------- |
| sts    | false   | Toggle to add a certificate with CommonName $groupId.$name. |
| sts/cn |         | Generate an STS certificate with the given commonName.      |

### NTA Dbh integration

[dbh](https://github.com/skatteetaten/dbh) is a service that enables an application to ask for credentials to a database
schema.

If there is no schema the default behavior is to create one.

It is possible to change the default values for this process so that each application that wants a database can just use
the `database=true` instruction

| path                                     | default        | description                                                                                                                                                                                                             |
| ---------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| databaseDefaults/flavor                  | ORACLE_MANAGED | One of `ORACLE_MANAGED`, `POSTGRES_MANAGED`.                                                                                                                                                                            |
| databaseDefaults/generate                | true           | Set this to false to avoid generating a new schema if your lables does not match an existing one                                                                                                                        |
| databaseDefaults/ignoreMissingSchema     | false          | Set this to ignore missing schema when generate = false. Schemas identified with ID are not ignored.                                                                                                                    |
| databaseDefaults/name                    | @name@         | The default name to given a database when using database=true                                                                                                                                                           |
| databaseDefaults/tryReuse                | false          | Try to reuse schema in cooldown if there is no active schema. Sets this as the default behavior                                                                                                                         |
| databaseDefaults/cooldownDuration        |                | Set a time duration in format 1d, 12h that indicate how long the database schema should be in cooldown before deletion. Can't be longer than default cooldown in cluster. UTV-clusters: 7 days, TEST-clusters: 30 days. |
| databaseDefaults/instance/name           |                | The name of the instance you want to use for yor db schemas                                                                                                                                                             |
| databaseDefaults/instance/fallback       | true           | If your instance does not match by labels, a fallback instance will be used if available. Default is true for ORACLE_MANAGED and false for POSTGRES_MANAGED                                                             |
| databaseDefaults/instance/labels/\<key\> |                | Set key=value pair that will be sent when matching database instances. Default is affiliation=@affiliation@                                                                                                             |
| database                                 | false          | Toggle this to add a database with \$name to your application.                                                                                                                                                          |
| `database/<name>`                        |                | Simplified config for multiple databases.If you want to add multiple databases specify a name for each. Set to 'auto' for auto generation or a given ID to pin it. Set to false to turn off this database.              |

If you want to change the default configuration for one application you need to use the expanded syntax

| path                                    | default                                | description                                                                                                                                                                                                             |
| --------------------------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `database/<name>/enabled`               | true                                   | Set to false to disable database                                                                                                                                                                                        |
| `database/<name>/flavor`                | \$databaseDefaults/flavor              | Override default flavor.                                                                                                                                                                                                |
| `database/<name>/name`                  | \<name\>                               | Override the name of the database.                                                                                                                                                                                      |
| `database/<name>/id`                    |                                        | Set the id of the database to get an exact match.                                                                                                                                                                       |
| `database/<name>/tryReuse`              | false                                  | If there is no active schema, try to find schema in cooldown.                                                                                                                                                           |
| `database/<name>/cooldownDuration`      |                                        | Set a time duration in format 1d, 12h that indicate how long the database schema should be in cooldown before deletion. Can't be longer than default cooldown in cluster. UTV-clusters: 7 days, TEST-clusters: 30 days. |
| `database/<name>/applicationLabel`      |                                        | Override the application name set on the database registration                                                                                                                                                          |
| `database/<name>/generate`              | \$databaseDefaults/generate            | Override default generate.                                                                                                                                                                                              |
| `database/<name>/ignoreMissingSchema`   | \$databaseDefaults/ignoreMissingSchema | Override default ignoreMissingSchema.                                                                                                                                                                                   |
| `database/<name>/instance/name`         | \$databaseDefaults/instance/name       | Override default instance/name.                                                                                                                                                                                         |
| `database/<name>/instance/fallback`     | \$databaseDefaults/instance/fallback   | Override default instance/fallback.                                                                                                                                                                                     |
| `database/<name>/instance/labels/<key>` |                                        | Add/override labels for instance.                                                                                                                                                                                       |

To share a database schema between multiple applications then one application must be defined as the owner of the
schema.
The `<name>` must be the same in the configuration files, and for applications that do not own the
schema `applicationLabel` must be set and match the name of the application owning the schema.

The `database` property configuration should not be put in global or env files.
For `databaseDefaults` should be used for database configuration for a whole or multiple environments.
configuration that should be the same for all applications in an environment should be set in
`databaseDefaults` placed in a global or env file.

### NTA S3 integration

To use the S3 integration, a bucket needs to exist before enabling s3 in auroraconfig.
Refer to internal documentation to see how a new bucket is created.

The config field objectArea(specified below) has the following acceptable pattern: lowercase characters, numbers,
hyphen(-) and period(.).

It could be wise to set some defaults in your base configuration files. The s3Defaults are as follows:

| path                  | default | description                                                                                                                                      |
| --------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| s3Defaults/bucketName |         | Bucketname defined upon creation of s3 bucket. In order to use simplified config, this has to be defined                                         |
| s3Defaults/objectArea |         | Objectarea is our read friendly abstraction for s3 objectprefix. In order to use simplified config, this has to be defined                       |

The simplified syntax is as follows:

| path | default | description                                                                                          |
| ---- | ------- | ---------------------------------------------------------------------------------------------------- |
| s3   | false   | Simplified config that is dependant upon that s3Defaults/bucketName and s3Defaults/objectArea is set |

For expanded syntax the following applies:

| path                         | default | description                                                                                                                                      |
| ---------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `s3/<objectArea>/enabled`    | true    | Enabled lets you disable s3 for that specific objectArea.                                                                                        |
| `s3/<objectArea>/bucketName` |         | Set the bucketName for that specific objectArea.                                                                                                 |
| `s3/<objectArea>/objectArea` |         | Overrides the objectArea set in \<objectArea\>                                                                                                   |

### Registration of alerts

Application specific alerts can be automatically registered by adding the following configuration.

| path                             | default                              | description                                                                              |
| -------------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------- |
| `alerts/<alertName>/enabled`     | false                                | Enabled lets you enable the specified alert                                              |
| `alerts/<alertName>/expr`        |                                      | Set the promql expression that should trigger an alert                                   |
| `alerts/<alertName>/delay`       |                                      | Time in minutes until a condition should cause Prometheus to send alert to alert-manager |
| `alerts/<alertName>/connections` |                                      | Array of connection rules between alert definition and recipients via specific channels  |
| `alerts/<alertName>/severity`    |                                      | Severity of alert that is registered, values: critical, warning                          |
| `alerts/<alertName>/summary`     | oppsummering av alarm er ikke angitt | Clear text summary of what the alert does                                                |
| `alerts/<alertName>/description` | beskrivelse av alarm er ikke angitt  | Clear text description of the alert                                                      |

Some configuration values can be set with defaults, these values will be used unless an alert-configuration overrides
it.
`alertsDefaults` can be set in the _base_ file if they should be used for all instances of an application across all
environments,
or in the _env_ file if they should be used for all applications in that environment.

| path                         | default | desctiption                                                                              |
| ---------------------------- | ------- | ---------------------------------------------------------------------------------------- |
| `alertsDefaults/enabled`     | false   | Enabled lets you enable the specified alert                                              |
| `alertsDefaults/connections` |         | Array of connection rules between alert definition and recipients via specific channels  |
| `alertsDefaults/delay`       |         | Time in minutes until a condition should cause Prometheus to send alert to alert-manager |

### Logging configuration

To configure logging it is necessary to add the logging configuration block to the aurora config.
If the configuration is not specified then the application(s) will log via Splunk Connect to a default
index `log-ocp-<env>`.

**Note**: Log files are expected to reside under `/u01/logs`

#### Simple configuration

A minimal configuration specifying the log index can be added to the configuration.

```yaml
logging: # configuration block
  index: myapp-index # splunk index where logs will be indexed
```

#### Separate indexes

It is possible to define separate splunk indexes for different types of logs.
Logs that are not specified explicitly will be indexed to the index specified in `logging.index`.

Available defined log types:

| Name        | Type            | Log file pattern |
| ----------- | --------------- | ---------------- |
| access      | access_combined | \*.access        |
| application | log4j           | \*.log           |
| audit_json  | \_json          | \*.audit.json    |
| audit_text  | log4j           | \*.audit.text    |
| gc          | gc_log          | \*.gc            |
| sensitive   | log4j           | \*.sensitive     |
| slow        | log4j           | \*.slow          |
| stacktrace  | log4j           | \*.stacktrace    |

To configure a specific, of the available log types, then `logging.loggers.<logname>` must be configured (
replace `<logname>` with one of the log type names).

```yaml
logging:
  index: myapp-index # splunk index where log will be indexed
  loggers:
    stacktrace: myapp-stacktrace-index # splunk index where stacktraces will be indexed
    audit_text: aud-myapp-index # splunk index where audit_text logs will be indexed
```

#### Separate indexes with custom file pattern

We have support for specifying custom file patterns if you do not follow the default patterns. We strongly advice you to
use the default loggers config if possible.
We do not allow custom sourcetypes, we currently support [_json, access_combined, gc_log, log4j].
If you need support for another sourcetype you need to contact us.
When you use custom logging, you take full ownership and responsibility of capturing logs with correct file pattern.
If you specify custom logging you cannot have the config fields `logging/index` or `logging/loggers`.
For custom logging you have to specify one logger that is named application, see example below.

Custom logging:

```yaml
logging:
  custom:
    application:
      index: openshift
      sourcetype: log4j
      pattern: "*-custom-app.log"
    custom-access:
      index: openshift
      sourcetype: access_combined
      pattern: "*-custom-aud.log"
```

#### Additional output

In addition to sending logs to splunk, we also support sending log data to an HTTP collector. This
happens in addition to the data being sent to splunk.

Custom logging with `additionalOutput` set:

```yaml
logging:
  custom:
    application:
      index: "openshift"
      sourcetype: "log4j"
      pattern: "*-custom-app.log"
    access:
      index: "openshift"
      sourcetype: "access_combined"
      pattern: "*-custom-aud.log"
    vso:
      index: "logg-collector-openshift"
      sourcetype: "log4j"
      pattern: "collector.log"
      additionalOutput:
        vso-output:
          type: "http"
          secretVault: "collector-credentials"
          host: "logg-collector.skead"
          port: "80"
          path: "/v1/collect"

secretVaults:
  collector-credentials:
    name: collector-credentials
```

The secretVault must contain the `CUSTOM_OUTPUT_USERNAME` and `CUSTOM_OUTPUT_PASSWORD` properties
used to authenticate with the collector service.

**Note**: The HTTP collector is not provided by us, and is something you develop yourself.

#### Configuring tail input plugin for fluentbit

Refer to fluentbit docs [for tail input plugin](https://docs.fluentbit.io/manual/pipeline/inputs/tail) to see definition
of configuration parameters we refer to in table below.

| Name                      | Default | Description                                                                                                                                                                    |
| ------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| logging/bufferSize        | 20      | Adjust bufferSize for fluentbit. Sets Mem_Buf_Limit to the value. Sets container memory request to the same value. Container memory limit is set to `bufferSize * 5`           |
| logging/bufferMaxSize     | 512k    | Sets the Buffer_Max_Size for tail input plugin. Allowed suffix are k(kilo) or m (mega). Unit is Bytes.                                                                         |
| logging/emitterBufferSize |         | Sets the Emitter_Mem_Buf_Limit in MB for multiline matching _-evalevent_xml, _-ats:eval:xml and log4j. Container memory limit is set to `(bufferSize + emitterBufferSize) * 5` |

#### Configurable fields

By default, descriptive fields will be added to the messages logged by the application. It is possible to toggle these
fields on or off.

| Name                       | Default | Description                          |
| -------------------------- | ------- | ------------------------------------ |
| logging/fields/environment | true    | Add field environment to log message |
| logging/fields/version     | true    | Add field version to log message     |
| logging/fields/nodetype    | true    | Add field nodetype to log message    |
| logging/fields/application | true    | Add field application to log message |
| logging/fields/cluster     | true    | Add field cluster to log message     |
| logging/fields/nodename    | false   | Add field nodeName to log message    |

#### Add fluent-bit sidecar container for additional types

Fluent-bit is only supported for types: [deploy, development], however it is possible to opt-in for the
types [localTemplate, template, job, cronJob].
You are not guaranteed that it will work for all types and your specific use case. You might have to configure custom
logging
if the logfiles do not conform to the normal filenames.

```yaml
logging:
  index: "openshift"
  enableForAdditionalTypes:
    localTemplate: true
    template: true
    job: true
    cronjob: true
```

#### Disable fluent-bit sidecar logging

Setting `logging.index` to an empty value will prevent the application from running with a logging sidecar.
This can be useful in situations where a fluent-bit sidecar is unwanted, for example a job that may hang if the pod
starts with a fluent-bit container.

```yaml
logging:
  index: ""
```

### Topology

Support for organizing
the [OpenShift topology view](https://docs.openshift.com/container-platform/4.10/applications/odc-viewing-application-composition-using-topology-view.html)
is available with the `topology` configuration.

| Name                  | Default | Description                                                             |
| --------------------- | ------- | ----------------------------------------------------------------------- |
| `topology/partOf`     |         | Used to group deployments visually.                                     |
| `topology/runtime`    |         | Single value defining the runtime (i.e spring-boot) of the application. |
| `topology/connectsTo` |         | List of application names the deployment connects to.                   |

Notes:

- All fields are optional.
- `partOf` can only hold one value.
- For which values to use in `connectsTo` see the description for `name` in [Application files](#application-files).

The `partOf` property is only used for visual grouping of deployments,
Each project decide themselves how to use the visual grouping, and there are no pre-defined values.

The `runtime` property is used to select a display icon. For example when `topology/runtime=spring-boot` is set, the
topology view will show a spring-boot icon.
Supported icons are listed in the logos array in the link below (it is not necessary to include the `icon-` part of the
name):

- https://github.com/openshift/console/blob/master/frontend/public/components/catalog/catalog-item-icon.tsx
- Alternatively supported icons can be found by right-click on the topology view
  and `Add to project` -> `Container image` and check the `Runtime icon` dropdown list.

The `connectsTo` property indicate which applications the deployment connects to in one direction (sends requests to).
The topology view can only visualize connections in the same namespace.

The topology configuration will add the following labels and annotations to the deployment

- `topology/partOf` adds the label `app.kubernetes.io/part-of=<config-value>` on all resources belonging to the
  deployment.
- `topology/runtime` adds the label `app.kubernetes.io/runtime=<config-value>` on all resources belonging to the
  deployment.
- `topology/connectsTo` adds the annotation `app.openshift.io/connects-to=['config-value']` on the DeploymentConfig.

### Configure Maskinporten

| Name                           | Default         | Description                                                                                        |
| ------------------------------ | --------------- | -------------------------------------------------------------------------------------------------- |
| `maskinporten`                 |                 | Simplified configuration can be used to enabled/disable the feature                                |
| `maskinporten/enabled`         |                 | Enable or disable maskinporten                                                                     |
| `maskinporten/<name>/enabled`  |                 | Required boolean value. Set to true to mount secret for Maskinporten client with provided clientID |
| `maskinporten/<name>/clientId` | value from name | The value from name is used by default, this field can be used to override the clientId            |

Note: If maskinporten feature is disabled with simplified configuration or `maskinporten/enabled` then it must be
explicitly re-enabled.

### Configure Vertical Pod Autoscaling (VPA)

The Vertical Pod Autoscaler (VPA) in Kubernetes automates resource limits and requests for pods. It adjusts requests
based on actual usage, optimizing resource allocation. VPA downscales over-requesting pods and upscales under-requesting
ones. It maintains specified limit/request ratios for containers. This dynamic autoscaling improves resource utilization
and application performance.

| Name                                | Default           | Description                                                                                                                           |
| ----------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `vpa`                               |                   | Simplified configuration can be used to enabled/disable the feature. Type boolean.                                                    |
| `vpa/enabled`                       |                   | Enable or disable vpa. Type boolean.                                                                                                  |
| `vpa/updateMode`                    | Auto              | Supported values are ["Auto", "Off"]. Type String.                                                                                    |
| `vpa/minimumAvailableReplicas`      | 2                 | The minimum number of available replicas needed before initiating scaling operations. Type Integer.                                   |
| `vpa/resources/controlledResources` | ["cpu", "memory"] | Specify the resources to initiate scaling operations. Supported values are cpu and memory. Type list of Strings.                      |
| `vpa/resources/minAllowed/cpu`      |                   | Set minimum allowed. Optional. Type Quantity https://kubernetes.io/docs/reference/kubernetes-api/common-definitions/quantity/.        |
| `vpa/resources/minAllowed/memory`   |                   | Set minimum allowed memory. Optional. Type Quantity https://kubernetes.io/docs/reference/kubernetes-api/common-definitions/quantity/. |
| `vpa/resources/maxAllowed/cpu`      |                   | Set maximum allowed CPU. Optional. Type Quantity https://kubernetes.io/docs/reference/kubernetes-api/common-definitions/quantity/.    |
| `vpa/resources/maxAllowed/memory`   |                   | Set maximum allowed memory. Optional. Type Quanity https://kubernetes.io/docs/reference/kubernetes-api/common-definitions/quantity/.  |

Note:
When using VPA, ensure that the pods have well-defined resource requests and limits in their initial configuration.
These values act as guidelines for VPA to adjust the resource requests later. While VPA doesn't strictly follow these
initial values, it uses them as starting points to iteratively adjust resource requests based on real usage patterns.
During autoscaling, VPA ensures that the new resource requests set for a pod do not exceed the specified resource
limits,
respecting the upper boundaries defined in the initial pod configuration. As a side note, we highly recommend setting
minimumAvailableReplicas to a value of 2 or higher to avoid service disruption during scaling.

Warning: This feature cannot be used in combination with HPA.

### Configure Horizontal Pod Autoscaling (HPA)

Horizontal Pod Autoscaling (HPA) is a powerful feature that allows you to automatically adjust the number of pods in
your deployments based on specific resource utilization or custom metrics. By dynamically scaling the number of pods
up or down, HPA ensures that your applications can handle varying workloads effectively.

The primary purpose of HPA is to maintain a balance between resource availability and application performance. When
your workload experiences increased demand, such as a spike in incoming requests or data processing, HPA will
automatically increase the number of pods to meet the demand and distribute the workload across multiple instances.

Conversely, during periods of low demand, HPA can scale down the number of pods to conserve resources and
reduce unnecessary costs. This autoscaling capability is particularly useful when you have fluctuating workloads
or unpredictable usage patterns.

HPA can scale pods based on different metrics:

    Resource Utilization Metrics: HPA can scale pods based on the actual CPU or memory utilization of the running pods.
    You can set a threshold for CPU or memory utilization, and when the observed utilization exceeds that threshold,
    HPA will initiate scaling actions.

    Custom Metrics: In addition to resource metrics, HPA supports scaling based on custom metrics. These metrics can be
    specific to your application and may include things like the rate of incoming requests, response times, or any
    other custom metric that you define.

    External Metrics: HPA can also scale based on external metrics obtained from sources outside of the Kubernetes
    cluster. For instance, if your workload depends on an external service that provides metrics relevant to scaling
    decisions, you can configure HPA to use these external metrics.

It's essential to configure resource requests and limits for your pods to ensure HPA can function correctly with
resource utilization metrics. By providing these values, HPA can calculate the scaling ratio based on the actual
resource usage and the requested resources.

| Name              | Default | Description                                                                                                                                                                                              |
| ----------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hpa`             |         | Simplified configuration can be used to enabled/disable the feature. Type boolea                                                                                                                         |
| `hpa/enabled`     |         | Enable or disable the hpa feature. Type boolean.                                                                                                                                                         |
| `hpa/minReplicas` |         | Minimum number of replicas. Type Integer.                                                                                                                                                                |
| `hpa/maxReplicas` |         | Maximum number of replicas. Type Integer.                                                                                                                                                                |
| `hpa/behavior`    |         | Defines advanced scaling behavior. See https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/#configurable-scaling-behavior for additional information. Type behavior.               |
| `hpa/metrics`     |         | Defines the metrics to act up on. Se examples section or https://docs.openshift.com/container-platform/4.11/rest_api/autoscale_apis/horizontalpodautoscaler-autoscaling-v2.html. Type list of resources. |

Example of common use case

```yaml
hpa:
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 50
    - type: Resource
      resource:
        name: memory
        target:
          type: AverageValue
          averageValue: 500Mi
```

This configuration snippet defines two resource-based metrics for HorizontalPodAutoscaler:

    CPU Metric: It uses CPU resource and sets a target utilization of 50%.
    Memory Metric: It uses memory resource and sets a target average value of 500Mi (megabytes).

More advanced example

```yaml
hpa:
  enabled: true
  minReplicas: "2"
  maxReplicas: "10"
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: AverageValue
          averageValue: 500m
  behavior:
    scaleDown:
      policies:
        - type: Pods
          value: 4
          periodSeconds: 60
        - type: Percent
          value: 10
          periodSeconds: 60
      selectPolicy: Min
      stabilizationWindowSeconds: 300
    scaleUp:
      policies:
        - type: Pods
          value: 5
          periodSeconds: 60
        - type: Percent
          value: 12
          periodSeconds: 60
      selectPolicy: Max
      stabilizationWindowSeconds: 0
```

This configuration defines the following settings for HorizontalPodAutoscaler (HPA):

    Metrics: The HPA uses the CPU resource and sets a target average value of 500 milli-CPU (mCPU).

    Behavior: The scaling behavior includes both scaleDown and scaleUp policies.

        Scale Down Policies: It applies two policies to scale down the number of replicas:
            The first policy will scale down with at most 4 pods if the CPU utilization is below target for 60 seconds
            The second policy will scale down with at most 10% of the current replicas if the CPU utilization is below target for 60 seconds
            SelectPolicy: Min, select the policy with the smallest change in replica count.

        Scale Up Policies: It applies two policies to scale up the number of replicas:
            The first policy will scale up with at most 5 pods if the CPU utilization is above target for 60 seconds
            The second policy will scale up with at most 10% of the current replicas if the CPU utilization is above target for 60 seconds
            SelectPolicy: Max, select the policy with the largest change in replicas count.

        Stabilization Window: When the metrics indicate that the target should be scaled down the algorithm looks into previously computed desired states, and uses the highest value from the specified interval. For scale-down the past 300 seconds will be considered, for
        scale-up there is no stabilization window, and the application is scaled-up immediately when the threshold is reached.

Warning: This feature cannot be used in combination with the VPA feature.

### Configure the trace collector(Grafana Agent)

We use the Grafana Agent to receive, process, and export telemetry data, eliminating the need for multiple
agents/collectors. It supports open source observability data formats (e.g. OTEL http, OTEL grpc, Zipkin) and integrates
with Grafana Enterprise Trace solution. Even though we support multiple protocols, there should be compelling reasons 
to use anything other than OTEL over GRPC. This is the protocol we support through our starter libraries for Kotlin 
and Java applications.

Employing a collector alongside services enables quick data offloading and additional
handling like retries, batching, authentication, and data enrichment. By having collectors work in tandem with our
services, we achieve swift data offloading, minimizing any impact on the services' performance. The buffering mechanisms 
supported by the collector minimize the risk in the event that the Grafana Enterprise Trace solution experiences problems.

The Aurora configuration supports two operation modes for telemetry data collection. The first mode involves using
an agent collector as a DaemonSet running on each node, while the second mode deploys the agent collector alongside
the service as a sidecar container. For the majority of our users, the first approach should be sufficient and
straightforward.

**Note**: this feature is currently only supported for the deployment types `deploy`, `development`, `cronjob`
and `job`.
The configuration will not be used on other deployment types, but will not fail on validation if configured.

| Name            | Default | Description                                                                       |
| --------------- | ------- | --------------------------------------------------------------------------------- |
| `trace`         |         | Simplified configuration can be used to enabled/disable the feature. Type boolean |
| `trace/enabled` |         | Enable or disable the trace feature. Type boolean.                                |

Example

```yaml
trace: true
```

In this example, we will expose the following environment variables: OTLP_GRPC_TRACING_ENDPOINT,
ZIPKIN_TRACING_ENDPOINT, and OTLP_HTTP_TRACING_ENDPOINT. These variables are used to point to the nearest node
collector, in the format IP:port.

By setting these environment variables correctly, the telemetry data will be directed to the appropriate collectors,
It's worth noting that certain frameworks, such as Spring Boot, may require an additional step. When using these
frameworks, it is essential to include the appropriate protocol prefix, such as "http://" or "https://", in the
specified endpoint URL.

The second approach with the sidecar container is tailored for more advanced users who require
greater control over the configuration and data flow. With the sidecar approach, users can fine-tune and customize the
telemetry data collection process to suit specific requirements and optimize performance.

Currently, our support includes memory requirement tuning, but we anticipate the addition of more advanced features,
such as data enrichment, in the near future. This solution will continue to evolve over time, adapting to the needs
of development teams as they require more sophisticated functionalities. For more information about the supported
capabilities in the Grafana Agent, please follow this link https://grafana.com/docs/agent/latest/flow/reference/.

| Name                                      | Default                  | Description                                                                                                                             |
| ----------------------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `trace/sidecar/enabled`                   |                          | Enable or disable the trace sidecar feature. Type boolean.                                                                              |
| `trace/sidecar/version`                   | latest supported version | Version of the grafana agent collector                                                                                                  |
| `trace/sidecar/resources/requests/cpu`    | 50m                      | cpu request for the agent container. Type Quantity https://kubernetes.io/docs/reference/kubernetes-api/common-definitions/quantity/.    |
| `trace/sidecar/resources/requests/memory` | 100Mi                    | memory request for the agent container. Type Quantity https://kubernetes.io/docs/reference/kubernetes-api/common-definitions/quantity/. |
| `trace/sidecar/resources/limits/cpu`      | 100m                     | cpu limit for the agent container. Type Quantity https://kubernetes.io/docs/reference/kubernetes-api/common-definitions/quantity/.      |
| `trace/sidecar/resources/limits/memory`   | 200Mi                    | memory limit for the agent container. Type Quantity https://kubernetes.io/docs/reference/kubernetes-api/common-definitions/quantity/.   |

Example

```yaml
trace:
  sidecar:
    enabled: true
    resources:
      requests:
        cpu: 100m
        memory: 100Mi
      limits:
        cpu: 200m
        memory: 200Mi
```

In this example, we expose the following environment variables: OTLP_GRPC_TRACING_ENDPOINT, ZIPKIN_TRACING_ENDPOINT,
and OTLP_HTTP_TRACING_ENDPOINT. These variables are used to point to the sidecar collector, with the format
localhost:port. Just like the first approach, this may also require adding the appropriate protocol prefix.

### PodDisruptionBudget - configure minimum available number of pods for high availability

A PodDisruptionBudget limits the number of pods that can be down at the same time.
AuroraConfig supports configuring the minimum number of available healthy pods, that must be available during service
operations on the cluster, for example cluster draining and scaling.
For more details about disruptions and Pod disruption budgets
see https://kubernetes.io/docs/concepts/workloads/pods/disruptions/

In AuroraConfig support for PodDisruptionBudget is implemented for minimum available pods, a PodDisruptionBudget
resource will be created in the namespace when using this functionality.
To use PodDisruptionBudget `replicas` must be at least 2. If `replicas` is below 2 or the deployment is paused, then the
PodDisruptionBudget resource will not be created but a warning will be displayed.
It is not possible to configure minimum number of available pods to be equal to or above `replicas`.

| Name                             | Default | Description                                                                                                                      |
| -------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------- |
| podDisruptionBudget              |         | Simplified configuration can be used to enable/disable the feature                                                               |
| podDisruptionBudget/enabled      |         | Can be used to enable/disable the feature                                                                                        |
| podDisruptionBudget/minAvailable | 1       | Specify the minimum available healthy pods, the feature will count as enabled when this is specified and not explicitly disabled |

Minimal example - will create a PodDisruptionBudget with minimum 1 available healthy pod

```yaml
replicas: 2
podDisruptionBudget: true
```

Minimum available example - will create a PodDisruptionBudget with minimum 3 available healthy pods

```yaml
replicas: 8
podDisruptionBudget:
  minAvailable: 3
```

### Configure Access Control

Through the access control configuration, users can grant and request ATS roles from applications that
offer or require specific roles. A prerequisite is that the role in question must be pre-defined and
present in the ATS environment. The sole responsibility of this feature is to connect the requester to
a role granted by some other application. Moreover, it is necessary to define the appropriate data
classification for the namespace, and the granter must have explicit permission to delegate access to
the role(s) in question.

#### Request access to roles

Applications can request access to roles by specifying an egress configuration. The egress configuration is
a list, in the format outlined in the following table.

| Name                                   | Default | Description                                                                                                                                          |
| -------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `accesscontrol/egress/[]/application`  |         | The name of the application we request access to. This value is mandatory and can be expressed using the supported glob pattern. Type String         |
| `accesscontrol/egress/[]/namespace`    |         | The namespace in which the application resides. This value is mandatory and can be expressed using the supported glob pattern. Type String           |
| `accesscontrol/egress/[]/cluster`      |         | The name of the cluster in which the application resides. This value is mandatory and can be expressed using the supported glob pattern. Type String |
| `accesscontrol/egress/[]/wanted_roles` |         | List of wanted roles. Type list of Strings                                                                                                           |

Aurora config example

```yaml
accesscontrol:
    egress:
        - application: foo
          namespace: *
          cluster: utv*
          wanted_roles:
              - FOO_READER
              - FOO_WRITER
        - application: bar
          namespace: barspace
          cluster: utv02
          wanted_roles:
              - BAR_READER
              - BAR_WRITER

```

In this example, we are requesting access to the roles FOO_READER and FOO_WRITER owned by the application
'foo', running in a namespace matching the pattern ‘\*’ and a cluster with a name matching the pattern
‘utv\*’. Additionally, we are also requesting access to the roles BAR_READER and BAR_WRITER for
the application 'bar' in the 'barspace' namespace on the 'utv02' cluster.

If the roles are assigned, the 'wantedaccess' object connected with this request will be displayed with
a status of 'successful.' If there are no granted roles for this request or the request is only partially
performed, the status will be marked as 'pending.' You can review the status of the request using the
following command:

```shell
oc get wantedaccess <appname> -n <namespace> -o yaml
```

#### Grant access to roles

Applications can grant access to roles by specifying an ingress configuration. The ingress configuration
is a list, in the format outlined in the following table.

| Name                                   | Default | Description                                                                                                                                          |
| -------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `accesscontrol/ingress/[]/application` |         | Name of the application that should be granted access. This value is mandatory and can be expressed using the supported glob pattern. Type String    |
| `accesscontrol/ingress/[]/namespace`   |         | The namespace in which the application resides. This value is mandatory and can be expressed using the supported glob pattern. Type String           |
| `accesscontrol/ingress/[]/cluster`     |         | The name of the cluster in which the application resides. This value is mandatory and can be expressed using the supported glob pattern. Type String |
| `accesscontrol/ingress/[]/roles`       |         | List of roles to grant the application. Type list of Strings.                                                                                        |

Aurora config example

```yaml
accesscontrol:
    ingress:
        - application: charlie
          namespace: *
          cluster: utv*
          roles:
              - FOO_READER
        - application: delta
          namespace: deltaspace
          cluster: utv02
          roles:
              - FOO_WRITER

```

In this example, we are granting access to the FOO_READER role for the requesting application 'charlie,'
running in a namespace matching the pattern ‘\*’ and with a cluster named matching the pattern ‘utv\*’.
Additionally, we are also granting access to the FOO_WRITER role for the requesting application 'delta,'
running in the 'deltaspace' namespace on the 'utv02' cluster.

If the affiliation to which the application belongs is permitted to grant these roles, the status of
the connected 'grantedaccess' object will be 'successful' or 'failed' in the case of failures.
You can review the status of the request using the following command:

```shell
oc get grantedaccess <appname> -n <namespace> -o yaml
```

#### Supported glob pattern

Application, namespace, and cluster parameters in both ingress and egress must adhere to the regular
expression [\\*]|[^\\d](\w)((?!\\*\\w).)+. For example, "test," "test," "test," "test123sd," "",
and "test213" are considered valid, while "123Test," "tes*st" are not.

## Example configuration

### Simple reference-application

Below is an example of how you could configure an instance of
the [reference application](https://github.com/skatteetaten/openshift-reference-springboot-server)

about.yaml

```yaml
schemaVersion: v1
affiliation: paas
permissions:
  admin: [PAAS_OPS, PAAS_DEV]
logging:
  index: paas-test
```

reference.yaml

```yaml
groupId: no.skatteetaten.aurora.openshift
artifactId: openshift-reference-springboot-server
version: 1
type: deploy
replicas: 3
sts: true
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
permissions:
  admin: [PAAS_OPS, PAAS_DEV]
logging:
  index: paas-test
groupId: no.skatteetaten.aurora.openshift
artifactId: openshift-reference-springboot-server
version: 1
type: deploy
replicas: 3
sts: true
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
permissions:
  admin: [PAAS_OPS, PAAS_DEV]
logging:
  index: paas-test
```

sample-atomhopper.yaml

```yaml
type: template
template: aurora-atomhopper-1.0.0
databaseDefaults:
  flavor: POSTGRES_MANAGED
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
permissions:
  admin: [PAAS_OPS, PAAS_DEV]
logging:
  index: paas-test
type: template
template: aurora-atomhopper-1.0.0
databaseDefaults:
  flavor: POSTGRES_MANAGED
database: true
route: true
parameters:
  FEED_NAME: feed
  DB_NAME: atomhopper
  DOMAIN_NAME: localhost
```

### Example configuration for alerts

Single application _utv/sample-app.yaml_

```yaml
baseFile: "sample-app.yaml"
---
alerts:
  failed-connections:
    enabled: true
    delay: "2"
    connections:
      - "aurora"
    expr: "failed_connections > 5"
    severity: "critical"
    summary: "Connections has failed over 5 times"
    description: "Instance has had over 5 connection failures"
  duplicate-entries:
    enabled: true
    delay: "5"
    connections:
      - "aurora"
    expr: "duplicate_entries > 10"
    severity: "warning"
    summary: "Duplicate entries has been registered over 10 times"
    Description: "Application has registered over 10 duplicates"
```

Default alert configuration with override
_sample-app.yaml_

```yaml
---
alertsDefaults:
  enabled: true
  delay: "5"
  connections:
    - "aurora"
```

_utv/sample-app.yaml_

```yaml
baseFile: "sample-app.yaml"
---
alerts:
  failed-connections:
    delay: "1"
    expr: "failed_connections > 5"
    severity: "critical"
    summary: "Connections has failed over 5 times"
    description: "Instance has had over 5 connection failures"
  duplicate-entries:
    expr: "duplicate_entries > 10"
    severity: "warning"
    summary: "Duplicate entries has been registered over 10 times"
    Description: "Application has registered over 10 duplicates"
```

## Guidelines for developing templates

When creating templates the following guidelines should be followed:

- include the following parameters VERSION, NAME and if appropriate REPLICAS. They will be populated from relevant
  AuroraConfig fields
- the following labels will be added to the template: app, affiliation, updatedBy
- if the template does not have a VERSION parameter it will not be upgradable from internal web tools
- Each container in the template will get additional ENV variables applied if NTA specific integrations are applied.
