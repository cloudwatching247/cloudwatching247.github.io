---
title: "Azure Container App Jobs - Overview"
categories:
    - Azure
    - ACA
    - ACA Jobs
tags:
    - azure
    - acajobs
---

## TL;DR
- ACA jobs are containerized tasks that run temporarily and exit
- ACA jobs and apps can run in the same ACA environment

## ACA apps vs. ACA jobs
- apps are `services` that run continuously - containers are restarted if they fail
- jobs are `tasks` that run temporarily - containers perform a task, and then stop

## Triggers
- ACA jobs have 3 trigger types:
    - `manual`: job is triggered on-demand
    - `schedule`: job that runs at a specific time (repeatedly)
    - `event`: job that runs in response to an event

### Manual jobs
- triggered using the `az` CLI, or an API request to the ARM API
- create a manual job:
```
az containerapp job create \
    --name "my-job" --resource-group "my-resource-group"  --environment "my-environment" \
    --trigger-type "Manual" \
    --replica-timeout 1800 --replica-retry-limit 0 --replica-completion-count 1 --parallelism 1 \
    --image "mcr.microsoft.com/k8se/quickstart-jobs:latest" \
    --cpu "0.25" --memory "0.5Gi"
```

### Schedule jobs
- triggered using a schedule defined by a [`cron`](https://en.wikipedia.org/wiki/Cron) expression
- create a schedule job:
```
az containerapp job create --name "my-job" --resource-group "my-resource-group"  --environment "my-environment" --trigger-type "Schedule" --replica-timeout 1800 --replica-retry-limit 0 --replica-completion-count 1 --parallelism 1 --image "mcr.microsoft.com/k8se/quickstart-jobs:latest" --cpu "0.25" --memory "0.5Gi" --cron-expression "*/1 * * * *"
```

### Event-driven jobs
- triggered by events from supported custom scalers
    - custom scalers are [any scalers supported by KEDA](https://keda.sh/docs/2.12/scalers/)
    - **to create custom scalers, use the `type` and the corresponding `metadata` provided in the KEDA specification**
- containers and apps both use KEDA scalers
    - for apps, a container replica processes data, and the scale rule determines the number of replicas
    - for jobs, a job container processes a single event, and the scale rule determines the number of jobs to run
- event-driven jobs are similar to [KEDA scaling jobs](https://keda.sh/docs/2.12/concepts/scaling-jobs/)
- create an event driven job using an `Azure Storage queue` scale rule:
```
az containerapp job create --name "my-job" --resource-group "my-resource-group"  --environment "my-environment" --trigger-type "Event" --replica-timeout 1800 --replica-retry-limit 0 --replica-completion-count 1 --parallelism 1 --image "docker.io/myuser/my-event-driven-job:latest" --cpu "0.25" --memory "0.5Gi" --min-executions "0" --max-executions "10" --scale-rule-name "queue" --scale-rule-type "azure-queue" --scale-rule-metadata "accountName=mystorage" "queueName=myqueue" "queueLength=1" --scale-rule-auth "connection=connection-string-secret" --secrets "connection-string-secret=<QUEUE_CONNECTION_STRING>"
```

## Start a job execution on demand
- all job types can be executed on demand
- when executing a job on demand, you can override the job config as needed
1. Get the current job config and save the template to a file:
```
az containerapp job show --name "my-job" --resource-group "my-resource-group" --query "properties.template" --output yaml > my-job-template.yaml
```
- It should save something like this:
```
containers:
- name: print-hello
  image: ubuntu
  resources:
    cpu: 1
    memory: 2Gi
  env:
  - name: MY_NAME
    value: Azure Container Apps jobs
  args:
  - /bin/bash
  - -c
  - echo "Hello, $MY_NAME!"
```
- Make the necessary config changes to the above template file

2. Run the job using the modified template:
```
az containerapp job start --name "my-job" --resource-group "my-resource-group" --yaml my-job-template.yaml
```

## References
- [Jobs in Azure Container Apps](https://learn.microsoft.com/en-us/azure/container-apps/jobs?tabs=azure-cli)
- [ACA Custom Scale Rule using Azure Service Bus](https://learn.microsoft.com/en-us/azure/container-apps/scale-app?pivots=azure-portal#example-2)
- [KEDA Scaling Jobs](https://keda.sh/docs/2.12/concepts/scaling-jobs/)
- [KEDA Scalers](https://keda.sh/docs/2.12/scalers/)
- [az containerapp job CLI](https://learn.microsoft.com/en-us/cli/azure/containerapp/job?view=azure-cli-latest)