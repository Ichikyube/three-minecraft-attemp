


var waypoint = false;

export var toggleWaypoint = function (scene, camera, renderer, controls) {

  console.log(waypoint);

  var el = document.getElementById("state");

  if (waypoint) {

    el.innerText = "Nav: Orbit Controls";

    controls.enablePan = true;
    controls.target = controls.target0; //or some appropriate target

    document.removeEventListener('wheel', onDocumentMouseWheel);

  } else {

    el.innerText = "Nav: Waypoint";

    var tmpObj = new THREE.Object3D();
    tmpObj.position.copy(controls.object.position);
    tmpObj.translateOnAxis(controls.object.getWorldDirection(), 0.1);

    controls.target.copy(tmpObj.position);
    controls.enablePan = false;

    controls.update();

    document.addEventListener('wheel', onDocumentMouseWheel, false);



  }

  console.log("toggled");

  waypoint = !waypoint;
};

function onDocumentMouseWheel(event) {
  var fov = camera.fov + event.deltaY * 0.05;
  camera.fov = THREE.Math.clamp(fov, 10, 75);
  camera.updateProjectionMatrix();

  //Clicking on Object
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  function onPointerMove(event) {

    // calculate pointer position in normalized device coordinates
    // (-1 to +1) for both components

    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  }
  const projector = new THREE.Projector();
  renderer.domElement.addEventListener('mousedown', function (event) {
    var vector = new THREE.Vector3(
      renderer.devicePixelRatio * (event.pageX - this.offsetLeft) /
      this.width * 2 - 1,
      -renderer.devicePixelRatio * (event.pageY - this.offsetTop) /
      this.height * 2 + 1,
      0
    );
    projector.unprojectVector(vector, camera);
    var raycaster = new THREE.Raycaster(
      camera.position,
      vector.sub(camera.position).normalize()
    );
    var intersects = raycaster.intersectObjects(OBJECTS);
    if (intersects.length) {
      // intersects[0] describes the clicked object
    }
  }, false);
}

