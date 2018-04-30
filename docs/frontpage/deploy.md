## How do we deploy

An deploy starts with triggering the AuroraAPI from either of the userfacing clients [AO](/documentation/openshift/#ao), [AuroraKonsole](/documentation/openshift/#aurora-console) or [AuroraPipeline](#). The API will then extract and [merge AuroraConfig](/documentation/aurora-config/) in order to create a AuroraDeploymentSpec.

[Synchrous integrations](#) are run and the result of both are assembled into Kubernetes objects that are applied to the cluster. Async integrations will that use the [controller pattern](https://kubernetes.io/docs/concepts/api-extension/custom-resources/#custom-controllers) will run and add aditional resources. The application is then rolled out either via importing a new image or triggering a new deploy. The [deploy result](#) is save for later inspection.
