# v4.0.0
* internal refactor
* v8 prof is now the default method of stack collection
* add `--kernel-tracing` option
* removed `--svg` flag
* removed `--gen` flag
* removed `--timestamp-profiles` flag
* removed `--theme` flag
* removed `--include` flag
* removed `--exclude | -x` flag
* removed `--tiers | -t` flag
* removed `--langs | -l` flag
* renamed `--trace-info` to `--kernel-tracing-debug` flag
* removed `--log-output` flag
* removed `--stacks-only` flag
* removed `-d | --delay` flag
* renamed `--json-stacks` to `--tree-debug` flag
* profile folders renamed to `{outputDir}/{name}.0x`
* ui: removed langs button
* ui: removed theme button
* ui: style changes, minor redesign
* altered mapFrames API (frames is now an array of objects, not strings)  
* ui: rename/reorganize type labels
* ui: tier coloring improvements
* ui: search improvements
* categorization improvements
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
* API: removed `logOutput` option 
* API: removed `stacksOnly` option
* API: removed `delay` option 
* API: renamed `jsonStacks` to `treeDebug` option
* enhanced status console output (can be overridden in API)
* added merging capability (v8 prof only)
* added capturing inline data along side v8 prof ("pre-inlined" functions)


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
