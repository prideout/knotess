Filament.loadMathExtensions();

const CENTERLINES = '//unpkg.com/knotess@1.0.1/centerlines.bin';

Filament.init([ CENTERLINES, 'plastic.filamat', 'pillars_2k_ibl.ktx' ], () => {
    const canvas = document.getElementsByTagName('canvas')[0];
    window.VertexAttribute = Filament.VertexAttribute;
    window.AttributeType = Filament.VertexBuffer$AttributeType;
    window.PrimitiveType = Filament.RenderableManager$PrimitiveType;
    window.IndexType = Filament.IndexBuffer$IndexType;
    window.Fov = Filament.Camera$Fov;
    window.LightType = Filament.LightManager$Type;
    window.app = new App(canvas);
});

class App {

    onHashChange() {
        const linkid = document.location.hash.substr(1);
        this.navigateTo(linkid);
    }

    navigateTo(linkid) {
        // Create new renderables if they are not in the cache.
        let renderables = this.renderables[linkid];
        if (!renderables) {
            const meshes = this.knots.tessellate(linkid, {
                polygonSides: 30,
                radius: 0.07
            });
            renderables = this.renderables[linkid] = [];
            const M = 1.5, minpt = [-M, -M, -M], maxpt = [M, M, M];
            const bounds = [minpt, maxpt];
            let i = 0;
            for (const mesh of meshes) {
                const renderable = this.createRenderable(
                    mesh.vertices, mesh.triangles, bounds, this.materials[i++]);
                renderables.push(renderable);
            }
        }
        // Add renderables to scene.
        for (const renderable of renderables) {
            this.scene.addEntity(renderable);
        }
        // Update the URL hash and label.
        const label = document.getElementById('label');
        const comps = linkid.split('.');
        label.innerHTML = `${comps[0]}<sup>${comps[1]}</sup><sub>${comps[2]}</sub>`;
        const index = this.LinearRolfsenLookup[linkid];
        const prev = this.LinearRolfsen[index - 1];
        const next = this.LinearRolfsen[index + 1];
        document.getElementById('uparrow').href = '#' + prev;
        document.getElementById('dnarrow').href = '#' + next;
    }

    constructor(canvas) {
        this.canvas = canvas;
        this.renderables = {};
        this.knots = new Knotess(Filament.assets[CENTERLINES].buffer);
        this.LinearRolfsen = [];
        this.LinearRolfsenLookup = {};
        for (const row of this.knots.Rolfsen) {
            for (const id of row.split(' ')) {
                this.LinearRolfsenLookup[id] = this.LinearRolfsen.length;
                this.LinearRolfsen.push(id);
            }
        }

        const engine = this.engine = Filament.Engine.create(canvas);
        this.scene = engine.createScene();

        const material_package = Filament.Buffer(Filament.assets['plastic.filamat']);
        const mat = engine.createMaterial(material_package);
        const mats = this.materials = [mat.createInstance(), mat.createInstance()];

        const red = [0.2, 0.3, 0.4];
        mats[0].setColorParameter("baseColor", Filament.RgbType.sRGB, red);
        mats[0].setFloatParameter("roughness", 0.1);
        mats[0].setFloatParameter("clearCoat", 1.0);
        mats[0].setFloatParameter("clearCoatRoughness", 0.3);

        const yellow = [0.2, 0.4, 0.3];
        mats[1].setColorParameter("baseColor", Filament.RgbType.sRGB, yellow);
        mats[1].setFloatParameter("roughness", 0.5);
        mats[1].setFloatParameter("clearCoat", 1.0);
        mats[1].setFloatParameter("clearCoatRoughness", 0.3);

        this.renderables = {};
        this.navigateTo("7.2.3");
        document.location.hash = "7.2.3";
        window.onhashchange = this.onHashChange.bind(this);

        const sunlight = Filament.EntityManager.get().create();
        this.scene.addEntity(sunlight);

        Filament.LightManager.Builder(LightType.SUN)
        .color([0.98, 0.92, 0.89])
        .intensity(50000.0)
        .direction([0.6, -1.0, -0.8])
        .castShadows(true)
        .sunAngularRadius(1.9)
        .sunHaloSize(10.0)
        .sunHaloFalloff(80.0)
        .build(engine, sunlight);

        const ibldata = Filament.assets['pillars_2k_ibl.ktx'];
        const indirectLight = engine.createIblFromKtx(ibldata, {'rgbm': true});
        indirectLight.setIntensity(50000);
        this.scene.setIndirectLight(indirectLight);

        this.swapChain = engine.createSwapChain();
        this.renderer = engine.createRenderer();
        this.camera = engine.createCamera();
        this.view = engine.createView();
        this.view.setClearColor([1,1,1,1]);
        this.view.setCamera(this.camera);
        this.view.setScene(this.scene);
        this.resize();
        this.render = this.render.bind(this);
        this.resize = this.resize.bind(this);
        window.addEventListener("resize", this.resize);
        window.requestAnimationFrame(this.render);
    }

    createRenderable(vertices, triangles, bounds, matinstance) {
        const renderable = Filament.EntityManager.get().create();
        const engine = this.engine;
        const nverts = vertices.length / 6;

        // Compute tangents. The "vertices" buffer looks like: PX PY PZ NX NY NZ.
        const tangents = new Uint16Array(4 * nverts);
        for (var i = 0; i < nverts; ++i) {
            const n = vertices.subarray(i * 6 + 3, i * 6 + 6);
            const dst = tangents.subarray(i * 4, i * 4 + 4);
            const b = vec3.cross(vec3.create(), n, [1, 0, 0]);
            const t = vec3.cross(vec3.create(), b, n);
            const q = quat.fromMat3(quat.create(), [
                    t[0], t[1], t[2],
                    b[0], b[1], b[2],
                    n[0], n[1], n[2]]);
            vec4.packSnorm16(dst, q);
        }

        const vb = Filament.VertexBuffer.Builder()
        .vertexCount(nverts)
        .bufferCount(2)
        .attribute(VertexAttribute.POSITION, 0, AttributeType.FLOAT3, 0, 24)
        .attribute(VertexAttribute.TANGENTS, 1, AttributeType.SHORT4, 0, 0)
        .normalized(VertexAttribute.TANGENTS)
        .build(engine);

        const ib = Filament.IndexBuffer.Builder()
        .indexCount(triangles.length)
        .bufferType(IndexType.USHORT)
        .build(engine);

        vb.setBufferAt(engine, 0, Filament.Buffer(vertices));
        vb.setBufferAt(engine, 1, Filament.Buffer(tangents));
        ib.setBuffer(engine, Filament.Buffer(triangles));

        Filament.RenderableManager.Builder(1)
        .boundingBox(bounds)
        .material(0, matinstance)
        .geometry(0, PrimitiveType.TRIANGLES, vb, ib)
        .build(engine, renderable);

        return renderable;
    }

    render() {
        const eye = [0, 0, 4], center = [0, 0, 0], up = [0, 1, 0];
        this.camera.lookAt(eye, center, up);
        this.renderer.render(this.swapChain, this.view);
        const radians = Date.now() / 1000;
        const transform = mat4.fromRotation(mat4.create(), radians, [0, 1, 0]);
        const tcm = this.engine.getTransformManager();
        for (let key in this.renderables) {
            for (let renderable of this.renderables[key]) {
                tcm.setTransform(tcm.getInstance(renderable), transform);
            }
        }
        window.requestAnimationFrame(this.render);
    }

    resize() {
        const dpr = window.devicePixelRatio;
        const width = this.canvas.width = window.innerWidth * dpr;
        const height = this.canvas.height = window.innerHeight * dpr;
        this.view.setViewport([0, 0, width, height]);
        this.camera.setProjectionFov(45, width / height, 1.0, 10.0,
            width > height ? Fov.VERTICAL : Fov.HORIZONTAL);
    }
}
