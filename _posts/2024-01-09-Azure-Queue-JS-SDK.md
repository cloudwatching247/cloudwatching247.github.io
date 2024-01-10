---
title: "Azure Queue JS SDK"
categories:
    - Azure
    - ACA
    - ACA Jobs
    - JS
tags:
    - azure
    - aca
    - acajobs
    - javascript
---

## TL;DR
- get the queue name and the connection string for the storage account
- create the QueueServiceClient object using the connection string
- get the QueueClient using the QueueServiceClient and the queue name
- get the message from the queue using the `receiveMessages()` function
- process the message
- delete the message from the queue using the `deleteMessage()` function

```
require("dotenv").config();
const { QueueClient, QueueServiceClient } = require("@azure/storage-queue");

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const queueName = process.env.AZURE_STORAGE_QUEUE_NAME;

async function main() {
    const queueServiceClient = QueueServiceClient.fromConnectionString(connectionString);
    const queueClient = queueServiceClient.getQueueClient(queueName);
    
    // 1. Dequeue one message from the queue
    const response = await queueClient.receiveMessages({
        numberOfMessages: 1,
        visibilityTimeout: 60, // set this to longer than the expected processing time (in seconds)
    });

    if (response.receivedMessageItems.length === 0) {
        console.log("No message received. Exiting...");
        return;
    }

    const message = response.receivedMessageItems[0];
    console.log(`Processing message: ${message.messageText}`);

    // 2. Process the message here

    // 3. Delete the message from the queue
    await queueClient.deleteMessage(message.messageId, message.popReceipt);
    console.log("Message processed");

    // 4. Exit
}

main();
```

## References
- [container-apps-event-driven-jobs-tutorial](https://github.com/Azure-Samples/container-apps-event-driven-jobs-tutorial/blob/main/index.js)
- [Quickstart: Azure Queue Storage client library for Python](https://learn.microsoft.com/en-us/azure/storage/queues/storage-quickstart-queues-python?tabs=passwordless%2Croles-azure-portal%2Cenvironment-variable-windows%2Csign-in-azure-cli)