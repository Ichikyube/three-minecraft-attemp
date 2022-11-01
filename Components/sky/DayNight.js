import * as THREE from 'three';
export var currentPhase = function (sunAngle) {
    if (Math.sin(sunAngle) > Math.sin(0)) {
        return 'day'
    } else if (Math.sin(sunAngle) > Math.sin(-Math.PI / 6)) {
        return 'twilight'
    } else {
        return 'night'
    }
}
var Sun; 
const SHADOW_MAP_Sun = 1524;
const DsArea = 70;
export var SunSphere = function () {
    var geometry = new THREE.SphereGeometry(20, 30, 30)
    var material = new THREE.MeshBasicMaterial({
        color: 0xff0000
    })
    var mesh = new THREE.Mesh(geometry, material)
    this.object3d = mesh
    var xRot = 0;
    this.update = function (sunAngle) {
        xRot += 0.02;
        mesh.rotation.x = xRot;
        mesh.rotation.y = xRot;
        mesh.rotation.z = xRot;
        mesh.position.x = 0;
        mesh.position.y = Math.sin(sunAngle) * 400; //500 * Math.sin(degrees_to_radians(xRot * 100));
        mesh.position.z = Math.cos(sunAngle) * 400; //500 * Math.cos(degrees_to_radians(xRot * 100));
        Sun.position.copy(this.object3d.position)
        var phase = currentPhase(sunAngle)
        if (phase === 'day') {
            mesh.material.color.set("rgb(255," + (Math.floor(Math.sin(sunAngle) * 200) + 55) + "," + (
                Math.floor(Math.sin(sunAngle) * 200) + 5) + ")");
        } else if (phase === 'twilight') {
            mesh.material.color.set("rgb(255,55,5)");
        } else {}
    }
}
export var SunShine = function (scene) {
    Sun = new THREE.DirectionalLight(0xbb1133, 1);
    const targetObject = new THREE.Object3D();
    targetObject.position.set(0, 0, 0)
    Sun.target = targetObject;
    Sun.castShadow = true;
    let lightHelper = new THREE.DirectionalLightHelper(Sun, 10);
    let shadowCameraHelper = new THREE.CameraHelper(Sun.shadow.camera);
    scene.add(Sun, lightHelper, targetObject)
    Sun.target.updateMatrixWorld();
    lightHelper.parent.updateMatrixWorld();
    lightHelper.update();
    lightHelper.visible = false;

    Sun.shadow.darkness = 6;
    Sun.shadow.radius = 3;
    Sun.shadow.blurSamples = 15;
    Sun.shadow.mapSize.width = SHADOW_MAP_Sun;
    Sun.shadow.mapSize.height = SHADOW_MAP_Sun;
    Sun.shadow.bias = -0.0001;
    Sun.shadow.camera.near = 60;
    Sun.shadow.camera.far = 1000;
    // DirectionalLight only; not necessary for PointLight
    Sun.shadow.camera.left = -DsArea;
    Sun.shadow.camera.right = DsArea;
    Sun.shadow.camera.top = DsArea;
    Sun.shadow.camera.bottom = -DsArea;
    Sun.shadow.camera.visible = true;
    Sun.shadow.cascade = true;
    Sun.shadow.cascadeCount = 3;
    Sun.shadow.cascadeNearZ = [-1.000, 0.995, 0.998];
    Sun.shadow.cascadeFarZ = [0.995, 0.998, 1.000];
    Sun.shadow.cascadeWidth = [1024, 1024, 1024];
    Sun.shadow.cascadeHeight = [1024, 1024, 1024];
}
export var SunLight = function () {
    var light = new THREE.DirectionalLight(0xffffff, 1);
    this.object3d = light

    this.update = function (sunAngle) {
        light.position.x = 0;
        light.position.y = Math.sin(sunAngle) * 90000;
        light.position.z = Math.cos(sunAngle) * 90000;
        // console.log('Phase ', currentPhase(sunAngle))
        
        var phase = currentPhase(sunAngle)
        if (phase === 'day') {
            light.color.set("rgb(255," + (Math.floor(Math.sin(sunAngle) * 200) + 55) + "," + (Math
                .floor(Math.sin(sunAngle) * 200)) + ")");
        } else if (phase === 'twilight') {
            light.intensity = 1;
            light.color.set("rgb(" + (255 - Math.floor(Math.sin(sunAngle) * 510 * -1)) + "," + (55 -
                Math.floor(Math.sin(sunAngle) * 110 * -1)) + ",0)");
        } else {
            light.intensity = 0;
        }
    }
}
export var StarField = function () {
    var distance = 100;
    // create the mesh
    var texture = new THREE.TextureLoader().load('../assets/textures/' + 'galaxy_starfield.png')
    var material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide,
        color: 0x808080,
    })
    var geometry = new THREE.SphereGeometry(distance - 10, 32, 32)
    var mesh = new THREE.Mesh(geometry, material)
    this.object3d = mesh
    this.object3d.rotation.order = 'XZY';
    this.object3d.renderDepth = distance;

    this.update = function (sunAngle) {
        var phase = currentPhase(sunAngle)
        if (phase === 'day') {
            mesh.visible = false
        } else if (phase === 'twilight') {
            mesh.visible = false
        } else {
            mesh.visible = true
            mesh.rotation.y = sunAngle / 5
            var intensity = Math.abs(Math.sin(sunAngle))
            material.color.setRGB(intensity, intensity, intensity)
        }
    }
}

export var Skydom = function () {
    var distance = 1000;
    var geometry = new THREE.SphereGeometry(distance - 10, 30, 20);
    var material = new THREE.ShaderMaterial({
        vertexShader: SkydomShader.vertexShader,
        fragmentShader: SkydomShader.fragmentShader,
        uniforms: SkydomShader.uniforms,
        side: THREE.BackSide
    });

    var mesh = new THREE.Mesh(geometry, material);
    this.object3d = mesh
    //mesh.scale.set(-1, 1, 1);mesh.position.set(0, 0, 0);
    this.object3d.rotation.order = 'XZY';
    this.object3d.renderDepth = distance;


    this.update = function (sunAngle) {
        var phase = currentPhase(sunAngle)
        if (phase === 'day') {
            SkydomShader.uniforms.topColor.value.set("rgb(0,120,255)");
            SkydomShader.uniforms.bottomColor.value.set("rgb(255," + (Math.floor(Math.sin(sunAngle) * 200) + 55) +
                "," + (Math.floor(Math.sin(sunAngle) * 200)) + ")");
        } else if (phase === 'twilight') {
            SkydomShader.uniforms.topColor.value.set("rgb(0," + (120 - Math.floor(Math.sin(sunAngle) * 240 * -1)) +
                "," + (255 - Math.floor(Math.sin(sunAngle) * 510 * -1)) + ")");
            SkydomShader.uniforms.bottomColor.value.set("rgb(" + (255 - Math.floor(Math.sin(sunAngle) * 510 * -1)) +
                "," + (55 - Math.floor(Math.sin(sunAngle) * 110 * -1)) + ",0)");
        } else {
            SkydomShader.uniforms.topColor.value.set('black')
            SkydomShader.uniforms.bottomColor.value.set('black');
        }
    }
}
const SkydomShader = {

    uniforms: {
        topColor: {
            type: "c",
            value: new THREE.Color().setHSL(0.6, 1, 0.75)
        },
        bottomColor: {
            type: "c",
            value: new THREE.Color(0xffffff)
        },
        offset: {
            type: "f",
            value: 400
        },
        exponent: {
            type: "f",
            value: 0.6
        },
    },

    vertexShader: /* glsl */ `    
    varying vec3 vWorldPosition;

    void main() {

        vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
        vWorldPosition = worldPosition.xyz;

        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`,

    fragmentShader: /* glsl */ `

    uniform vec3 topColor;
    uniform vec3 bottomColor;
    uniform float offset;
    uniform float exponent;

    varying vec3 vWorldPosition;

    void main() {

        float h = normalize( vWorldPosition + offset ).y;
        gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h, 0.0 ), exponent ), 0.0 ) ), 1.0 );
    }`

};