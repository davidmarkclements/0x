# 0x kernel tracing

By default 0x uses the internal profiler of the JavaScript engine (V8).

This means native frames are omitted. This means calls made by libuv
(Node's I/O library) are omitted.

Capturing these stacks requires kernel level tracing, which `0x` supports
on Linux. 

## Requirements

On Linux the host operating system must have perf(1) installed with perf 
support compiled into the kernel. Similarly DTrace must be installed and
enabled on macOS. 

## Usage

```
0x --kernel-tracing my-app.js
```

> Note: `0x` uses `linux_perf` for kernel tracing, which requires spawning a non-nodejs process
directly, for this reason, one can't use `--kernel-tracing` together with `--on-port`. Instead,
run it in a separate terminal.

## Troubleshooting

### Missing JavaScript Frames

In Node 8.5.0+ this approach will most likely generate flamegraphs where 
JavaScript functions that are known to be in the code don't appear 
in the flamegraph. Turning on the v8 filter will also reveal a large
amount of "ByteCodeHandler" frames.

This is due to the interpreter (Ignition) and optimizing compiler (Turbofan)
used by the V8 engine version that was integrated into Node 8.5.0 and above. 
Any frames that do not get optimized will appear in kernel level tracing output 
as bytecode handlers. In order to resolve this, the kernel tracing software 
(perf) has to be able to jump to another memory address where the name 
of the JavaScript function is held, however the memory address that it the kernel 
profiler should jump to is not exposed by the V8 engine to the kernel profiler. 
This is one of the main reasons why 0x v4 uses V8 profiling instead of kernel 
profiling by default.

Since only optimized functions will show, one way to make more JavaScript frames 
appear is simply to ensure the process is put under more pressure for longer, 
thus forcing Turbofan to optimize more functions.

Another way to make almost all functions appear in the flamegraph is to use 
the `--always-opt` flag:

```
0x -- node --always-opt my-app.js
```

This will cause all functions to be to be optimized, and thus appear in the flamegraph.
However, this flag fundamentally changes the performance characteristics of the application,
so should probably be avoided when attempting to improve the performance of an application.    

### Docker

Due to security reasons Docker containers tend to result in the following error:

```bash
Cannot read kernel map
perf_event_open(..., PERF_FLAG_FD_CLOEXEC) failed with unexpected error 1 (Operation not permitted)
perf_event_open(..., 0) failed unexpectedly with error 1 (Operation not permitted)
Error:
You may not have permission to collect stats.
[...]
```

A workaround is to run the container with the `--privileged` option
or add `privileged: true` into the `docker-compose.yml` file.
See the [Docker's doc](https://docs.docker.com/engine/reference/run/#runtime-privilege-and-linux-capabilities) for more info.

