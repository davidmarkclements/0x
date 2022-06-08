#!/usr/bin/env bash

node index.js &
first_pid=$!

sleep 1

curl -v http://localhost:3000/start-profiling

node --cpu-prof --cpu-prof-name=samples-cpu-prof.cpuprofile \
  node_modules/.bin/autocannon -l -R 200000 -c 2000 -d 20 http://localhost:3000

curl -v http://localhost:3000/stop-profiling

sleep 3
kill -KILL $first_pid

node node_modules/.bin/0x --visualize-cpu-profile samples.cpuprofile
node node_modules/.bin/0x --name=flamegraph-autocannon --visualize-cpu-profile samples-cpu-prof.cpuprofile
