---
title: "Aviatrix Platform HA v3 - Azure"
categories:
    - Aviatrix
    - Platform HA
tags:
    - aviatrix
    - azureha
---

## TL;DR
- An Azure storage account contains all of your Azure Storage data objects: blobs, files, queues, and tables. 

## Standard endpoints

| Storage service               | Endpoint                                         |
| ----------------------------- | ------------------------------------------------ |
| Blob Storage 	                | https://<storage-account>.blob.core.windows.net  |
| Static website (Blob Storage) | https://<storage-account>.web.core.windows.net   |
| Data Lake Storage Gen2        | https://<storage-account>.dfs.core.windows.net   |
| Azure Files 	                | https://<storage-account>.file.core.windows.net  |
| Queue Storage                 | https://<storage-account>.queue.core.windows.net |
| Table Storage 	            | https://<storage-account>.table.core.windows.net |

## References
- [Azure Storage Standard Endpoints](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-overview#storage-account-endpoints)