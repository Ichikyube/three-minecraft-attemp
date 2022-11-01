import * as THREE from 'three';
import * as BufferGeometryUtils from 'addons/utils/BufferGeometryUtils.js';
import {
    MeshSurfaceSampler
} from "addons/math/MeshSurfaceSampler.js";

let treesGen = Math.random();
let worldGen = Math.random();
let biomeGen = Math.random();
const grounds = [];
const worldWidth = 128,
worldDepth = 128;
const worldHalfWidth = worldWidth / 2;
const worldHalfDepth = worldDepth / 2;
const data = generateHeight(worldWidth, worldDepth);
function getY(x, z) {

    return (data[x + z * worldWidth] * 0.15) | 0;

}

function generateHeight(width, height) {

    const data = [],
        perlin = new ImprovedNoise(),
        size = width * height,
        z = Math.random() * 100;

    let quality = 2;

    for (let j = 0; j < 4; j++) {

        if (j === 0)
            for (let i = 0; i < size; i++) data[i] = 0;

        for (let i = 0; i < size; i++) {

            const x = i % width,
                y = (i / width) | 0;
            data[i] += perlin.noise(x / quality, y / quality, z) * quality;


        }

        quality *= 4;

    }

    return data;

}
let psize = 10;
let pdist = psize/2;
export function buildingWorldofBlocks() {
    const matrix = new THREE.Matrix4();
    const pxGeometry = new THREE.PlaneGeometry(psize, psize);
    pxGeometry.attributes.uv.array[1] = 0.5;
    pxGeometry.attributes.uv.array[3] = 0.5;
    pxGeometry.rotateY(Math.PI / 2);
    pxGeometry.translate(pdist, 0, 0);
    ///////////////////////////////

    const nxGeometry = new THREE.PlaneGeometry(psize, psize);
    nxGeometry.attributes.uv.array[1] = 0.5;
    nxGeometry.attributes.uv.array[3] = 0.5;
    nxGeometry.rotateY(-Math.PI / 2);
    nxGeometry.translate(-pdist, 0, 0);
    ///////////////////////////////

    const pyGeometry = new THREE.PlaneGeometry(psize, psize);
    pyGeometry.attributes.uv.array[5] = 0.5;
    pyGeometry.attributes.uv.array[7] = 0.5;
    pyGeometry.rotateX(-Math.PI / 2);
    pyGeometry.translate(0, pdist, 0);
    ///////////////////////////////

    const pzGeometry = new THREE.PlaneGeometry(psize, psize);
    pzGeometry.attributes.uv.array[1] = 0.5;
    pzGeometry.attributes.uv.array[3] = 0.5;
    pzGeometry.translate(0, 0, pdist);
    ///////////////////////////////

    const nzGeometry = new THREE.PlaneGeometry(psize, psize);
    nzGeometry.attributes.uv.array[1] = 0.5;
    nzGeometry.attributes.uv.array[3] = 0.5;
    nzGeometry.rotateY(Math.PI);
    nzGeometry.translate(0, 0, -pdist);
    ///////////////////////////////
    
    const geometries = [];

    for (let z = 0; z < worldDepth; z++) {

        for (let x = 0; x < worldWidth; x++) {

            const h = getY(x, z);

            matrix.makeTranslation(
                x * psize - worldHalfWidth * psize,
                h * psize,
                z * psize - worldHalfDepth * psize
            );

            const px = getY(x + 1, z);
            const nx = getY(x - 1, z);
            const pz = getY(x, z + 1);
            const nz = getY(x, z - 1);
            let gy = pyGeometry.clone().applyMatrix4(matrix)
            geometries.push(gy);
            grounds.push(gy);
            if ((px !== h && px !== h + 1) || x === 0) {

                geometries.push(pxGeometry.clone().applyMatrix4(matrix));
            }

            if ((nx !== h && nx !== h + 1) || x === worldWidth - 1) {

                geometries.push(nxGeometry.clone().applyMatrix4(matrix));
            }

            if ((pz !== h && pz !== h + 1) || z === worldDepth - 1) {

                geometries.push(pzGeometry.clone().applyMatrix4(matrix));
            }

            if ((nz !== h && nz !== h + 1) || z === 0) {

                geometries.push(nzGeometry.clone().applyMatrix4(matrix));
            }

        }

    }
    
    const geometry = BufferGeometryUtils.mergeBufferGeometries(geometries);
    const base = BufferGeometryUtils.mergeBufferGeometries(grounds);
    geometry.computeBoundingSphere();

    const texture = new THREE.TextureLoader().load('../assets/textures/minecraft/atlas.png');
    texture.magFilter = THREE.NearestFilter;

    const mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({
        map: texture,
        side: THREE.DoubleSide
    }));
    
    let Base = new THREE.Mesh(
        base,
        new THREE.MeshBasicMaterial
    )
    return {mesh, Base}
}
export function addingGrass(scene, Base, camera) {
    let grassGeometry, grassMaterial;
    let grassHeight = 9,
        grassWidth = 6,
        grassCount = 15000;
    grassGeometry = new THREE.PlaneGeometry(grassWidth, grassHeight, 1, 1);
    let textureLoader = new THREE.TextureLoader();
    let grassMap = textureLoader.load("../assets/textures/grass/grass01.png");
    grassMaterial = new THREE.MeshBasicMaterial({
        map: grassMap,
        color: 'darkgreen',//emissive: 'darkgreen',emissiveIntensity: 0.06,
        transparent: true,
        alphaTest: 0.5,
        fog: true,
        side: THREE.DoubleSide
    });
    const sampler = new MeshSurfaceSampler(Base).build();
    
    const _normal = new THREE.Vector3();
    const tempPosition = new THREE.Vector3(0,6,0);
    const tempObject = new THREE.Object3D();
    let grassMasses = new THREE.InstancedMesh(grassGeometry, grassMaterial, grassCount)
    scene.add(grassMasses)
    for (let i = 0, l = grassCount; i < l; i = i + 3) {
        sampler.sample(tempPosition, _normal);
        let s = Math.random() * 0.5 + 0.5;
        let ns = grassHeight*s;
        tempObject.scale.setScalar(s);
        tempObject.position.x = tempPosition.x;
        tempObject.position.z = tempPosition.z;
        tempObject.position.y = tempPosition.y+ns-ns/2;
        tempObject.rotation.y = Math.random() * Math.PI;
        tempObject.updateMatrix();
        grassMasses.setMatrixAt(i, tempObject.matrix);
        tempObject.rotation.y = tempObject.rotation.y + Math.PI / 3;
        tempObject.updateMatrix();
        grassMasses.setMatrixAt(i + 1, tempObject.matrix);
        tempObject.rotation.y = tempObject.rotation.y + Math.PI * 2 / 3;
        tempObject.updateMatrix();
        grassMasses.setMatrixAt(i + 2, tempObject.matrix);
    }
    //grassMasses.position.y = grassHeight/2;
    grassMasses.setRotationFromMatrix (camera.matrix);
    grassMasses.castShadow = true;
    grassMasses.receiveShadow = true;
    grassMasses.instanceMatrix.needsUpdate = true;
}
