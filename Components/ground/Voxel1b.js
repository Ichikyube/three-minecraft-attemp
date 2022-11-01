import * as THREE from 'three';


const _VOXEL_HEIGHT = 128;
const _OCEAN_LEVEL = Math.floor(_VOXEL_HEIGHT * 0.12);
const _BEACH_LEVEL = _OCEAN_LEVEL + 2;
const _SNOW_LEVEL = Math.floor(_VOXEL_HEIGHT * 0.8);
const _MOUNTAIN_LEVEL = Math.floor(_VOXEL_HEIGHT * 0.5);


var worldGen = Math.random();
var biomeGen = Math.random();
var treesGen = Math.random();
var biomeSize = 1; // the higher this number, the larger the biomes get
var treeDensity = 1;

function getBiome(n) {
    if (n < 0.2) {
        return "plains";
    } else if (n >= 0.2) {
        return "desert";
    }
}

export class VoxelWorld {
    constructor(options, folder) {
        let texName = options.imgAtlas;
        let imageSuffix = ".png";
        let imgPath = 'assets/textures/';
        if (folder == !undefined) imgPath += folder + '/';
        let texAtlas = new THREE.TextureLoader().setPath(imgPath)
            .load(texName + imageSuffix, (img) => {
                console.log(img.image.naturalWidth + ', ' + img.image.naturalHeight);
            });
        texAtlas.name = 'atlas';
        texAtlas.magFilter = texAtlas.minFilter = THREE.NearestFilter;
        this.cellSize = options.cellSize;
        this.tileSize = options.tileSize;
        this.tileTextureWidth = 256;
        this.tileTextureHeight = 64;
        const {
            cellSize
        } = this;
        this.cellSliceSize = cellSize * cellSize;
        this.cells = {};
        this.material = new THREE.MeshBasicMaterial({
            map: texAtlas,
            side: THREE.DoubleSide,
            alphaTest: 0.1,
            transparent: true,
        });
    }

    computeCellId(x, y, z) {
        const {
            cellSize
        } = this;
        const cellX = Math.floor(x / cellSize);
        const cellY = Math.floor(y / cellSize);
        const cellZ = Math.floor(z / cellSize);
        return `${cellX},${cellY},${cellZ}`;
    }
    getCellForVoxel(x, y, z) {
        return this.cells[this.computeCellId(x, y, z)];
    }
    computeVoxelOffset(x, y, z) {
        const {
            cellSize
        } = this;
        const voxelX = THREE.MathUtils.euclideanModulo(x, cellSize) | 0;
        const voxelY = THREE.MathUtils.euclideanModulo(y, cellSize) | 0;
        const voxelZ = THREE.MathUtils.euclideanModulo(z, cellSize) | 0;
        return voxelY * cellSize * cellSize +
            voxelZ * cellSize +
            voxelX;
    }
    setVoxel(x, y, z, v) {
        let cell = this.getCellForVoxel(x, y, z);
        if (!cell) {
            cell = this.addCellForVoxel(x, y, z);
        }
        const voxelOffset = this.computeVoxelOffset(x, y, z)
        
        cell[voxelOffset] = v;
    }
    addCellForVoxel(x, y, z) {
        const cellId = this.computeCellId(x, y, z);
        let cell = this.cells[cellId];
        if (!cell) {
            const {
                cellSize
            } = this;
            cell = new Uint8Array(cellSize * cellSize * cellSize);
            this.cells[cellId] = cell;
        }
        return cell;
    }
    getVoxel(x, y, z) {
        const cell = this.getCellForVoxel(x, y, z);
        if (!cell) {
            return 0;
        }
        const voxelOffset = this.computeVoxelOffset(x, y, z)
        return cell[voxelOffset];
    }

    generateGeometryDataForCell(cellX, cellY, cellZ) {
        const {
            cellSize,
            tileSize,
            tileTextureWidth,
            tileTextureHeight
        } = this;
        const positions = [];
        const normals = [];
        const uvs = [];
        const indices = [];
        const startX = cellX * cellSize;
        const startY = cellY * cellSize;
        const startZ = cellZ * cellSize;
        for (let y = 0; y < cellSize; ++y) {
            const voxelY = startY + y;
            for (let z = 0; z < cellSize; ++z) {
                const voxelZ = startZ + z;
                for (let x = 0; x < cellSize; ++x) {
                    const voxelX = startX + x;
                    const voxel = this.getVoxel(voxelX, voxelY, voxelZ);
                    if (voxel) {
                        for (const {
                                dir,
                                corners,
                                uvRow
                            } of VoxelWorld.faces) {
                            const neighbor = this.getVoxel(
                                voxelX + dir[0],
                                voxelY + dir[1],
                                voxelZ + dir[2]);
                            if (!neighbor) {
                                // this voxel has no neighbor in this direction so we need a face
                                const ndx = positions.length / 3;
                                const _SNOW_LEVEL = 6;
                                const _BEACH_LEVEL = 4;
                                const _OCEAN_LEVEL = 2;
                                let ocean = 12,
                                    sand = 3,
                                    snow = 2;
                                for (const {
                                        pos,
                                        uv
                                    } of corners) {
                                    positions.push(pos[0] + x, pos[1] + (y), pos[2] + z);
                                    normals.push(...dir);
                                    if (y < _OCEAN_LEVEL) uvs.push(
                                        (ocean + uv[0]) * tileSize / tileTextureWidth,
                                        1 - (uvRow + 1 - uv[1]) * tileSize / tileTextureHeight);
                                    if (y >= _OCEAN_LEVEL && y < _BEACH_LEVEL) uvs.push(
                                        (sand + uv[0]) * tileSize / tileTextureWidth,
                                        1 - (uvRow + 1 - uv[1]) * tileSize / tileTextureHeight);

                                    if (y > _SNOW_LEVEL) uvs.push(
                                        (snow + uv[0]) * tileSize / tileTextureWidth,
                                        1 - (uvRow + 1 - uv[1]) * tileSize / tileTextureHeight);
                                    if (y >= _BEACH_LEVEL && y <= _SNOW_LEVEL) {
                                        if (y < voxel) uvs.push(
                                            (14 + uv[0]) * tileSize / tileTextureWidth,
                                            1 - (uvRow + 1 - uv[1]) * tileSize / tileTextureHeight);
                                        else uvs.push(
                                            (13 + uv[0]) * tileSize / tileTextureWidth,
                                            1 - (uvRow + 1 - uv[1]) * tileSize / tileTextureHeight);
                                    }

                                }

                                indices.push(
                                    ndx, ndx + 1, ndx + 2,
                                    ndx + 2, ndx + 1, ndx + 3,
                                );
                            }
                        }
                    }

                }
            }
        }
        return {
            positions,
            normals,
            uvs,
            indices,
        }
    }

    // from
    // https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.42.3443&rep=rep1&type=pdf
    intersectRay(start, end) {
        let dx = end.x - start.x;
        let dy = end.y - start.y;
        let dz = end.z - start.z;
        const lenSq = dx * dx + dy * dy + dz * dz;
        const len = Math.sqrt(lenSq);

        dx /= len;
        dy /= len;
        dz /= len;

        let t = 0.0;
        let ix = Math.floor(start.x);
        let iy = Math.floor(start.y);
        let iz = Math.floor(start.z);

        const stepX = (dx > 0) ? 1 : -1;
        const stepY = (dy > 0) ? 1 : -1;
        const stepZ = (dz > 0) ? 1 : -1;

        const txDelta = Math.abs(1 / dx);
        const tyDelta = Math.abs(1 / dy);
        const tzDelta = Math.abs(1 / dz);

        const xDist = (stepX > 0) ? (ix + 1 - start.x) : (start.x - ix);
        const yDist = (stepY > 0) ? (iy + 1 - start.y) : (start.y - iy);
        const zDist = (stepZ > 0) ? (iz + 1 - start.z) : (start.z - iz);

        // location of nearest voxel boundary, in units of t
        let txMax = (txDelta < Infinity) ? txDelta * xDist : Infinity;
        let tyMax = (tyDelta < Infinity) ? tyDelta * yDist : Infinity;
        let tzMax = (tzDelta < Infinity) ? tzDelta * zDist : Infinity;

        let steppedIndex = -1;

        // main loop along raycast vector
        while (t <= len) {
            const voxel = this.getVoxel(ix, iy, iz);
            if (voxel) {
                return {
                    position: [
                        start.x + t * dx,
                        start.y + t * dy,
                        start.z + t * dz,
                    ],
                    normal: [
                        steppedIndex === 0 ? -stepX : 0,
                        steppedIndex === 1 ? -stepY : 0,
                        steppedIndex === 2 ? -stepZ : 0,
                    ],
                    voxel,
                };
            }

            // advance t to next nearest voxel boundary
            if (txMax < tyMax) {
                if (txMax < tzMax) {
                    ix += stepX;
                    t = txMax;
                    txMax += txDelta;
                    steppedIndex = 0;
                } else {
                    iz += stepZ;
                    t = tzMax;
                    tzMax += tzDelta;
                    steppedIndex = 2;
                }
            } else {
                if (tyMax < tzMax) {
                    iy += stepY;
                    t = tyMax;
                    tyMax += tyDelta;
                    steppedIndex = 1;
                } else {
                    iz += stepZ;
                    t = tzMax;
                    tzMax += tzDelta;
                    steppedIndex = 2;
                }
            }
        }
        return null;
    }

}
VoxelWorld.faces = [{ // left
        uvRow: 0,
        dir: [-1, 0, 0],
        corners: [{
                pos: [0, 1, 0],
                uv: [0, 1],
            },
            {
                pos: [0, 0, 0],
                uv: [0, 0],
            },
            {
                pos: [0, 1, 1],
                uv: [1, 1],
            },
            {
                pos: [0, 0, 1],
                uv: [1, 0],
            },
        ],
    },
    { // right
        uvRow: 0,
        dir: [1, 0, 0],
        corners: [{
                pos: [1, 1, 1],
                uv: [0, 1],
            },
            {
                pos: [1, 0, 1],
                uv: [0, 0],
            },
            {
                pos: [1, 1, 0],
                uv: [1, 1],
            },
            {
                pos: [1, 0, 0],
                uv: [1, 0],
            },
        ],
    },
    { // bottom
        uvRow: 1,
        dir: [0, -1, 0],
        corners: [{
                pos: [1, 0, 1],
                uv: [1, 0],
            },
            {
                pos: [0, 0, 1],
                uv: [0, 0],
            },
            {
                pos: [1, 0, 0],
                uv: [1, 1],
            },
            {
                pos: [0, 0, 0],
                uv: [0, 1],
            },
        ],
    },
    { // top
        uvRow: 2,
        dir: [0, 1, 0],
        corners: [{
                pos: [0, 1, 1],
                uv: [1, 1],
            },
            {
                pos: [1, 1, 1],
                uv: [0, 1],
            },
            {
                pos: [0, 1, 0],
                uv: [1, 0],
            },
            {
                pos: [1, 1, 0],
                uv: [0, 0],
            },
        ],
    },
    { // back
        uvRow: 0,
        dir: [0, 0, -1],
        corners: [{
                pos: [1, 0, 0],
                uv: [0, 0],
            },
            {
                pos: [0, 0, 0],
                uv: [1, 0],
            },
            {
                pos: [1, 1, 0],
                uv: [0, 1],
            },
            {
                pos: [0, 1, 0],
                uv: [1, 1],
            },
        ],
    },
    { // front
        uvRow: 0,
        dir: [0, 0, 1],
        corners: [{
                pos: [0, 0, 1],
                uv: [0, 0],
            },
            {
                pos: [1, 0, 1],
                uv: [1, 0],
            },
            {
                pos: [0, 1, 1],
                uv: [0, 1],
            },
            {
                pos: [1, 1, 1],
                uv: [1, 1],
            },
        ],
    },
];