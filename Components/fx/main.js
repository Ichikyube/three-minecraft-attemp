import * as THREE from 'three';

import Stats from './jsm/libs/stats.module.js';

let container, stats;

let camera, controls, scene, renderer;
const clock = new THREE.Clock();
var maxDelta = 0.2
var requestId = null
var lastTimeMsec = null
init();
animate();

function init() {

    container = document.getElementById('container');

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 20000);
    camera.position.y = getY(worldHalfWidth, worldHalfDepth) * 100 + 100;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbfd1e5);

    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
            
    /*ground = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100), new THREE.MeshPhongMaterial()
    )
    ground.rotation.y = -Math.PI;
    ground.rotateX(-Math.PI / 2);
    ground.position.y = -2;*/
    stats = new Stats();
    container.appendChild(stats.dom);

    //

    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    controls.handleResize();
}
frameDelta += clock.getDelta();
INV_MAX_FPS = 1 / 60;
var lastTimeMsec = null
function animate(nowMsec) {

	nowMsec = clock.getElapsedTime();
	lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60;
	var deltaMsec = Math.min(maxDelta * 1000, nowMsec - lastTimeMsec);//Math.min(200, nowMsec - lastTimeMsec)
	var deltaTime = deltaMsec / STEPS_PER_FRAME;
    while (deltaTime >= INV_MAX_FPS) {
        update(INV_MAX_FPS); // calculate physics
        frameDelta -= INV_MAX_FPS;
        }
	lastTimeMsec = nowMsec;
    requestAnimationFrame(animate); // keep looping

    render();
    stats.update();

}

function render() {

    controls.update(clock.getDelta());
    renderer.render(scene, camera);

}

//sceneloader
var loader = new THREE.SceneLoader();
loader.addGeometryHandler('ctm', THREE.CTMLoader);
loader.addHierarchyHandler('dae', THREE.ColladaLoader);
loader.load('scene.js', function (result) {
    scene.add(result.scene);
});
//<div id="bar"><div id="progress"></div></div>
var total = progress.totalModels + progress.totalTextures,
    loaded = progress.loadedModels + progress.loadedTextures,
    progressBar = document.getElementById('progress');
progressBar.style.width = Math.round(100 * loaded / total) + '%';

function onLoadCallback(loaded) {
    // just output the length for arrays and binary blobs
    if (loaded.length) {
        console.log("Loaded", loaded.length);
    } else {
        console.log("Loaded", loaded);
    }
}

function onProgressCallback(progress) {
    console.log("Progress", progress);
}

function onErrorCallback(error) {
    console.log("Error", error)
}

function loadTexture(texture) {
    var texture = THREE.ImageUtils.loadTexture(textureURL, null,
        onLoadCallback, onErrorCallback);
    console.log("texture after loadTexture call", texture);
}

function loadModel(modelUrl) {
    var jsonLoader = new THREE.JSONLoader();
    jsonLoader.load(modelUrl, onLoadCallback, null);
}

function loadModelWithProgress(model) {
    var jsonLoader = new THREE.JSONLoader();
    jsonLoader.loadAjaxJSON(jsonLoader, model, onLoadCallback,
        null, onProgressCallback);
}

function loadOthers(res) {
    var xhrLoader = new THREE.XHRLoader();
    xhrLoader.load(res, onLoadCallback,
        onProgressCallback, onErrorCallback);
}
