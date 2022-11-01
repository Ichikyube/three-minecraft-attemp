export function handlingGun(player) {
    let raycaster = new THREE.Raycaster(camera.getWorldPosition(new THREE.Vector3()), camera.getWorldDirection(
        new THREE.Vector3()));
    let arrow = new THREE.ArrowHelper(camera.getWorldDirection(new THREE.Vector3()), camera.getWorldPosition(
        new THREE.Vector3()), 3, 0x000000);

    const pointer = new THREE.Vector2();
    // update the picking ray with the camera and pointer position

    animateTasks.push(function (gun) {
        raycaster.setFromCamera(pointer, camera);
        raycaster.set(camera.getWorldPosition(new THREE.Vector3()), camera
            .getWorldDirection(new THREE
                .Vector3()));
        scene.remove(arrow);
        arrow = new THREE.ArrowHelper(raycaster.ray.direction, raycaster.ray.origin, 5,
            0x000000);
        //scene.add(arrow);
        gun.position.set(camera.position.x, camera.position.y - 6, camera.position.z - 4)
        gun.rotation.copy(camera.rotation);

    });
}

function Riffle() {
    let rifle;
    const loader = new GLTFLoader().setPath('./assets/models/gltf/');
    loader.load('M4A1.glb', (gltf) => {
        rifle = gltf.scene
        rifle.scale.multiplyScalar(18); // adjust scalar factor to match your scene scale
        rifle.name = 'rifle';
        scene.add(rifle);
        worldOctree.fromGraphNode(rifle);
        rifle.traverse(child => {

            if (child.isMesh) {

                child.castShadow = true;
                child.receiveShadow = true;

                if (child.material) {
                    child.material.metalness = 0
                    child.material.anisotropy = 4;
                }
            }
        });
    });

    // some variables
    const zoom = this.input.mousePointer.rightButtonDown()
    const speed = 0.1
    const direction = new THREE.Vector3()
    const rotation = this.third.camera.getWorldDirection(direction)
    const theta = Math.atan2(rotation.x, rotation.z)

    // reset red dot
    this.redDot.alpha = 1

    // the rifle movement
    if (zoom) {
        this.redDot.alpha = 0
        this.move.x = THREE.MathUtils.lerp(this.move.x, 0.6, 0.2)
        this.move.y = THREE.MathUtils.lerp(this.move.y, -0.8 + 1.8, 0.2)
        this.move.z = THREE.MathUtils.lerp(this.move.z, -0.45, 0.2)
    } else if (this.keys.w.isDown) {
        this.move.x = Math.sin(time * -0.015) * 0.075
        this.move.y = Math.sin(time * 0.015) * 0.075
        this.move.z = Math.sin(time * 0.015) * 0.075
    } else {
        this.move.x = Math.sin(time * -0.003) * 0.01
        this.move.y = Math.sin(time * 0.003) * 0.01
        this.move.z = Math.sin(time * 0.003) * 0.01
    }

    // tilt
    if (this.keys.q.isDown) {
        this.third.camera.rotateZ(0.2)
        this.firstPersonControls.offset = new THREE.Vector3(
            Math.sin(theta + Math.PI * 0.5) * 0.4,
            0,
            Math.cos(theta + Math.PI * 0.5) * 0.4
        )
    } else if (this.keys.e.isDown) {
        this.third.camera.rotateZ(-0.2)
        this.firstPersonControls.offset = new THREE.Vector3(
            Math.sin(theta - Math.PI * 0.5) * 0.4,
            0,
            Math.cos(theta - Math.PI * 0.5) * 0.4
        )
    } else {
        this.third.camera.rotateZ(0)
        this.firstPersonControls.offset = new THREE.Vector3(0, 0, 0)
    }

    // adjust the position of the rifle to the camera
    const raycaster = new THREE.Raycaster()
    // x and y are normalized device coordinates from -1 to +1
    raycaster.setFromCamera({
        x: 0.6 - this.move.x,
        y: -0.8 - this.move.y
    }, this.third.camera)
    const pos = new THREE.Vector3()
    pos.copy(raycaster.ray.direction)
    pos.multiplyScalar(0.8 + this.move.z)
    pos.add(raycaster.ray.origin)

    this.rifle.position.copy(pos)
    this.rifle.rotation.copy(this.third.camera.rotation)

    // shoot
    if (this.input.mousePointer.leftButtonDown()) {
        const x = 0
        const y = 0
        const force = 5
        const pos = new THREE.Vector3()

        raycaster.setFromCamera({
            x,
            y
        }, this.third.camera)

        pos.copy(raycaster.ray.direction)
        pos.add(raycaster.ray.origin)

        const sphere = this.third.physics.add.sphere({
            radius: 0.05,
            x: pos.x,
            y: pos.y,
            z: pos.z,
            mass: 5,
            bufferGeometry: true
        }, {
            phong: {
                color: 0x202020
            }
        })

        pos.copy(raycaster.ray.direction)
        pos.multiplyScalar(24)

        sphere.body.applyForce(pos.x * force, pos.y * force, pos.z * force)
    }
}


// adjust the position of the rifle to the camera
const raycaster = new THREE.Raycaster()
// x and y are normalized device coordinates from -1 to +1
raycaster.setFromCamera({
    x: 0.6 - this.move.x,
    y: -0.8 - this.move.y
}, this.third.camera)
const pos = new THREE.Vector3()
pos.copy(raycaster.ray.direction)
pos.multiplyScalar(0.8 + this.move.z)
pos.add(raycaster.ray.origin)

this.rifle.position.copy(pos)
this.rifle.rotation.copy(this.third.camera.rotation)




Bullet.prototype.update = (function () {
    var scaledDirection = new THREE.Vector3();
    return function (delta) {
        scaledDirection.copy(this.direction).multiplyScalar(this.speed * delta);
        this.position.add(scaledDirection);
    };
})();
var shoot = (function () {
    var negativeZ = new THREE.Vector3(0, 0, -1);
    return function (from, to) {
        bullet = new Bullet();
        bullet.position.copy(from.position);
        if (to) {
            bullet.direction = to.position.clone().sub(from.position).
            normalize();
        } else {
            bullet.direction = negativeZ.clone().applyEuler(from.rotation);
        }
        bullets.push(bullet);
        scene.add(bullet);
    };
})();

controls = new OrbitControls( camera, renderer.domElement );
				controls.minDistance = 1000;
				controls.maxDistance = 10000;
				controls.maxPolarAngle = Math.PI / 2;

				//

				const data = generateHeight( worldWidth, worldDepth );

				controls.target.y = data[ worldHalfWidth + worldHalfDepth * worldWidth ] + 500;
				camera.position.y = controls.target.y + 2000;
				camera.position.x = 2000;
				controls.update();

				const geometry = new THREE.PlaneGeometry( 7500, 7500, worldWidth - 1, worldDepth - 1 );
				geometry.rotateX( - Math.PI / 2 );

				const vertices = geometry.attributes.position.array;

				for ( let i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {

					vertices[ j + 1 ] = data[ i ] * 10;

				}

				//

				texture = new THREE.CanvasTexture( generateTexture( data, worldWidth, worldDepth ) );
				texture.wrapS = THREE.ClampToEdgeWrapping;
				texture.wrapT = THREE.ClampToEdgeWrapping;

				mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { map: texture } ) );
				scene.add( mesh );

				const geometryHelper = new THREE.ConeGeometry( 20, 100, 3 );
				geometryHelper.translate( 0, 50, 0 );
				geometryHelper.rotateX( Math.PI / 2 );
				helper = new THREE.Mesh( geometryHelper, new THREE.MeshNormalMaterial() );
				scene.add( helper );

				container.addEventListener( 'pointermove', onPointerMove );

				stats = new Stats();
				container.appendChild( stats.dom );

				//

				window.addEventListener( 'resize', onWindowResize );

			}

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

			}

			function generateHeight( width, height ) {

				const size = width * height, data = new Uint8Array( size ),
					perlin = new ImprovedNoise(), z = Math.random() * 100;

				let quality = 1;

				for ( let j = 0; j < 4; j ++ ) {

					for ( let i = 0; i < size; i ++ ) {

						const x = i % width, y = ~ ~ ( i / width );
						data[ i ] += Math.abs( perlin.noise( x / quality, y / quality, z ) * quality * 1.75 );

					}

					quality *= 5;

				}

				return data;

			}

			function generateTexture( data, width, height ) {

				// bake lighting into texture

				let context, image, imageData, shade;

				const vector3 = new THREE.Vector3( 0, 0, 0 );

				const sun = new THREE.Vector3( 1, 1, 1 );
				sun.normalize();

				const canvas = document.createElement( 'canvas' );
				canvas.width = width;
				canvas.height = height;

				context = canvas.getContext( '2d' );
				context.fillStyle = '#000';
				context.fillRect( 0, 0, width, height );

				image = context.getImageData( 0, 0, canvas.width, canvas.height );
				imageData = image.data;

				for ( let i = 0, j = 0, l = imageData.length; i < l; i += 4, j ++ ) {

					vector3.x = data[ j - 2 ] - data[ j + 2 ];
					vector3.y = 2;
					vector3.z = data[ j - width * 2 ] - data[ j + width * 2 ];
					vector3.normalize();

					shade = vector3.dot( sun );

					imageData[ i ] = ( 96 + shade * 128 ) * ( 0.5 + data[ j ] * 0.007 );
					imageData[ i + 1 ] = ( 32 + shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );
					imageData[ i + 2 ] = ( shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );

				}

				context.putImageData( image, 0, 0 );

				// Scaled 4x

				const canvasScaled = document.createElement( 'canvas' );
				canvasScaled.width = width * 4;
				canvasScaled.height = height * 4;

				context = canvasScaled.getContext( '2d' );
				context.scale( 4, 4 );
				context.drawImage( canvas, 0, 0 );

				image = context.getImageData( 0, 0, canvasScaled.width, canvasScaled.height );
				imageData = image.data;

				for ( let i = 0, l = imageData.length; i < l; i += 4 ) {

					const v = ~ ~ ( Math.random() * 5 );

					imageData[ i ] += v;
					imageData[ i + 1 ] += v;
					imageData[ i + 2 ] += v;

				}

				context.putImageData( image, 0, 0 );

				return canvasScaled;

			}


			function onPointerMove( event ) {

				pointer.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
				pointer.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;
				raycaster.setFromCamera( pointer, camera );

				// See if the ray from the camera into the world hits one of our meshes
				const intersects = raycaster.intersectObject( mesh );

				// Toggle rotation bool for meshes that we clicked
				if ( intersects.length > 0 ) {

					helper.position.set( 0, 0, 0 );
					helper.lookAt( intersects[ 0 ].face.normal );

					helper.position.copy( intersects[ 0 ].point );

				}

			}
