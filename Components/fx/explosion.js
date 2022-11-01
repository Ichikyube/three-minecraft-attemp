CANNONS.Explosion = function(x, y, z) {
    this.name = 'explosion';
    this.alive = true;
    var g = new THREE.SphereGeometry( 200, 8, 6 );
    var texture = THREE.ImageUtils.loadTexture('textures/glass_orange.png');
    texture.anisotropy = renderer.getMaxAnisotropy();
    var material = new THREE.MeshBasicMaterial(
        { map: texture, transparent: true, opacity: 0.6, color: 0xFF0000 });
    this.mesh = new THREE.Mesh(g, material);
    this.mesh.position.x = x;
    this.mesh.position.y = y;
    this.mesh.position.z = z;
    scene.add(this.mesh);

    CANNONS.entities[CANNONS.entities.length] = this;

    this.lifeSpan = 40;

    var sndeffect = new Audio("sounds/explode.ogg");
    sndeffect.play();

    this.update = function() {
        this.mesh.scale.add(new THREE.Vector3(0.2, 0.2, 0.2));
        if (--this.lifeSpan == 0)
            this.die();
    }

    this.die = function() {
        scene.remove(this.mesh);
        this.alive = false;
    };

    this.isAlive = function() {
        return this.alive;
    }
};