

function fabricGrass(params) {

    //////////////////////////////////////////////////////////////////////////////////
    //		comment								//
    //////////////////////////////////////////////////////////////////////////////////
    var nTufts = 5000
    var positions = new Array(nTufts)
    for (var i = 0; i < nTufts; i++) {
        var position = new THREE.Vector3()
        position.x = (Math.random() - 0.5) * 20
        position.z = (Math.random() - 0.5) * 20
        positions[i] = position
    }
    var mesh = THREEx.createGrassTufts(positions)
    scene.add(mesh)
    // load the texture
    var textureUrl = 'textures/grass01.png'
    var material = mesh.material
    material.map = loader.load(textureUrl);
    material.alphaTest = 0.7
    //////////////////////////////////////////////////////////////////////////////////
    //		comment								//
    //////////////////////////////////////////////////////////////////////////////////
  
  
    var nTufts = 5000
    var positions = new Array(nTufts)
    for (var i = 0; i < nTufts; i++) {
        var position = new THREE.Vector3()
        position.x = (Math.random() - 0.5) * 20
        position.z = (Math.random() - 0.5) * 20
        positions[i] = position
    }
    var mesh = THREEx.createGrassTufts(positions)
    scene.add(mesh)
    // load the texture
    var textureUrl = 'textures/grass02.png'
    var material = mesh.material
    material.map = loader.load(textureUrl);
    material.alphaTest = 0.7
  
    //////////////////////////////////////////////////////////////////////////////////
    //		comment								//
    //////////////////////////////////////////////////////////////////////////////////
    var nTufts = 100
    var positions = new Array(nTufts)
    for (var i = 0; i < nTufts; i++) {
        var position = new THREE.Vector3()
        position.x = (Math.random() - 0.5) * 20
        position.z = (Math.random() - 0.5) * 20
        positions[i] = position
    }
    var mesh = THREEx.createGrassTufts(positions)
    scene.add(mesh)
    // load the texture
    var material = mesh.material
    var textureUrl = 'textures/flowers01.png'
    material.map = loader.load(textureUrl);
    material.emissive.set(0x888888)
    material.alphaTest = 0.7
  
    //////////////////////////////////////////////////////////////////////////////////
    //		comment								//
    //////////////////////////////////////////////////////////////////////////////////
    var nTufts = 100
    var positions = new Array(nTufts)
    for (var i = 0; i < nTufts; i++) {
        var position = new THREE.Vector3()
        position.x = (Math.random() - 0.5) * 20
        position.z = (Math.random() - 0.5) * 20
        positions[i] = position
    }
    var mesh = THREEx.createGrassTufts(positions)
    scene.add(mesh)
    // load the texture
    var material = mesh.material
    var textureUrl = 'textures/flowers02.png'
    material.map = loader.load(textureUrl);
    material.emissive.set(0x888888)
    material.alphaTest = 0.7
  }
  
  const vertexShader = `
  varying vec2 vUv;
  uniform float time;
  
    void main() {
  
    vUv = uv;
    
    // VERTEX POSITION
    
    vec4 mvPosition = vec4( position, 1.0 );
    #ifdef USE_INSTANCING
        mvPosition = instanceMatrix * mvPosition;
    #endif
    
    // DISPLACEMENT
    
    // here the displacement is made stronger on the blades tips.
    float dispPower = 1.0 - cos( uv.y * 3.1416 / 2.0 );
    
    float displacement = sin( mvPosition.z + time * 10.0 ) * ( 0.1 * dispPower );
    mvPosition.z += displacement;
    
    //
    
    vec4 modelViewPosition = modelViewMatrix * mvPosition;
    gl_Position = projectionMatrix * modelViewPosition;
  
    }
  `;
  
  const fragmentShader = `
  varying vec2 vUv;
  
  void main() {
      vec3 baseColor = vec3( 0.41, 1.0, 0.5 );
    float clarity = ( vUv.y * 0.5 ) + 0.5;
    gl_FragColor = vec4( baseColor * clarity, 1 );
  }
  `;
  
  const uniforms = {
    time: {
        value: 0
    }
  }
  // load the texture
  var bushImg = new THREE.TextureLoader().load('assets/textures/grass/grass01.png');
  bushImg.mapping = THREE.UVMapping;
  bushImg.magFilter = bushImg.minFilter = THREE.NearestFilter;
  // build the material
  var bushMat = new THREE.MeshPhongMaterial({
    map: bushImg,
    color: 'grey',
    emissive: 0x013220,
    alphaTest: 0.7,
    side: THREE.DoubleSide
  })
  const leavesMaterial = new THREE.ShaderMaterial({
    map: bushImg,
    color: 'grey',
    emissive: 0x013220,
    alphaTest: 0.7,
    vertexShader,
    fragmentShader,
    uniforms,
    side: THREE.DoubleSide
  });
  
  /////////
  // MESH
  /////////
  
  const instanceNumber = 5000;
  const dummy = new THREE.Object3D();
  
  const geometry = new THREE.PlaneGeometry(0.1, 1, 1, 4);
  geometry.translate(0, 0.5, 0); // move grass blade geometry lowest point at 0.
  
  const instancedMesh = new THREE.InstancedMesh(geometry, leavesMaterial, instanceNumber);
  
  scene.add(instancedMesh);
  
  // Position and scale the grass blade instances randomly.
  
  for (let i = 0; i < instanceNumber; i++) {
  
    dummy.position.set(
        (Math.random() - 0.5) * 10,
        0,
        (Math.random() - 0.5) * 10
    );
  
    dummy.scale.setScalar(0.5 + Math.random() * 0.5);
  
    dummy.rotation.y = Math.random() * Math.PI;
  
    dummy.updateMatrix();
    instancedMesh.setMatrixAt(i, dummy.matrix);
  
  }
  animateTasks.push(function() {
    // Hand a time variable to vertex shader for wind displacement.
    leavesMaterial.uniforms.time.value = clock.getElapsedTime();
    leavesMaterial.uniformsNeedUpdate = true;
  
    //camera.quaternion.copy(car.quaternion);
    //plane.setRotationFromQuaternion( camera.quaternion );
    //plane.rotation.setFromRotationMatrix( camera.matrix );
    // plane.lookAt( camera.position ); // rotation messed up after camera pan
    //plane.rotation.setFromRotationMatrix(camera.matrix);
  })