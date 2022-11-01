
        "nature": {
            "type":"basic",
            "patterns": {
                "bushes":{
                    "freqX":5,
                    "freqZ":5,
                    "elements":[
                        {"object":"../data/graphics/textures/vegetation/grass.png","width":1.5,"height":1.5},
                        {"object":"../data/graphics/textures/vegetation/struik.png","width":1.5,"height":1.5}
                    ]
                },
                "forest":{
                    "freqX":10,
                    "freqZ":10,
                    "elements":[
                        {"object":"../data/graphics/textures/vegetation/tree01.png","width":8.75,"height":8.91},
                        {"object":"../data/graphics/textures/vegetation/tree02.png","width":10,"height":9.84},
                        {"object":"../data/graphics/textures/vegetation/tree03.png","width":9.59,"height":8.65},
                        {"object":"../data/graphics/textures/vegetation/tree04.png","width":6.1,"height":8.65},
                        {"object":"../data/graphics/textures/vegetation/tree05.png","width":10,"height":7.66},
                        {"object":"../data/graphics/textures/vegetation/tree06.png","width":8.94,"height":13.9},
                        {"object":"../data/graphics/textures/vegetation/tree07.png","width":10.2,"height":14.53}
                    ]
                }
            },
            "zones": [
                {"pattern":"forest","minX":-30,"minZ":-30,"maxZ":150,"maxX":150},
                {"pattern":"bushes","minX":-10,"minZ":-30,"maxZ":140,"maxX":140},
            ]
            drawNature = function () {

                var nat=$WORLD.map.nature;
                //CARGAR EN MEMORIA TODOS LOS SPRITES
                var list=Object.keys(nat.patterns);
                for (var i=0;i<list.length;i++) {
                    var pat=nat.patterns[list[i]];
                    for (var n=0;n<pat.elements.length;n++) {
                        var el=pat.elements[n];
                        var mat = new THREE.SpriteMaterial( { map: $WORLD.textureLoader.load(el.object), useScreenCoordinates: false, transparent: true,fog:true} );
                        var obj =new THREE.Sprite(mat);
                        obj.scale.y=el.height;
                        obj.scale.x=el.width;
                        el._sprite = obj;
                    }
                }
                //PARA CADA ZONA AÑADIR LOSaerboles
                for (var j=0;j<nat.zones.length;j++) {
                    var zon=nat.zones[j];
                    var pat=nat.patterns[zon.pattern];
                    for (var x=zon.minX;x<zon.maxX-pat.freqX;x+=pat.freqX) {
                        for (var z=zon.minZ;z<zon.maxZ-pat.freqZ;z+=pat.freqZ) {
                            var i=Math.round(Math.random()*(pat.elements.length-1));
                            var el=pat.elements[i];
                            var obj2=el._sprite.clone();z
                            obj2.position.set(x+(Math.random()*pat.freqX), el.height/2-0.05, z+(Math.random()*pat.freqZ));
                            $WORLD.scene.add(obj2);
                        }
                    }
                }
        };

        light.position.set(sky.sunlightposition.x, sky.sunlightposition.y, sky.sunlightposition.z); 
        light.target = $WORLD.sky.skyBox;
        
        $WORLD.scene.fog.near = sky.fogNear;
        if (sky.fogFar > 0 && ($WORLD.distance - $WORLD.distance / 4) > sky.fogFar) {
            $WORLD.scene.fog.far = sky.fogFar;
        }
        $WORLD.scene.fog.color = new THREE.Color(sky.fogColor);
        $WORLD.renderer.setClearColor($WORLD.scene.fog.color, 1);
        
        $WORLD.addToListUpdate ($WORLD.sky);
        
    var skyBoxMaterial = new THREE.ShaderMaterial( {
        fragmentShader: shader.fragmentShader,
        vertexShader: shader.vertexShader,
        uniforms: shader.uniforms,
        depthWrite: false,
        side: THREE.BackSide
        });        
        drawSky = function () {
            var sky = $WORLD.map.sky;
            if (sky.type=="skybox"){
                $WORLD.drawSkybox(sky);
            } else if (sky.type=="skysphere" && sky.texture!="") {
                $WORLD.drawSkysphere(sky);
            } else {
                $WORLD.drawSkysphereNoImg(sky);
            }

        }

        scene.fog.near = sky.fogNear;
    if (sky.fogFar > 0 && ($WORLD.distance - $WORLD.distance / 4) > sky.fogFar) {
        $WORLD.scene.fog.far = sky.fogFar;
    }
    $WORLD.scene.fog.color = new THREE.Color(sky.fogColor);
    $WORLD.renderer.setClearColor($WORLD.scene.fog.color, 1);

    drawSkybox=function (sky){
        var cubemap = new THREE.CubeTextureLoader().load( sky.texture );
        cubemap.format = THREE.RGBFormat;
            
        var shader = THREE.ShaderLib['cube']; 
        shader.uniforms['tCube'].value = cubemap; 
    
        var skyBoxMaterial = new THREE.ShaderMaterial( {
        fragmentShader: shader.fragmentShader,
        vertexShader: shader.vertexShader,
        uniforms: shader.uniforms,
        depthWrite: false,
        side: THREE.BackSide
        });
        
        var distance=($WORLD.distance*2-20);
        var c = Math.pow ((distance*distance)/2,0.5);
        var skyBox = new THREE.Mesh(  new THREE.BoxGeometry(c, c, c),  skyBoxMaterial);
        $WORLD.scene.add(skyBox);
        $WORLD.sky.skyBox = skyBox;
    
    };

    drawSkysphere=function (sky){
        var skyTexture = $WORLD.textureLoader.load(sky.texture);
        var geometry = new THREE.SphereGeometry($WORLD.distance - 10, 30, 20);
    
        var uniforms = {
            texture: { type: 't', value: skyTexture }
        };
        var material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: "varying vec2 vUV;" +
            "\n" +
            "void main() {  " +
            "    vUV = uv;" +
            "    vec4 pos = vec4(position, 1.0);" +
            "    gl_Position = projectionMatrix * modelViewMatrix * pos;" +
            "}",
            fragmentShader: "uniform sampler2D texture;" +
            "varying vec2 vUV;" +
            "" +
            "    void main() {" +
            "        vec4 sample = texture2D(texture, vUV);" +
            "        gl_FragColor = vec4(sample.xyz, sample.w);" +
            "    }"
        });
    
        var skyBox = new THREE.Mesh(geometry, material);
        skyBox.scale.set(-1, 1, 1);
        skyBox.rotation.order = 'XZY';
        skyBox.renderDepth = $WORLD.distance;
        $WORLD.scene.add(skyBox);
        $WORLD.sky.skyBox = skyBox;
    };


    var map = $WORLD.map;
    var groundTexture = $WORLD.textureLoader.load(map.ground.texture);
    var x = $WORLD.distance * 2.25 + map.x
    var z = $WORLD.distance * 2.25 + map.z
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(x / 2, z / 2); 
    groundTexture.anisotropy = 16;
    var groundMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff, map: groundTexture });
    var mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(x, z), groundMaterial);
    mesh.position.y = 0;
    mesh.position.x = map.x / 2;
    mesh.position.z = map.z / 2;
    mesh.rotation.x = - Math.PI / 2;
    mesh.receiveShadow = true;
    $WORLD.scene.add(mesh);

    drawGround = function () {
        var map = $WORLD.map;
        var groundTexture = $WORLD.textureLoader.load(map.ground.texture);
        var x = $WORLD.distance * 2.25 + map.x
        var z = $WORLD.distance * 2.25 + map.z
        groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
        groundTexture.repeat.set(x / 2, z / 2); 
        groundTexture.anisotropy = 16;
        var groundMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff, map: groundTexture });
        var mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(x, z), groundMaterial);
        mesh.position.y = 0;
        mesh.position.x = map.x / 2;
        mesh.position.z = map.z / 2;
        mesh.rotation.x = - Math.PI / 2;
        mesh.receiveShadow = true;
    
$WORLD.startAnimation = function () {
    $WORLD.animate();
}

$WORLD.pauseAnimation = function () {
    window.cancelAnimationFrame( $WORLD.idAnim );
}

$WORLD.addToListUpdate = function (obj) {
    $WORLD._objUpdate.push(obj);
}

$WORLD.animate = function () {
    $WORLD.idAnim = requestAnimationFrame($WORLD.animate);
    var delta = $WORLD.clock.getDelta();
    for (var i = 0; i < $WORLD._objUpdate.length; i++) {
        $WORLD._objUpdate[i].update(delta);
    };
    THREE.AnimationHandler.update(delta);
    $WORLD.renderer.render($WORLD.scene, $WORLD.camera);

};
