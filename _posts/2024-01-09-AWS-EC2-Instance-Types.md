---
title: "AWS EC2 Instance Types overview p1"
categories:
    - AWS
    - EC2
tags:
    - aws
    - ec2
    - overview
---

## TL;DR
- to select an EC2 instance type, key metrics to look for are:
    - Memory - how much memory is required
    - vCPU count - how much processing power is required - this may be hard to determine initally
    - Network Bandwith - how much network I/O is required
    - ENI Count - how many interfaces are required
- network bandwith may be calculated using base bandwidth + burstable bandwidth
    - burstable bandwidth is calculated using network I/O credits
    - network I/O credits for an instance depends on the vCPU count
    - instances get network I/O credits when they use less bandwidth than its baseline
    - instances return to baseline bandwidth if they have exhausted all their network I/O credits
    - burst bandwidth is a shared resource

## References
- [EC2 Instance Types](https://aws.amazon.com/ec2/instance-types/)
- [EC2 Instance Types ENI limits](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-eni.html)
- [EC2 Instance Types Network Bandwidth](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-network-bandwidth.html)