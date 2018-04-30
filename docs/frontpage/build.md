## How do we build

Building an image is done with out central build logic [architect](/documentation/openshift/#the-application-image-builder-architect) that implements the [CustomBuilder](https://docs.openshift.org/latest/creating_images/custom.html) contract.

Triggering a build can be done in several ways:

* via [AuroraPipeline](#) as a [semanic release](/documentation/openshift/#deployment-and-patching-strategy) or as a [wip/branch build](#)
* as a binary-build directly from a local client for [development flow](/documentation/openshift/#development-flow) builds. This will buypass Nexus and read DeliveryBundle from stdin
* when the build logic or base image changes a trigger will be fired to rebuild in order to support [patching](/documentation/openshift/#deployment-and-patching-strategy).
