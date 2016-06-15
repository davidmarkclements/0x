## Run this example

```
npm install
0x node index.js
```

## Details on use of babel

Note that this example uses babel to transpile the es6 source code in `/src` to es5 via babel and is placed in `/lib`. This transpilation is done via the `npm run build` command.

## Warning: babel require hook not currently supported

The babel require hook (https://babeljs.io/docs/setup/#installation) does not currently play nicely with 0x and will prevent the flamegraphs from being generated (The flamegraph generation will hang and a `Unable to find map file!` error is displayed).

If you are using the require hook then consider using the `babel-cli` as per this example to transpile your code up front and then remove reference to the `require('babel-register')` from your app for the duration of profiling.
