import { vec3, quat } from 'gl-matrix';

const TWOPI = 2 * Math.PI;

const Links = [['0.1'], ['3.1', [3042, 47]], ['4.1', [1375, 69]], ['5.1', [7357, 69]], ['5.2',
    [1849, 81]], ['6.1', [1534, 96]], ['6.2', [0, 82]], ['6.3', [10652, 85]], ['7.1', [7845,
    94]], ['7.2', [5595, 86]], ['7.3', [190, 122]], ['7.4', [3640, 102]], ['7.5', [1751,
    98]], ['7.6', [5020, 102]], ['7.7', [9660, 91]], ['8.1', [1279, 96]], ['8.2', [9751,
    108]], ['8.3', [2817, 112]], ['8.4', [3938, 105]], ['8.5', [4043, 105]], ['8.6', [4623,
    90]], ['8.7', [1191, 88]], ['8.8', [5681, 100]], ['8.9', [1930, 98]], ['8.10', [9031,
    85]], ['8.11', [1444, 90]], ['8.12', [4828, 94]], ['8.13', [6231, 90]], ['8.14', [885,
    98]], ['8.15', [9574, 86]], ['8.16', [4148, 85]], ['8.17', [312, 81]], ['8.18', [2243,
    97]], ['8.19', [6321, 86]], ['8.20', [7529, 88]], ['8.21', [686, 89]], ['9.1', [7013,
    102]], ['9.2', [10544, 108]], ['9.3', [4922, 98]], ['9.4', [3322, 89]], ['9.5', [3411,
    114]], ['9.6', [8182, 98]], ['9.7', [592, 94]], ['9.8', [10353, 91]], ['9.9', [2140,
    103]], ['9.10', [8392, 112]], ['9.11', [9349, 120]], ['9.12', [2929, 113]], ['9.13',
    [9116, 123]], ['9.14', [3089, 102]], ['9.15', [7939, 116]], ['9.16', [5462, 133]],
    ['9.17', [10242, 111]], ['9.18', [82, 108]], ['9.19', [5122, 118]], ['9.20', [7725,
    120]], ['9.21', [486, 106]], ['9.22', [1630, 121]], ['9.23', [2436, 113]], ['9.24',
    [775, 110]], ['9.25', [6601, 102]], ['9.26', [3525, 115]], ['9.27', [6407, 89]],
    ['9.28', [7426, 103]], ['9.29', [8280, 112]], ['9.30', [5781, 111]], ['9.31', [6703,
    120]], ['9.32', [8055, 127]], ['9.33', [7227, 130]], ['9.34', [4713, 115]], ['9.35',
    [3191, 131]], ['9.36', [5240, 119]], ['0.2.1'], ['2.2.1', [2648, 36], [2684, 36]],
    ['4.2.1', [10161, 39], [10200, 42]], ['5.2.1', [8728, 38], [8766, 39]], ['6.2.1', [8931,
    49], [8980, 51]], ['6.2.2', [2340, 47], [2387, 49]], ['6.2.3', [3742, 41], [3783, 54]],
    ['7.2.1', [9859, 44], [9903, 55]], ['7.2.2', [393, 45], [438, 48]], ['7.2.3', [6928,
    39], [6967, 46]], ['7.2.4', [6496, 77], [6573, 28]], ['7.2.5', [5892, 45], [5937, 68]],
    ['7.2.6', [6823, 27], [6850, 78]], ['7.2.7', [10057, 78], [10135, 26]], ['7.2.8', [9239,
    43], [9282, 67]], ['8.2.1', [7115, 58], [7173, 54]], ['8.2.2', [6005, 53], [6058, 59]],
    ['8.2.3', [8504, 42], [8546, 63]], ['8.2.4', [4357, 50], [4407, 57]], ['8.2.5', [9958,
    51], [10009, 48]], ['8.2.6', [10444, 46], [10490, 54]], ['8.2.7', [5359, 47], [5406,
    56]], ['8.2.8', [1097, 50], [1147, 44]], ['8.2.9', [2028, 42], [2070, 70]], ['8.2.10',
    [4233, 96], [4329, 28]], ['8.2.11', [6117, 93], [6210, 21]], ['0.3.1'], ['6.3.1', [3837,
    37], [3874, 31], [3905, 33]], ['6.3.2', [9469, 38], [9507, 34], [9541, 33]], ['6.3.3',
    [2720, 35], [2755, 30], [2785, 32]], ['7.3.1', [7617, 44], [7661, 33], [7694, 31]],
    ['8.3.1', [8805, 45], [8850, 49], [8899, 32]], ['8.3.2', [8609, 45], [8654, 48], [8702,
    26]], ['8.3.3', [983, 43], [1026, 36], [1062, 35]], ['8.3.4', [4464, 28], [4492, 29],
    [4521, 102]], ['8.3.5', [2549, 26], [2575, 29], [2604, 44]]];

function perp(u, dest) {
    const v = [1, 0, 0];
    vec3.cross(dest, u, v);
    const e = vec3.dot(dest, dest);
    if (e < 0.01) {
        vec3.copy(v, [0, 1, 0]);
        vec3.cross(dest, u, v);
    }
    return vec3.normalize(dest, dest);
}

function direction(vec, vec2, dest) {
    if (!dest) { dest = vec; }
    let x = vec[0] - vec2[0],
    y = vec[1] - vec2[1],
    z = vec[2] - vec2[2],
    len = Math.sqrt(x * x + y * y + z * z);
    if (!len) {
        dest[0] = 0;
        dest[1] = 0;
        dest[2] = 0;
        return dest;
    }
    len = 1 / len;
    dest[0] = x * len;
    dest[1] = y * len;
    dest[2] = z * len;
    return dest;
}

function clamp(v,least,most) {return Math.max(Math.min(most,v),least)}

function packSnorm16(value) {return Math.round(clamp(value,-1,1)*32767)}

function vec4_packSnorm16(out,src) {
    out[0]=packSnorm16(src[0]);
    out[1]=packSnorm16(src[1]);
    out[2]=packSnorm16(src[2]);
    out[3]=packSnorm16(src[3]);
    return out
}

export default class Knotess {
    constructor(centerlines) {
        console.assert(ArrayBuffer.prototype.constructor === centerlines.constructor);
        this.spines = new Float32Array(centerlines);
        this.Rolfsen = [
            '0.1 3.1 4.1 5.1 5.2 6.1 6.2 6.3 7.1',
            '7.2 7.3 7.4 7.5 7.6 7.7 8.1 8.2 8.3',
            '8.4 8.5 8.6 8.7 8.8 8.9 8.10 8.11 8.12',
            '8.13 8.14 8.15 8.16 8.17 8.18 8.19 8.20 8.21',
            '9.1 9.2 9.3 9.4 9.5 9.6 9.7 9.8 9.9',
            '9.10 9.11 9.12 9.13 9.14 9.15 9.16 9.17 9.18',
            '9.19 9.20 9.21 9.22 9.23 9.24 9.25 9.26 9.27',
            '9.28 9.29 9.30 9.31 9.32 9.33 9.34 9.35 9.36',
            '0.2.1 2.2.1 4.2.1 5.2.1 6.2.1 6.2.2 6.2.3 7.2.1 7.2.2',
            '7.2.3 7.2.4 7.2.5 7.2.6 7.2.7 7.2.8 8.2.1 8.2.2 8.2.3',
            '8.2.4 8.2.5 8.2.6 8.2.7 8.2.8 8.2.9 8.2.10 8.2.11 0.3.1',
            '6.3.1 6.3.2 6.3.3 7.3.1 8.3.1 8.3.2 8.3.3 8.3.4 8.3.5'
        ];
        this.LinearRolfsen = [];
        this.LinearRolfsenLookup = {};
        for (const row of this.Rolfsen) {
            for (const id of row.split(' ')) {
                this.LinearRolfsenLookup[id] = this.LinearRolfsen.length;
                this.LinearRolfsen.push(id);
            }
        }
        this.LinksDb = {};
        for (const link of Links) {
            this.LinksDb[link[0]] = link.slice(1);
        }
    }

    getPreviousLinkId(linkid) {
        const index = this.LinearRolfsenLookup[linkid];
        return this.LinearRolfsen[Math.max(0, index - 1)];
    }

    getNextLinkId(linkid) {
        const index = this.LinearRolfsenLookup[linkid];
        const upper = this.LinearRolfsen.length -  1;
        return this.LinearRolfsen[Math.min(upper, index + 1)];
    }

    // Given an Alexander-Briggs-Rolfsen identifier and an optional configuration dictionary,
    // returns an array of 'meshes' where each mesh is a dictionary with three entries: a
    // `Float32Array` vertex buffer, a `Uint16Array` triangle buffer, and (optionally) a
    // `Uint16Array` wireframe buffer. The vertex buffer is a flat array of PX PY PZ NX NY NZ.
    tessellate(linkid, options) {
        const defaults = {
            scale: 0.15,
            bézierSlices: 5,
            polygonSides: 10,
            radius: 0.07,
            wireframe: false,
            tangents: false,
            tangentSmoothness: 3
        };
        options = Object.assign(defaults, options);
        const ranges = this.LinksDb[linkid];
        if (ranges.length) {
            return this.tessellateLink(ranges, options);
        }
        if (linkid == "0.1") {
            const mesh = this.tessellate("2.2.1", options)[0];
            return [this.clone(mesh, [0.5, -0.25, 0])];
        }
        if (linkid == "0.2.1") {
            const mesh = this.tessellate("2.2.1", options)[0];
            return [
                this.clone(mesh, [0, 0, 0]),
                this.clone(mesh, [0.5, 0, 0])];
        }
        if (linkid == "0.3.1") {
            const mesh = this.tessellate("2.2.1", options)[0];
            return [
                this.clone(mesh, [0, 0, 0]),
                this.clone(mesh, [0.5, 0, 0]),
                this.clone(mesh, [1.0, 0, 0])];
        }
        return [];
    }

    clone(mesh, translation) {
        const result = {
            vertices: new Float32Array(mesh.vertices),
            triangles: mesh.triangles,
        };
        if (mesh.tangents) {
            result.tangents = new Uint16Array(mesh.tangents);
        }
        if (mesh.wireframe) {
            result.wireframe = new Uint16Array(mesh.wireframe);
        }
        const nverts = mesh.vertices.length / 6;
        for (let i = 0; i < nverts; i++) {
            result.vertices[i * 6 + 0] += translation[0];
            result.vertices[i * 6 + 1] += translation[1];
            result.vertices[i * 6 + 2] += translation[2];
        }
        return result;
    }

    // Consumes an array of RANGE where RANGE = [INTEGER, INTEGER]
    // Produces an array of MESH where MESH = {vertices: Float32Array, triangles: Uint16Array}
    tessellateLink(ranges, options) {
        return ranges.map((range) => this.tessellateComponent(range, options));
    }

    // Consumes [INTEGER, INTEGER]
    // Produces {vertices: Float32Array, triangles: Uint16Array}
    tessellateComponent(component, options) {
        let centerline, faceCount, i, j, lineCount, next, polygonCount;
        let polygonEdge, ptr, rawBuffer, segmentData, sides, sweepEdge, tri, triangles, tube, v;
        let wireframe = null;
        // Perform Bézier interpolation
        segmentData = this.spines.subarray(component[0] * 3, component[0] * 3 + component[1] * 3);
        centerline = this.getKnotPath(segmentData, options);
        // Create a positions buffer for a swept octagon
        rawBuffer = this.generateTube(centerline, options);
        tube = rawBuffer;
        // Create the index buffer for the tube wireframe
        polygonCount = centerline.length / 3 - 1;
        sides = options.polygonSides;
        lineCount = polygonCount * sides * 2;
        if (options.wireframe) {
            rawBuffer = new Uint16Array(lineCount * 2);
            [i, ptr] = [0, 0];
            while (i < polygonCount * (sides + 1)) {
                j = 0;
                while (j < sides) {
                    sweepEdge = rawBuffer.subarray(ptr + 2, ptr + 4);
                    sweepEdge[0] = i + j;
                    sweepEdge[1] = i + j + sides + 1;
                    [ptr, j] = [ptr + 2, j + 1];
                }
                i += sides + 1;
            }
            i = 0;
            while (i < polygonCount * (sides + 1)) {
                j = 0;
                while (j < sides) {
                    polygonEdge = rawBuffer.subarray(ptr + 0, ptr + 2);
                    polygonEdge[0] = i + j;
                    polygonEdge[1] = i + j + 1;
                    [ptr, j] = [ptr + 2, j + 1];
                }
                i += sides + 1;
            }
            wireframe = rawBuffer;
        }
        // Create the index buffer for the solid tube
        faceCount = centerline.length / 3 * sides * 2;
        rawBuffer = new Uint16Array(faceCount * 3);
        [i, ptr, v] = [0, 0, 0];
        while (++i < centerline.length / 3) {
            j = -1;
            while (++j < sides) {
                next = (j + 1) % sides;
                tri = rawBuffer.subarray(ptr + 0, ptr + 3);
                tri[0] = v + next + sides + 1;
                tri[1] = v + next;
                tri[2] = v + j;
                tri = rawBuffer.subarray(ptr + 3, ptr + 6);
                tri[0] = v + j;
                tri[1] = v + j + sides + 1;
                tri[2] = v + next + sides + 1;
                ptr += 6;
            }
            v += sides + 1;
        }
        triangles = rawBuffer;
        // Generate surface orientation quaternions.
        let tangents = null;
        if (options.tangents) {
            const nverts = tube.length / 6;
            tangents = new Uint16Array(4 * nverts);
            for (let i = 0; i < nverts; ++i) {
                const n = tube.subarray(i * 6 + 3, i * 6 + 6);
                const dst = tangents.subarray(i * 4, i * 4 + 4);
                const b = vec3.cross(vec3.create(), n, [1, 0, 0]);
                const t = vec3.cross(vec3.create(), b, n);
                const q = quat.fromMat3([0, 0, 0, 1], [
                        t[0], t[1], t[2],
                        b[0], b[1], b[2],
                        n[0], n[1], n[2]]);
                vec4_packSnorm16(dst, q);
            }
        }
        return {
            vertices: tube,
            tangents: tangents,
            triangles: triangles,
            wireframe: wireframe
        };
    }

    // Evaluate a Bézier function for smooth interpolation.
    // Return a Float32Array
    getKnotPath(data, options) {
        let a, b, c, dt, i, ii, j, k, l, n, p, r, rawBuffer, ref, slices, t, tt, v, v1, v2, v3, v4;
        let slice;
        slices = options.bézierSlices;
        rawBuffer = new Float32Array(data.length * slices + 3);
        [i, j] = [0, 0];
        while (i < data.length + 3) {
            r = (function() {
                let k, len, ref, results;
                ref = [0, 2, 3, 5, 6, 8];
                results = [];
                for (k = 0, len = ref.length; k < len; k++) {
                    n = ref[k];
                    results.push((i + n) % data.length);
                }
                return results;
            })();
            a = data.subarray(r[0], r[1] + 1);
            b = data.subarray(r[2], r[3] + 1);
            c = data.subarray(r[4], r[5] + 1);
            v1 = vec3.clone(a);
            v4 = vec3.clone(b);
            vec3.lerp(v1, v1, b, 0.5);
            vec3.lerp(v4, v4, c, 0.5);
            v2 = vec3.clone(v1);
            v3 = vec3.clone(v4);
            vec3.lerp(v2, v2, b, 1 / 3);
            vec3.lerp(v3, v3, b, 1 / 3);
            t = dt = 1 / (slices + 1);
            for (slice = k = 0, ref = slices; (0 <= ref ? k < ref : k > ref);
                    slice = 0 <= ref ? ++k : --k) {
                tt = 1 - t;
                c = [tt * tt * tt, 3 * tt * tt * t, 3 * tt * t * t, t * t * t];
                p = (function() {
                    let l, len, ref1, results;
                    ref1 = [v1, v2, v3, v4];
                    results = [];
                    for (l = 0, len = ref1.length; l < len; l++) {
                        v = ref1[l];
                        results.push(vec3.clone(v));
                    }
                    return results;
                })();
                for (ii = l = 0; l < 4; ii = ++l) {
                    vec3.scale(p[ii], p[ii], c[ii]);
                }
                p = p.reduce(function(a, b) {
                    return vec3.add(a, a, b);
                });
                vec3.scale(p, p, options.scale);
                rawBuffer.set(p, j);
                j += 3;
                if (j >= rawBuffer.length) {
                    return rawBuffer;
                }
                t += dt;
            }
            i += 3;
        }
    }

    // Sweep a n-sided polygon along the given centerline.
    // Returns the mesh verts as a Float32Arrays.
    // Repeats the vertex along the seam to allow nice texture coords.
    generateTube(centerline, options) {
        let B, C, basis, center, count, dtheta, frames, i, m, mesh, n, normal, p, r, theta;
        let v, x, y, z;
        n = options.polygonSides;
        dtheta = TWOPI / n;
        frames = this.generateFrames(centerline, options);
        count = centerline.length / 3;
        mesh = new Float32Array(count * (n + 1) * 6);
        [i, m] = [0, 0];
        p = vec3.create();
        r = options.radius;
        while (i < count) {
            v = 0;
            basis = (function() {
                let k, results;
                results = [];
                for (C = k = 0; k <= 2; C = ++k) {
                    results.push(frames[C].subarray(i * 3, i * 3 + 3));
                }
                return results;
            })();
            basis = (function() {
                let k, len, results;
                results = [];
                for (k = 0, len = basis.length; k < len; k++) {
                    B = basis[k];
                    results.push((function() {
                        let l, results1;
                        results1 = [];
                        for (C = l = 0; l <= 2; C = ++l) {
                            results1.push(B[C]);
                        }
                        return results1;
                    })());
                }
                return results;
            })();
            basis = basis.reduce(function(A, B) {
                return A.concat(B);
            });
            theta = 0;
            while (v < n + 1) {
                x = r * Math.cos(theta);
                y = r * Math.sin(theta);
                z = 0;
                vec3.transformMat3(p, [x, y, z], basis);
                p[0] += centerline[i * 3 + 0];
                p[1] += centerline[i * 3 + 1];
                p[2] += centerline[i * 3 + 2];
                // Stamp p into 'm', skipping over the normal:
                mesh.set(p, m);
                [m, v, theta] = [m + 6, v + 1, theta + dtheta];
            }
            i++;
        }
        // Next, populate normals:
        [i, m] = [0, 0];
        normal = vec3.create();
        center = vec3.create();
        while (i < count) {
            v = 0;
            while (v < n + 1) {
                p[0] = mesh[m + 0];
                p[1] = mesh[m + 1];
                p[2] = mesh[m + 2];
                center[0] = centerline[i * 3 + 0];
                center[1] = centerline[i * 3 + 1];
                center[2] = centerline[i * 3 + 2];
                direction(p, center, normal);
                // Stamp n into 'm', skipping over the position:
                mesh.set(normal, m + 3);
                [m, v] = [m + 6, v + 1];
            }
            i++;
        }
        return mesh;
    }

    // Generate reasonable orthonormal basis vectors for curve in R3.
    // Returns three lists-of-vec3's for the basis vectors.
    // See 'Computation of Rotation Minimizing Frame' by Wang and Jüttler.
    generateFrames(centerline, options) {
        let count, frameR, frameS, frameT, i, j, n, r0, ri, rj, s0, si, sj, t0, ti, tj, xi, xj;
        count = centerline.length / 3;
        frameR = new Float32Array(count * 3);
        frameS = new Float32Array(count * 3);
        frameT = new Float32Array(count * 3);
        // Obtain unit-length tangent vectors
        i = -1;
        while (++i < count) {
            j = (i + 1 + options.tangentSmoothness) % (count - 1);
            xi = centerline.subarray(i * 3, i * 3 + 3);
            xj = centerline.subarray(j * 3, j * 3 + 3);
            ti = frameT.subarray(i * 3, i * 3 + 3);
            direction(xi, xj, ti);
        }
        // Allocate some temporaries for vector math
        [r0, s0, t0] = (function() {
            let k, results;
            results = [];
            for (n = k = 0; k <= 2; n = ++k) {
                results.push(vec3.create());
            }
            return results;
        })();
        [rj, sj, tj] = (function() {
            let k, results;
            results = [];
            for (n = k = 0; k <= 2; n = ++k) {
                results.push(vec3.create());
            }
            return results;
        })();
        // Create a somewhat-arbitrary initial frame (r0, s0, t0)
        vec3.copy(t0, frameT.subarray(0, 3));
        perp(t0, r0);
        vec3.cross(s0, t0, r0);
        vec3.normalize(r0, r0);
        vec3.normalize(s0, s0);
        vec3.copy(frameR.subarray(0, 3), r0);
        vec3.copy(frameS.subarray(0, 3), s0);
        // Use parallel transport to sweep the frame
        // TODO: add minor twist so that a swept triangle aligns without cracks.
        [i, j] = [0, 1];
        [ri, si, ti] = [r0, s0, t0];
        while (i < count - 1) {
            j = i + 1;
            xi = centerline.subarray(i * 3, i * 3 + 3);
            xj = centerline.subarray(j * 3, j * 3 + 3);
            ti = frameT.subarray(i * 3, i * 3 + 3);
            tj = frameT.subarray(j * 3, j * 3 + 3);
            vec3.cross(sj, tj, ri);
            vec3.normalize(sj, sj);
            vec3.cross(rj, sj, tj);
            vec3.copy(frameR.subarray(j * 3, j * 3 + 3), rj);
            vec3.copy(frameS.subarray(j * 3, j * 3 + 3), sj);
            vec3.copy(ri, rj);
            ++i;
        }
        // Return the basis columns
        return [frameR, frameS, frameT];
    }
}
