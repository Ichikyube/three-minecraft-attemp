/**
 * Main javascript file - where the game starts
 * @type {{VERSION: string}}
 */

var CANNONS = { VERSION : '0.0.13a' };

var container, stats;
var camera, controls, scene, renderer, world, player, tank, clock, gravity, audio;

function main() {
    gravity = new THREE.Vector3(0, 0.1, 0);
    clock = new THREE.Clock(true);
    if (! Detector.webgl) {
        Detector.addGetWebGLMessage();
        document.getElementById('container').innerHTML = "";
    }
    init();
    animate();
}

function init() {
    debug.init();
    debug.enable();
    container = document.getElementById('container');
    world = new CANNONS.World({ width: 64, length: 64, height: 16 });
    // play obligatory tank sound
    //audio = document.createElement('audio');
    var source = document.createElement('source');
    source.src = 'sounds/tank.mp3';
    //audio.appendChild(source);
    //audio.volume = 0.1;
    //audio.loop = true;
    //audio.play();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 50000);
    player = new CANNONS.Player(camera);
    CANNONS.entities.add(player);
    scene = new THREE.Scene();
    //controls = new THREE.TankControls(camera);
    //controls.ground();
    controls = new THREE.FirstPersonControls(camera);
    scene.add(player.getObject());
    world.render();

    var ambientLight = new THREE.AmbientLight(0x999999);
    scene.add(ambientLight);
    var directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(1, 1, 0.5).normalize();
    scene.add(directionalLight);
    renderer = new THREE.WebGLRenderer({ alpha: false });
    renderer.setClearColor(0xbfd1e5, 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    container.appendChild(stats.domElement);
    window.addEventListener('resize', onWindowResize, false);
    tank = new CANNONS.Tank(scene, renderer, player.position);
    CANNONS.entities.add(tank);
    createAiTank();
    gui.init();
    gui.drawRadar();

    //CANNONS.stateManager.changeState(CANNONS.gameStates.splash);
    CANNONS.stateManager.changeState(CANNONS.gameStates.debug);

    // add player cursor
    scene.add(player.cursor);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    //controls.handleResize();
}

function animate() {
    requestAnimationFrame(animate);
    render();
    stats.update();
}

function render() {
    controls.update(clock.getDelta());
    CANNONS.entities.update(clock.getDelta());
    gui.update();
    renderer.render(scene, camera);
}