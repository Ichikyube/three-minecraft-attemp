/**
 * At the moment, this just handles bullets fired from tanks
 * @param mesh The "body" of the object
 * @param velocity The speed and direction of the object
 * @constructor
 */
CANNONS.Entity = function(mesh, velocity) {
    this.name = 'tank-shell';
    this.alive = true;
    this.mesh = mesh;
    this.velocity = velocity;
    this.internalClock = new THREE.Clock(true);
    this.internalClock.start();

    this.update = function(delta) {
        if (!this.isAlive()) return;
        gravity.y = - Math.pow(this.internalClock.getElapsedTime() * 0.4, 2);
        this.velocity.add(gravity);
        this.velocity.x += ( - this.velocity.x ) * delta;
        this.velocity.y += ( - this.velocity.y ) * delta;
        this.velocity.z += ( - this.velocity.z ) * delta;

        this.mesh.translateX( this.velocity.x );
        this.mesh.translateY( this.velocity.y );
        this.mesh.translateZ( this.velocity.z );

        if (this.isOutside())
            this.die();

        if (this.hitGround()) {
            new CANNONS.Explosion(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
            
            // do damage
            var disToAi = this.mesh.position.distanceTo(CANNONS.aitank.bodyMesh.position);
            var disToPlayer = this.mesh.position.distanceTo(player.getObject().position);
            console.log("distance to ai: " + disToAi + ", distance to player: " + disToPlayer);
            if (disToAi < 1000)
            	CANNONS.aitank.health -= 50;
            if (disToPlayer < 1000)
            	player.health -= 50;
            
            if (player.health <= 0)
            	CANNONS.stateManager.changeState(CANNONS.gameStates.lose);
            if (CANNONS.aitank.health <= 0)
            	CANNONS.stateManager.changeState(CANNONS.gameStates.win);
            
            this.die();
        }
    };

    this.isAlive = function() {
        return this.alive;
    };

    this.isOutside = function() {
        return world.isOutside(
            this.mesh.position.x,
            this.mesh.position.y,
            this.mesh.position.z);
    };

    this.die = function() {
        this.alive = false;
        CANNONS.entities.remove(this);
        scene.remove(this.mesh);
        this.internalClock.stop();
        setTimeout(function() { CANNONS.stateManager.nextState() }, 5000);
    };

    this.hitGround = function() {
        if (world.getYW(this.mesh.position.x, this.mesh.position.z) > this.mesh.position.y)
            return true;
        else
            return false;
    }
};