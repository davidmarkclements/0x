# Profile Folder

The Profile Folder can contain the following files

* flamegraph.html - the interactive flamegraph
* isolate-0x103000600-3866-v8.log - a v8 profiling log file
* isolate-0x103000600-3866-v8.json - the profile log file processed into JSON
* meta.json - additional meta data captured via processing
* stacks.3866.json - only with `--tree-debug` flag: a JSON tree representing the captured stacks 

The hex address in the isolate log files (0x103000600) is set according
to V8 internals, and will (most likely) differ each time a process is profiled. 

When used with the [`--kernel-tracing`](#--kernel-tracing) flag the Profile Folder won't
contain the isolate V8 log or JSON files, but will contain the following:

* .stacks.3866.out - pre-processed captured stacks via kernel tracing 
* stacks.3866.out - post-processed captured stacks via kernel tracing