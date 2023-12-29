---
title: "Azure Service Bus - part 1"
categories:
    - Azure
    - Service Bus
tags:
    - overview
    - overview
    - a
    - standard
---

### Definitions
- event: a discrete, lightweight notification of a condition or a state change with no expectations from sender or receiver
- message: raw data produced by a service to be consumed or stored elsewhere. sender has expectations from receiver regarding the message data

## Overview
- enterprise grade messaging broker
- message: a container decorated with metadata, and contains data. 
    - data can be any kind of information, eg: JSON
- has both queues, and topics-subscriptions (pub-sub model)
- has namespaces - container for a set of messaging infra (queues, or topics-subs)
- features: messaging, DLQ, app decoupling, load balancing, load leveling

## Comparisons

| Service     | Purpose                         | Type                           | When to use                                 |
| ----------- | ------------------------------- | ------------------------------ | ------------------------------------------- |
| Event Grid  | Reactive programming            | Event distribution (discrete)  | React to status changes                     |
| Event Hubs  | Big data pipeline               | Event streaming (series)       | Telemetry and distributed data streaming    |
| Service Bus | High-value enterprise messaging | Message                        | Order processing and financial transactions |


## References
[Azure Event vs. message services](https://learn.microsoft.com/en-us/azure/service-bus-messaging/compare-messaging-services#event-vs-message-services)
[What is Azure Service Bus?](https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-messaging-overview)
[Service Bus Integrations](https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-messaging-overview#integration)
[Azure messaging services comparison](https://learn.microsoft.com/en-us/azure/service-bus-messaging/compare-messaging-services#comparison-of-services)