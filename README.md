# Knotess [![badge]](https://travis-ci.org/prideout/knotess)

[badge]: https://travis-ci.org/prideout/knotess.svg?branch=master "Build Status"

This library creates triangle meshes for the
[prime knots](https://en.wikipedia.org/wiki/List_of_prime_knots).

- [Interactive Demo](https://prideout.net/knotess)

<img src="https://upload.wikimedia.org/wikipedia/commons/0/05/Blue_Figure-Eight_Knot.png"
     width="200" />

## Example

```js
const points = [[168, 180], [168, 178], [168, 179], [168, 181], [168, 183], ...];

const delaunay = Delaunator.from(points);
console.log(delaunay.triangles);
// [623, 636, 619,  636, 444, 619, ...]
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

#### Delaunator.from(points[, getX, getY])

Constructs a delaunay triangulation object given an array of points (`[x, y]` by default).
`getX` and `getY` are optional functions of the form `(point) => value` for custom point formats.
Duplicate points are skipped.

#### new Delaunator(coords)

Constructs a delaunay triangulation object given an array of point coordinates of the form:
`[x0, y0, x1, y1, ...]` (use a typed array for best performance).

#### delaunay.triangles

A `Uint32Array` array of triangle vertex indices (each group of three numbers forms a triangle).
All triangles are directed counterclockwise.

To get the coordinates of all triangles, use:

```js
for (let i = 0; i < triangles.length; i += 3) {
    coordinates.push([
        points[triangles[i]],
        points[triangles[i + 1]],
        points[triangles[i + 2]]
    ]);
}
```

#### delaunay.halfedges

A `Int32Array` array of triangle half-edge indices that allows you to traverse the triangulation.
`i`-th half-edge in the array corresponds to vertex `triangles[i]` the half-edge is coming from.
`halfedges[i]` is the index of a twin half-edge in an adjacent triangle
(or `-1` for outer half-edges on the convex hull).

The flat array-based data structures might be counterintuitive,
but they're one of the key reasons this library is fast.

#### delaunay.hull

A `Uint32Array` array of indices that reference points on the convex hull of the input data, counter-clockwise.

#### delaunay.coords

An array of input coordinates in the form `[x0, y0, x1, y1, ....]`,
of the type provided in the constructor (or `Float64Array` if you used `Delaunator.from`).
