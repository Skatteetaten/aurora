## Why did you make things inhouse?

* Both Kubernetes and OpenShift lack a concept we have called **affiliation**. That is groups of people that can administer or view objects for several projects. We have several different development teams that work on our clusters and we want them to be able to work in **isolation**.

* The ability to deploy applications to **several clusters** in one command is highly desired within our organization. Our network infrastructure implies that we need to have multiple clusters.

* When configuring how to deploy applications and projects we want to avoid duplication. Our **declarative** config format AuroraConfig supports **composition** with **sane defaults**
