import {terser} from 'rollup-plugin-terser';
import buble from 'rollup-plugin-buble';

const config = (file, plugins) => ({
    input: 'index.js',
    output: {
        name: 'Knotess',
        format: 'umd',
        file
    },
    plugins
});

const bubleConfig = {transforms: {dangerousForOf: true}};

export default [
    config('knotess.js', [buble(bubleConfig)]),
    config('knotess.min.js', [terser(), buble(bubleConfig)])
];
