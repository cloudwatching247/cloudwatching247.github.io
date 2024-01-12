---
title: "Common commands for docker use"
categories:
    - Docker
tags:
    - docker
    - overview
---

## TL;DR
- basic flow:
    1. write code to run in a container, and add a requirements file if needed
    2. create a `Dockerfile` to manage the container execution
    3. build a docker image using the `Dockerfile` and the code
    4. create and run the container using the docker image
- example set of commands:
```
# list docker images
docker images 
# list all running containers
docker container ls
# list all containers, even stopped ones
docker container ls -a
# remove a docker image by ID
docker rmi -f <IMAGE_ID>
# remove all images
docker rmi -f $(docker images -aq)
# remove all stopped containers
docker container prune
# build new image 
```

## Dockerfile:

```
FROM python:3.9-slim-buster
WORKDIR /app
ADD app/ /app
RUN pip3 install --no-cache-dir -r requirements.txt
ENV APP_PORT=443
ENTRYPOINT ["python3"]
CMD ["-m", "app"]
```

## References
- [docker run](https://docs.docker.com/engine/reference/commandline/run/)
- [docker build](https://docs.docker.com/engine/reference/commandline/build/)