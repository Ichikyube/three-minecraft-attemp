function clean() {

    const meshes = [];

    scene.traverse(function (object) {

        if (object.isMesh) meshes.push(object);

    });

    for (let i = 0; i < meshes.length; i++) {

        const mesh = meshes[i];
        mesh.material.dispose();
        mesh.geometry.dispose();

        scene.remove(mesh);

    }

}

const randomizeMatrix = function () {

    const position = new THREE.Vector3();
    const rotation = new THREE.Euler();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();

    return function (matrix) {

        position.x = Math.random() * 40 - 20;
        position.y = Math.random() * 40 - 20;
        position.z = Math.random() * 40 - 20;

        rotation.x = Math.random() * 2 * Math.PI;
        rotation.y = Math.random() * 2 * Math.PI;
        rotation.z = Math.random() * 2 * Math.PI;

        quaternion.setFromEuler(rotation);

        scale.x = scale.y = scale.z = Math.random() * 1;

        matrix.compose(position, quaternion, scale);

    };

}();

function initMesh() {

    clean();

    // make instances
    new THREE.BufferGeometryLoader()
        .setPath('models/json/')
        .load('suzanne_buffergeometry.json', function (geometry) {

            material = new THREE.MeshNormalMaterial();

            geometry.computeVertexNormals();

            console.time(api.method + ' (build)');

            switch (api.method) {

                case Method.INSTANCED:
                    makeInstanced(geometry);
                    break;

                case Method.MERGED:
                    makeMerged(geometry);
                    break;

                case Method.NAIVE:
                    makeNaive(geometry);
                    break;

            }

            console.timeEnd(api.method + ' (build)');

        });

}

function makeInstanced(geometry) {

    const matrix = new THREE.Matrix4();
    const mesh = new THREE.InstancedMesh(geometry, material, api.count);

    for (let i = 0; i < api.count; i++) {

        randomizeMatrix(matrix);
        mesh.setMatrixAt(i, matrix);

    }

    scene.add(mesh);

    //

    const geometryByteLength = getGeometryByteLength(geometry);

    guiStatsEl.innerHTML = [

        '<i>GPU draw calls</i>: 1',
        '<i>GPU memory</i>: ' + formatBytes(api.count * 16 + geometryByteLength, 2)

    ].join('<br/>');

}



function getGeometryByteLength( geometry ) {

    let total = 0;

    if ( geometry.index ) total += geometry.index.array.byteLength;

    for ( const name in geometry.attributes ) {

        total += geometry.attributes[ name ].array.byteLength;

    }

    return total;

}

// Source: https://stackoverflow.com/a/18650828/1314762
function formatBytes( bytes, decimals ) {

    if ( bytes === 0 ) return '0 bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = [ 'bytes', 'KB', 'MB' ];

    const i = Math.floor( Math.log( bytes ) / Math.log( k ) );

    return parseFloat( ( bytes / Math.pow( k, i ) ).toFixed( dm ) ) + ' ' + sizes[ i ];

}