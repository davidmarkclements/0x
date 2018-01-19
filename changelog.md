# 3.0.0

* node 4 support dropped, node 6+ supported
* changelog.md added
* refactor
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
