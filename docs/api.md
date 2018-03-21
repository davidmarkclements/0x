# Programmatic API

### `require('0x')(opts) => Promise -> assetPath`

The `opts` argument is an object, with the following properties:

#### `argv` (array) – required

Pass the arguments that the spawned Node process should receive. 

#### `workingDir` (string)

The base directory where profile folders will be placed. 

Default: process.cwd()

#### `pathToNodeBinary` (string)

The path to any node binary executable. This will be used to run execute 
the script and arguments supplied in `argv`.

Default: Node executable according to the `PATH` environment variable.

#### `name` (string) 

The name of the flamegraph HTML output file, without the extension.

Default: flamegraph

#### `onPort` (string)

Run a given command and then generate the flamegraph. 
The command as specified has access to a `$PORT` variable. 
The `$PORT` variable is set according to the first port that 
profiled process opens. 

When the load-test completes, the profiled processed will be 
sent a SIGINT and the flamegraph will be automatically generated.  

Default: ''

#### `title` (string)

Set the title to display in the flamegraph UI.

Default: argv joined by space

#### `visualizeOnly` (string)

Supply a path to a profile folder to build or rebuild visualization 
from original stacks.

Default: undefined

#### `collectOnly` (boolean)

Don't generate the flamegraph, only create the Profile Folder,
with relevant outputs.

Default: false

#### `mapFrames` (function)

A custom mapping function that receives 
an array of frames and an instance of the Profiler (see [stacks-to-json-stack-tree](http://github.com/davidmarkclements/stacks-to-json-stack-tree)).

Takes the form `(frames, profiler) => Array|false`. 

The `frames` parameter is an array of objects containing a `name` property.

Return `false` to remove the whole stack from the output, or return a 
modified array to change the output.

#### `status` (function)

Is called with status messages from 0x internals - useful for logging
or displaying status in the console. 

Default: ()=>{} (noop)

### `kernelTracing`

Use an OS kernel tracing tool (perf on Linux or DTrace on macOS and SmartOS). 
This will capture native stack frames (C++ modules and Libuv I/O), 
but may result in missing stacks on Node 8.

See [kernel-tracing.md](kernel-tracing.md) for more information.

Default: false 

#### `outputDir` (string)

Specify artifact output directory. This can be specified in template
form with possible variables being `{pid}`, `{timestamp}`, `{name}` 
(based on the `name` option) and `{outputDir}`(variables
must be specified without whitespace, e.g. `{ pid }` is not supported).

Default: `{pid}.0x`

#### `outputHtml` (string)

Specify destination of the generated flamegraph HTML file. 
This can be specified in template form with possible variables 
being `{pid}`, `{timestamp}`, `{name}` (based on the `name` flag) and 
`{outputDir}` (variables must be specified without whitespace, 
e.g. `{ pid }` is not supported). It can also be set to `-` to 
send the HTML output to STDOUT.

If either this or `name` is set to `-` then the HTML will go to STDOUT.

Default: `{outputDir}/{name}.html`

#### `treeDebug` (boolean)

Save the intermediate tree representation of captured trace output to a JSON
file.

Default: false

#### `kernelTracingDebug` (boolean)

Show output from DTrace or perf(1) tools.

Default: false