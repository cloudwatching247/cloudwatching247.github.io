---
title: "Azure Container Apps - Secrets"
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
- use secrets to securely store sensitive configuration values
- secrets are defined at the app level, but are available to the app revisions

## Define secrets
- When you create a container app, secrets are defined using the `--secrets` parameter
    - The parameter accepts a space-delimited set of name/value pairs
    - Each pair is delimited by an equals sign (=)
    ```
    az containerapp create --resource-group "my-resource-group" --name queuereader --environment "my-environment-name" --image demos/queuereader:v1 --secrets "queue-connection-string=<CONNECTION_STRING>"
    ```

## Use secrets directly
- When a secret is defined, the secret is stored in Azure Key Vault, and the app has a reference to it
    - when a container is running, ACA automatically gets the secret from the reference, and gives to the container
- the container app must be able to access the Azure Key Vault to retrieve the secret
    - use `Managed Identity`
- secrets are defined using the `--secrets` parameter when creating the container app
```
az containerapp create --resource-group "my-resource-group" --name queuereader --environment "my-environment-name" --image demos/queuereader:v1 --user-assigned "<USER_ASSIGNED_IDENTITY_ID>" --secrets "queue-connection-string=keyvaultref:<KEY_VAULT_SECRET_URI>,identityref:<USER_ASSIGNED_IDENTITY_ID>"
```
- the parameter accepts a space-delimited set of name/value pairs.
- each pair is delimited by an equals sign (=).
- to specify a Key Vault reference, use the format 
```
<SECRET_NAME>=keyvaultref:<KEY_VAULT_SECRET_URI>,identityref:<MANAGED_IDENTITY_ID>.
```
- Example:
```
queue-connection-string=keyvaultref:https://mykeyvault.vault.azure.net/secrets/queuereader,identityref:/subscriptions/00000000-0000-0000-0000-000000000000/resourcegroups/my-resource-group/providers/Microsoft.ManagedIdentity/userAssignedIdentities/my-identity
```

## Use secrets in env vars
- secrets can be added to the env vars for the container - use the `secretref` parameter
```
az containerapp create --resource-group "my-resource-group" --name myQueueApp --environment "my-environment-name" --image demos/myQueueApp:v1 --secrets "queue-connection-string=$CONNECTIONSTRING" --env-vars "QueueName=myqueue" "ConnectionString=secretref:queue-connection-string"
```

## Caveats

- Key Vault secret URI must be in one of the following formats:
    - `https://myvault.vault.azure.net/secrets/mysecret/ec96f02080254f109c51a1f14cdb1931`: Reference a specific version of a secret.
    - `https://myvault.vault.azure.net/secrets/mysecret`: Reference the latest version of a secret.
        - this is the default


## References
- [Manage secrets in Azure Container Apps](https://learn.microsoft.com/en-us/azure/container-apps/manage-secrets?tabs=azure-cli)
- [Managed Identiies](https://learn.microsoft.com/en-us/azure/container-apps/managed-identity?tabs=cli%2Cpython)