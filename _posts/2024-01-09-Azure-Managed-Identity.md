---
title: "Azure Container Apps - Managed Identity"
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
- use managed identity to connect ACA and ACA jobs to protected resources, without using any passwords
- 2 types of managed identities: system-assigned, user-assigned

## Assign a system-assigned identity
- we don't have to make this managed identity prior to assigning it
```
az containerapp identity assign --name myApp --resource-group myResourceGroup --system-assigned
```

## Authenticate via python using system-assigned identity
```
from azure.identity import ManagedIdentityCredential
from azure.keyvault.secrets import SecretClient

credential = ManagedIdentityCredential()
client = SecretClient("https://my-vault.vault.azure.net", credential)
```

## Assign a user-assigned identity
- create the user-assigned identity
```
az identity create --resource-group <GROUP_NAME> --name <IDENTITY_NAME> --output json
```
- assign the identity
```
az containerapp identity assign --resource-group <GROUP_NAME> --name <APP_NAME> --user-assigned <IDENTITY_RESOURCE_ID>
```

## Authenticate via python using user-assigned identity
```
from azure.identity import ManagedIdentityCredential
from azure.keyvault.secrets import SecretClient

credential = ManagedIdentityCredential(client_id=managed_identity_client_id)
client = SecretClient("https://my-vault.vault.azure.net", credential)
```

## View managed identities
```
az containerapp identity show --name <APP_NAME> --resource-group <GROUP_NAME>
```

## Remove a managed identity
- To remove the system-assigned identity:
```
az containerapp identity remove --name <APP_NAME> --resource-group <GROUP_NAME> --system-assigned
```
- To remove one or more user-assigned identities:
```
az containerapp identity remove --name <APP_NAME> --resource-group <GROUP_NAME> --user-assigned <IDENTITY1_RESOURCE_ID> <IDENTITY2_RESOURCE_ID>
```


## References
- [Managed identities in Azure Container Apps](https://learn.microsoft.com/en-us/azure/container-apps/managed-identity?tabs=cli%2Cpython)
- [Azure Identity client library for Python](https://learn.microsoft.com/en-us/python/api/overview/azure/identity-readme?view=azure-python#authenticating-with-defaultazurecredential)