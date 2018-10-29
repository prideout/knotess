<h1>Knotess<img src="https://upload.wikimedia.org/wikipedia/commons/0/05/Blue_Figure-Eight_Knot.png"
align="right" width="128"></h1>

[![badge]](https://travis-ci.org/prideout/knotess)

This library generates triangle meshes for all the [prime knots] in the Rolfsen table.

Knotess consumes a compact binary file that provides XYZ positions for bézier control points, then
produces tube shapes by sweeping a polygon along the bézier curve.

- [Interactive Demo](https://prideout.net/knotess)

## Example

```js
const SPINEDATA = 'centerlines.bin';
fetch(SPINEDATA).then(res => res.arrayBuffer()).then((data) => {
    const knots = new Knotess(data);
    const link = knots.tessellate('7.2.3');
    const mesh = link[0];
    const nverts = mesh.vertices.length / 6; // positions and normals
    console.info(`The first component has ${nverts} vertices.`);
});
```

## Install

Install with NPM (`npm install knotess`) or Yarn (`yarn add knotess`), then:

```js
import Knotess from 'knotess';
```

Or use a browser build directly as follows. Note the external dependency on [glMatrix].

```html
<script src="//unpkg.com/gl-matrix@2.8.1/dist/gl-matrix-min.js"></script>
<script src="//unpkg.com/knotess@1.0.0/knotess.js"></script>
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

[badge]: https://travis-ci.org/prideout/knotess.svg?branch=master "Build Status"
[prime knots]: https://en.wikipedia.org/wiki/List_of_prime_knots
[glMatrix]: http://glmatrix.net
