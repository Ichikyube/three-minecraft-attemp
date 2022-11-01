import * as THREE from 'three'
import {
    OrbitControls
} from 'assets/jsm/controls/OrbitControls'
import Stats from 'assets/jsm/libs/stats.module'
import {
    OBB
} from 'assets/jsm/math/OBB'

const scene = new THREE.Scene()
scene.add(new THREE.AxesHelper(5))

const light = new THREE.AmbientLight()
scene.add(light)

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)
camera.position.set(0.8, 1.4, 3.0)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

const geometry = new THREE.BoxGeometry(1, 2, 3)
geometry.computeBoundingBox()
const material = new THREE.MeshPhongMaterial()
const mesh = new THREE.Mesh(geometry, material)
mesh.position.set(4, 1, 0)
mesh.geometry.userData.obb = new OBB().fromBox3(
    mesh.geometry.boundingBox = THREE.Box3
)
mesh.userData.obb = new OBB()
scene.add(mesh)

const mesh2 = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        wireframe: true
    })
)
mesh2.position.set(-3, 1, 0)
mesh2.geometry.userData.obb = new OBB().fromBox3(
    mesh2.geometry.boundingBox = THREE.Box3
)
mesh2.userData.obb = new OBB()

scene.add(mesh2)

const floor = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(20, 20, 10, 10),
    new THREE.MeshBasicMaterial({
        color: 0xaec6cf,
        wireframe: true
    })
)
floor.rotateX(-Math.PI / 2)
scene.add(floor)

function animate() {
    requestAnimationFrame(animate)

    mesh.position.x = Math.sin(clock.getElapsedTime() * 0.5) * 4

    controls.update()

    mesh.userData.obb.copy(mesh.geometry.userData.obb)
    mesh2.userData.obb.copy(mesh2.geometry.userData.obb)
    mesh.userData.obb.applyMatrix4(mesh.matrixWorld)
    mesh2.userData.obb.applyMatrix4(mesh2.matrixWorld)
    if (mesh.userData.obb.intersectsOBB(mesh2.userData.obb)) {
        mesh.material.color.set(0xff0000)
    } else {
        mesh.material.color.set(0x00ff00)
    }

    mesh.rotateY(0.01)
    mesh2.rotateY(-0.005)

    render()

    stats.update()
}

function CustomObject() {

    this.type = 'CustomObject';

    this.geometry = new THREE.BoxGeometry(540, 540, 14);
    this.material = new THREE.MeshLambertMaterial({
        color: 0xff0000
    });

    THREE.Mesh.call(this, this.geometry, this.material);

}

CustomObject.prototype = Object.create(THREE.Mesh.prototype);
CustomObject.prototype.constructor = CustomObject;

CustomObject.prototype.getMesh = function () {

    return this.mesh;

}

var foo = new CustomObject();
scene.add(foo);



/**
 * Calculates collision detection parameters.
 */
function calculateCollisionPoints(mesh, scale, type = 'collision') {
    // Compute the bounding box after scale, translation, etc.
    var bBox = new THREE.Box3().setFromObject(mesh);

    var bounds = bBox.containsPoint(camera.position);

    collisions.push(bounds);
}
calculateCollisionPoints(trunk);

// Detect collisions.
if (collisions.length > 0) {
    detectCollisions();
}

/**
 * Collision detection for every solid object.
 */
function detectCollisions() {
    // Get the user's current collision area.
    var bounds = {
        xMin: rotationPoint.position.x - box.geometry.parameters.width / 2,
        xMax: rotationPoint.position.x + box.geometry.parameters.width / 2,
        yMin: rotationPoint.position.y - box.geometry.parameters.height / 2,
        yMax: rotationPoint.position.y + box.geometry.parameters.height / 2,
        zMin: rotationPoint.position.z - box.geometry.parameters.width / 2,
        zMax: rotationPoint.position.z + box.geometry.parameters.width / 2,
    };

    // Run through each object and detect if there is a collision.
    for (var index = 0; index < collisions.length; index++) {

        if (collisions[index].type == 'collision') {
            if ((bounds.xMin <= collisions[index].xMax && bounds.xMax >= collisions[index].xMin) &&
                (bounds.yMin <= collisions[index].yMax && bounds.yMax >= collisions[index].yMin) &&
                (bounds.zMin <= collisions[index].zMax && bounds.zMax >= collisions[index].zMin)) {
                // We hit a solid object! Stop all movements.
                stopMovement();

                // Move the object in the clear. Detect the best direction to move.
                if (bounds.xMin <= collisions[index].xMax && bounds.xMax >= collisions[index].xMin) {
                    // Determine center then push out accordingly.
                    var objectCenterX = ((collisions[index].xMax - collisions[index].xMin) / 2) + collisions[index].xMin;
                    var playerCenterX = ((bounds.xMax - bounds.xMin) / 2) + bounds.xMin;
                    var objectCenterZ = ((collisions[index].zMax - collisions[index].zMin) / 2) + collisions[index].zMin;
                    var playerCenterZ = ((bounds.zMax - bounds.zMin) / 2) + bounds.zMin;

                    // Determine the X axis push.
                    if (objectCenterX > playerCenterX) {
                        rotationPoint.position.x -= 1;
                    } else {
                        rotationPoint.position.x += 1;
                    }
                }
                if (bounds.zMin <= collisions[index].zMax && bounds.zMax >= collisions[index].zMin) {
                    // Determine the Z axis push.
                    if (objectCenterZ > playerCenterZ) {
                        rotationPoint.position.z -= 1;
                    } else {
                        rotationPoint.position.z += 1;
                    }
                }
            }
        }
    }
}




var files = ['mesh1_tex.jpg', 'mesh2_tex.jpg'];

var objLoader = new THREE.OBJLoader(manager);

var textureLoader = new THREE.TextureLoader(manager);

objLoader.load(obj_path, function (model) {
    model.traverse(function (child) {

        if (child instanceof THREE.Mesh) {

            // here you have to find a way how to choose the correct texture for the mesh
            // the following is just an example, how it could be done, but it depends on your data
            const file = files.find(f => f === child.name + '_tex.jpg');
            if (!file) {
                console.warn(`Couldn't find texture file.`);
                return;
            }

            textureLoader.load(file, (texture) => {

                child.material.map = texture;
                child.material.needsupdate = true;

                render(); // only if there is no render loop

            });

        }

    });

});




self.controls.update(deltaTime);
this.controls.lookSpeed = 0.2;
this.controls.movementSpeed = 10;
this.controls.noFly = true;
this.controls.lookVertical = true;
this.controls.constrainVertical = true;
this.controls.verticalMin = 0.0;
this.controls.verticalMax = 2.0;
this.controls.lon = -150;
this.controls.lat = 120;

var vector = new THREE.Vector3(0, -1, 0.5);
// collision detection:
//   determines if any of the rays from the cube's origin to each vertex
//		intersects any face of a mesh in the array of target meshes
//   for increased collision accuracy, add more vertices to the cube;
//		for example, new THREE.CubeGeometry( 64, 64, 64, 8, 8, 8, wireMaterial )
//   HOWEVER: when the origin of the ray is within the target mesh, collisions do not occur
var originPoint = cameraBox.position.clone();
for (var vertexIndex = 0; vertexIndex < cameraBox.geometry.attributes.position.array; vertexIndex++) {
    var localVertex = cameraBox.geometry.vertices[vertexIndex].clone();
    var globalVertex = localVertex.applyMatrix4(cameraBox.matrix);
    var directionVector = globalVertex.sub(cameraBox.position);

    var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
    var collisionResults = ray.intersectObjects(collidableMeshList);
    if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length())
        appendText(" Hit ");
}

var textureLoader = new THREE.TextureLoader();

// Fill an array with textures.
var paints = new Array(6).fill(0).map((_, index) => {
    return textureLoader.load('assets/textures/Paintings/' + pad(index, 3) + '.jpg', () => {
        console.log(imgTexture.image.width);
    })
});
// Helper function to pad numbers with leading zeroes. (3 --> '003')
function pad(num, size) {
    return ('000000000' + num).substr(-size);
}

function mapAspect(tex, aspect) {
    var imageAspect = tex.image.width / tex.image.height;
    if (aspect < imageAspect) {
        tex.matrix.setUvTransform(0, 0, aspect / imageAspect, 1, 0, 0.5, 0.5);
    } else {
        tex.matrix.setUvTransform(0, 0, 1, imageAspect / aspect, 0, 0.5, 0.5);
    }
}
let planeGeometry = new THREE.PlaneGeometry(100, 40, 1, 1);
let floorTexture = new THREE.TextureLoader().load("assets/textures/floors/FloorsCheckerboard_S_Diffuse.jpg",
    () => {
        mapAspect(floorTexture, 100 / 40)
    });
let floorNormal = new THREE.TextureLoader().load("assets/textures/floors/FloorsCheckerboard_S_Normal.jpg",
    () => {
        mapAspect(floorNormal, 100 / 40)
    });

let cube, planeMaterial;
const buildings = [];
let geometry = new THREE.SphereBufferGeometry(10, 10, 10);
cube = new THREE.Mesh(
    geometry,
    material
);
cube.castShadow = true; //default is false
cube.receiveShadow = true; //default
//worldOctree.fromGraphNode(cube);
//scene.add(cube);    

function rotatingCube(time) {
    xRot += 0.02 * time;
    cube.rotation.x = xRot;
    cube.rotation.y = xRot;
    cube.rotation.z = xRot;
    cube.position.x = 500 * Math.cos(degrees_to_radians(xRot * 100));
    cube.position.y = 500 * Math.sin(degrees_to_radians(xRot * 100));
}
//const waterPosition = watergeo.attributes.position;
//waterPosition.usage = THREE.DynamicDrawUsage;

var geometry = new THREE.PlaneGeometry(4, 2)
geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 1, 0));
//const gposition = geometry.attributes.position;
//for (let i = 0; i < position.count; i++) {
geometry.normalizeNormals();
geometry.computeBoundingSphere();
var mergedGeo = new THREE.Object3D();
var nTufts = 600
var positions = new Array(nTufts)
for (var i = 0; i < nTufts; i++) {
    var position = new THREE.Vector3()
    position.x = (Math.random() - 0.5) * 20
    position.z = (Math.random() - 0.5) * 20
    positions[i] = position
}
for (var i = 0; i < positions.length; i++) {
    var position = positions[i]
    var baseAngle = Math.PI * 2 * Math.random()

    var nPlanes = 2
    for (var j = 0; j < nPlanes; j++) {
        var angle = baseAngle + j * Math.PI / nPlanes;

        // First plane
        var object3d = new THREE.Mesh(geometry, bushMat);
        scene.add(object3d);
        object3d.rotateY(angle);
        object3d.position.copy(position);
        mergedGeo.add(object3d);
    }
}
scene.add(mergedGeo);
mergedGeo.translateY(-5);