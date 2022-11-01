function createAiTank() {
    CANNONS.aitank = new CANNONS.Tank(scene, renderer, world.getSpawn(1));

    CANNONS.aitank.update = function() {
    	// TODO: use vectors/matrices or whatever three.js offers to do this
        this.facePlayer();
        var dx = Math.sin(this.bodyMesh.rotation.y) * 5.0;
        var dz = Math.cos(this.bodyMesh.rotation.y) * 5.0;
        this.bodyMesh.position.x -= dx * this.speed;
        this.bodyMesh.position.z -= dz * this.speed;
        this.ground();
    };

    CANNONS.aitank.shoot = function() {
        var bulletGeometry = new THREE.SphereGeometry(15);
        var texture = THREE.ImageUtils.loadTexture('textures/glass_red.png');
        var material = new THREE.MeshBasicMaterial({ map: texture });
        var bulletMesh = new THREE.Mesh(bulletGeometry, material);
        bulletMesh.position.y = this.barrelMesh.position.y;
        bulletMesh.position.x = this.barrelMesh.position.x;
        bulletMesh.position.z = this.barrelMesh.position.z;
        var bulletEntity = new CANNONS.Entity(bulletMesh,
            this.getDirection(new THREE.Vector3(0, 0, - this.muzzleVelocity)));
        CANNONS.entities.add(bulletEntity);
        scene.add(bulletMesh);
        var sndeffect = new Audio("sounds/fire.ogg");
        sndeffect.play();
    };

    CANNONS.aitank.getDirection = function(speed) {
        var rotation = new THREE.Euler( 0, 0, 0, "YXZ" );
        rotation.set(
            30 * d2r,
            this.bodyMesh.rotation.y, 0);
        return speed.applyEuler(rotation);
    };

    CANNONS.aitank.takeTurn = function() {
        if (this.canSeePlayer()) {
            this.shoot();
        } else {
            this.move();
        }
    };

    CANNONS.aitank.facePlayer = function() {
        var ax = this.bodyMesh.position.x;
        var ay = this.bodyMesh.position.z;
        var px = player.getObject().position.x;
        var py = player.getObject().position.z;
        var dx = px - ax;
        var dy = py - ay;
        var tan = dx / dy;
        
        var theta = Math.atan(tan);
        // quadrant!
        if ((dx > 0 && dy > 0) || (dx < 0 && dy > 0))
        	theta = theta + Math.PI;
        this.bodyMesh.rotation.y = theta;
    };
    
    CANNONS.aitank.canSeePlayer = function() {
    	var ax = this.bodyMesh.position.x;
        var ay = this.bodyMesh.position.z;
        var px = player.getObject().position.x;
        var py = player.getObject().position.z;
        var dx = px - ax;
        var dy = py - ay;

        console.log('ax, ay: ' + ax + ',' + ay + ', dx: ' + dx + ', y:' + this.bodyMesh.position.y);

        var playerIsVisible = true;
        var theta;
        var xInc, yInc;
        if (dx == 0 || dy == 0) {
            if (dx == 0) if (dy < 0) { xInc = 0; yInc = 100; } else { xInc = 0; yInc = -100; }
            if (dy == 0) if (dx < 0) { xInc = 100; yInc = 0; } else { xInc = -100; yInc = 0; }
        } else {
            theta = Math.atan(dx / dy);
            if (dy < 0)
                theta += Math.PI / 2;
            else
                theta += 3 * Math.PI / 2;
            xInc = Math.cos(theta) * 100;
            yInc = - Math.sin(theta) * 100;
        }
        
        // total length
        var adx = Math.abs(dx);
        var ady = Math.abs(dy);
        var dis = Math.abs(adx / Math.cos(theta)) / 100 + 1;

        debug.msg("dx: " + dx + ", dy: " + dy + ", xInc: " + xInc + ", yInc: " + yInc + ", dis: " + dis + ", theta: " + theta * 180 / Math.PI);
        var x=ax, y=ay;
        for (var i = 0; i < dis ; i++) {
            x+=xInc;
            y+=yInc;
        	console.log(x, y, world.getYW(x, y));
        	if (world.getYW(x, y) > this.bodyMesh.position.y)
                playerIsVisible = false;
            gui.radar.fillStyle = '#8ED6FF';
            gui.radar.fillRect(w(x), w(y), 1, 1);
        }
        
        var txt = "playerIsVisible: " + playerIsVisible;
        console.log(txt);
        return playerIsVisible;
    };

    CANNONS.aitank.move = function() {
        console.log('moving tank');
        this.speed = 1.0;
        setTimeout(function() {
                CANNONS.aitank.speed = 0.0;
                CANNONS.stateManager.nextState();
            }, 10000);
    };

    CANNONS.aitank.ground();
    CANNONS.aitank.bodyMesh.rotation.y = 90 * d2r;
    CANNONS.aitank.copyPositionToBodyParts();
    CANNONS.entities.add(CANNONS.aitank);
    CANNONS.aitank.show();
    CANNONS.aitank.muzzleVelocity = 25;
    CANNONS.aitank.rotateBarrel(30);
}