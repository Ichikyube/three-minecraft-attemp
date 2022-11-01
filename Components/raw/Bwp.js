import * as THREE from 'three';
import Stats from '../assets/jsm/libs/stats.module.js';
import * as BufferGeometryUtils from '../assets/jsm/utils/BufferGeometryUtils.js';
//controls
import {
    PointerLockControls
} from '../assets/jsm/controls/PointerLockControls.js';
import {
    GLTFLoader
} from '../assets/jsm/loaders/GLTFLoader.js';
import {
    ShadowMapViewer
} from '../assets/jsm/utils/ShadowMapViewer.js';
import {
    Octree
} from '../assets/jsm/math/Octree.js';
import {
    OctreeHelper
} from '../assets/jsm/helpers/OctreeHelper.js';
import {
    Capsule
} from '../assets/jsm/math/Capsule.js';
import {
    Water
} from '../assets/jsm/objects/Water2.js';
//Post-Processing
import {
    ShaderPass
} from '../assets/jsm/postprocessing/ShaderPass.js';
import {
    RenderPass
} from '../assets/jsm/postprocessing/RenderPass.js';
import {
    MaskPass
} from '../assets/jsm/postprocessing/MaskPass.js';
import {
    AfterimagePass
} from '../assets/jsm/postprocessing/AfterimagePass.js';
import {
    EffectComposer
} from '../assets/jsm/postprocessing/EffectComposer.js';
//Shader
import {
    FXAAShader
} from '../assets/jsm/shaders/FXAAShader.js';
import {
    BokehPass
} from '../assets/jsm/postprocessing/BokehPass.js';
import {
    RGBShiftShader
} from '../assets/jsm/shaders/RGBShiftShader.js';
import {
    CopyShader
} from '../assets/jsm/shaders/CopyShader.js';
//add-on function
function degrees_to_radians(degrees) {
    var pi = Math.PI;
    return degrees * (pi / 180);
}
////////////// States View ///////////////////////////////
const stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.top = '0px';
////////////// Global Variables ///////////////////////////////
// ThreeJS webGL 
let player, scene, renderer, composer, camera, controls;
const clock = new THREE.Clock();
const container = document.getElementById('container');
container.appendChild(stats.domElement);
// Custom
const GRAVITY = 30;
const NUM_SPHERES = 100;
const SPHERE_RADIUS = 0.2;
const STEPS_PER_FRAME = 3;
const keyStates = {};
let xRot = 0;
const SHADOW_MAP_WIDTH = 548,
    SHADOW_MAP_HEIGHT = 524;
const SHADOW_MAP_DLight = 1024;
const DsArea = 80;
const objects = [];
const worldOctree = new Octree();
const vertex = new THREE.Vector3();
const color = new THREE.Color();
var mouse_sensitivity = 0.002
var acceleration = 4.0
var friction = 6.0
const mvControl = {
    pressBackward: false,
    pressForward: false,
    pressLeft: false,
    pressRight: false,
    pressJump: false
}
const worldWidth = 128,
    worldDepth = 128;
let renderTargetDepth = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat
});
//////////// Player //////////////////////////////////////
class Player extends Capsule {
    constructor(start, end, radius) {
        super(start, end, radius);
        this.start = new THREE.Vector3(0, 1.35, 0);
        this.end = new THREE.Vector3(0, 6, 0);
        this.radius = 1.35;
        this.onGround = false;
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.walk_speed = 8.0;
        this.run_speed = 16.0;
        this.jump_speed = 75.0;
    }
    checkCollision() {
        const result = worldOctree.capsuleIntersect(this);
        let self = this;
        this.onGround = false;
        if (result) {
            this.onGround = result.normal.y > 0;
            if (!this.onGround) {
                this.velocity.addScaledVector(result.normal, -result.normal.dot(this.velocity));
            }
            this.translate(result.normal.multiplyScalar(result.depth));
        }
    }

    updateMovement(deltaTime) {

        let self = this;
        if (controls.isLocked === true) {
            self.checkCollision();
            let damping = Math.exp(-4 * deltaTime) - 1;

            if (!this.onGround) {
                this.velocity.y -= GRAVITY * 10.0 * deltaTime;
                // small air resistance
                damping *= 0.0001;
            } else this.velocity.y -= GRAVITY * deltaTime / 100.0
            this.velocity.addScaledVector(this.velocity, damping);
            const deltaPosition = this.velocity.clone().multiplyScalar(deltaTime);
            this.translate(deltaPosition);

        }
    }

    getForwardVector() {
        camera.getWorldDirection(this.direction);
        this.direction.y = 0;
        this.direction.normalize();
        return this.direction;

    }

    getSideVector() {
        camera.getWorldDirection(this.direction);
        this.direction.y = 0;
        this.direction.normalize();
        this.direction.cross(camera.up);

        return this.direction;

    }

    controller(deltaTime) {
        // gives a bit of air control
        const speedDelta = deltaTime * 25;
        if (this.onGround) {
            if (mvControl.pressForward) {
                this.velocity.add(this.getForwardVector().multiplyScalar(speedDelta * this.walk_speed));
            }
            if (mvControl.pressBackward) {
                this.velocity.add(this.getForwardVector().multiplyScalar(-speedDelta * this.walk_speed));
            }
            if (mvControl.pressLeft) {
                this.velocity.add(this.getSideVector().multiplyScalar(-speedDelta * this.walk_speed));
            }
            if (mvControl.pressRight) {
                this.velocity.add(this.getSideVector().multiplyScalar(speedDelta * this.walk_speed));
            }
            if (mvControl.pressJump) {
                this.velocity.y = this.jump_speed;
                this.onGround = false;

            }
        }
    }
}
////////////////// Main App ///////////////////////////////
window.onload = init;

function init() {
    //---------------------------------------------------//
    /*------------Three JS basic Objects-----------------*/
    //---------------------------------------------------//
    // create a scene, that will hold all our elements such as objects, cameras and lights.
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xaaccff);
    //scene.overrideMaterial = new THREE.MeshDepthMaterial();
    // create a render and set the size
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    scene.fog = new THREE.FogExp2(0xffffff, 0.00125);//(uniforms['bottomColor'].value5, 0.002);
    renderer.setClearColor(scene.fog.color, 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = Math.pow(1, 5.0); // to allow for very bright scenes.
    // add the output of the render function to the HTML
    document.body.appendChild(renderer.domElement);
    const colHelper = new OctreeHelper(worldOctree);
    colHelper.visible = true;
    scene.add(colHelper);
    // create a camera, which defines where we're looking at
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.rotation.order = 'YXZ';
    let makePlayer = function () {
        player = new Player();
    }
    initLights(scene);
    //initShadowViewer();
    initSky(scene);
    composer = initPostFX();
    createStartingMesh(scene);
    makePlayer();

    controls = new PointerLockControls(camera, renderer.domElement);
    controls.maxPolarAngle = 2.0;
    controls.minPolarAngle = 0.8;
    controls.pointerSpeed = 0.3;
    scene.add(controls.getObject());

    const blocker = document.getElementById('blocker');
    const instructions = document.getElementById('instructions');

    instructions.addEventListener('click', function () {

        controls.lock();

    });
    controls.addEventListener('lock', function () {

        instructions.style.display = 'none';
        blocker.style.display = 'none';

    });
    controls.addEventListener('unlock', function () {

        blocker.style.display = 'block';
        instructions.style.display = '';

    });
    window.addEventListener('keydown', function (event) {
        onKeyDown(event)
    });
    window.addEventListener('keyup', function (event) {
        onKeyUp(event)
    });
    var onKeyDown = function (event) {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                mvControl.pressForward = true;
                break;

            case 'ArrowLeft':
            case 'KeyA':
                mvControl.pressLeft = true;
                break;

            case 'ArrowDown':
            case 'KeyS':
                mvControl.pressBackward = true;
                break;

            case 'ArrowRight':
            case 'KeyD':
                mvControl.pressRight = true;
                break;

            case 'Space':
                mvControl.pressJump = true;
                break;
        }
    };

    var onKeyUp = function (event) {
        switch (event.code) {

            case 'ArrowUp':
            case 'KeyW':
                mvControl.pressForward = false;
                break;

            case 'ArrowLeft':
            case 'KeyA':
                mvControl.pressLeft = false;
                break;

            case 'ArrowDown':
            case 'KeyS':
                mvControl.pressBackward = false;
                break;

            case 'ArrowRight':
            case 'KeyD':
                mvControl.pressRight = false;
                break;

            case 'Space':
                mvControl.pressJump = false;
                break;
        }
    };
    window.addEventListener('resize', onWindowResize);

    function onWindowResize() {
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(renderer.domElement.width, renderer.domElement.height);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        //resizeShadowMapViewers();
    }
    let watergeo = new THREE.PlaneGeometry(90, 40, worldWidth - 1, worldDepth - 1);
    watergeo.rotateX(-Math.PI / 2);

    //water.position.y = 1;
    //water.rotation.x = Math.PI * - 0.5;
    const position = watergeo.attributes.position;
    position.usage = THREE.DynamicDrawUsage;

    for (let i = 0; i < position.count; i++) {

        const y = 2.5 * Math.sin(i / 2);
        position.setY(i, y);

    }
    let earth = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshLambertMaterial()) ;
    earth.rotateX(-Math.PI / 2);
    earth.position.y = -5;
    const texture = new THREE.TextureLoader().load('assets/textures/water.jpg');
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(5, 5);

    let water = new Water(watergeo, {
        color: 0x0044ff,
        //map: texture,
        scale: 5,
        clipBias: -0.0001,
        flowDirection: new THREE.Vector2(1, 1),
        shader: Water.WaterShader,
        textureWidth: 2524,
        textureHeight: 2524
    });
    //water.position.z = -10;
    scene.add(water, earth);
    worldOctree.fromGraphNode(water);
    worldOctree.fromGraphNode(earth);
   
    function animate() {
        const deltaTime = Math.min(0.05, clock.getDelta()) / STEPS_PER_FRAME;

        for (let i = 0; i < STEPS_PER_FRAME; i++) {
            player.controller(deltaTime);
            player.updateMovement(deltaTime);
            controls.getObject().position.copy(player.end);
            animateProps(deltaTime);
        }

    }

    function render() {
        composer.render();
        const time = clock.getElapsedTime() * 10;
        const position = watergeo.attributes.position;

        for (let i = 0; i < position.count; i++) {

            const y = 0.5 * Math.sin(i / 5 + (time + i) / 7);
            position.setY(i, y);

        }

        position.needsUpdate = true;
        //renderer.render(scene, camera, renderTargetDepth, true);
        stats.update();
    }
    // function for re-rendering/animating the scene
    function loop() {
        animate();
        render();
        requestAnimationFrame(loop);
    }

    loop();
}

function animateProps(deltaTime) {
    //rotatingCube(deltaTime);
    //planeMaterial.emissive.setHSL(0.54, 1, 0.35 * (0.5 + 0.5 * Math.sin(35 * clock.getDelta())));
}
//---------------------------------------------------//
/*...............Post Processing.....................*/
//---------------------------------------------------//
//---------------------------------------------------//
function initPostFX() {
    let composer = new EffectComposer(renderer);
    composer.setSize(renderer.domElement.width, renderer.domElement.height);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    const fxaaPass = new ShaderPass(FXAAShader);
    const pixelRatio = renderer.getPixelRatio();
    fxaaPass.material.uniforms['resolution'].value.x = 1 / (document.body.offsetWidth * pixelRatio);
    fxaaPass.material.uniforms['resolution'].value.y = 1 / (document.body.offsetHeight * pixelRatio);
    composer.addPass(fxaaPass);
    var bokehPass = new BokehPass(scene, camera, {
        //tDepth: renderTargetDepth.texture,
        focus: 1,
        aperture: 0.006,
        maxblur: 0.004,
        //focalLength: 35,
        //fstop: 2.8,
        //focalDepth: 1,
        width: window.innerWidth,
        height: window.innerHeight
    });
    //composer.addPass(bokehPass);
    /*const afterimagePass = new AfterimagePass();
    //composer.addPass( afterimagePass );
    const CopyPass = new ShaderPass(CopyShader);
    CopyPass.renderToScreen = true;
    //composer.addPass(CopyPass);
    const RGBShift = new ShaderPass(RGBShiftShader);
    RGBShift.uniforms['amount'].value = 0.0035;
    RGBShift.uniforms['angle'].value = 3.5;
    //composer.addPass(RGBShift);*/
    return composer;
}

//---------------------------------------------------//
/*--------------------Light--------------------------*/
//---------------------------------------------------//
function initLights(scene) {
    let spotLight = new THREE.SpotLight(0xffffff, 1);
    spotLight.position.set(16, 30, 0); //16, 22, 0
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.1;
    spotLight.decay = 2;
    spotLight.distance = 200;
    spotLight.shadow.mapSize.width = 512;
    spotLight.shadow.mapSize.height = 512;
    spotLight.shadow.camera.near = 10;
    spotLight.shadow.camera.far = 200;
    spotLight.shadow.focus = 1;
    const targetObject = new THREE.Object3D();
    targetObject.translateX(spotLight.position.x);
    targetObject.translateY(14);
    targetObject.translateZ(-20);
    spotLight.target = targetObject;

    let light = new THREE.PointLight(0xf4b400, 0.5, 100, 2);
    light.position.set(0, 8, 1.5);
    //Set up shadow properties for the light
    //light.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    //light.shadow.mapSize.height = SHADOW_MAP_HEIGHT;
    //light.shadow.camera.near = 0.05;
    //light.shadow.camera.far = 220;
    //light.shadow.bias = 0.00001;

    light.castShadow = false; // default false
    spotLight.castShadow = true;
    scene.add(light, spotLight, targetObject);
    const lightHelper = new THREE.SpotLightHelper(spotLight);
    const shadowCameraHelper = new THREE.CameraHelper(spotLight.shadow.camera);
    const pointLightHelper = new THREE.PointLightHelper(light, 1);
    //scene.add( pointLightHelper, lightHelper, shadowCameraHelper );
    //lightHelper.parent.updateMatrixWorld();
    //lightHelper.update();
}

//---------------------------------------------------//
/*-----------------ShadowMapViewer-------------------*/
//---------------------------------------------------//
let lightShadowMapViewer, DLightShadowMapViewer;

function initShadowViewer() {
    lightShadowMapViewer = new ShadowMapViewer(light);
    DLightShadowMapViewer = new ShadowMapViewer(DLight);
    resizeShadowMapViewers();
}

function renderShadowMapViewers() {
    DLightShadowMapViewer.render(renderer);
    lightShadowMapViewer.render(renderer);
}

function resizeShadowMapViewers() {
    const w = window.innerWidth * 0.15;
    const h = window.innerHeight * 0.15;
    lightShadowMapViewer.position.x = 10;
    lightShadowMapViewer.position.y = sizes.height - (SHADOW_MAP_HEIGHT / 4) - 10;
    lightShadowMapViewer.size.width = w;
    lightShadowMapViewer.size.height = h;
    DLightShadowMapViewer.position.x = 10;
    DLightShadowMapViewer.position.y = 10;
    DLightShadowMapViewer.size.width = w;
    DLightShadowMapViewer.size.height = h;
    DLightShadowMapViewer.update(); //Required when setting position or size directly
}
//---------------------------------------------------//
/*-------------------SKYDOME-------------------------*/
//---------------------------------------------------//
function initSky(scene) {
    let ambilight = new THREE.AmbientLight(0x737373, 0.075);

    let fillLight1 = new THREE.HemisphereLight('midnightblue', 'darkred', 0.375);
    fillLight1.position.set(0, 7.6, 0);
    fillLight1.color.setHSL(0.6, 1, 0.06);
    fillLight1.groundColor.setHSL(0.595, 1, 0.15);
    fillLight1.castShadow = false;
    const hemiLightHelper = new THREE.HemisphereLightHelper(fillLight1, 1);
    scene.add(ambilight, fillLight1);
    const vertexShader = document.getElementById('vertexShader').textContent;
    const fragmentShader = document.getElementById('fragmentShader').textContent;
    const uniforms = {
        'topColor': {
            value: fillLight1.color
        },
        'bottomColor': {
            value: new THREE.Color(0xffffff)
        },
        'offset': {
            value: 33
        },
        'exponent': {
            value: 0.6
        }
    };
    //scene.fog = new THREE.FogExp2(uniforms['bottomColor'].value5, 0.002);
    //renderer.setClearColor(scene.fog.color, 1);

    const skyGeo = new THREE.SphereGeometry(200, 32, 16);
    const skyMat = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        side: THREE.BackSide
    });

    let sky = new THREE.Mesh(skyGeo, skyMat);
    //sky.scale.set(-1, 1, 1);  
    sky.eulerOrder = 'XZY';
    sky.renderDepth = 1000.0;
    sky.position.set(0, 0, 0);
    scene.add(sky);
}
//---------------------------------------------------//
/*--------------------Materials----------------------*/
//---------------------------------------------------//
function wallMat() {
    let brick_diffuse = new THREE.TextureLoader().load("assets/textures/brick_diffuse.jpg",
        () => {
            brick_diffuse.mapping = THREE.UVMapping;
            brick_diffuse.wrapS = brick_diffuse.wrapT = THREE.MirroredRepeatWrapping;
            brick_diffuse.encoding = THREE.sRGBEncoding;
            brick_diffuse.anisotropy = renderer.capabilities.getMaxAnisotropy();
            brick_diffuse.minFilter = brick_diffuse.magFilter = THREE.LinearFilter;
            brick_diffuse.repeat.set(2, 1);
            brick_diffuse.offset.set(0.5, 0.53)
        });

    let brick_roughness = new THREE.TextureLoader().load("assets/textures/brick_roughness.jpg",
        () => {
            brick_roughness.wrapS = brick_roughness.wrapT = THREE.MirroredRepeatWrapping;
            brick_roughness.repeat.set(2, 1);
            brick_roughness.offset.set(0.5, 0.53)
        });
    let brick_bump = new THREE.TextureLoader().load("assets/textures/brick_bump.jpg",
        () => {
            brick_bump.wrapS = brick_bump.wrapT = THREE.MirroredRepeatWrapping;
            brick_bump.repeat.set(2, 1);
            brick_bump.offset.set(0.5, 0.53)
        });
    let texMat = new THREE.MeshStandardMaterial({
        map: brick_diffuse,
        color: 0xb92b27,
        bumpMap: brick_bump,
        bumpScale: 0.45,
        roughness: 0.98,
        roughnessMap: brick_roughness,
        transparent: false,
        flatShading: true,
        //envMap: sky
    });
    return texMat;
}

function floorMat() {
    let floorTexture = new THREE.TextureLoader().load("assets/textures/floors/FloorsCheckerboard_S_Diffuse.jpg",
        () => {
            floorTexture.wrapS = floorTexture.wrapT = THREE.MirroredRepeatWrapping;
            floorTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
            //floorTexture.minFilter = floorTexture.magFilter = THREE.LinearFilter;
            //floorTexture.mapping = THREE.UVMapping;
            floorTexture.repeat.set(5, 2);
            floorTexture.offset.set(0.27, 0);
        });
    let floorNormal = new THREE.TextureLoader().load("assets/textures/floors/FloorsCheckerboard_S_Normal.jpg",
        () => {
            floorNormal.wrapS = floorNormal.wrapT = THREE.MirroredRepeatWrapping;
            //floorNormal.minFilter = floorNormal.magFilter = THREE.LinearFilter;
            //floorNormal.mapping = THREE.UVMapping;
            floorNormal.repeat.set(5, 2);
            floorNormal.offset.set(0.27, 0);
        });
    let floorMat = new THREE.MeshPhongMaterial({
        map: floorTexture,
        color: 0xdddddd,
        normalMap: floorNormal,
        normalScale: new THREE.Vector2(0.1, 0.1),
        side: THREE.FrontSide,
        shininess: 90,
        reflectivity: 0.2
    });
    return floorMat;
}

function grassMat(opts) {
    // create the textureDiffuse	
    var textureDiffuse = new THREE.TextureLoader().load('assets/textures/grass/grasslight-small.jpg',
        () => {
            textureDiffuse.wrapS = THREE.RepeatWrapping;
            textureDiffuse.wrapT = THREE.RepeatWrapping;
            textureDiffuse.repeat.set(3, 3);
            textureDiffuse.anisotropy = renderer.capabilities.getMaxAnisotropy();
        });

    // create the textureNormal	
    var textureNormal = new THREE.TextureLoader().load('assets/textures/grass/grasslight-small-nm.jpg',
        () => {
            textureNormal.wrapS = THREE.RepeatWrapping;
            textureNormal.wrapT = THREE.RepeatWrapping;
            textureNormal.repeat.set(3, 3);
            textureNormal.anisotropy = 6;
        });

    var grassMat = new THREE.MeshPhongMaterial({
        map: textureDiffuse,
        normalMap: textureNormal,
        normalScale: new THREE.Vector2(1, 1).multiplyScalar(0.5),
        color: 0x44FF44,
    })

    // return the just-built object3d
    return grassMat;
}

//---------------------------------------------------//
/*--------------------Geometry-----------------------*/
//---------------------------------------------------//
function createStartingMesh(scene) {
    var grass = new THREE.Mesh(new THREE.SphereGeometry(5, 32, 16), grassMat());
    grass.rotateX(-Math.PI / 2);
    grass.position.set(14, -0.8, -8);
    grass.castShadow = true;
    grass.receiveShadow = true;
    scene.add(grass);
    worldOctree.fromGraphNode(grass);
    var boxgeom = new THREE.PlaneGeometry(40, 40, 1, 1); //boxgeom.matrixAutoUpdate = true;
    //boxgeom.rotateX(degrees_to_radians(90));
    boxgeom.rotateY(degrees_to_radians(-90));
    boxgeom.computeBoundingBox();
    boxgeom.normalizeNormals();
    var roomOctree = new THREE.Mesh(boxgeom, new THREE.MeshStandardMaterial({
        color: 0xff0000,
        side: THREE.FrontSide
    }));
    roomOctree.position.set(45, 14, 0);
    //scene.add(roomOctree);
    var room = new THREE.Mesh(new THREE.BoxBufferGeometry(-90, 40, 40), wallMat());
    room.position.set(0, -2.51 + 20, 0);
    //room.updateMatrix();
    //room.updateWorldMatrix();
    //room.updateMatrixWorld();
    //worldOctree.fromGraphNode(roomOctree);
    //worldOctree.fromGraphNode(room);
    room.castShadow = false;
    room.receiveShadow = true;
    var uvAttribute = room.geometry.attributes.uv;
    for (var i = 0; i < uvAttribute.count; i++) {

        var u = uvAttribute.getX(i);
        var v = uvAttribute.getY(i);

        // do something with uv
        u = u * 2;
        v = v % 3.14;

        // write values back to attribute

        uvAttribute.setXY(i, u, v);

    }
    uvAttribute.normalized = true;
    uvAttribute.needsUpdate = true;

    var planeGeometry = new THREE.PlaneGeometry(100, 40, 1, 1);
    var floor = new THREE.Mesh(planeGeometry, floorMat());
    floor.rotation.x = degrees_to_radians(-90);
    floor.position.set(0.15, -2.5, 0);
    floor.updateWorldMatrix(true, false);
    floor.geometry.computeBoundingBox();
    floor.castShadow = false;
    floor.receiveShadow = true;
    var ceiling = floor.clone();
    ceiling.rotation.y = degrees_to_radians(180);
    ceiling.position.y = 32.2;
    scene.add(room, floor, ceiling);
    worldOctree.fromGraphNode(floor);
    // Helper function to pad numbers with leading zeroes. (3 --> '003')
    function pad(num, size) {
        return ('000000000' + num).substr(-size);
    }
    const paints = [];
    const paintings = [];
    const canvas = [];
    for (var i = 0; i < 6; i++) {
        var board = new THREE.BoxGeometry(6, 6);
        board.translate(i * 8, 5, -19.5);
        board.lookAt(new THREE.Vector3(0, 0, 0));
        let paint = new THREE.TextureLoader().load('assets/textures/Paintings/' + pad(i, 3) + '.jpg',
            () => {
                paint.wrapS = paint.wrapT = THREE.ClampToEdgeWrapping;
                var aspect = board.parameters.width / board.parameters.height;
                var imageAspect = paint.image.width / paint.image.height;
                if (aspect < imageAspect) {
                    paint.matrix.setUvTransform(0, 0, aspect / imageAspect, 1, 0, 0.5, 0.5);
                } else {
                    paint.matrix.setUvTransform(0, 0, 1, imageAspect / aspect, 0, 0.5, 0.5);
                }
            });
        paint.matrixAutoUpdate = false;
        paints.push(paint);
        canvas[i] = new THREE.MeshLambertMaterial({
            map: paints[i],
            color: 0xffffff,
            transparent: false,
            reflectivity: 0.3,
            side: THREE.DoubleSide
        });
        paintings[i] = new THREE.Mesh(board, canvas[i]);
        scene.add(paintings[i]);
        paintings[i].castShadow = true;
        paintings[i].receiveShadow = true;
        worldOctree.fromGraphNode(paintings[i]);
    }
    paintings[5].geometry.scale(2, 2.3, 1);
    paintings[5].position.set(-64, 7, 0);
}