
     document.getElementById("tour").addEventListener('click', function () {
        store.lockControl();
    }, false);
    function Store3D() {
        this.spriteIsShow=1; // There are sprite systems, such as labels
    }
    Store3D.prototype.lockControl=function() {
        if(this.spriteIsShow==1) // If there is energy in the scene during locking, the system will report an error 
        {
            this.changeSpriteShow(); // Therefore, before locking, call the method to hide the wizard system. The specific wizard system can understand it by itself
        }
        // Because we want to simulate the first person entering the scene, we change the position of the camera
        this.camera.position.y = 100; 
        // Change the camera's angle of view
        this.camera.lookAt(0,100,0);
        // Simulate human eyes. Human eyes are equivalent to the current position of the camera
        this.lockcontrols.getObject().position.x =0;
        this.lockcontrols.getObject().position.y =100;
        this.lockcontrols.getObject().position.z =580;
        this.lockcontrols.lock(); // Call lock to lock the mouse control
    },

    //first person perspective movement

    Store3D.prototype.firstPersonMove=function(){
        // If it is currently locked, move the first view
        if ( this.lockcontrols.isLocked === true ) {
            // First, set up rays for collision test
            // The initial position of the ray is the position of the first person object, so its direction is the direction of the object in front of me
            this.raycaster.ray.origin.copy( this.lockcontrols.getObject().position );
            // For example, we only detect the vertical direction
            // Then the position he is facing is down from the current position
            this.raycaster.ray.origin.y -= 10;
            // Check whether they intersect. If they intersect, put all objects into the variable intersections
            var intersections = this.raycaster.intersectObjects( this.objects );
            // If intersections If the length is greater than 0, it indicates that it intersects with the following objects. At this time, set onObject to true
            var onObject = intersections.length > 0;
            // Get the last interval every time, because the time of each call to the loop function is different according to different performance
            var time = performance.now();
            // In order to prevent performance from affecting the speed of operation, we set it to a factor. If the performance is high, the interval is short
            var delta = ( time - this.prevTime ) / 1000;
            // Set the (10) deceleration factor. The faster he is, the slower the whole process will be, and the faster the deceleration process will be
            this.velocity.x -= this.velocity.x * 10.0 * delta;
            this.velocity.z -= this.velocity.z * 10.0 * delta;
            this.velocity.y -= 9.8 * 100.0 * delta; // y-axis jump speed 100.0 = mass 
            
            // The variable that controls the direction when the mouse is operated
            // If a positive number is forward, a negative number is backward
            this.direction.z = Number( this.moveForward ) - Number( this.moveBackward );
            this.direction.x = Number( this.moveLeft ) - Number( this.moveRight );
            // this ensures consistent movements in all directions
            this.direction.normalize(); 
            //Note the velocity vector, which is a buffer value. In order to ensure that the scene does not pause directly after the mouse is raised, but has a short transition effect:
            if ( this.moveForward || this.moveBackward ) this.velocity.z -= this.direction.z * 2000.0 * delta;
            if ( this.moveLeft || this.moveRight ) this.velocity.x -= this.direction.x * 2000.0 * delta;
    
    // If onObject is true,
            if ( onObject === true ) {
                // At this time, you need to set the speed of the y-axis to 0 and the maximum value of the previous speed
                this.velocity.y = Math.max( 0, this.velocity.y );
                this.canJump = true;
            }
    // Calculate the distance of each movement on the X, y and Z axes
            this.lockcontrols.getObject().translateX( this.velocity.x * delta );
            this.lockcontrols.getObject().position.y += ( this.velocity.y * delta ); // new behavior
            this.lockcontrols.getObject().translateZ( this.velocity.z * delta );
    // In order to ensure that I am always above the ground, I set y equal to 100 when y is less than 100
            if ( this.lockcontrols.getObject().position.y < 100 ) {
                this.velocity.y = 0;
                this.lockcontrols.getObject().position.y = 100;
                this.canJump = true;
            }
            this.prevTime = time;
        }
    },
  /**
     * Initialize PointLockControl
     * Set mouse control
     */
    Store3D.prototype.initPointLockControl=function(object){
        this.lockcontrols = new THREE.PointerLockControls( this.camera );
        this.raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );
        // Set keyboard press listening event
        var onKeyDown = function ( event ) {
            switch ( event.keyCode ) {
                case 38: // up
                case 87: // w
                    object.moveForward = true;
                    break;
                case 37: // left
                case 65: // a
                    object.moveLeft = true;
                    break;
                case 40: // down
                case 83: // s
                    object.moveBackward = true;
                    break;
                case 39: // right
                case 68: // d
                    object.moveRight = true;
                    break;
                case 32: // space
                    if ( object.canJump === true ) object.velocity.y += 350;
                    object.canJump = false;
                    break;
            }
        };
        // Set keyboard monitoring events
        var onKeyUp = function ( event ) {
            switch ( event.keyCode ) {
                case 38: // up
                case 87: // w
                    object.moveForward = false;
                    break;
                case 37: // left
                case 65: // a
                    object.moveLeft = false;
                    break;
                case 40: // down
                case 83: // s
                    object.moveBackward = false;
                    break;
                case 39: // right
                case 68: // d
                    object.moveRight = false;
                    break;
            }
        };
        document.addEventListener( 'keydown', onKeyDown, false );
        document.addEventListener( 'keyup', onKeyUp, false );
    }