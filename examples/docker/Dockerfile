FROM ubuntu:wily

MAINTAINER Luciano Colosio "unlucio@gmail.com"

RUN apt-get update && apt-get install -y build-essential git wget sudo linux-tools-4.2.0-16-generic wrk && \
    cd tmp && \
    wget https://nodejs.org/dist/v4.4.0/node-v4.4.0-linux-x64.tar.xz && \
    tar -xJf node-v4.4.0-linux-x64.tar.xz -C /usr/local --strip-components=1 && \
    rm node-v4.4.0-linux-x64.tar.xz && \
    npm install -g node-gyp 0x
