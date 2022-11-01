import * as THREE from 'three';
import Stats from 'addons/libs/stats.module.js';
import {
    GUI
} from 'vendor/gui/dat.gui.module.js';
//Post-Processing
import {
    ShaderPass
} from 'addons/postprocessing/ShaderPass.js';
import {
    RenderPass
} from 'addons/postprocessing/RenderPass.js';
import {
    ClearPass
} from 'addons/postprocessing/ClearPass.js';
import {
    MaskPass, ClearMaskPass
} from 'addons/postprocessing/MaskPass.js';
import {
    EffectComposer
} from 'addons/postprocessing/EffectComposer.js';
import {
    SSAOPass
} from 'addons/postprocessing/SSAOPass.js';
//Shader
import {
    SSAOShader
} from 'addons/shaders/SSAOShader.js';
import {
    FXAAShader
} from 'addons/shaders/FXAAShader.js';
import {
    UnrealBloomPass
} from 'addons/postprocessing/UnrealBloomPass.js';
import {
    CopyShader
} from 'addons/shaders/CopyShader.js';

import {
    Player
} from 'parts/Player/1stPView.js';
////////////// States View ///////////////////////////////
const stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.top = '0px';
const container = document.getElementById('container');
container.appendChild(stats.domElement);
//let renderDistance = 4;
const effectController = {

    focalLength: 15,
    // jsDepthCalculation: true,
    // shaderFocus: false,
    //
    fstop: 2.8,
    // maxblur: 1.0,
    //
    showFocus: false,
    focalDepth: 3,
    // manualdof: false,
    // vignetting: false,
    // depthblur: false,
    //
    // threshold: 0.5,
    // gain: 2.0,
    // bias: 0.5,
    // fringe: 0.7,
    //
    // focalLength: 35,
    // noise: true,
    // pentagon: false,
    //
    // dithering: 0.0001

};
let ssaoPass;
const width = window.innerWidth;
const height = window.innerHeight;
let sceneMain = new THREE.Scene();
let sceneUI = new THREE.Scene();
let cameraFps = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000); //new FirstPersonCamera(this.camera_, this.objects_);
let cameraUI = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 1, 10);
let depthShader = THREE.ShaderLib[ "distanceRGBA" ];
let depthUniforms = THREE.UniformsUtils.clone( depthShader.uniforms );
let depthMaterial = new THREE.ShaderMaterial( { fragmentShader: depthShader.fragmentShader, vertexShader: depthShader.vertexShader, uniforms: depthUniforms } );
depthMaterial.blending = THREE.MultiplyBlending;
cameraUI.position.z = 10;
let renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true
});
let renderTargetParameters = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    stencilBuffer: true
};
let renderTarget = new THREE.WebGLRenderTarget(width, height, renderTargetParameters);
const depthTarget = new THREE.WebGLRenderTarget( width, height, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat } );
let composer = new EffectComposer(renderer, renderTarget);
let fogColor = 0x5b8419;
let shooterView = false;
const mapLoader = new THREE.TextureLoader();
const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
export function initRender(sceneAlpha) {
    initRenderer();
    initCamera();
    initCrosshair();
    initPostFX(sceneAlpha);
    // add the output of the render function to the HTML
    document.body.appendChild(renderer.domElement);
    window.addEventListener('resize', onWindowResize);

    function onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        renderer.setSize(width, height);
        composer.setSize(renderer.domElement.width, renderer.domElement.height);
        cameraFps.aspect = width / height;
        cameraFps.updateProjectionMatrix();
        updateUIelm();
        //resizeShadowMapViewers();
    }
}
export let makePlayer = function () {
    return new Player(sceneMain, cameraFps, renderer.domElement);
}
export function initCamera() {
    cameraFps.rotation.order = 'YXZ';
    cameraFps.position.y = 1000;
}
export function initRenderer() {
    renderer.setClearColor(fogColor, 1);
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.autoClear = false; // To allow render overlay on top of sprited sphere
    renderer.physicallyCorrectLights = false;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = Math.pow(1, 5.0); // to allow for very bright scenes.
    return renderer;
}
export function render(sceneAlpha) {
    //cameraFps.updateMatrixWorld( true );
    //renderer.clear();
    sceneAlpha.overrideMaterial = depthMaterial;
    // set force clear to true here so the depth buffer is not preserved
    renderer.render( sceneAlpha, cameraFps, depthTarget, true );    
    sceneAlpha.overrideMaterial = null;
    //renderer.clearDepth();
    composer.render();
    //renderer.render(sceneAlpha, cameraFps);
    //renderer.clearDepth();
    renderer.render(sceneUI, cameraUI);

    stats.update();
}
function updateUIelm() {
    cameraUI.left = -width / 2;
    cameraUI.right = width / 2;
    cameraUI.top = height / 2;
    cameraUI.bottom = -height / 2;
    cameraUI.updateProjectionMatrix();
    if(shooterView)    crosshair.position.set(0, 0, 1);
}
export function enterShooterView() {
    enableCrosshair();
}
export function leaveShooterView() {
    disableCrosshair();
}
// Crosshair 
let crosshair
function initCrosshair() {
    const crossImg = mapLoader.load('../assets/textures/crosshair/cursor.png');
    crossImg.anisotropy = maxAnisotropy;
    let crosshairMat = new THREE.SpriteMaterial({
        opacity: 0.74,
        color: 0xaa1111,
        fog: false,
        depthTest: false,
        depthWrite: false,
        transparent: true,
        map: crossImg
    })
    crosshairMat.scaleByViewport = true;
    crosshairMat.blending = THREE.NormalBlending;
    crosshair = new THREE.Sprite(crosshairMat);
    crosshair.position.set(0, 0, 1);
    crosshair.center.set(0.5, 0.5);
    crosshair.scale.set((width / 24) / 1.5, height / 24, 1);
    
}
function enableCrosshair() {
    crosshair.position.set(0, 0, 1);
    crosshair.center.set(0.5, 0.5);
    crosshair.scale.set((width / 24) / 1.5, height / 24, 1);
    sceneUI.add(crosshair);
}
function disableCrosshair() {
    sceneUI.remove(crosshair);
}

//scene
export function initScene(folder, fp, bp, tp, dp, rp, lp) {
    let params = [fp, bp, tp, dp, lp, rp];
    let imageSuffix = ".png";
    let directions = params.map(function (param) {
        return param + imageSuffix;
    })
    const reflectionCube = new THREE.CubeTextureLoader()
        .setPath('../assets/textures/Skybox/' + folder + '/')
        .load(directions);
    reflectionCube.encoding = THREE.sRGBEncoding;
    sceneMain.background = reflectionCube;
    sceneMain.fog = new THREE.FogExp2(fogColor, 0.0025);
    return sceneMain;
}
export function Scene() {
    sceneMain.fog = new THREE.FogExp2(fogColor, 0.0025); //(uniforms['bottomColor'].value5, 0.002);
    //scene.overrideMaterial = new THREE.MeshDepthMaterial();
    return sceneMain;
}

export function initGround() {
    const checkerboard = mapLoader.load('resources/checkerboard.png');
    checkerboard.anisotropy = maxAnisotropy;
    checkerboard.wrapS = THREE.RepeatWrapping;
    checkerboard.wrapT = THREE.RepeatWrapping;
    checkerboard.repeat.set(32, 32);
    checkerboard.encoding = THREE.sRGBEncoding;

    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100, 10, 10),
        new THREE.MeshStandardMaterial({
            map: checkerboard
        }));
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;
    this.sceneMain.add(plane);

}

//helper
function ocHelper() {
    const colHelper = new OctreeHelper(worldOctree);
    colHelper.visible = false;
    sceneMain.add(colHelper);
}

export function initGui() {
    // Init gui
    const gui = new GUI();

    gui.add(ssaoPass, 'output', {
        'Default': SSAOPass.OUTPUT.Default,
        'SSAO Only': SSAOPass.OUTPUT.SSAO,
        'SSAO Only + Blur': SSAOPass.OUTPUT.Blur,
        'Beauty': SSAOPass.OUTPUT.Beauty,
        'Depth': SSAOPass.OUTPUT.Depth,
        'Normal': SSAOPass.OUTPUT.Normal
    }).onChange(function (value) {

        ssaoPass.output = parseInt(value);

    });
    gui.add(ssaoPass, 'kernelRadius').min(0).max(32);
    gui.add(ssaoPass, 'minDistance').min(0.001).max(0.02);
    gui.add(ssaoPass, 'maxDistance').min(0.01).max(0.3);
}

//---------------------------------------------------//
/*...............Post Processing.....................*/
//---------------------------------------------------//
//---------------------------------------------------//
function initPostFX(sceneAlpha) {
    const pixelRatio = renderer.getPixelRatio();
    composer.setSize(renderer.domElement.width, renderer.domElement.height);
        // set clear to false while rendering the model to preserve buffer data
    // the information in the stencil buffer is used for the masking pass

    const clearPass = new ClearPass(fogColor, 1);
    composer.addPass( clearPass );
    // add both foreground and background rendering to the composer
    const renderPass = new RenderPass(sceneMain, cameraFps);
    //renderPass.clear = false;
    composer.addPass( renderPass );
    const SSAOs = new ShaderPass( SSAOShader );
    console.log(SSAOs)
    SSAOs.uniforms[ 'tDepth' ].value = depthTarget;
    SSAOs.uniforms[ 'cameraNear' ].value = cameraFps.near;
    SSAOs.uniforms[ 'cameraFar' ].value = cameraFps.far;
    SSAOs.renderToScreen = true;
    //composer.insertPass( SSAOs,3 );
    ssaoPass = new SSAOPass(sceneMain, cameraFps, width, height);
    console.log(ssaoPass)
    ssaoPass.kernelRadius = 32;
    ssaoPass.minDistance = 0.001;
    ssaoPass.maxDistance = 0.01;
    ssaoPass.tDepth = depthTarget;
    ssaoPass.depthRenderMaterial = depthMaterial;
    ssaoPass.cameraNear = cameraFps.near;
    ssaoPass.cameraFar = cameraFps.far;
    ssaoPass.aoClamp = 0.4;
    ssaoPass.transparent = true;
    ssaoPass.renderToScreen = true;
    composer.insertPass(ssaoPass, 2);
    const alphaPass = new RenderPass( sceneAlpha, cameraFps );
    console.log(alphaPass)
        alphaPass.clear = false;
        alphaPass.renderToScreen = true;
    composer.addPass( alphaPass );
    const fxaaPass = new ShaderPass(FXAAShader);
    fxaaPass.uniforms['resolution'].value.x = 1 / (document.body.offsetWidth * pixelRatio);
    fxaaPass.uniforms['resolution'].value.y = 1 / (document.body.offsetHeight * pixelRatio);
    fxaaPass.renderToScreen = true;
    composer.addPass(fxaaPass);
    const bloomPass = new UnrealBloomPass( new THREE.Vector2(width, height), 1.5, 0.4, 0.85 );//2.0, 0.0, 0.75
    bloomPass.threshold = 0.15;
    bloomPass.strength = 0.1;
    bloomPass.radius = 0.15;
    composer.addPass(bloomPass);
    const CopyPass = new ShaderPass(CopyShader);
    CopyPass.renderToScreen = true;
    composer.insertPass(CopyPass,2);
    composer.addPass(CopyPass);
}