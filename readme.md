# <img alt=0x src=assets/0x-logo.png width=350>


🔥 single-command flamegraph profiling 🔥

Discover the bottlenecks and hot paths in your code, with flamegraphs.

## Visualize Stack Traces

`0x` can profile and generate an interactive flamegraph for a Node process in a single command, on both Linux *and* OS X. Whilst this seems trivial... it's not. Well it wasn't before `0x`.

## Demo

![](assets/demo.gif)

An example interactive flamegraph can be viewed at <http://davidmarkclements.github.io/0x-demo/>

## Support

* Node v6+

* OS
  * Linux
    * requires [perf](https://en.wikipedia.org/wiki/Perf_(Linux))
  * OS X
    * Up-to-date XCode
  * SmartOS
  * *not* Windows (PR's welcome)

## Install

```sh
npm install -g 0x
```

## Basic Usage

Prefix the usual command for starting a process with 0x:

```sh
0x my-app.js
```

You can make the flamegraph automatically open in your browser with:

```sh
0x -o my-app.js
```

Using a custom Node.js executable:

```sh
0x -- /path/to/node my-app.js
```

Passing custom arguments to node:

```sh
0x -- node --trace-opt --trace-deopt my-app.js
```

## Generating

Once we're ready to generate a flamegraph we send a SIGINT.

The simplest way to do this is pressing CTRL+C.

When `0x` catches the SIGINT, it process the stacks and
generates a profile folder (`<pid>.flamegraph`), containing `flamegraph.html`


## Docker
Due to security reasons Docker containers tend to result in the following error:

```bash
Cannot read kernel map
perf_event_open(..., PERF_FLAG_FD_CLOEXEC) failed with unexpected error 1 (Operation not permitted)
perf_event_open(..., 0) failed unexpectedly with error 1 (Operation not permitted)
Error:
You may not have permission to collect stats.
[...]
```
We can work around this problem by running our container with the `--privileged` option
or add `privileged: true` in your `docker-compose.yml` file.
See the [Docker's doc](https://docs.docker.com/engine/reference/run/#runtime-privilege-and-linux-capabilities) for more info.


## Production Servers

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
0x --gen stacks.7777.out # 0x locally
```

Now the hard work is done away from production, ensuring we avoid any service-level problems.

Alternatively if we transfer the entire folder (containing the stacks file),
we can pass the folder to `--visualize-only`:

```sh
0x --visualize-only 7777.flamegraph # create a flamegraph.html in 7777.flamegraph
```

## Memory Issues

As your stack grows you may have memory issues with both Node and your browser.

For Node, run with the following flag
```
--stack-size=8024
```

For Chrome, run with the following flag
```
--js-flags="--stack-size 8024"
```

Where 8024 is the megabytes of RAM required to run load stack. Adjust this as needed and confirm you have it to spare.

## Empty Output Stacks

If you are getting empty output stacks, you may have to run with `sudo`:
```sh
sudo 0x my-app.js
```

## Command nesting

Use `--` to set the `node` executable and/or set node flags

```sh
0x [0xFlags] -- node [nodeFlags] script.js [scriptFlags]
```

For instance

```sh
0x --open -- node --zero-fill-buffers script.js --my-own-arg
```

## 0x Flags

### --help | -h

Print usage info

### --open | -o

Open the flamegraph on your browser using `open` or `xdg-open` (see
https://www.npmjs.com/package/open for details).

### --name

The name of the HTML file, without the .html extension
Can be set to - to write HTML to STDOUT (note
due to the nature of CLI argument parsing, this must be set using `=`, 
e.g. `--name=-`).

If either this flag or `--output-html-file` is set to `-` 
then the HTML will go to STDOUT.

Default: flamegraph

### ---title 

Set the title to display in the flamegraph UI.

### --output-dir | -D

Specify artifact output directory. This can be specified in template
form with possible variables being `{pid}`, `{timestamp}`, `{name}` 
(based on the `--name` flag) and `{outputDir}`(variables
must be specified without whitespace, e.g. `{ pid }` is not supported).

Default: `{pid}.flamegraph`

### --output-html | -F

Specify destination of the generated flamegraph HTML file. 
This can be specified in template form with possible variables 
being `{pid}`, `{timestamp}`, `{name}` (based on the `--name` flag) and 
`{outputDir}` (variables must be specified without whitespace, 
e.g. `{ pid }` is not supported). It can also be set to `-` to 
send the HTML output to STDOUT (note
due to the nature of CLI argument parsing, this must be set using `=`, 
e.g. `--output-html=-`).

If either this flag or --name is set to - 
then the HTML will go to STDOUT.

Default: `{outputDir}/{name}.html`


### --gen | -g

Generate the flamegraph from a specified stacks.out file.
The `--tiers` and `--langs` flags can also be combined with this flag.
Outputs to STDOUT unless the `--name` flag is set, in which case 
outputs to a file `{name}.html` in the current folder.

### --svg

Generates an `flamegraph.svg` file in the artifact output directory,
in addition to the `flamegraph.html` file.

### --prof-viz

Experimental. **Node 8+ only**. Create an additional flame graph using
log output when from the V8 `--prof`. This will create 
an additional flamegraph named according to the 
`--name` flag, prefixed with `v8-prof-`. If `--name` 
is set to - then flamegraph HTML will be streamed to STDOUT.

Default: false 

### --prof-only
  
Experimental. Only create the prof-viz flamegraph.

Default: false 

### --phase

Stage in initialization to begin aggregating stacks. 

**Phase 0** visualizes from the very start, this includes bootstrapping 
stacks and loading the application module tree (these can dominate the flamegraph). 

**Phase 1** excludes core bootstrapping stacks, except the end of the boostrapping process 
where the application module tree is loaded from the entry point. 

**Phase 2** excludes all initialization, this renders the most pragmatic flamegraph for most 
use cases.

Default: 2

### --delay | -d

Milliseconds. Delay before tracing begins (or before stacks are processed in the Linux case), allows us to ignore
initialisation stacks (e.g. module loading).

Example: `0x -d 2000 my-app.js`

Default: 0

### --langs | -l

Color code the stacks by JS and C

Example: `0x -l my-app.js`

Default: false

### --tiers | -t

A comma separated list

Overrides langs, Color code frames by type

Examples: `0x -t my-app.js`

Default: false

### --exclude | -x

Exclude tiers or langs, comma seperated list

Options: v8, regexp, nativeC, nativeJS, core, deps, app, js, c

Examples:
`0x -x v8,nativeC,core my-app.js`
`0x -x c my-app.js`

Default: v8

### --include

Include tiers, Overwrites exclude. Really only useful
for including the v8 tier (which is excluded by default).

Options: v8, regexp, nativeC, nativeJS, core, deps, app, js, c

Example: `0x --include v8 my-app.js`

Default: false

### --theme

Dark or Light theme

Options: dark | light

Example: `0x --theme light my-app.js`

Default: dark

### --quiet | -q 

Limit output, the only output will be fatal errors or 
the path to the `flamegraph.html` upon successful generation.

Default: false

### --silent | -s

Suppress all output, except fatal errors.

Default: false

### --json-stacks

Save the intermediate JSON tree representation of the stacks.

Default: false

### --collect-only

Don't generate the flamegraph, only create the stacks
output. 

Default: false

### --visualize-only 

Supply a path to a profile folder to build or rebuild visualization 
from original stacks. Similar to --gen flag, except specify containing folder
instead of stacks file.

Default: ''  

### --log-output 

Specify `stdout` or `stderr` as 0x's output stream.

Default: stderr

### --trace-info

Show output from dtrace or perf tools

Default: false

#### --timestamp-profiles

Prefixes the current timestamp to the Profile Folder's name minimizing collisions
in containerized environments

Example: `1516395452110-3866.flamegraph`

## The Profile Folder

By default, a profile folder will be created and named after the PID, e.g.
`3866.flamegraph` (we can set this name manually using the `--output-dir` flag).

The Profile Folder can contain the following files

* flamegraph.svg - an SVG rendering of the flamegraph
* stacks.3866.out - the traced stacks (run through [perf-sym](http://npmjs.com/perf-sym) on OS X)
* flamegraph.html - the interactive flamegraph
* stacks.3866.json - a JSON tree generated from the stacks, enabled with `--json-stacks`
* isolate-0x103000600-3866-v8.log - a v8 profiling log file, only included when `--prof-viz` is enabled 
* isolate-0x103000600-3866-v8.log.json - v8 profiling log file processed into JSON using v8s internal tick processor, only included when `--prof-viz` is enabled
* v8-prof-stacks.3866.out - a generated stacks file based on v8 profiling data, only included when `--prof-viz` is enabled (on linux the file name will have a generated uid instead of the PID in it)
* v8-prof-flamegraph.html - an alternartive flamegraph that only shows JS stacks based on v8's profiling data, only included when `--prof-viz` is enabled 


The is helpful, because there's other things you can do with
stacks output. For instance, checkout [cpuprofilify](http://npmjs.com/cpuprofilify) and [traceviewify](http://npmjs.com/traceviewify).

## Example

Want to try it out? Clone this repo, run `npm i -g` and
from the repo root run

```sh
0x examples/rest-api
```

In another tab run

```sh
npm run stress-rest-example
```

To put some load on the rest server, once that's done
use ctrl + c to kill the server.

Now try some other options, e.g.

```sh
0x -t examples/rest-api
```

Babel (ES6 Transpile) Examples
-------

See `./examples/babel` for an example. Note the babel require hook is not currently supported. Notes on using the babel-cli instead can be found in the babel example readme.

## Programmatic API 

0x can also be required as a Node module and scripted:

```js
const zeroEks = require('0x')
const path = require('path')
zeroEks({
  argv: [path.join(__dirname, 'my-app.js'), '--my-flag', '"value for my flag"'],
  workingDir: __dirname
})
```

### `require('0x')(opts, binary, cb)`

The `cb` option is a error first callback which is invoked after a 
profile folder has been created and populated.

The `binary` option can be `false` (to default to the `node` executed resolved
according to environment `PATH`) or a string holding the path to any 
node binary executable.

The `opts` argument is an object, with the following properties:

#### `argv` (array) – required

Pass the arguments that the spawned Node process should receive. 

#### `workingDir` (string)

The base directory where profile folders will be placed. 

Default: process.cwd()

#### `name` (string) 

The name of the flamegraph HTML output file, without the extension.

Default: flamegraph 

#### `open` (boolean)

See [`--open`](#--open---o)

#### `quiet` (boolean)

See [`--quiet`](#--quiet---q)

#### `silent` (boolean)

See [`--silent`](#--silent---s)

#### `jsonStacks` (boolean)

See [`--json-stacks`](#--json-stacks)

#### `svg` (boolean)

See [`--svg`](#--svg)

#### `logOutput` (boolean)

See [`--log-output`](#--log-output)

#### `timestampProfiles` (boolean)

See [`--timestamp-profiles`](#--timestamp-profiles)

#### `traceInfo` (boolean)

See [`--trace-info`](#--trace-info)

#### `theme` (string)

See [`--theme`](#--theme)

#### `include` (string)

See [`--include`](#--include)

#### `exclude` (string)

See [`--exlude`](#--exlude---x)

#### `langs` (string)

See [`--langs`](#--langs---l)

#### `tiers` (string)

See [`--tiers`](#--tiers---t)

#### `gen` (string)

See [`--gen`](#--gen---g)

#### `outputDir` (string)

See [`--output-dir`](#--output-dir---d)

#### `outputHtml` (string)

See [`--output-html`](#--output-html---f)

#### `title` (string)

See [`--title`](#--title)

### `profViz`

See [`--prof-viz`](#--prof-viz)

### `profOnly`

See [`--prof-only`](#--prof-only)

#### `phase` (number)

See [`--phase`](#--phase)

#### `mapFrames` (function)

Will override phase. A custom mapping function that receives 
an array of frames and an instance of the Profiler (see `stack-convert.js`).

Takes the form `(frames, profiler) => Array|false`. Return false to remove 
the whole stack from the output, or return a modified array to change 
the output. 

#### `delay` (number)

See [`--delay`](#--delay---d)

#### `visualizeOnly` (string)

See [`--visualize-only`](#--visualize-only)

#### `collectOnly` (boolean)

See [`--collect-only`](#--collect-only)

### `require('0x').stacksToFlamegraph(opts, binary, cb)`

This method will take a captured stacks input file 
and generate a flamegraph HTML file.

It takes the same arguments as the main function, but the 
`gen` argument (which should hold a path to the source 
stacks file) and the `name` argument (which should specify a
destination out file) is required. 

## v2

If you still need support for Node v4, use [0x v2.x.x](https://github.com/davidmarkclements/0x/tree/v2)

## v1

Don't use v1, it was an experiment and is  non functional
Should have be v0...

## Contributions

Yes please!

## Debugging

`DEBUG=0x* 0x my-app.js`

## Alternatives

* <https://github.com/brendangregg/FlameGraph> (perl)
* <https://www.npmjs.com/package/stackvis> (node)
* <https://www.npmjs.com/package/d3-flame-graph> (node)

## Acknowledgements

0x is generously sponsored by [nearForm](http://nearform.com)

This tool is essentially a mashup from various info and code
sources, and therefore would have taken much longer without
the following people and their Open Source/Info Sharing efforts

* Thorsten Lorenz (<http://thlorenz.com/>)
* Dave Pacheco (<http://dtrace.org/blogs/dap/about/>)
* Brendan Gregg (<http://www.brendangregg.com/>)
* Martin Spier (<http://martinspier.io/>)

## License

MIT and Apache (depending on the code, see LICENSE.md)
