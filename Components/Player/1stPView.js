import * as THREE from 'three';
import {
    Capsule
} from 'addons/math/Capsule.js';
import {
    PointerLockControls
} from 'addons/controls/PointerLockControls.js';
import {
    onKeyDown,
    onKeyUp,
    mvControl
} from '../Controls/Controls.js';
import { handlingGun } from '../Items/Weapon.js';

const GRAVITY = 30;
let walk_speed = 8.0; //let run_speed = 16.0;
let jumpForce = 45.0;
let height = 8;


let airMultiplier;
//let acceleration = new THREE.Vector3(0, -150, 0);//gravity
//let ambientFriction = new THREE.Vector3(-10, 0, -10);

/* -= this.mouseX * actualLookSpeed;
if (this.lookVertical) lat -= this.mouseY * actualLookSpeed * verticalLookRatio;

var lat = Math.max(-85, Math.min(85, lat));

let phi = MathUtils.degToRad(90 - lat);
const theta = MathUtils.degToRad(lon);

if (this.constrainVertical) {

    phi = MathUtils.mapLinear(phi, 0, Math.PI, this.verticalMin, this.verticalMax);

}

const position = this.object.position;

targetPosition.setFromSphericalCoords(1, phi, theta).add(position);

this.object.lookAt(targetPosition);*/
if(useGun){
    handlingGun();
}
const playerCollider = new Capsule(new THREE.Vector3(0, 0.35, 0), new THREE.Vector3(0, height, 0), 1.35);
class Player {
    constructor(scene, camera, domElement, height) {
        this.scene = scene;
        this.camera = camera;
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.cameraTarget = new THREE.Vector3();
        this.controls = new PointerLockControls(this.camera, domElement);
        let raycaster = new THREE.Raycaster(this.camera.getWorldPosition(new THREE.Vector3()), 
                                            this.camera.getWorldDirection(new THREE.Vector3()));
        this.scene.add(this.controls.getObject());
        this.initControls();
        this.body = playerCollider;
        this.body.translate(this.camera.position);
        this.height = height;
        this.onGround = false;
        this.headBobActive_ = false,
        this.headBobTimer_ = 0;
        this.useGun = false;
    }
    checkCollision(worldOctree) {
        const result = worldOctree.capsuleIntersect(this.body);
        this.onGround = false;
        if (result) {
            this.onGround = result.normal.y > 0;
            if (!this.onGround) {
                this.velocity.addScaledVector(result.normal, -result.normal.dot(this.velocity));
            }
            this.body.translate(result.normal.multiplyScalar(result.depth));
        }
    }

    updateMovement(deltaTime) {
        let damping = Math.exp(-4 * deltaTime) - 1;
        if (!this.onGround) {
            this.velocity.y -= GRAVITY * 10.0 * deltaTime;
            // small air resistance
            damping *= 0.0001;
        } else this.velocity.y -= GRAVITY * deltaTime / 100.0;
        //
        this.velocity.addScaledVector(this.velocity, damping);
        const deltaPosition = this.velocity.clone().multiplyScalar(deltaTime);
        this.body.translate(deltaPosition);
        this.controls.getObject().position.copy(this.body.end);
        if ((Math.abs(this.velocity.x) > 10 || Math.abs(this.velocity.z) > 10) && this.onGround) {
            this.headBobActive_ = true;
        }
    }

    getForwardVector() {
        this.camera.getWorldDirection(this.direction);
        this.direction.y = 0;
        this.direction.normalize();
        return this.direction;
    }

    getSideVector() {
        this.camera.getWorldDirection(this.direction);
        this.direction.y = 0;
        this.direction.normalize();
        this.direction.cross(this.camera.up);
        return this.direction;
    }

    updateHeadBob_(timeElapsedS) {
        if (this.headBobActive_) {
            const wavelength = Math.PI;
            const nextStep = 1 + Math.floor(((this.headBobTimer_ + 0.000001) * 10) / wavelength);
            const nextStepTime = nextStep * wavelength / 10;
            this.headBobTimer_ = Math.min(this.headBobTimer_ + timeElapsedS * 0.001, nextStepTime);

            if (this.headBobTimer_ == nextStepTime) {
                this.headBobActive_ = false;
                this.headBobTimer_ = 0;
            }
        }
    }

    controller(deltaTime) {
        // gives a bit of air control
        const speedDelta = deltaTime * 25;
        let jumpCooldown = 3;
        let readyToJump = true;
        if (this.controls.isLocked === true) {
            if (this.onGround) {
                if (mvControl.pressForward) {
                    this.velocity.add(this.getForwardVector().multiplyScalar(speedDelta * walk_speed));
                }
                if (mvControl.pressBackward) {
                    this.velocity.add(this.getForwardVector().multiplyScalar(-speedDelta * walk_speed));
                }
                if (mvControl.pressLeft) {
                    this.velocity.add(this.getSideVector().multiplyScalar(-speedDelta * walk_speed));
                }
                if (mvControl.pressRight) {
                    this.velocity.add(this.getSideVector().multiplyScalar(speedDelta * walk_speed));
                }
                if (mvControl.pressJump && readyToJump) {
                    readyToJump = false;
                    this.velocity.y += jumpForce;
                    this.onGround = false;
                    setTimeout(() => {
                        requestAnimationFrame(tick);
                    }, 1000 / jumpCooldown);
                }
                this.velocity.y += Math.abs(Math.sin(this.headBobTimer_ * 10 * deltaTime) * 25 * Math.max(this.velocity.x, this.velocity.z));
                this.camera.lookAt(this.direction.x, this.body.start.y + height, this.direction.z);
            }

        }

    }

    initControls() {
        let self = this;
        this.controls.maxPolarAngle = 2.0;
        this.controls.minPolarAngle = 0.8;
        this.controls.pointerSpeed = 0.3;
        
        //const blocker = document.getElementById('blocker');
        //const instructions = document.getElementById('instructions');
        window.addEventListener('click', function () {
            self.controls.lock();
            let intersects = this.raycaster.intersectObjects(self.scene.children);

            if (intersects.length > 0) {
                let intersect = intersects[0];
                //makeParticles(intersect.point);
            }
        });

        this.controls.addEventListener('lock', function () {
            //document.getElementById("escapeScreenGUI").style.display = "none";
            //instructions.style.display = 'none';
            //blocker.style.display = 'none';

        });
        this.controls.addEventListener('unlock', function () {
            //document.getElementById("escapeScreenGUI").style.display = "block";//keys = [];
            //blocker.style.display = 'block';
            //instructions.style.display = '';

        });
        window.addEventListener('keydown', function (event) {
            onKeyDown(event)
        });
        window.addEventListener('keyup', function (event) {
            onKeyUp(event)
        });

    }
}
export {
    Player
};


//sound
let cheering = new THREE.AudioObject('cheering.ogg', 0, 1, false);
scene.add(cheering);
THREE.AudioObject.call(cheering, 'cheering.ogg', 1, 1, false);


if (controls.isLocked) {
    if (keys.includes(controlOptions.forward)) {
        player.forward(movingSpeed * (sprint ? sprintSpeedInc : 1));
        forback = 1 * movingSpeed;
        for (let i = 0; i < chunks.length; i++) {
            for (let j = 0; j < chunks[i].length; j++) {
                let b = chunks[i][j];
                let c = intersect(b.x, b.y, b.z, 5, 5, 5, player.x, player.y, player.z, player.w, player
                    .h, player.d);
                if (c && (b.y - 2.5 < player.y + (player.h / 2) && b.y + 2.5 > player.y - (player.h /
                        2)) && b.blockType != "water") {
                    player.backward((movingSpeed * (sprint ? sprintSpeedInc : 1)));
                    forback = 0;
                    rightleft = 0;
                    sprint = false;
                }
            }
        }
    }
    if (keys.includes(controlOptions.backward)) {
        player.backward(movingSpeed * (sprint ? sprintSpeedInc : 1));
        forback = -1 * movingSpeed;
        for (let i = 0; i < chunks.length; i++) {
            for (let j = 0; j < chunks[i].length; j++) {
                let b = chunks[i][j];
                let c = intersect(b.x, b.y, b.z, 5, 5, 5, player.x, player.y, player.z, player.w, player
                    .h, player.d);
                if (c && (b.y - 2.5 < player.y + (player.h / 2) && b.y + 2.5 > player.y - (player.h /
                        2)) && b.blockType != "water") {
                    player.forward(movingSpeed * (sprint ? sprintSpeedInc : 1));
                    forback = 0;
                    rightleft = 0;
                    sprint = false;
                }
            }
        }
    }
    if (keys.includes(controlOptions.right)) {
        player.right(movingSpeed * (sprint ? sprintSpeedInc : 1));
        rightleft = 1 * movingSpeed;
        for (let i = 0; i < chunks.length; i++) {
            for (let j = 0; j < chunks[i].length; j++) {
                let b = chunks[i][j];
                let c = intersect(b.x, b.y, b.z, 5, 5, 5, player.x, player.y, player.z, player.w, player
                    .h, player.d);
                if (c && (b.y - 2.5 < player.y + (player.h / 2) && b.y + 2.5 > player.y - (player.h /
                        2)) && b.blockType != "water") {
                    player.left(movingSpeed * (sprint ? sprintSpeedInc : 1));
                    forback = 0;
                    rightleft = 0;
                    sprint = false;
                }
            }
        }
    }
    if (keys.includes(controlOptions.left)) {
        player.left(movingSpeed * (sprint ? sprintSpeedInc : 1));
        rightleft = -1 * movingSpeed;
        for (let i = 0; i < chunks.length; i++) {
            for (let j = 0; j < chunks[i].length; j++) {
                let b = chunks[i][j];
                let c = intersect(b.x, b.y, b.z, 5, 5, 5, player.x, player.y, player.z, player.w, player
                    .h, player.d);
                if (c && (b.y - 2.5 < player.y + (player.h / 2) && b.y + 2.5 > player.y - (player.h /
                        2)) && b.blockType != "water") {
                    player.right(movingSpeed * (sprint ? sprintSpeedInc : 1));
                    forback = 0;
                    rightleft = 0;
                    sprint = false;
                }
            }
        }
    }
}

// Decceleration part
if (!keys.includes(controlOptions.forward) && !keys.includes(controlOptions.backward) && !keys.includes(
        controlOptions.right) && !keys.includes(controlOptions.left)) {
    forback /= deceleration;
    rightleft /= deceleration;
    for (let i = 0; i < chunks.length; i++) {
        for (let j = 0; j < chunks[i].length; j++) {
            let b = chunks[i][j];
            let c = intersect(b.x, b.y, b.z, 5, 5, 5, player.x, player.y, player.z, player.w, player.h,
                player.d);
            if (c && (b.y - 2.5 < player.y + (player.h / 2) && b.y + 2.5 > player.y - (player.h / 2))) {
                let br = true;
                forback /= -deceleration;
                rightleft /= -deceleration;
                sprint = false;
                break;
            }
        }
        if (br) {
            break;
        }
    }
    player.forward(forback * (sprint ? sprintSpeedInc : 1));
    player.right(rightleft * (sprint ? sprintSpeedInc : 1));
}

camera.position.y = camera.position.y - ySpeed;
ySpeed = ySpeed + acc;

let particles = new Array();
if (particles.length > 0) {
    let pLength = particles.length;
    while (pLength--) {
        particles[pLength].prototype.update(pLength);
    }
}
function makeParticles(intersectPosition) {

    let totalParticles = 80;

    let pointsGeometry = new THREE.Geometry();
    pointsGeometry.oldvertices = [];
    let colors = [];
    for (let i = 0; i < totalParticles; i++) {
        let position = randomPosition(Math.random());
        let vertex = new THREE.Vector3(position[0], position[1], position[2]);
        pointsGeometry.oldvertices.push([0, 0, 0]);
        pointsGeometry.vertices.push(vertex);

        let color = new THREE.Color(Math.random() * 0xffffff);
        colors.push(color);
    }
    pointsGeometry.colors = colors;

    let pointsMaterial = new THREE.PointsMaterial({
        size: .8,
        sizeAttenuation: true,
        depthWrite: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        vertexColors: THREE.VertexColors
    });

    let points = new THREE.Points(pointsGeometry, pointsMaterial);

    points.prototype = Object.create(THREE.Points.prototype);
    points.position.x = intersectPosition.x;
    points.position.y = intersectPosition.y;
    points.position.z = intersectPosition.z;
    points.updateMatrix();
    points.matrixAutoUpdate = false;

    points.prototype.constructor = points;
    points.prototype.update = function (index) {
        let pCount = this.constructor.geometry.vertices.length;
        let positionYSum = 0;
        while (pCount--) {
            let position = this.constructor.geometry.vertices[pCount];
            let oldPosition = this.constructor.geometry.oldvertices[pCount];

            let velocity = {
                x: (position.x - oldPosition[0]),
                y: (position.y - oldPosition[1]),
                z: (position.z - oldPosition[2])
            }

            let oldPositionX = position.x;
            let oldPositionY = position.y;
            let oldPositionZ = position.z;

            position.y -= .03; // gravity

            position.x += velocity.x;
            position.y += velocity.y;
            position.z += velocity.z;

            let wordlPosition = this.constructor.position.y + position.y;

            if (wordlPosition <= 0) {
                //particle touched the ground
                oldPositionY = position.y;
                position.y = oldPositionY - (velocity.y * .3);

                positionYSum += 1;
            }

            this.constructor.geometry.oldvertices[pCount] = [oldPositionX, oldPositionY, oldPositionZ];
        }

        pointsGeometry.verticesNeedUpdate = true;

        if (positionYSum >= totalParticles) {
            particles.splice(index, 1);
            scene.remove(this.constructor);
            console.log('particle removed');
        }

    };

    particles.push(points);
    scene.add(points);
}

function randomPosition(radius) {
    radius = radius * Math.random();
    let theta = Math.random() * 2.0 * Math.PI;
    let phi = Math.random() * Math.PI;

    let sinTheta = Math.sin(theta);
    let cosTheta = Math.cos(theta);
    let sinPhi = Math.sin(phi);
    let cosPhi = Math.cos(phi);
    let x = radius * sinPhi * cosTheta;
    let y = radius * sinPhi * sinTheta;
    let z = radius * cosPhi;

    return [x, y, z];
}