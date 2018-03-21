# v4.0.0
* internal refactor
* v8 prof is now the default method of stack collection
* profile folders renamed to `{outputDir}/{name}.0x`
* CLI: add `--kernel-tracing` option
* CLI: removed `--svg` flag
* CLI: removed `--gen` flag
* CLI: removed `--timestamp-profiles` flag
* CLI: removed `--theme` flag
* CLI: removed `--include` flag
* CLI: removed `--exclude | -x` flag
* CLI: removed `--tiers | -t` flag
* CLI: removed `--langs | -l` flag
* CLI: renamed `--trace-info` to `--kernel-tracing-debug` flag
* CLI: removed `--logging-output` flag
* CLI: removed `--stacks-only` flag
* CLI: removed `-d | --delay` flag
* CLI: renamed `--json-stacks` to `--tree-debug` flag
* UI: removed langs button
* UI: removed theme button
* UI: style changes, minor redesign
* API: altered mapFrames API (frames is now an array of objects, not strings)  
* UI: rename/reorganize type labels
* UI: tier coloring improvements
* UI: search improvements
* UI: categorization improvements
* API: removed `log` option
* API: added `kernelTracing` option
* API: removed `svg` option
* API: removed `gen` option 
* API: removed `timestamp-profiles` option
* API: removed `theme` option
* API: removed `include` option
* API: removed `exclude` option
* API: removed `tiers` option
* API: removed `langs` option
* API: renamed `traceInfo` to `kernelTracingDebug` option
* API: removed `loggingOutput` option 
* API: removed `stacksOnly` option
* API: removed `delay` option 
* API: renamed `jsonStacks` to `treeDebug` option
* CLI: enhanced status console output (can be overridden in API)
* UI: added merging capability (v8 prof only)
* UI: fully responsive
* added capturing inline data along side v8 prof ("inlinable" functions)
* profiling REPL no longer supported
* support for eval'd code - appears under native frames
* DOCS: readme changes to reflect API changes
* DOCS: additional /docs folder for in depth topics
* API: removed `quiet` (still part of CLI)
* API: removed `silent` (still part of CLI)
* API: removed `open` (still part of CLI)
* CLI: add `--on-port` flag
* API: add `onPort` option
* CLI: removed `--phase` flag
* API: removed `phase` option

# v3.4.1
* break out the ui and stack converter portions into separate modules: d3-fg and stacks-to-json-tree.

# v3.4.0
* introduce experimental `--prof-only` flag, generates flamegraph based on internal v8 profiling data, without performing kernel tracing at the same time (as `--prof-viz` does)

# v3.3.0

* introduce experimental `--prof-viz` flag, generates additional flamegraph based on internal v8 profiling data
* linux fixes & tidy up

# v3.2.0

* introduce `--phase` option
* change `--delay` from `300` to `0` - not a breaking change 
because `--phase` provides the same result (stripping module loading stacks) 
far more reliably.

# v3.1.0

* enhance `--output-dir` option with interpolation feature
* add `--output-html` option 

# v3.0.2

* missing dep

# v3.0.1

* fix auto open functionality for linux (doesn't close browser on process exit)

# v3.0.0

* node 4 support dropped, node 6+ supported
* changelog.md added
* refactor
* profile folder schema change `profile-{pid}` -> `{pid}.flamegraph`
* `--timestamp-profiles` prefix instead of suffix `profile-{pid}-{timestamp}` -> `{timestamp}-{pid}.flamegraph`
* programmatic API `require('0x')` and `require('0x/cmd')`
* removed `--preview` option
* remove `--command` option and changed `-c gen` to `--gen`
* added `--json-stacks` option and no longer storing intermediate JSON by default
* added alias to `-q`: `--quiet`
* added `--silent` flag
* added `--name` flag
* added `--log-output` flag 
* added double dash syntax for nesting flags, e.g.: `0x -- node --zero-fill-buffers script.js`
* `--node` flag removed – now possible with new CLI syntax (`0x [flags] -- node [nodeFlags] script.js [scriptFlags]`)
* `--node-options` removed – now possible with new CLI syntax (`0x [flags] -- node [nodeFlags] script.js [scriptFlags]`)
* CLI argument schema: unrecognized flags are now rejected
* `0x` === `0x -h` (use `0x -- node` or `0x --` to profile repl)
* `--stacks-only` removed, (use `--collect-only`)
* add `--collect-only` and `--visualize-only`
