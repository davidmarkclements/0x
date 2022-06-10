#!/usr/bin/env bash

node --cpu-prof --cpu-prof-name=samples-cpu-prof.cpuprofile index.js &

sleep 1
node_modules/.bin/autocannon -l -R 200000 -c 2000 -d 20 http://localhost:3000
curl -v http://localhost:3000/stop-server
wait

node node_modules/.bin/0x --name=flamegraph-cpu-prof --visualize-cpu-profile samples-cpu-prof.cpuprofile
