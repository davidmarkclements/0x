# 3.0.0

* changelog.md added
* refactor
* programmatic API (`require('0x')`)
* removed `--preview` option
* remove `--command` option and changed `-c gen` to `--gen`
* added `--json-stacks` option and no longer storing intermediate JSON by default
* added alias to `-q`: `--quiet`
* added `--silent` flag
* added `--name` flag
* added `--log-output` flag 
* `--node` flag renamed to `--node-path`
* added double dash syntax for nesting flags, e.g.: `0x -- node --zero-fill-buffers script.js`