import * as THREE from 'three';
import * as BufferGeometryUtils from 'addons/utils/BufferGeometryUtils.js';
import {
    MeshSurfaceSampler
} from "addons/math/MeshSurfaceSampler.js";
const _VOXEL_HEIGHT = 128;
const _OCEAN_LEVEL = Math.floor(_VOXEL_HEIGHT * 0.05);
const _BEACH_LEVEL = _OCEAN_LEVEL + 4;
const _SNOW_LEVEL = Math.floor(_VOXEL_HEIGHT * 0.7);
const _MOUNTAIN_LEVEL = Math.floor(_VOXEL_HEIGHT * 0.3);

const _OCEAN_C = new THREE.Color(0x8080FF);
const _BEACH_C = new THREE.Color(0xFFFF80);
const _SNOW_C = new THREE.Color(0xFFFFFF);
const _STONE_C = new THREE.Color(0x404040);
const _GRASS_C = new THREE.Color(0x40FF40);

function Biome(e, m) {
    if (e < _OCEAN_LEVEL) return 'sand';
    if (e < _BEACH_LEVEL) return 'sand';

    if (e > _SNOW_LEVEL) {
      return 'snow';
    }

    if (e > _MOUNTAIN_LEVEL) {
      // if (m < 0.2) {
      //   return 'stone';
      // } else if (m < 0.25) {
      //   return 'grass';
      // }
    }
    return 'grass';
  }

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

function generateTexture(data, width, height) {

    // bake lighting into texture

    let context, image, imageData, shade;

    const vector3 = new THREE.Vector3(0, 0, 0);

    const sun = new THREE.Vector3(1, 1, 1);
    sun.normalize();

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    context = canvas.getContext('2d');
    context.fillStyle = '#000';
    context.fillRect(0, 0, width, height);

    image = context.getImageData(0, 0, canvas.width, canvas.height);
    imageData = image.data;

    for (let i = 0, j = 0, l = imageData.length; i < l; i += 4, j++) {

        vector3.x = data[j - 2] - data[j + 2];
        vector3.y = 2;
        vector3.z = data[j - width * 2] - data[j + width * 2];
        vector3.normalize();

        shade = vector3.dot(sun);

        imageData[i] = (96 + shade * 128) * (0.5 + data[j] * 0.007);
        imageData[i + 1] = (32 + shade * 96) * (0.5 + data[j] * 0.007);
        imageData[i + 2] = (shade * 96) * (0.5 + data[j] * 0.007);

    }

    context.putImageData(image, 0, 0);

    // Scaled 4x

    const canvasScaled = document.createElement('canvas');
    canvasScaled.width = width * 4;
    canvasScaled.height = height * 4;

    context = canvasScaled.getContext('2d');
    context.scale(4, 4);
    context.drawImage(canvas, 0, 0);

    image = context.getImageData(0, 0, canvasScaled.width, canvasScaled.height);
    imageData = image.data;

    for (let i = 0, l = imageData.length; i < l; i += 4) {

        const v = ~~(Math.random() * 5);

        imageData[i] += v;
        imageData[i + 1] += v;
        imageData[i + 2] += v;

    }

    context.putImageData(image, 0, 0);

    return canvasScaled;

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
let pdist = psize / 2;

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
    return {
        mesh,
        Base
    }
}


function RebuildFromCellBlock(cells) {
    const cellsOfType = {};

    for (let k in cells) {
        const c = cells[k];
        if (!(c.type in cellsOfType)) {
            cellsOfType[c.type] = [];
        }
        if (c.visible) {
            cellsOfType[c.type].push(c);
        }
    }

    for (let k in cellsOfType) {
        this._RebuildFromCellType(cellsOfType[k], k);
    }

    for (let k in this._geometryBuffers) {
        if (!(k in cellsOfType)) {
            this._RebuildFromCellType([], k);
        }
    }
}

function _GetBaseGeometryForCellType(cellType) {
    if (cellType == 'water') {
        return this._geometries.plane;
    }
    return this._geometries.cube;
}

function _RebuildFromCellType(cells, cellType) {
    const textureInfo = this._game._atlas.Info[cellType];

    if (!(cellType in this._geometryBuffers)) {
        this._geometryBuffers[cellType] = new THREE.InstancedBufferGeometry();

        this._materials[cellType] = new THREE.RawShaderMaterial({
            uniforms: {
                diffuseTexture: {
                    value: textureInfo.texture
                },
                skybox: {
                    value: this._game._graphics._scene.background
                },
                fogDensity: {
                    value: 0.005
                },
                cloudScale: {
                    value: [1, 1, 1]
                }
            },
            vertexShader: voxels_shader.VS,
            fragmentShader: voxels_shader.PS,
            side: THREE.FrontSide
        });

        // HACKY: Need to have some sort of material manager and pass
        // these params.
        if (cellType == 'water') {
            this._materials[cellType].blending = THREE.NormalBlending;
            this._materials[cellType].depthWrite = false;
            this._materials[cellType].depthTest = true;
            this._materials[cellType].transparent = true;
        }

        if (cellType == 'cloud') {
            this._materials[cellType].uniforms.fogDensity.value = 0.001;
            this._materials[cellType].uniforms.cloudScale.value = [64, 10, 64];
        }

        this._meshes[cellType] = new THREE.Mesh(
            this._geometryBuffers[cellType], this._materials[cellType]);
        this._game._graphics._scene.add(this._meshes[cellType]);
    }

    this._geometryBuffers[cellType].maxInstancedCount = cells.length;

    const baseGeometry = this._GetBaseGeometryForCellType(cellType);

    this._geometryBuffers[cellType].setAttribute(
        'position', new THREE.Float32BufferAttribute(
            [...baseGeometry.attributes.position.array], 3));
    this._geometryBuffers[cellType].setAttribute(
        'uv', new THREE.Float32BufferAttribute(
            [...baseGeometry.attributes.uv.array], 2));
    this._geometryBuffers[cellType].setAttribute(
        'normal', new THREE.Float32BufferAttribute(
            [...baseGeometry.attributes.normal.array], 3));
    this._geometryBuffers[cellType].setIndex(
        new THREE.BufferAttribute(
            new Uint32Array([...baseGeometry.index.array]), 1));

    const offsets = [];
    const uvOffsets = [];
    const colors = [];

    const box = new THREE.Box3();

    for (let c in cells) {
        const curCell = cells[c];

        let randomLuminance = Noise(
            _N2, curCell.position[0], curCell.position[2], 16, 8, 0.6, 2) * 0.2 + 0.8;
        if (curCell.luminance !== undefined) {
            randomLuminance = curCell.luminance;
        } else if (cellType == 'cloud') {
            randomLuminance = 1;
        }

        const colour = textureInfo.colourRange[0].clone();
        colour.r *= randomLuminance;
        colour.g *= randomLuminance;
        colour.b *= randomLuminance;

        colors.push(colour.r, colour.g, colour.b);
        offsets.push(...curCell.position);
        uvOffsets.push(...textureInfo.uvOffset);
        box.expandByPoint(new THREE.Vector3(
            curCell.position[0],
            curCell.position[1],
            curCell.position[2]));
    }

    this._geometryBuffers[cellType].setAttribute(
        'color', new THREE.InstancedBufferAttribute(
            new Float32Array(colors), 3));
    this._geometryBuffers[cellType].setAttribute(
        'offset', new THREE.InstancedBufferAttribute(
            new Float32Array(offsets), 3));
    this._geometryBuffers[cellType].setAttribute(
        'uvOffset', new THREE.InstancedBufferAttribute(
            new Float32Array(uvOffsets), 2));
    this._geometryBuffers[cellType].attributes.offset.needsUpdate = true;
    this._geometryBuffers[cellType].attributes.uvOffset.uvOffset = true;
    this._geometryBuffers[cellType].attributes.color.uvOffset = true;

    this._geometryBuffers[cellType].boundingBox = box;
    this._geometryBuffers[cellType].boundingSphere = new THREE.Sphere();
    box.getBoundingSphere(this._geometryBuffers[cellType].boundingSphere);
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
        color: 'darkgreen', //emissive: 'darkgreen',emissiveIntensity: 0.06,
        transparent: true,
        alphaTest: 0.5,
        fog: true,
        side: THREE.DoubleSide
    });
    const sampler = new MeshSurfaceSampler(Base).build();

    const _normal = new THREE.Vector3();
    const tempPosition = new THREE.Vector3(0, 6, 0);
    const tempObject = new THREE.Object3D();
    let grassMasses = new THREE.InstancedMesh(grassGeometry, grassMaterial, grassCount)
    scene.add(grassMasses)
    for (let i = 0, l = grassCount; i < l; i = i + 3) {
        sampler.sample(tempPosition, _normal);
        let s = Math.random() * 0.5 + 0.5;
        let ns = grassHeight * s;
        tempObject.scale.setScalar(s);
        tempObject.position.x = tempPosition.x;
        tempObject.position.z = tempPosition.z;
        tempObject.position.y = tempPosition.y + ns - ns / 2;
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
    grassMasses.setRotationFromMatrix(camera.matrix);
    grassMasses.castShadow = true;
    grassMasses.receiveShadow = true;
    grassMasses.instanceMatrix.needsUpdate = true;
}