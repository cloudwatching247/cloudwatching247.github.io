---
title: "Azure Storage Queue Python SDK"
categories:
    - Azure
    - Storage Queues
tags:
    - azure
    - storagequeue
---

## TL;DR
- overall steps:
    - set up the app framework
    - authenticate Azure
    - write the code for the storage queue
- side node: azure storage queue's default authentication method is set based on the storage account

## Azure Storage Queue Authentication
- by default, new azure storage queues use the default authentication method of the storage account
- default storage account authentication can be set in "Settings > Configuration"
- to use `DefaultAzureCredentials()` in the Python code, the storage account queue needs to use Microsoft Entra ID auth, not connection string auth

## References
- [Azure Queue Storage client library for Python](https://learn.microsoft.com/en-us/azure/storage/queues/storage-quickstart-queues-python?tabs=passwordless%2Croles-azure-portal%2Cenvironment-variable-linux%2Csign-in-azure-cli#create-a-queue)
- [Azure Storage Queue authentication](https://learn.microsoft.com/en-us/azure/storage/queues/authorize-data-operations-portal)