---
title: "Azure Container App Jobs - Terraform"
categories:
    - Azure
    - ACA
    - ACA Jobs
tags:
    - azure
    - acajobs
---

## TL;DR
- ACA jobs can be defined in TF but for now, they're not available as a TF resource
- need to use an AzAPI provider resource
- can use `ManagedServiceIdentity` using `identity` definition
- can define ACA secrets (to hide auth info, etc)
- for event-driven jobs, use keda scalers to configure events and scale rules
    - can define the scale rule using properties defined in the KEDA ScaledJob object, and the KEDA scalers in `JobScaleRule`

## Example resource
```
resource "azapi_resource" "symbolicname" {
  type = "Microsoft.App/jobs@2023-05-01"
  name = "string"
  location = "string"
  parent_id = "string"
  tags = {
    tagName1 = "tagValue1"
    tagName2 = "tagValue2"
  }
  identity {
    type = "string"
    identity_ids = []
  }
  body = jsonencode({
    properties = {
      configuration = {
        eventTriggerConfig = {
          parallelism = int
          replicaCompletionCount = int
          scale = {
            maxExecutions = int
            minExecutions = int
            pollingInterval = int
            rules = [
              {
                auth = [
                  {
                    secretRef = "string"
                    triggerParameter = "string"
                  }
                ]
                name = "string"
                type = "string"
              }
            ]
          }
        }
        manualTriggerConfig = {
          parallelism = int
          replicaCompletionCount = int
        }
        registries = [
          {
            identity = "string"
            passwordSecretRef = "string"
            server = "string"
            username = "string"
          }
        ]
        replicaRetryLimit = int
        replicaTimeout = int
        scheduleTriggerConfig = {
          cronExpression = "string"
          parallelism = int
          replicaCompletionCount = int
        }
        secrets = [
          {
            identity = "string"
            keyVaultUrl = "string"
            name = "string"
            value = "string"
          }
        ]
        triggerType = "string"
      }
      environmentId = "string"
      template = {
        containers = [
          {
            args = [
              "string"
            ]
            command = [
              "string"
            ]
            env = [
              {
                name = "string"
                secretRef = "string"
                value = "string"
              }
            ]
            image = "string"
            name = "string"
            probes = [
              {
                failureThreshold = int
                httpGet = {
                  host = "string"
                  httpHeaders = [
                    {
                      name = "string"
                      value = "string"
                    }
                  ]
                  path = "string"
                  port = int
                  scheme = "string"
                }
                initialDelaySeconds = int
                periodSeconds = int
                successThreshold = int
                tcpSocket = {
                  host = "string"
                  port = int
                }
                terminationGracePeriodSeconds = int
                timeoutSeconds = int
                type = "string"
              }
            ]
            resources = {
              cpu = "decimal-as-string"
              memory = "string"
            }
            volumeMounts = [
              {
                mountPath = "string"
                subPath = "string"
                volumeName = "string"
              }
            ]
          }
        ]
        initContainers = [
          {
            args = [
              "string"
            ]
            command = [
              "string"
            ]
            env = [
              {
                name = "string"
                secretRef = "string"
                value = "string"
              }
            ]
            image = "string"
            name = "string"
            resources = {
              cpu = "decimal-as-string"
              memory = "string"
            }
            volumeMounts = [
              {
                mountPath = "string"
                subPath = "string"
                volumeName = "string"
              }
            ]
          }
        ]
        volumes = [
          {
            mountOptions = "string"
            name = "string"
            secrets = [
              {
                path = "string"
                secretRef = "string"
              }
            ]
            storageName = "string"
            storageType = "string"
          }
        ]
      }
      workloadProfileName = "string"
    }
  })
}
```

## References
- [Microsoft.App jobs - Terraform](https://learn.microsoft.com/en-us/azure/templates/microsoft.app/jobs?pivots=deployment-language-terraform)
- [ManagedServiceIdentity](https://learn.microsoft.com/en-us/azure/templates/microsoft.app/jobs?pivots=deployment-language-terraform#managedserviceidentity-2)
- [JobScaleRule](https://learn.microsoft.com/en-us/azure/templates/microsoft.app/jobs?pivots=deployment-language-terraform#jobscalerule-2)