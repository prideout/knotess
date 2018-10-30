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

    tessellate(linkid) {
        const options = {
            polygonSides: 30,
            radius: 0.07,
            tangents: true
        };
        return this.knots.tessellate(linkid, options);
    }

    navigateTo(linkid) {
        // Hide old renderables (if any)
        const meshes = this.renderables[this.linkid];
        if (meshes) {
            for (const mesh of meshes) {
                this.scene.remove(mesh);
            }
        }
        this.linkid = linkid;
        // Create new renderables if they are not in the cache.
        let renderables = this.renderables[linkid];
        if (!renderables) {
            const meshes = this.tessellate(linkid);
            renderables = this.renderables[linkid] = [];
            const M = 1.5, minpt = [-M, -M, -M], maxpt = [M, M, M];
            const bounds = [minpt, maxpt];
            let i = 0;
            for (const mesh of meshes) {
                const renderable = this.createRenderable(mesh, bounds, this.materials[i++]);
                renderables.push(renderable);
            }
        }
        // Add renderables to scene.
        for (const renderable of renderables) {
            this.scene.addEntity(renderable);
        }
        // Update various DOM elements.
        const label = document.getElementById('label');
        const comps = linkid.split('.');
        if (comps.length == 3) {
            label.innerHTML = `${comps[0]}<sup>${comps[1]}</sup><sub>${comps[2]}</sub>`;
        } else {
            label.innerHTML = `${comps[0]}<sub>${comps[1]}</sub>`;
        }
        const uparrow = document.getElementById('uparrow');
        const dnarrow = document.getElementById('dnarrow');
        const previd = this.knots.getPreviousLinkId(linkid);
        const nextid = this.knots.getNextLinkId(linkid);
        uparrow.href = '#' + previd;
        dnarrow.href = '#' + nextid;
        uparrow.style = linkid == previd ? "display:none" : "display:inline";
        dnarrow.style = linkid == nextid ? "display:none" : "display:inline";
    }

    constructor(canvas) {
        this.canvas = canvas;
        this.renderables = {};
        this.knots = new Knotess(Filament.assets[CENTERLINES].buffer);

        const engine = this.engine = Filament.Engine.create(canvas, {
            alpha: true,
            antialias: true,
            depth: true,
            premultipliedAlpha: false
        });
        this.scene = engine.createScene();

        const material_package = Filament.Buffer(Filament.assets['plastic.filamat']);
        const mat = engine.createMaterial(material_package);
        const mats = this.materials = [
            mat.createInstance(), mat.createInstance(), mat.createInstance()];
        const colors = [[0.5, 0.75, 1], [0.9, 1, 0.9], [1, 0.75, 0.5]];
        mats[0].setColorParameter("baseColor", Filament.RgbType.LINEAR, colors[0]);
        mats[1].setColorParameter("baseColor", Filament.RgbType.LINEAR, colors[1]);
        mats[2].setColorParameter("baseColor", Filament.RgbType.LINEAR, colors[2]);

        this.renderables = {};
        if (document.location.hash.length > 1) {
            this.linkid = document.location.hash.substr(1);
        } else {
            this.linkid = "8.3.5";
        }
        this.navigateTo(this.linkid);
        document.location.hash = this.linkid;
        window.onhashchange = this.onHashChange.bind(this);

        document.addEventListener('keydown', (event) => {
            const keyName = event.key;
            if (keyName == 'ArrowUp') {
                const el = document.getElementById('uparrow');
                const linkid = el.hash.substr(1);
                this.navigateTo(linkid);
                document.location.hash = linkid;
            }
            if (keyName == 'ArrowDown') {
                const el = document.getElementById('dnarrow');
                const linkid = el.hash.substr(1);
                this.navigateTo(linkid);
                document.location.hash = linkid;
            }
          });

        const ibldata = Filament.assets['pillars_2k_ibl.ktx'];
        const indirectLight = engine.createIblFromKtx(ibldata, {'rgbm': true});
        indirectLight.setIntensity(30000);
        this.scene.setIndirectLight(indirectLight);

        this.swapChain = engine.createSwapChain();
        this.renderer = engine.createRenderer();
        this.camera = engine.createCamera();
        this.view = engine.createView();
        this.view.setPostProcessingEnabled(false);
        this.view.setClearColor([1,1,1,0]);
        this.view.setCamera(this.camera);
        this.view.setScene(this.scene);
        this.resize();
        this.render = this.render.bind(this);
        this.resize = this.resize.bind(this);
        window.addEventListener("resize", this.resize);
        window.requestAnimationFrame(this.render);
    }

    createRenderable(mesh, bounds, matinstance) {
        const renderable = Filament.EntityManager.get().create();
        const engine = this.engine;
        const vertices = mesh.vertices;
        const tangents = mesh.tangents;
        const triangles = mesh.triangles;

        const vb = Filament.VertexBuffer.Builder()
            .vertexCount(vertices.length / 6)
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
        const eye = [0, 0, 5], center = [0, 0, 0], up = [0, 1, 0];
        this.camera.lookAt(eye, center, up);
        const radians = Date.now() / 1000;
        const transform = mat4.fromRotation(mat4.create(), radians, [0, 1, 0]);
        const tcm = this.engine.getTransformManager();
        for (let key in this.renderables) {
            for (let renderable of this.renderables[key]) {
                tcm.setTransform(tcm.getInstance(renderable), transform);
            }
        }
        this.renderer.render(this.swapChain, this.view);
        window.requestAnimationFrame(this.render);
    }

    resize() {
        const dpr = window.devicePixelRatio;
        const width = this.canvas.width = this.canvas.clientWidth * dpr;
        const height = this.canvas.height = this.canvas.clientHeight * dpr;
        this.view.setViewport([0, 0, width, height]);
        this.camera.setProjectionFov(45, width / height, 1.0, 10.0,
            width > height ? Fov.VERTICAL : Fov.HORIZONTAL);
    }
}
