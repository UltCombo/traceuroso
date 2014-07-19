# traceuroso

Write and run ECMAScript.next Node.js packages without any build steps.

# Install

```
npm install --save traceuroso
```

# Usage

Create a traceuroso bootstrapping file and set it as your package's entry point. Here is a quick overview:

package.json

```
"main": "bootstrap.js"
```

bootstrap.js

```js
module.exports = require('traceuroso')(__dirname, 'index');
```

index.js

```js
let my = ((awesome, es6) => 'code')('shine!');
```

See the API section below for details.

# API

```
<entryPointExports> traceuroso(packageRoot[, entryPoint='index'])
```

## Parameters

- `packageRoot` (string): the root directory of the package to traceurosofy. All `.js` files inside of `packageRoot`, except those inside of `packageRoot`'s `node_modules/` directory, will be compiled using Traceur when `require()`d or `import`ed.
- `entryPoint` (string): the file path to your package's main file (your `package.json`'s previous `main` file), relative to `packageRoot`. Defaults to `index`.
- *returns*: `entryPoint`'s exports. You should re-export these in order to make them available to the files which `require()` your package.

# The traceuroso bootstrapping file

The bootstrapping file is the first file to be executed when your package is required. It is responsible for loading Traceur, compiling and running your package, as well as re-exporting your package's exports. Review the Usage and API sections for example and details.

Note that as the bootstrapping file is `require()`'d and executed directly by Node.js before the package is traceurosofied, the bootstrapping file must contain only valid Node.js code that can run without Traceur's aid.
