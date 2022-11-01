CANNONS.World = function(size) {
    this.width = size.width;
    this.length = size.length;
    this.height = size.height;
    this.halfWidth = this.width / 2;
    this.halfLength = this.length / 2;
    this.minWidth = - this.halfWidth * 100;
    this.maxWidth = this.halfWidth * 100;
    this.minDepth = - this.halfWidth * 100;
    this.maxDepth = this.halfWidth * 100;
    this.minHeight = - 25 * 100;
    this.maxHeight = 25 * 100;

    this.makeNoise = function () {
        var data = [];
        var size = 5;
        for (var y = 0; y < this.length; y++)
            for (var x = 0; x < this.width; x++) {
                n = PerlinNoise.noise(size * x / this.width, size * y / this.length, this.height);
                data[y * this.width + x] = Math.round(this.height * n);
            }
        return data;
    };

    this.getY = function(x, z) {
        return (this.data.getY(x, z));
    };

    this.getYW = function(x, z) {
        x = w(x); z = w(z);
        return ((this.data[x + z * this.width] * 0.2) | 0) * 100;
    };

    this.isOutside = function(x, y, z) {
        if (x < this.minWidth || x > this.maxWidth)
            return true;
        if (z < this.minDepth || z > this.maxDepth)
            return true;
        return false;
    };

    this.getSpawn = function(player) {       // player 0 is human, player 1 is CPU
        var spawnPoint = new THREE.Vector3();
        if (player == 0) {
            spawnPoint.x = this.minWidth + Math.floor((Math.random() * this.halfWidth * 100) + 1);
            spawnPoint.z = this.minDepth + Math.floor((Math.random() * this.halfLength * 100) + 1);
            spawnPoint.y = this.getYW(spawnPoint.x, spawnPoint.z);
        } else {
            spawnPoint.x = this.maxWidth - Math.floor((Math.random() * this.halfWidth * 100) + 1);
            spawnPoint.z = this.maxDepth - Math.floor((Math.random() * this.halfLength * 100) + 1);
            spawnPoint.y = this.getYW(spawnPoint.x, spawnPoint.z);
        }
        return spawnPoint;
    };

    this.landMesh = null;

    this.buildWorld = function() {
        for (var y = 0; y != world.length; y++)
            for (var x = 0; x != world.width; x++)
                this.data[y][x] = this.getY(x, y);
    };

    // sloth loves chunk
    this.render = function() {

        console.log('rendering world', this.height, this.length, this.width);

        if (this.landMesh != null)
            scene.remove(this.landMesh);
        // lay of the land
        var texture = THREE.ImageUtils.loadTexture('textures/grass.png');
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.LinearMipMapLinearFilter;
        var boxGeom = new THREE.BoxGeometry(100, 100, 100);
        var boxes = new THREE.Geometry();
        var matrix = new THREE.Matrix4();
        for (var y = 0; y < this.height; y++) {
            for (var z = 0; z < this.length; z++) {
                for (var x = 0; x < this.width; x++) {
                    if (this.data.get(x, y, z) != 0) {
                        //console.log('drawing cube at: ', x * 100 - this.halfWidth * 100, y * 100, z * 100 - this.halfLength * 100, this.width, this.length, this.height);
                        matrix.makeTranslation(
                            x * 100 - this.halfWidth * 100,
                            y * 100,
                            z * 100 - this.halfLength * 100
                        );
                        boxes.merge(boxGeom, matrix);
                    }
                }
            }
        }
        this.landMesh = new THREE.Mesh(boxes,
            new THREE.MeshLambertMaterial({ map: texture, ambient: 0xbbbbbb }));
        scene.add(this.landMesh);
    };

    this.data = new CANNONS.Land(this.width, this.length, this.height);
    this.data.setData(this.makeNoise());
};