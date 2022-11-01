import * as THREE from 'three';
import {
    Capsule
} from '../assets/jsm/math/Capsule.js';
import {
    PointerLockControls
} from '../assets/jsm/controls/PointerLockControls.js';
import {
    onKeyDown,
    onKeyUp,
    mvControl
} from './Controls.js';
import * as THREE from 'three';
import {
    GLTFLoader
} from 'addons/loaders/GLTFLoader.js';
//camera follow object
function render() {
    var sphere = scene.getObjectByName('sphere');
    renderer.render(scene, camera);
    camera.lookAt(sphere.position);
    step += 0.02;
    sphere.position.x = 0 + (10 * (Math.cos(step)));
    sphere.position.y = 0.75 * Math.PI / 2 +
        (6 * Math.abs(Math.sin(step)));
    requestAnimationFrame(render);
}

//To zoom in with the camera, we first need to determine the distance from the camera to the object and its height:
// create an helper
var helper = new THREE.BoundingBoxHelper(cube);
helper.update();
// get the bounding sphere
var boundingSphere = helper.box.getBoundingSphere();
// calculate the distance from the center of the sphere
// and subtract the radius to get the real distance.
var center = boundingSphere.center;
var radius = boundingSphere.radius;
var distance = center.distanceTo(camera.position) -
    radius;
var realHeight = Math.abs(helper.box.max.y -
    helper.box.min.y);

var fov = 2 * Math.atan(realHeight *
        control.correctForDepth / (2 * distance)) *
    (180 / Math.PI);
camera.fov = fov;
camera.updateProjectionMatrix();

/*
If you are creating a game that provides a 2D interface on top of a 3D world, for instance, as
shown in the Creating a 2D overlay recipe, you might want to know how the 3D coordinates
map to your 2D overlay. If you know the 2D coordinates, you can add all kinds of visual effects
to the 2D overlay, such as tracking the code or letting the 2D overlay interact with the objects
in the 3D scene.

*/
var projector = new THREE.Projector();
var vector = new THREE.Vector3();
projector.projectVector(
vector.setFromMatrixPosition( object.matrixWorld ),
camera );
var width = window.innerWidth;
var height = window.innerHeight;
var widthHalf = width / 2;
var heightHalf = height / 2;
vector.x = ( vector.x * widthHalf ) + widthHalf;
vector.y = - ( vector.y * heightHalf ) + heightHalf;
/**
 * At this point, the vector variable will contain the screen coordinates of the center
of object. You can now use these coordinates with standard JavaScript, HTML,
and CSS to add effects.
In this recipe, we converted world coordinates to screen coordinates. This is actually
rather easy, as we've got all the information (in three dimensions) to correctly
determine the coordinates (in two dimensions). In the Selecting an object in the
scene recipe, we convert a screen coordinate to a world coordinate, which is harder
to do, as we don't have any depth information we can use.

 */
document.addEventListener('mousedown',
onDocumentMouseDown, false);
function onDocumentMouseDown(event) { ... }
var projector = new THREE.Projector();
var vector = new THREE.Vector3(
(event.clientX / window.innerWidth) * 2 - 1,
-(event.clientY / window.innerHeight) * 2 + 1,
0.5);
projector.unprojectVector(vector, camera);
var raycaster = new THREE.Raycaster(
    camera.position,
    vector.sub(camera.position).normalize());
    var intersects = raycaster.intersectObjects(
    [sphere, cylinder, cube]);
    if (intersects.length > 0) {
        intersects[0].object.material.transparent
         = true;
        if (intersects[0].object.material.opacity
         === 0.5) {
        intersects[0].object.material.opacity =
         1;
        } else {
        intersects[0].object.material.opacity =
         0.5;
        }

        
//render the raycast
var points = [];
points.push(new THREE.Vector3(camera.position.x,
camera.position.y - 0.2, camera.position.z));
points.push(intersects[0].point);
var mat = new THREE.MeshBasicMaterial({
color: 0xff0000,
transparent: true,
opacity: 0.6
});
var tubeGeometry = new THREE.TubeGeometry( new
THREE.SplineCurve3(points), 60, 0.001);
var tube = new THREE.Mesh(tubeGeometry, mat);
scene.add(tube);

function Player() {
    THREE.Mesh.apply(this, arguments);
    this.rotation.order = 'YXZ';
    this._aggregateRotation = new THREE.Vector3();
    this.cameraHeight = 40;
    this.velocity = new THREE.Vector3();
    this.acceleration = new THREE.Vector3(0, -150, 0);
}
Player.prototype = Object.create(THREE.Mesh.prototype);
Player.prototype.constructor = Player;
Player.prototype.update = (function () {
    var halfAccel = new THREE.Vector3();
    var scaledVelocity = new THREE.Vector3();
    return function (delta) {
        var r = this._aggregateRotation
            .multiplyScalar(delta)
            .add(this.rotation);
        r.x = Math.max(Math.PI * -0.5, Math.min(Math.PI * 0.5, r.x));
        this.rotation.x = 0;
        if (this.moveDirection.FORWARD) this.velocity.z -= Player.SPEED;
        if (this.moveDirection.LEFT) this.velocity.x -= Player.SPEED;
        if (this.moveDirection.BACKWARD) this.velocity.z += Player.SPEED;
        if (this.moveDirection.RIGHT) this.velocity.x += Player.SPEED;
        halfAccel.copy(this.acceleration).multiplyScalar(delta * 0.5);
        this.velocity.add(halfAccel);
        var squaredVelocity = this.velocity.x * this.velocity.x +
            this.velocity.z * this.velocity.z;
        if (squaredVelocity > Player.SPEED * Player.SPEED) {
            var scalar = Player.SPEED / Math.sqrt(squaredVelocity);
            this.velocity.x *= scalar;
            this.velocity.z *= scalar;
        }
        scaledVelocity.copy(this.velocity).multiplyScalar(delta);
        this.translateX(scaledVelocity.x);
        this.translateZ(scaledVelocity.z);
        this.position.y += scaledVelocity.y;
        this.velocity.add(halfAccel);
        this.velocity.add(scaledVelocity.multiply(
            this.ambientFriction
        ));
        this.rotation.set(r.x, r.y, r.z);
        this._aggregateRotation.set(0, 0, 0);
    };
})();

this.third.camera.position.lerp(
    this.camerasArr[this.cameraIndex % 3].getWorldPosition(new THREE.Vector3()),
    0.05
)
const pos = this.player.position.clone()
this.third.camera.lookAt(pos.x, pos.y + 3, pos.z)

if (pos.y < -20) this.scene.restart()

if (this.keys.space.isDown) {
    if (this.canCameraMove) {
        this.canCameraMove = false
        this.time.addEvent({
            delay: 250,
            callback: () => (this.canCameraMove = true)
        })
        this.cameraIndex++
    }
}
if (this.keys.w.isDown) {
    const speed = 4
    const rotation = this.player.getWorldDirection(
        new THREE.Vector3()?.setFromEuler?.(this.player.rotation) || this.player.rotation.toVector3()
    )
    const theta = Math.atan2(rotation.x, rotation.z)

    const x = Math.sin(theta) * speed,
        y = this.player.body.velocity.y,
        z = Math.cos(theta) * speed

    this.player.body.setVelocity(x, y, z)
}

if (this.keys.a.isDown) this.player.body.setAngularVelocityY(3)
else if (this.keys.d.isDown) this.player.body.setAngularVelocityY(-3);
else this.player.body.setAngularVelocityY(0);


document.getElementById('start').addEventListener('click', function () {
    if (BigScreen.enabled) {
        var instructions = this;
        BigScreen.request(document.body, function () {
            PL.requestPointerLock(document.body, function () {
                instructions.className = 'hidden';
                startAnimating();
            }, function () {
                stopAnimating();
            });
        }, function () {
            instructions.className = 'exited';
            stopAnimating();
        });
    }
});

document.onselectstart = function () {
    return false;
}
document.addEventListener('mousemove', function (event) {
    player.rotate(event.movementY, event.movementX, 0);
}, false);
player = new Player();
player.add(camera);
scene.add(player);
// When the mesh is instantiated
mesh.velocity = new THREE.Vector3(0, 0, 0);
mesh.acceleration = new THREE.Vector3(0, 0, 0);
// Called in the animation loop
function update(delta) {
    // Apply acceleration
    mesh.velocity.add(mesh.acceleration().clone().multiplyScalar(delta));
    // Apply velocity
    mesh.position.add(mesh.velocity.clone().multiplyScalar(delta));
}
var halfAccel = mesh.acceleration.clone().multiplyScalar(delta *
    0.5);
// Apply half acceleration (first half of midpoint formula)
mesh.velocity.add(halfAccel);
// Apply thrust
mesh.position.add(mesh.velocity.clone().multiplyScalar(delta));
// Apply half acceleration (second half of midpoint formula)
mesh.velocity.add(halfAccel);
var widthHalf = 0.5 * renderer.domElement.width / renderer.
devicePixelRatio,
heightHalf = 0.5 * renderer.domElement.height / renderer.
devicePixelRatio;

var projector = new THREE.Projector();
var vector = mesh.position.clone(); // or an arbitrary point
projector.projectVector(vector, camera);
vector.x = vector.x * widthHalf + widthHalf;
vector.y = -vector.y * heightHalf + heightHalf;

renderer.domElement.addEventListener('mousedown', function (event) {
    var vector = new THREE.Vector3(
        renderer.devicePixelRatio * (event.pageX - this.offsetLeft) /
        this.width * 2 - 1,
        -renderer.devicePixelRatio * (event.pageY - this.offsetTop) /
        this.height * 2 + 1,
        0
    );
    projector.unprojectVector(vector, camera);
    var raycaster = new THREE.Raycaster(
        camera.position,
        vector.sub(camera.position).normalize()
    );
    var intersects = raycaster.intersectObjects(OBJECTS);
    if (intersects.length) {
        // intersects[0] describes the clicked object
    }
}, false);




_LoadAnimatedModel() {
    const loader = new FBXLoader();
    loader.setPath('./resources/zombie/');
    loader.load('mremireh_o_desbiens.fbx', (fbx) => {
        fbx.scale.setScalar(0.1);
        fbx.traverse(c => {
            c.castShadow = true;
        });

        const params = {
            target: fbx,
            camera: this._camera,
        }
        this._controls = new BasicCharacterControls(params);

        const anim = new FBXLoader();
        anim.setPath('./resources/zombie/');
        anim.load('walk.fbx', (anim) => {
            const m = new THREE.AnimationMixer(fbx);
            this._mixers.push(m);
            const idle = m.clipAction(anim.animations[0]);
            idle.play();
        });
        this._scene.add(fbx);
    });
}

_LoadAnimatedModelAndPlay(path, modelFile, animFile, offset) {
    const loader = new FBXLoader();
    loader.setPath(path);
    loader.load(modelFile, (fbx) => {
        fbx.scale.setScalar(0.1);
        fbx.traverse(c => {
            c.castShadow = true;
        });
        fbx.position.copy(offset);

        const anim = new FBXLoader();
        anim.setPath(path);
        anim.load(animFile, (anim) => {
            const m = new THREE.AnimationMixer(fbx);
            this._mixers.push(m);
            const idle = m.clipAction(anim.animations[0]);
            idle.play();
        });
        this._scene.add(fbx);
    });
}

_LoadModel() {
    const loader = new GLTFLoader();
    loader.load('./resources/thing.glb', (gltf) => {
        gltf.scene.traverse(c => {
            c.castShadow = true;
        });
        this._scene.add(gltf.scene);
    });
}