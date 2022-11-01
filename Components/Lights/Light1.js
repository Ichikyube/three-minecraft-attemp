import * as THREE from 'three';
export function initLights(lights, helpers, update) {
    var ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5);

    var spotLight2 = new THREE.SpotLight(0xFF45F6, 25);
    spotLight2.position.set(0, 23, 0);
    let light = new THREE.PointLight(0xf4b400, 1);
    light.position.set(16, 78, 1.5);
    var light1 = new THREE.PointLight(0xff0040, 4, 50);
    var light2 = new THREE.PointLight(0x0040ff, 3, 50);
    var light3 = new THREE.PointLight(0x80ff80, 4, 50);
    var directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
    const targetObject = new THREE.Object3D();
    directionalLight.target = targetObject;
    directionalLight.position.set(0, 41, 0);
    lights.push(ambientLight, directionalLight, spotLight2, targetObject, light, light1, light2,
        light3);
    update.push(function () { //     
        var time = Date.now() * 0.0005;
        light1.position.x = Math.sin(time * 0.7) * 30;
        light1.position.y = Math.cos(time * 0.5) * 40;
        light1.position.z = Math.cos(time * 0.3) * 30;
        light2.position.x = Math.cos(time * 0.3) * 30;
        light2.position.y = Math.sin(time * 0.5) * 40;
        light2.position.z = Math.sin(time * 0.7) * 30;
        light3.position.x = Math.sin(time * 0.7) * 30;
        light3.position.y = Math.cos(time * 0.3) * 40;
        light3.position.z = Math.sin(time * 0.5) * 30;
    })
    light.castShadow = false; // default false
    directionalLight.castShadow = true;
    const lightHelper = new THREE.DirectionalLightHelper(directionalLight);
    const shadowCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
    const pointLightHelper = new THREE.PointLightHelper(light, 1);
    helpers.push(pointLightHelper, lightHelper, shadowCameraHelper);
}