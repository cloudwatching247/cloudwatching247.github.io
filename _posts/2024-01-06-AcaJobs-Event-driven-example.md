---
title: "Azure Container App Jobs - Event-driven example"
categories:
    - Azure
    - ACA
    - ACA Jobs
tags:
    - azure
    - acajobs
---

## TL;DR
- launch an ACA job with an event driven trigger, using `az` cli
- trigger: a message is put on an azure storage queue
- job: retrieve the message from the queue and print it in the logs

## Overview
- Create a Container Apps environment to deploy your container apps
- Create an Azure Storage Queue to send messages to the container app
- Build a container image that runs a job
- Deploy the job to the Container Apps environment
- Verify that the queue messages are processed by the container app

### Job overview
1. Dequeues one message from the queue.
2. Logs the message to the job execution logs.
3. Deletes the message from the queue.
4. Exits.

### Setup
1. Login using the `az` cli: 
```
az login
```
2. Upgrade if needed: 
```
az upgrade
```
3. Add ACA CLI extension: 
```
az extension add --name containerapp --upgrade
```
4. Register required namespaces:
```
az provider register --namespace Microsoft.App
az provider register --namespace Microsoft.OperationalInsights
```
5. Define the needed `env` vars:
```
RESOURCE_GROUP="jobs-quickstart"
LOCATION="northcentralus"
ENVIRONMENT="env-jobs-quickstart"
JOB_NAME="my-job"
STORAGE_ACCOUNT_NAME="<STORAGE_ACCOUNT_NAME>"
QUEUE_NAME="myqueue"
CONTAINER_IMAGE_NAME="queue-reader-job:1.0"
CONTAINER_REGISTRY_NAME="<CONTAINER_REGISTRY_NAME>"
```

### Create a Container Apps environment
1. Create an RG:
```
az group create --name "$RESOURCE_GROUP" --location "$LOCATION"
```
2. Create an ACA environment:
```
az containerapp env create --name "$ENVIRONMENT" --resource-group "$RESOURCE_GROUP" --location "$LOCATION"
```

### Set up a storage queue
1. Create the storage account:
```
az storage account create --name "$STORAGE_ACCOUNT_NAME" --resource-group "$RESOURCE_GROUP" --location "$LOCATION" --sku Standard_LRS --kind StorageV2
```
2. Get storage account connection string used for connecting to the storage account:
```
QUEUE_CONNECTION_STRING=`az storage account show-connection-string -g $RESOURCE_GROUP --name $STORAGE_ACCOUNT_NAME --query connectionString --output tsv`
```
3. Using the connection string, create the storage queue
```
az storage queue create --name "$QUEUE_NAME" --account-name "$STORAGE_ACCOUNT_NAME" --connection-string "$QUEUE_CONNECTION_STRING"
```

### Build and deploy the job
1. Create the ACR:
```
az acr create --name "$CONTAINER_REGISTRY_NAME" --resource-group "$RESOURCE_GROUP" --location "$LOCATION" --sku Basic --admin-enabled true
```
2. Build an image in the ACR using an Azure provided Dockerfile:
```
az acr build --registry "$CONTAINER_REGISTRY_NAME" --image "$CONTAINER_IMAGE_NAME" "https://github.com/Azure-Samples/container-apps-event-driven-jobs-tutorial.git"
```
3. Create the ACA enviroment:
```
az containerapp job create --name "$JOB_NAME" --resource-group "$RESOURCE_GROUP" --environment "$ENVIRONMENT" --trigger-type "Event" --replica-timeout "1800" --replica-retry-limit "1" --replica-completion-count "1" --parallelism "1" --min-executions "0" --max-executions "10" --polling-interval "60" --scale-rule-name "queue" --scale-rule-type "azure-queue" --scale-rule-metadata "accountName=$STORAGE_ACCOUNT_NAME" "queueName=$QUEUE_NAME" "queueLength=1" --scale-rule-auth "connection=connection-string-secret" --image "$CONTAINER_REGISTRY_NAME.azurecr.io/$CONTAINER_IMAGE_NAME" --cpu "0.5" --memory "1Gi" --secrets "connection-string-secret=$QUEUE_CONNECTION_STRING" --registry-server "$CONTAINER_REGISTRY_NAME.azurecr.io" --env-vars "AZURE_STORAGE_QUEUE_NAME=$QUEUE_NAME" "AZURE_STORAGE_CONNECTION_STRING=secretref:connection-string-secret"
```

| Parameter                  | Description                                                                                              |
| -------------------------- | -------------------------------------------------------------------------------------------------------- |
| --replica-timeout          | The maximum duration a replica can execute.                                                              |
| --replica-retry-limit      | The number of times to retry a replica.                                                                  |
| --replica-completion-count | The number of replicas to complete successfully before a job execution is considered successful.         |
| --parallelism              | The number of replicas to start per job execution.                                                       |
| --min-executions           | The minimum number of job executions to run per polling interval.                                        |
| --max-executions           | The maximum number of job executions to run per polling interval.                                        |
| --polling-interval         | The polling interval at which to evaluate the scale rule.                                                |
| --scale-rule-name          | The name of the scale rule.                                                                              |
| --scale-rule-type          | The type of scale rule to use.                                                                           |
| --scale-rule-metadata      | The metadata for the scale rule.                                                                         |
| --scale-rule-auth          | The authentication for the scale rule.                                                                   |
| --secrets                  | The secrets to use for the job.                                                                          |
| --registry-server          | The container registry server to use for the job.                                                        |
| --env-vars                 | The environment variables to use for the job.                                                            |

### Verify the deployment
1. Send a message to the queue:
```
az storage message put --content "Hello Queue Reader Job" --queue-name "$QUEUE_NAME" --connection-string "$QUEUE_CONNECTION_STRING"
```
2. List the executions of a job:
```
az containerapp job execution list --name "$JOB_NAME" --resource-group "$RESOURCE_GROUP" --output json
```
3. View the logs:
```
LOG_ANALYTICS_WORKSPACE_ID=`az containerapp env show --name $ENVIRONMENT --resource-group $RESOURCE_GROUP --query properties.appLogsConfiguration.logAnalyticsConfiguration.customerId --out tsv 

az monitor log-analytics query --workspace "$LOG_ANALYTICS_WORKSPACE_ID" --analytics-query "ContainerAppConsoleLogs_CL | where ContainerJobName_s == '$JOB_NAME' | order by _timestamp_d asc"
```

### Clean up resources
1. Delete the RG:
```
az group delete --resource-group $RESOURCE_GROUP
```

## References
- [Deploy an event-driven job with Azure Container Apps](https://learn.microsoft.com/en-us/azure/container-apps/tutorial-event-driven-jobs)