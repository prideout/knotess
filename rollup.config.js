import {terser} from 'rollup-plugin-terser';
import buble from 'rollup-plugin-buble';

const config = (file, plugins) => ({
    input: 'index.js',
    output: {
        name: 'Knotess',
        globals: {
            'gl-matrix': 'vec3'
        },
        format: 'umd',
        file
    },
    external: ['gl-matrix'],
    plugins
});

const bubleConfig = {transforms: {dangerousForOf: true}};

export default [
    config('knotess.js', [buble(bubleConfig)]),
    config('knotess.min.js', [terser(), buble(bubleConfig)])
];
