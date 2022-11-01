function particles2(params) {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];

    const sprite = new THREE.TextureLoader().load('textures/sprites/disc.png');

    for (let i = 0; i < 10000; i++) {

        const x = 2000 * Math.random() - 1000;
        const y = 2000 * Math.random() - 1000;
        const z = 2000 * Math.random() - 1000;

        vertices.push(x, y, z);

    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    material = new THREE.PointsMaterial({
        size: 35,
        sizeAttenuation: true,
        map: sprite,
        alphaTest: 0.5,
        transparent: true
    });
    material.color.setHSL(1.0, 0.3, 0.7);

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

function particles(params) {
    var material = new THREE.PointsMaterial({
        color: 0x660000,
        map: null, // or an image texture
    });
    var particle = new THREE.Points(material);
    var material = new THREE.SpriteMaterial({
        color: 0x660000,
        map: null, // or an image texture
        opacity: 1.0,
        blending: THREE.AdditiveBlending,
    });
    var sprite = new THREE.Sprite(material);
    var geometry = new THREE.IcosahedronGeometry(200, 2);
    var mat = new THREE.ParticleBasicMaterial({
        color: type === 'R' ? TEAMS.R.color : TEAMS.B.color,
        size: 10,
    });
    var system = new THREE.ParticleSystem(geometry, mat);
    system.sortParticles = true;
    system.position.set(x, VERTICAL_UNIT * 0.5, z);
    scene.add(system);
    system.rotation.y += delta * 1.5;
}

function createSprite(size, transparent, opacity, color, spriteNumber) {
    // we have 1 row, with five sprites
    Material.sprite.uvOffset.set(1 / 5 * spriteNumber, 0);
    Material.sprite.uvScale.set(1 / 5, 1);
    Material.sprite.alignment = THREE.SpriteAlignment.bottomCenter;
    Material.sprite.scaleByViewport = true;
    Material.sprite.blending = THREE.AdditiveBlending;
    var sprite = new THREE.Sprite(Material.sprite);
    sprite.scale.set(size, size, size);
    sprite.position.set(200, window.innerHeight - 2, 0);
    sprite.velocityX = 5;
    scene.add(sprite);
}