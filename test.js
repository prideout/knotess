import {test} from 'tape';
import Knotess from './index.js';

test('throws on small number of points', (t) => {
    t.throws(() => {
        Delaunator.from(points.slice(0, 1));
    });
    t.throws(() => {
        Delaunator.from(points.slice(0, 2));
    });
    t.end();
});

test('throws on all-collinear input', (t) => {
    t.throws(() => {
        Delaunator.from([[0, 0], [1, 0], [2, 0], [3, 0]]);
    });
    t.end();
});

test('supports custom point format', (t) => {
    const d = Delaunator.from(
        [{x: 5, y: 5}, {x: 7, y: 5}, {x: 7, y: 6}],
        p => p.x,
        p => p.y);
    t.same(d.triangles, [0, 2, 1]);
    t.end();
});

function validate(t, points) {
    const d = Delaunator.from(points);

    // validate halfedges
    for (let i = 0; i < d.halfedges.length; i++) {
        const i2 = d.halfedges[i];
        if (i2 !== -1 && d.halfedges[i2] !== i) {
            t.fail('invalid halfedge connection');
        }
    }
    t.pass('halfedges are valid');

    // validate triangulation
    const hullAreas = [];
    for (let i = 0, len = d.hull.length, j = len - 1; i < len; j = i++) {
        const [x0, y0] = points[d.hull[j]];
        const [x, y] = points[d.hull[i]];
        hullAreas.push((x - x0) * (y + y0));
    }
    const hullArea = sum(hullAreas);

    const triangleAreas = [];
    for (let i = 0; i < d.triangles.length; i += 3) {
        const [ax, ay] = points[d.triangles[i]];
        const [bx, by] = points[d.triangles[i + 1]];
        const [cx, cy] = points[d.triangles[i + 2]];
        triangleAreas.push(Math.abs((by - ay) * (cx - bx) - (bx - ax) * (cy - by)));
    }
    const trianglesArea = sum(triangleAreas);

    const err = Math.abs((hullArea - trianglesArea) / hullArea);
    if (err <= Math.pow(2, -51)) {
        t.pass(`triangulation is valid: ${err} error`);
    } else {
        t.fail(`triangulation is broken: ${err} error`);
    }
}

// Kahan and Babuska summation, Neumaier variant; accumulates less FP error
function sum(x) {
    let sum = x[0];
    let err = 0;
    for (let i = 1; i < x.length; i++) {
        const k = x[i];
        const m = sum + k;
        err += Math.abs(sum) >= Math.abs(k) ? sum - m + k : k - m + sum;
        sum = m;
    }
    return sum + err;
}
