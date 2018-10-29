# Knotess [![badge]](https://travis-ci.org/prideout/knotess)

[badge]: https://travis-ci.org/prideout/knotess.svg?branch=master "Build Status"

This library generates triangle meshes for all the [prime
knots](https://en.wikipedia.org/wiki/List_of_prime_knots) in the Rolfsen table. Knotess consumes a
compact binary file that provides XYZ positions for bézier control points, then produces tube shapes
by sweeping a polygon along the bézier curve.

- [Interactive Demo](https://prideout.net/knotess)

<img src="https://upload.wikimedia.org/wikipedia/commons/0/05/Blue_Figure-Eight_Knot.png"
     width="200" />

## Example

```js
const SPINEDATA = 'centerlines.bin';
fetch(SPINEDATA).then(res => res.arrayBuffer()).then((data) => {
    const knots = new Knotess(data);
    const components = knots.tessellate('7.2.3');
    console.info(components.length);
    // 2
    console.info(components[0]);
    // {vertices: Float32Array(19236), triangles: Uint16Array(11760) }
    console.info(components[1]);
    // {vertices: Float32Array(15246), triangles: Uint16Array(13860) }
});
```

## Install

Install with NPM (`npm install knotess`) or Yarn (`yarn add knotess`), then:

```js
// import as an ES module
import Knotess from 'knotess';

// or require in Node / Browserify
const Knotess = require('knotess');
```

Or use a browser build directly:

```html
<script src="https://unpkg.com/knotess@1.0.0/knotess.min.js"></script> <!-- minified build -->
<script src="https://unpkg.com/knotess@1.0.0/knotess.js"></script> <!-- dev build -->
```

## API Reference

#### new Knotess(ArrayBuffer)

Constructs a tessellator given a flat array of floating-point XYZ coordinates for the knot
centerlines.

#### knotess.tesselate(string, options)

Given an Alexander-Briggs-Rolfsen identifier and an optional configuration dictionary,
returns an array of "meshes" where each mesh is a dictionary with three entries:
a `Float32Array` vertex buffer, a `Uint16Array` triangle buffer, and a`Uint16Array` wireframe
buffer.

#### Knotess.LinksDb

Dictionary from Alexander-Briggs-Rolfsen number (e.g. "2.2.1") to arrays of two-tuples,
where each two-tuple defines a range within the centerlines buffer. In knot theory parlance, each
two-tuple corresponds to a *component* and each entry in the dictionary corresponds to a *link*.

#### Knotess.Rolfsen

Array of strings where each string corresponds to a row in the Rolfsen table. Each string is a
space-delimited list of Alexander-Briggs-Rolfsen identifiers.
