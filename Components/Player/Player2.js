
import {
  ColladaLoader
} from './assets/jsm/loaders/ColladaLoader.js';
var loader = new THREE.ColladaLoader();
loader.load('flag.dae', function (result) {
  scene.add(result.scene);
}); // result.scene.scale and result.scene.position

//jsonloader
var loader = new THREE.JSONLoader();
loader.load('model.js', function (geometry, materials) {
  var material = materials && materials.length ?
      new THREE.MeshFaceMaterial(materials) :
      new THREE.MeshBasicMaterial({
          color: 0x000000
      });
  var mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
});



//export scene
var exporter = new THREE.SceneExporter();
var output = JSON.stringify(exporter.parse(scene), null, "\t");



//morph anim
var loader = new THREE.JSONLoader();
loader.load('model.js', function (geometry) {
  var material = new THREE.MeshLambertMaterial({
      color: 0x000000,
      morphTargets: true,
      morphNormals: true,
  });
  if (geometry.morphColors && geometry.morphColors.length) {
      var colorMap = geometry.morphColors[0];
      for (var i = 0; i < colorMap.colors.length; i++) {
          geometry.faces[i].color = colorMap.colors[i];
      }
      material.vertexColors = THREE.FaceColors;
  }
  geometry.computeMorphNormals();
  var mesh = new THREE.MorphAnimMesh(geometry, material);
  mesh.duration = 5000; // in milliseconds
  scene.add(mesh);
  morphs.push(mesh);
});

for (var i = 0; i < morphs.length; i++) {
  morphs[i].updateAnimation(delta);
}

//    skeletal anim
var loader = new THREE.JSONLoader();
loader.load('model.js', function (geometry, materials) {
  for (var i = 0; i < materials.length; i++) {
      materials[i].skinning = true;
  }
  var material = new THREE.MeshFaceMaterial(materials);
  THREE.AnimationHandler.add(geometry.animation);
  var mesh = new THREE.SkinnedMesh(geometry, material, false);
  scene.add(mesh);
  var animation = new THREE.Animation(mesh, geometry.animation.name);
  animation.interpolationType = THREE.AnimationHandler.LINEAR; // orCATMULLROM for cubic splines (ease-in-out)
  animation.play();
});

THREE.AnimationHandler.update(delta);





//http://cykod.com/blog/post/2011-08-using-nodejs-and-your-phone-to-control-a-browser-game and 
//http://blog.artlogic.com/2013/06/21/phone-to-browser-html5-gaming-using-node-js-and-socket-io/
// http://www.gamepadjs.com/
//(https://github.com/austinhallock/html5-virtual-game-controller


//Web PerformanceOptimization (WPO),  https://developers.google.com/speed/docs/best-practices/rules_intro
// http://developer.yahoo.com/performance/rules.html
var texture = THREE.ImageUtils.loadCompressedTexture(imagePath);
//To create DDS images, you can use a plugin for Gimp(https://code.google.com/p/gimp-dds/) or
//Photoshop (https://developer.nvidia.com/nvidia-texture-tools-adobe-photoshop
//http://buildnewgames.com/real-time-multiplayer/
//If your game can pause, make sure you're not including time elapsed while paused.
//Before writing your own components, you may want to check out two Three.js helper libraries by Jerome Etienne: an
//extension system called tQuery and a series of utilities called THREEx,

