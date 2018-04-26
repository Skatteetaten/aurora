## How do we build

Building an image is done with out central build logic [architect](docs#architect) that implements the [CustomBuilder](https://docs.openshift.org/latest/creating_images/custom.html) contract. 

Triggering a build can be done in several ways:
* via [AuroraPipeline](docs#auroraPipeline) as a [semanic release](docs#semantic) or as a [wip/branch build](docs#snapshot-build)
* as a binary-build directly from a local client for [development flow](aurora#development-flow) builds. This will buypass Nexus and read DeliveryBundle from stdin 
* when the build logic or base image changes a trigger will be fired to rebuild in order to support [patching](docs#patching). 
