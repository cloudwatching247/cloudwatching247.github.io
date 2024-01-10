---
title: "Azure Container Apps - Scaling Rules"
categories:
    - Azure
    - ACA
    - ACA Jobs
tags:
    - azure
    - aca
    - acajobs
---

## TL;DR

### Overview 
- container apps use scaling rules to determine horizontal scaling (number of replicas)
- event-driven container app jobs use scaling rules to trigger executions based on events
- scaling includes limits, rules and behaviour
- setting min replica to 1 (or higher) will mean the app is always running
    - but apps that scale to 0 will not incur costs at 0 replicas

### ACA Jobs
- for event driven jobs, only custom scale rules are used
- custom scale rules use KEDA scalers
    - configure the scaler according to the scaler docs from KEDA website
    - scaler auth params are convereted into container app secrets

## Scale Rules

### HTTP Rules

- HTTP: Based on the number of concurrent HTTP requests to your revision - NA for ACA jobs

#### Steps

1. Define an HTTP scale rule using the `--scale-rule-http-concurrency` parameter in the `create` or `update` commands.
```
az containerapp create \
    --name <CONTAINER_APP_NAME> \
    --resource-group <RESOURCE_GROUP> \
    --environment <ENVIRONMENT_NAME> \
    --image <CONTAINER_IMAGE_LOCATION>
    --min-replicas 0 \
    --max-replicas 5 \
    --scale-rule-name azure-http-rule \
    --scale-rule-type http \
    --scale-rule-http-concurrency 100
```

### TCP Rules

- TCP: Based on the number of concurrent TCP connections to your revision - NA for ACA jobs

#### Steps

1. Define a TCP scale rule using the `--scale-rule-tcp-concurrency` parameter in the `create` or `update` commands.
```
az containerapp create \
    --name <CONTAINER_APP_NAME> \
    --resource-group <RESOURCE_GROUP> \
    --environment <ENVIRONMENT_NAME> \
    --image <CONTAINER_IMAGE_LOCATION>
    --min-replicas 0 \
    --max-replicas 5 \
    --scale-rule-name azure-tcp-rule \
    --scale-rule-type tcp \
    --scale-rule-tcp-concurrency 100
```

### Custom Rules

- Custom: Based on CPU, memory, or supported event-driven data sources (using KEDA scalers)
    - for container apps, custom scale rules can based on any ScaledObject-based KEDA scalers
    - for container app jobs, custom scale rules can based on any ScaledJob-based KEDA scalers

#### Steps

1. From the KEDA scaler specification, find the `type` value.
```
triggers:
- type: azure-servicebus              # <-- this
  metadata:
    queueName: my-queue
    namespace: service-bus-namespace
    messageCount: "5"
```

2. In the CLI command, set the `--scale-rule-type` parameter to the specification `type` value.
```
az containerapp create \
  --name <CONTAINER_APP_NAME> \
  --resource-group <RESOURCE_GROUP> \
  --environment <ENVIRONMENT_NAME> \
  --image <CONTAINER_IMAGE_LOCATION>
  --min-replicas 0 \
  --max-replicas 5 \
  --secrets "connection-string-secret=<SERVICE_BUS_CONNECTION_STRING>" \
  --scale-rule-name azure-servicebus-queue-rule \
  --scale-rule-type azure-servicebus \                                      # <-- this
  --scale-rule-metadata "queueName=my-queue" \
                        "namespace=service-bus-namespace" \
                        "messageCount=5" \
  --scale-rule-auth "connection=connection-string-secret"
```

3. From the KEDA scaler specification, find the `metadata` values.
```
triggers:
- type: azure-servicebus
  metadata:
    queueName: my-queue                # <-- this
    namespace: service-bus-namespace   # <-- this
    messageCount: "5"                  # <-- this
```

4. In the CLI command, set the --scale-rule-metadata parameter to the metadata values. 
    - You'll need to transform the values from a YAML format to a key/value pair for use on the command line. Separate each key/value pair with a space.
```
az containerapp create \
  --name <CONTAINER_APP_NAME> \
  --resource-group <RESOURCE_GROUP> \
  --environment <ENVIRONMENT_NAME> \
  --image <CONTAINER_IMAGE_LOCATION>
  --min-replicas 0 \
  --max-replicas 5 \
  --secrets "connection-string-secret=<SERVICE_BUS_CONNECTION_STRING>" \
  --scale-rule-name azure-servicebus-queue-rule \
  --scale-rule-type azure-servicebus \
  --scale-rule-metadata "queueName=my-queue" \                # <-- this
                        "namespace=service-bus-namespace" \   # <-- this
                        "messageCount=5" \                    # <-- this
  --scale-rule-auth "connection=connection-string-secret"
```

#### Authentication
- For authentication, KEDA scaler authentication parameters convert into Container Apps secrets.
- A KEDA scaler may support using secrets in a `TriggerAuthentication` that is referenced by the `authenticationRef` property. 
- You can map the `TriggerAuthentication` object to the Container Apps scale rule.
- Container Apps scale rules only support secret references. Other authentication types such as pod identity are not supported.

##### Steps
1. Find the `TriggerAuthentication` object referenced by the KEDA `ScaledObject` specification.
- Identify each `secretTargetRef` of the `TriggerAuthentication` object
```
apiVersion: v1
kind: Secret                                               # 3. a. this is secret resource that is referred to, by the
metadata:                                                  # secretTargetRefs
  name: my-secrets
  namespace: my-project
type: Opaque
data:
  connection-string-secret: <SERVICE_BUS_CONNECTION_STRING>
---
apiVersion: keda.sh/v1alpha1
kind: TriggerAuthentication
metadata:
  name: azure-servicebus-auth                              # 2. a. this is the TriggerAuthentication resrouce that refers to a
spec:                                                      # secretTargetRef. there may be multiple secretTargetRefs
  secretTargetRef:                                         # 2. b. this is one of the secretTargetRefs 
  - parameter: connection
    name: my-secrets
    key: connection-string-secret
---
apiVersion: keda.sh/v1alpha1
kind: ScaledObject                                         # 1. a. this is a ScaledObject scaler that uses authentication
metadata:                                                  # via TriggerAuthentication
  name: azure-servicebus-queue-rule
  namespace: default
spec:
  scaleTargetRef:
    name: my-scale-target
  triggers:
  - type: azure-servicebus
    metadata:
      queueName: my-queue
      namespace: service-bus-namespace
      messageCount: "5"
    authenticationRef:
        name: azure-servicebus-auth                         # 1. b. this is the authenticationRef referring to the TriggerAuthentication
```

2. In your container app, create the secrets that match the secretTargetRef properties.

3. In the CLI command, set parameters for each secretTargetRef entry.
    - Create a secret entry with the `--secrets` parameter. If there are multiple secrets, separate them with a space.
    - Create an authentication entry with the `--scale-rule-auth` parameter. If there are multiple entries, separate them with a space.
```
az containerapp create \
  --name <CONTAINER_APP_NAME> \
  --resource-group <RESOURCE_GROUP> \
  --environment <ENVIRONMENT_NAME> \
  --image <CONTAINER_IMAGE_LOCATION>
  --min-replicas 0 \
  --max-replicas 5 \
  --secrets "connection-string-secret=<SERVICE_BUS_CONNECTION_STRING>" \    # this is the secrets parameter
  --scale-rule-name azure-servicebus-queue-rule \
  --scale-rule-type azure-servicebus \
  --scale-rule-metadata "queueName=my-queue" \
                        "namespace=service-bus-namespace" \
                        "messageCount=5" \
  --scale-rule-auth "connection=connection-string-secret"                   # this is the scale-rule-auth parameter that uses the secrets
```

## Scale Behaviours
- **Polling interval** is how frequently event sources are queried by KEDA. This value doesn't apply to HTTP and TCP scale rules.
    - default: 30 seconds
- **Cool down period** is how long after the last event was observed before the application scales down to its minimum replica count.
    - default: 300 seconds
- **Scale up stabilization window** is how long to wait before performing a scale up decision once scale up conditions were met.
    - default: 0 seconds
- **Scale down stabilization window** is how long to wait before performing a scale down decision once scale down conditions were met.
    - default: 300 seconds
- **Scale up step** is the rate new instances are added at. It starts with 1, 4, 8, 16, 32, ... up to the configured maximum replica count.
    - default: 1, 4, 100% of current
- **Scale down step** is the rate at which replicas are removed. By default 100% of replicas that need to shut down are removed.
    - default: 100% of current
- **Scaling algorithm** is the formula used to calculate the current desired number of replicas.
    - default: `desiredReplicas = ceil(currentMetricValue / targetMetricValue)`

## Example
```
"minReplicas": 0,
"maxReplicas": 20,
"rules": [
  {
    "name": "azure-servicebus-queue-rule",
    "custom": {
      "type": "azure-servicebus",
      "metadata": {
        "queueName": "my-queue",
        "namespace": "service-bus-namespace",
        "messageCount": "5"
      }
    }
  }
]
```
- Starting with an empty queue, KEDA takes the following steps in a scale up scenario:
1. Check my-queue every 30 seconds.
2. If the queue length equals 0, go back to (1).
3. If the queue length is > 0, scale the app to 1.
4. If the queue length is 50, calculate desiredReplicas = ceil(50/5) = 10.
5. Scale app to min(maxReplicaCount, desiredReplicas, max(4, 2*currentReplicaCount))
6. Go back to (1).

## References
- [Set scaling rules in Azure Container Apps](https://learn.microsoft.com/en-us/azure/container-apps/scale-app?pivots=azure-cli)
- [KEDA scalers](https://keda.sh/docs/2.12/scalers/)
- [ScaledObject](https://keda.sh/docs/2.12/concepts/scaling-deployments/)
- [ScaledJob](https://keda.sh/docs/2.12/concepts/scaling-jobs/)
- [Manage secrets in Azure Container Apps](https://learn.microsoft.com/en-us/azure/container-apps/manage-secrets?tabs=azure-cli)
- [KEDA Authentication](https://keda.sh/docs/2.12/concepts/authentication/)