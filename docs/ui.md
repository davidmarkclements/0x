# UI

## Flamegraph

A flamegraph is an aggregated visualization of stacks sampled over time.

It primarily visualizes two metrics. The amount of time a function 
was on CPU, and the amount of time a function top of stack. 

Each sample is a 1ms "snapshot" of the current stack. 

The last function to be called is referred to as being at the top of the stack.
If a function is observed being at the top of stack more times than other functions,
this function may be blocking the event loop. If a function is observed 
as being at the top of the stack in higher ratio it's referred to as being "hot".

Each function (a "frame") is represented by a block (a rectangle in the flamegraph).

The X-Axis is not time, it's alphabetically sorted according to function name.

However the width of a block in the flamegraph represents the amount of time a
function appears in the same stack in ratio to the total samples.

The color of the block represents the heat, that is, the amount of time a function
appears at the top of a stack in ratio to total samples. 

## Blocks

Each block contains content with the several possible data points, arranged
like so: 

`{optimization status}{function name} {file path}:{column}:{line} {tag} {percentage on stack}, {percentage on stack top}`

Optimization status is represented by '*' (optimized) or '~' unoptimized.
This only applies to JavaScript frames. 

Possible `{tag}` values are covered in the buttons listed under [Tiers](#tiers). 

## Buttons

### Optimized

Highlights all optimized functions.

### Unoptimized

Highlights all unoptimized functions.

### Merge

The merge button merges all Optimized and Unoptimized frames
and represents them as single blocks. It also merges all inlinable
functions in to the calling functions that they are later inlined 
into. This creates a simplified graph where stacks *only* diverge 
based code logic.

Going into Merged mode deactivates the Optimized, Unoptimized and Inlinable 
buttons, as they aren't applicable. 

### Unmerge

The merge button becomes the Unmerge button in Merge mode. 

Unmerge mode separates out the Optimized, Unoptimized and inlinable 
frames.

### Tiers

Frames in the flamegraph are subdivided into eight categories.

Each category has a button that hide or show the particular frame-type 
in the flamegraph.

Pressing the Tiers button will result in the categories being highlighted
according to the colouring of the category buttons as follows.

#### app

Application level JavaScript functions.

Enabled by default.

#### deps

Functions in dependencies. That is, functions that are in files within the `node_modules` folder.

Enabled by default.

#### core

JavaScript functions that are bundled with Node core. That is, any JavaScript code that
relates to core API's.

Enabled by default.

#### inlinable

When the function is inlined, it no longer shows in the flamegraph. However, 
it will show up in samples prior to inlining. This will result in at least two stacks 
in an Unmerged flamegraph.

Inlinable blocks are functions that are captured during profiling, which later become inlined 
into their parent calling function. These blocks include the tag [INLINABLE].

Inlinable blocks take precedent over app, deps and core blocks. This means if a 
frame is app, deps or core but also inlinable, it will be shown when inlinable is 
enabled regardless of whether app, deps or core are enabled.

Enabled by default.

#### native

Native refers to native JavaScript functions, that are compiled into V8.
This would include any native prototype methods (`Array.prototype.join` for instance),
and any functions that aren't publicly exposed but are used internally by V8
(`InnerArrayJoin` for instance).

In addition, evaluated functions (either code run with `eval` or created with `Function`) 
will also appear as native frames, such functions have the function name `[eval]`. 

Disabled by default.

#### rx

Rx stands for Regular Expressions. Regular expressions are also captured as "frames". 
In this case the regular expression notation fills in as the "function name" portion 
of the block label. This can be useful in identifying slow regular expressions 
(in particular [exponential time regular expressions](https://perlgeek.de/blog-en.cgi/perl-tips/in-search-of-an-exponetial-regexp.html)). 

These will have the tag `[CODE:RegExp]`.

Disabled by default.

#### v8

V8 frames pertain to V8 runtime operations, tags can include `[CODE:LoadGlobalIC]`, 
`[CODE:Handler]`, `[CODE:CallIC]`, `[CODE:LoadIC]`, `[CODE:StoreIC]`, `[CODE:Builtin]` , 
`[CODE:BytecodeHandler]`, `[CODE:Builtin]` , `[CODE:Stub]`.

#### cpp

These are C++ frames that are called by the V8 layer, they do not include C++ frames 
that may be called in Node, Libuv or third party modules. In `--kernel-tracing` mode,
however, non-V8 C++ frames *are* included. These frames can include the tags 
`[CPP]` and `[SHARED_LIB]`.

#### init

The init category describes core functions that are either:

* internal module system functions which are repeated frequently 
as the dependency tree is loaded
* other initialization functions that aren't related to the (public) module system

Filtering out these frames reduces generally redundant initialization 
noise.

These frames include the `[INIT]` tag, but may also include any of the other tags.

Any core frames that are also init frames are controlled by the init type 
(e.g hiding core frames wont hide any core frames that are also init frames).

However, any cpp frames that are also init frames are controlled by the cpp 
type (e.g. hiding init frames wont hide cpp frames that are also init frames). 

Disabled by default.
