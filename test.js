import test from 'tape';
import Knotess from './knotess.js';
import fs from 'fs';

test('smoke', (t) => {
    const data = fs.readFileSync('centerlines.bin').buffer;
    const knots = new Knotess(data);
    const components = knots.tessellate('7.2.3');
    t.same(components.length, 2);
    t.same(components[0].vertices.length / 6, 2156);
    t.end();
});
