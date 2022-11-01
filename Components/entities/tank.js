/**
 * Tank object
 * @param scene Current scene
 * @param renderer Current Renderer
 * @param position Where the tank should be
 * @constructor
 */
CANNONS.Tank = function(scene, renderer, position) {
    this.name = 'tank';
    this.health = 100;
    this.muzzleVelocity = 0;
    this.speed = 0;
    var bodyGeometry = new THREE.BoxGeometry(300, 250, 400);
    var baseGeometry = new THREE.BoxGeometry(200, 200, 200);
    var barrelGeometry = new THREE.BoxGeometry(50, 50, 400);
    barrelGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, -200));
    var blackGlassTexture = THREE.ImageUtils.loadTexture('textures/glass_black.png');
    var cyanGlassTexture = THREE.ImageUtils.loadTexture('textures/glass_cyan.png');
    var greenGlassTexture = THREE.ImageUtils.loadTexture('textures/glass_green.png');
    blackGlassTexture.anisotropy = renderer.getMaxAnisotropy();
    cyanGlassTexture.anisotropy = renderer.getMaxAnisotropy();
    greenGlassTexture.anisotropy = renderer.getMaxAnisotropy();
    this.bodyMesh = new THREE.Mesh(bodyGeometry,
        new THREE.MeshLambertMaterial( { map: blackGlassTexture, ambient: 0x333333 } ));
    this.baseMesh = new THREE.Mesh(baseGeometry,
        new THREE.MeshLambertMaterial( { map: greenGlassTexture, ambient: 0xbbbbbb } ));
    this.barrelMesh = new THREE.Mesh(barrelGeometry,
        new THREE.MeshLambertMaterial( { map: cyanGlassTexture, ambient: 0xbbbbbb } ));

    // the barrel just moves side to side and stuff
    this.barrelMesh.rotation.order = "YZX";

    if (position != undefined) {
        this.bodyMesh.position.x = position.x;
        this.bodyMesh.position.y = position.y;
        this.bodyMesh.position.z = position.z;
        this.baseMesh.position.x = position.x;
        this.baseMesh.position.y = position.y;
        this.baseMesh.position.z = position.z;
        this.barrelMesh.position.x = position.x;
        this.barrelMesh.position.y = position.y;
        this.barrelMesh.position.z = position.z;
    }

    this.show = function() {
        scene.add(this.bodyMesh);
        scene.add(this.baseMesh);
        scene.add(this.barrelMesh);
    };

    this.hide = function() {
        scene.remove(this.bodyMesh);
        scene.remove(this.baseMesh);
        scene.remove(this.barrelMesh);
    };

    this.update = function() {
        this.ground();
    };

    this.ground = function() {
        this.bodyMesh.position.y = world.getY(w(this.bodyMesh.position.x), w(this.bodyMesh.position.z)) * 100 + 300;
        this.copyPositionToBodyParts();
    };

    this.copyPositionToBodyParts = function() {
        this.baseMesh.position.x =
            this.barrelMesh.position.x =
                this.bodyMesh.position.x;
        this.baseMesh.position.y = this.bodyMesh.position.y + 100;
        this.barrelMesh.position.y = this.bodyMesh.position.y + 150;
        this.baseMesh.position.z =
            this.barrelMesh.position.z =
                this.bodyMesh.position.z;
        this.baseMesh.rotation.y =
            this.barrelMesh.rotation.y =
                this.bodyMesh.rotation.y;
    };

    this.rotateBarrel = function(theta) {
        this.barrelMesh.rotation.x += d2r * theta;
    };

    this.isAlive = function() {
        if (this.health > 0)
            return true;
        else
            return false;
    }
};