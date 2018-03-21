# Production Servers

Generating a flamegraph can be quite intense on CPU and memory,
if we have restricted resources we should generate the flamegraph
in two pieces.

First we can use the `--collect-only` flag to purely capture stacks.

```sh
0x --collect-only my-app.js  #0x on the server
```

Press ctrl+c when ready, this will create the usual profile folder,
holding one file, that `stacks.$PID.out` file.

Now we need to transfer the stacks file from our production server
to our local dev machine.

Let's say the pid was 7777, we can generate the flamegraph locally with

```sh
0x --visualize-only 7777.0x # create a flamegraph.html in 7777.0x
```