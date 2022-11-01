
		var renderer = new THREE.WebGLRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( renderer.domElement );

		// grid
		var gridHelper = new THREE.GridHelper( 100, 20 );
		gridHelper.rotation.x = Math.PI/2;
		scene.add( gridHelper );

		var bShape = new THREE.Shape();
		bShape.moveTo( 6, 6 );
		bShape.lineTo( 6, 8 );
		bShape.lineTo( 8, 8 );
		bShape.lineTo( 8, 6 );
		bShape.lineTo( 6, 6 );

		var bGeometry = new THREE.ShapeGeometry( bShape );
		var shapeB = new THREE.Mesh( bGeometry, new THREE.MeshBasicMaterial( { color: 0x999999, side: THREE.DoubleSide, transparent: true, opacity: 0.2 } ) );

		var cShape = new THREE.Shape();
		cShape.moveTo( 0, 0 );
		cShape.absarc( 0, 8, 3, 0, Math.PI * 2, false );

		var cGeometry = new THREE.ShapeGeometry( cShape );
		var shapeC = new THREE.Mesh( cGeometry, new THREE.MeshBasicMaterial( { visible: true , color: 0x789654 } ) );

		var circleRadius = 8;
		var circleShape = new THREE.Shape();
		circleShape.moveTo( 0, 0 );
		circleShape.absarc( 0, 0, circleRadius, 0, Math.PI * 2, false );

		var circleGeometry = new THREE.ShapeGeometry( circleShape );
		var plane = new THREE.Mesh( circleGeometry, new THREE.MeshBasicMaterial( { visible: true , color: 0x456789 } ) );
		scene.add( plane );

		shapeC.updateMatrix();
		plane.geometry.merge(shapeC.geometry, shapeC.matrix);

		shapeB.updateMatrix();
		plane.geometry.merge(shapeB.geometry, shapeB.matrix);

		var boxGeometry = new THREE.BoxGeometry( 2, 2, 2 );
		var cube = new THREE.Mesh( boxGeometry, new THREE.MeshBasicMaterial( { color: 0xdddddd } ) );
		cube.position.set( 0, 0, 1 );
		scene.add( cube );

		var light = new THREE.DirectionalLight( 0xffff00, 0.8 );
		light.position.set( 0, 0, 80 );
		scene.add(light);

		var vertices = [ [ new THREE.Vector3( -0.1, 1, 0 ), new THREE.Vector3( -0.1, -1, 0 ) ] ];
		var pathGeometry;
		var path;

		var animate = function () {
			requestAnimationFrame( animate );

			if (state === 1) {
				var x = cube.position.x + velocity.x * 0.0025;
				var y = cube.position.y + velocity.y * 0.0025;
				cube.position.set( x, y, 0 );
				cube.rotation.set( 0, 0, radian );

				if (path) {
					scene.remove(path);
					pathGeometry.dispose();
				}

				var v1 = new THREE.Vector3( 0, 1, 0 );
				v1.applyMatrix4( cube.matrixWorld );
				var v2 = new THREE.Vector3( 0, -1, 0 );
				v2.applyMatrix4( cube.matrixWorld );

				vertices.push( [ v1, v2 ] );

				var pathShape = new THREE.Shape();

				pathShape.moveTo( vertices[0][0].x, vertices[0][0].y );
				
				for (var i = 1; i < vertices.length; i++) {
				
					pathShape.lineTo( vertices[i][0].x, vertices[i][0].y );
					
				}
				for (var i = vertices.length-1; i >= 0; i--) {
				
					pathShape.lineTo( vertices[i][1].x, vertices[i][1].y );
					
				}
				pathShape.lineTo( vertices[0][0].x, vertices[0][0].y );
				
				if ( pathShape.curves.length <= 3 ) return;
				
				pathGeometry = new THREE.ShapeGeometry( pathShape );

				path = new THREE.Mesh( pathGeometry, new THREE.MeshBasicMaterial( { color: 0x999999, side: THREE.DoubleSide, transparent: true, opacity: 0.2 } ) );

				scene.add( path );

				camera.position.set( x, y, 30 );
			}

			if (state === 2) {
				state = 0;

				path.updateMatrix();
				plane.geometry.merge( path.geometry, path.matrix );
				plane.geometry.elementsNeedUpdate = true;
				plane.material.color.set( 0xff6600 );

				scene.remove( path );

			}
