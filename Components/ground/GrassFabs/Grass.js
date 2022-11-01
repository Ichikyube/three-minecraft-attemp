bushImg.mapping = THREE.UVMapping;
bushImg.magFilter = bushImg.minFilter = THREE.NearestFilter;


 // load the texture
 var bushImg = new THREE.TextureLoader().load('assets/textures/grass/grass01.png');
 // build the material
 var bushMat = new THREE.MeshPhongMaterial({
     map: texture,
     color: 'grey',
     emissive: 'darkgreen',
     alphaTest: 0.7,
     side: THREE.DoubleSide
 })



const geometry = new THREE.PlaneBufferGeometry(100, 100);

const texture = new THREE.CanvasTexture(generateTexture());

for (let i = 0; i < 15; i++) {

    const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.3, 0.75, (i / 15) * 0.4 + 0.1),
        map: texture,
        depthTest: false,
        depthWrite: false,
        transparent: true
    });

    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.y = i * 0.25;
    mesh.rotation.x = -Math.PI / 2;

    scene.add(mesh);

}

scene.children.reverse();

function generateTexture() {

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;

  const context = canvas.getContext('2d');

  for (let i = 0; i < 20000; i++) {

      context.fillStyle = 'hsl(0,0%,' + (Math.random() * 50 + 50) + '%)';
      context.beginPath();
      context.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() + 0.15, 0, Math
          .PI * 2, true);
      context.fill();

  }

  context.globalAlpha = 0.075;
  context.globalCompositeOperation = 'lighter';

  return canvas;

}

function render() {

  const time = Date.now() / 6000;

  for (let i = 0, l = scene.children.length; i < l; i++) {

      const mesh = scene.children[i];
      mesh.position.x = Math.sin(time * 4) * i * i * 0.005;
      mesh.position.z = Math.cos(time * 6) * i * i * 0.005;

  }

}