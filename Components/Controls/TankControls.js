THREE.TankControls = function ( camera ) {

    this.enabled = false;
    var scope = this;
    this.audio = audio;

    camera.rotation.set( 0, 0, 0 );

    var moveForward = false;
    var moveBackward = false;
    var moveLeft = false;
    var moveRight = false;

    var velocity = new THREE.Vector3();

    var onMouseMove = function ( event ) {
        if (scope.enabled === false) return;
        var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
        player.yawObject.rotation.y -= movementX * 0.0001;
        player.pitchObject.rotation.x -= movementY * 0.00005;
        // keep barrel from going to high or low
        if (player.pitchObject.rotation.x < -0.5)
            player.pitchObject.rotation.x = -0.5;
        if (player.pitchObject.rotation.x > PI_2)
            player.pitchObject.rotation.x = PI_2;
        player.yawObject.rotation.y =
            trimRot(player.yawObject.rotation.y);
    };

    var onKeyDown = function ( event ) {
        switch ( event.keyCode ) {
            case 38: // up
            case 87: // w
                moveForward = true;
                break;
            case 40: // down
            case 83: // s
                moveBackward = true;
                break;

            case 37: /*left*/
            case 65: /*A*/ moveLeft = true; break;

            case 39: /*right*/
            case 68: /*D*/ moveRight = true; break;

            case 32: // space
                if (tank.isShooting == true)
                    return;
                player.startShot();
                break;
            case 84:
                tank.rotateBarrel(1);
                break;
            case 71:
                tank.rotateBarrel(-1);
                break;
            case 85: // u
                CANNONS.aitank.bodyMesh.rotation.y += d2r;
                break;
            case 73: // i
                CANNONS.aitank.bodyMesh.rotation.y -= d2r;
                break;
        }
    };

    var onKeyUp = function ( event ) {
        switch( event.keyCode ) {
            case 38: // up
            case 87: // w
                moveForward = false;
                break;
            case 40: // down
            case 83: // s
                moveBackward = false;
                break;

            case 37: /*left*/
            case 65: /*A*/ moveLeft = false; break;

            case 39: /*right*/
            case 68: /*D*/ moveRight = false; break;

            case 32: // space
                player.endShot();
                break;
            case 186: // ;
                //debug.toggle();
                CANNONS.entities.isTurnOver();
                break;
            case 191: // /
            	gui.lockPointer();
            	break;
            	
            case 190: // .
                gui.drawRadar();
            	CANNONS.aitank.canSeePlayer();
            	break;
        }
    };

    var onMouseDown = function ( event ) {
        player.startShot();
    }

    var onMouseUp = function( event ) {
        player.endShot();
    }

    document.addEventListener( 'mousemove', onMouseMove, false );
    document.addEventListener( 'mousedown', onMouseDown, false );
    document.addEventListener( 'mouseup', onMouseUp, false );
    document.addEventListener( 'keydown', onKeyDown, false );
    document.addEventListener( 'keyup', onKeyUp, false );

    this.moveSpeed = 25;
    this.velocityInc = 3.0;

    this.update = function ( delta ) {
        if (scope.enabled === false) return;
        if (player.canMove) {
            //delta *= 0.1;
            velocity.x += ( - velocity.x ) * this.velocityInc * delta;
            velocity.z += ( - velocity.z ) * this.velocityInc * delta;
            //velocity.y -= 0.25 * delta;
            if ( moveForward ) velocity.z -= this.moveSpeed * delta;
            if ( moveBackward ) velocity.z += this.moveSpeed * delta;

            if ( moveLeft ) velocity.x -= this.moveSpeed * delta;
            if ( moveRight ) velocity.x += this.moveSpeed * delta;

            /*if (moveForward || moveBackward) {
                this.audio.volume = 0.4;
            } else {
                this.audio.volume = 0.1;
            }*/

            player.yawObject.translateX( velocity.x );
            player.yawObject.translateY( velocity.y );
            player.yawObject.translateZ( velocity.z );

            this.ground();
        }
    };
    
	this.enable = function() {
        scope.enabled = true;
	};
	
	this.disable = function() {
        scope.enabled = false;
	};

    this.ground = function() {
        // stick player to the ground (add method to world that takes webgl coords)
        player.yawObject.position.y =
            world.getY(
                w(player.yawObject.position.x),
                w(player.yawObject.position.z)) * 100 + 200;
    }
};