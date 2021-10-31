# Closest Find

Find Element Closest

## Install

```bash
npm i closest-find
# or
yarn add closest-find
```

## Use

```js
// Import Package
import closest from "closest-find";

// Get Element
var element = document.getElementById("example");

// Find Closest
closest(element, ".main"); // .main

// Check Self
closest(element, "#example", true); // #example
```
