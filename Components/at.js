
/*
	Three.js "tutorials by example"
	Author: Lee Stemkoski
	Date: August 2013 (three.js v59)

Entry for #7dFPS 2013
	
Websites used for textures:

http://www.textures123.com/free/game-texture.html
http://www.tutorialsforblender3d.com/Textures/Textures_index.html
http://seamless-pixels.blogspot.com/

*/

// MAIN

// standard global variables
var container, scene, camera, renderer, controls, stats;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();

// custom global variables
var person; 

var gravity = new THREE.Vector3(0,-10,0);

var walls = [];

init();
animate();

// FUNCTIONS 		
function init() 
{
	// SCENE
	scene = new THREE.Scene();
	// CAMERA
	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 1, FAR = 20000;
	camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
	scene.add(camera);
	
	// RENDERER
	if ( Detector.webgl )
		renderer = new THREE.WebGLRenderer( {antialias:true} );
	else
		renderer = new THREE.CanvasRenderer(); 
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	container = document.getElementById( 'ThreeJS' );
	container.appendChild( renderer.domElement );
	// EVENTS
	THREEx.WindowResize(renderer, camera);
	THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });
	
	// STATS
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild( stats.domElement );
	// LIGHT
	var light = new THREE.DirectionalLight(0xffffff);
	light.position.set(0,250,0);
	scene.add(light);
	
	// SKYBOX/FOG
	var imagePrefix = "images/autumn-";
	var directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
	var imageSuffix = ".png";
	var skyGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );	
	
	var materialArray = [];
	for (var i = 0; i < 6; i++)
		materialArray.push( new THREE.MeshBasicMaterial({
			map: THREE.ImageUtils.loadTexture( imagePrefix + directions[i] + imageSuffix ),
			side: THREE.BackSide
		}));
	var skyMaterial = new THREE.MeshFaceMaterial( materialArray );
	var skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
	scene.add( skyBox );
	
	////////////
	// CUSTOM //
	////////////

	// person should have all sorts of things attached.
	// I like to switch between 1st person / 3rd person view (w/ visible mesh) for debugging collision detection
	person = new THREE.Object3D();
	person.add(camera);
	camera.position.set(0,35,10); // first-person view
	person.position.set(-600,100,500);
	person.rotation.y = -Math.PI / 2.0;
	
	boundingG = new THREE.CubeGeometry(40,80,40);
	// radiusAtTop, radiusAtBottom, height, segmentsAroundRadius, segmentsAlongHeight,
	// boundingG = new THREE.CylinderGeometry(20,20,80,8,2);
	// better collision but FPS drops too much
	
	boundingG.computeBoundingSphere();
	boundingM = new THREE.MeshBasicMaterial( {color:0xff0000, transparent:true, wireframe:true} );
	bounding  = new THREE.Mesh( boundingG, boundingM );
	bounding.visible = false;
	person.add(bounding);
	
	person.velocity = new THREE.Vector3(0,0,0);
	
	scene.add(person);

	var coordinator = function(z,x,y)
	{
		return new THREE.Vector3(50*x, 50*y, 50*z);
	}

	this.cubeG = [];
	cubeG[1] = new THREE.CubeGeometry( 50, 50, 50 );
	cubeG[2] = new THREE.CubeGeometry( 50, 50, 50 );
	cubeG[3] = new THREE.CubeGeometry( 50, 50, 50 );
	
	// glass
	cubeG[4] = new THREE.PlaneGeometry( 50, 50 ); // front/back walls
	cubeG[5] = new THREE.PlaneGeometry( 50, 50 ); // left/right walls
	cubeG[6] = new THREE.PlaneGeometry( 50, 50 ); // ceiling/floor
	
	// force field
	cubeG[7] = new THREE.PlaneGeometry( 50, 50 ); // front/back walls
	cubeG[8] = new THREE.PlaneGeometry( 50, 50 ); // left/right walls
	cubeG[9] = new THREE.PlaneGeometry( 50, 50 ); // ceiling/floor
	
	
	var cubeM = [];
	cubeM[1] = new THREE.MeshBasicMaterial({ map: new THREE.ImageUtils.loadTexture("images/alien-alloy.png") });
	
	// stair material; want sides different from top for greater visibility
	var m1 = new THREE.MeshBasicMaterial({ map: new THREE.ImageUtils.loadTexture("images/alien-carving.png") });
	var m2 = new THREE.MeshBasicMaterial({ map: new THREE.ImageUtils.loadTexture("images/alien-carving-gray.png") });
	var mArray = [m2,m2,m1,m1,m2,m2];
	
	cubeM[2] = new THREE.MeshFaceMaterial( mArray )
	
	cubeM[3] = new THREE.MeshBasicMaterial({ map: new THREE.ImageUtils.loadTexture("images/x-crate.png") });
	cubeM[4] = new THREE.MeshBasicMaterial({ map: new THREE.ImageUtils.loadTexture("images/blue-glowy.jpg"), transparent:true, opacity:0.5});
	cubeM[5] = new THREE.MeshBasicMaterial({ map: new THREE.ImageUtils.loadTexture("images/blue-glowy.jpg"), transparent:true, opacity:0.5});
	cubeM[6] = new THREE.MeshBasicMaterial({ map: new THREE.ImageUtils.loadTexture("images/blue-glowy.jpg"), transparent:true, opacity:0.5});
	
	///////////////////////////////////////////////////////////////////////////////////////////////
	var noiseTexture = new THREE.ImageUtils.loadTexture( 'images/cloud.png' );
	noiseTexture.wrapS = noiseTexture.wrapT = THREE.RepeatWrapping; 
		
	var baseTexture = new THREE.ImageUtils.loadTexture( 'images/electric-blue-light.jpg' );
	baseTexture.wrapS = baseTexture.wrapT = THREE.RepeatWrapping; 
	
	// use "this." to create global object
	this.customUniforms = {
		baseTexture: 	{ type: "t", value: baseTexture },
		baseSpeed: 		{ type: "f", value: 0.15 },
		noiseTexture: 	{ type: "t", value: noiseTexture },
		noiseScale:		{ type: "f", value: 0.5337 },
		alpha: 			{ type: "f", value: 1.0 },
		time: 			{ type: "f", value: 1.0 }
	};
	
	// create custom material from the shader code above
	//   that is within specially labeled script tags
	var customMaterial = new THREE.ShaderMaterial( 
	{
	    uniforms: customUniforms,
		vertexShader:   document.getElementById( 'vertexShader'   ).textContent,
		fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
		transparent: true, blending: THREE.AdditiveBlending, side:THREE.DoubleSide, alphaTest: 0.5
	}   );
	cubeM[7] = customMaterial;
	cubeM[8] = customMaterial;
	cubeM[9] = customMaterial;
	/////////////////////////////////////////////////////////////////////////////////////////////
	
	var cubeMap = [];

	// cubeMap will be recycled to hold references to meshes

	cubeMap[0] = [ [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
				   [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
				   [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
				   [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
				   [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
				   [1,2,2,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
				   [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
				   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
				   [1,0,0,0,0,0,0,0,3,3,3,3,3,1,1,1,1,1,1,1,1],
				   [1,0,0,0,0,0,0,0,3,2,2,2,3,2,2,2,2,2,2,2,1],
				   [1,0,0,0,0,0,0,0,3,2,2,2,3,2,2,2,2,2,2,2,1],
				   [1,0,0,0,0,0,0,0,3,2,2,2,3,2,2,2,2,2,2,2,1],
				   [1,0,0,0,0,0,0,0,3,3,3,3,3,1,1,1,1,2,2,2,1],
				   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,2,2,1],
				   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,2,2,1],
				   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,2,2,1],
				   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],
				   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
				   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
				   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
				   [1,1,3,0,0,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1] ];

    cubeMap[1] = [ [1,1,1,1,1,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,1],
				   [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [1,2,2,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,3,3,0,3,3,7,7,7,7,7,7,7,1],
				   [8,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,3,3,0,3,3,7,7,7,1,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,2,2,1],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
				   [1,7,3,0,0,3,7,7,7,7,7,7,7,7,7,1,1,1,1,1,1] ];
	
	cubeMap[2] = [ [1,1,1,1,1,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,1],
				   [1,2,2,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [1,2,2,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [1,2,2,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,3,0,3,0,3,7,7,7,7,7,7,7,1],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,3,0,3,0,3,7,7,7,1,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,2,2,1],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,2,2,1],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,2,2,1],
				   [1,7,3,0,0,3,7,7,7,7,7,7,7,7,7,1,1,1,1,1,1] ];
	
	cubeMap[3] = [ [1,1,1,1,1,1,7,7,7,7,7,7,7,7,7,7,7,7,7,7,1],
				   [1,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [1,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [1,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,3,3,0,3,3,7,7,7,7,7,7,7,1],
				   [8,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,3,3,0,3,3,7,7,7,1,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,1],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,0,0,0,1],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,0,0,0,1],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,0,0,0,1],
				   [1,7,3,3,3,3,7,7,7,7,7,7,7,7,7,1,1,1,1,1,1] ];
	
	cubeMap[4] = [ [1,7,7,1,1,1,1,7,7,7,7,7,7,7,7,7,7,7,7,7,1],
				   [8,0,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,3,3,3,3,3,1,1,1,1,1,1,1,1],
				   [8,0,0,0,0,0,0,0,3,0,0,0,3,9,9,9,9,9,9,9,1],
				   [8,0,0,0,0,0,0,0,3,0,0,0,3,9,9,9,9,9,9,9,1],
				   [8,0,0,0,0,0,0,0,3,0,0,0,3,9,9,9,9,9,9,9,1],
				   [8,0,0,0,0,0,0,0,3,3,3,3,3,1,1,1,1,1,1,1,1],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,1],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,1],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,1],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,1],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,0,0,0,0,8],
				   [1,7,7,7,7,7,7,7,7,7,7,7,7,7,1,1,1,1,7,7,1] ];
				   
	// second floor
   cubeMap[5] = [  [1,7,7,7,1,1,1,1,1,1,1,7,7,7,7,7,7,7,7,7,1],
				   [8,0,0,0,0,0,2,2,2,2,1,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,2,2,2,2,1,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,2,2,2,2,1,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,1,2,2,2,2,2,1,1,1,1,1,1,1,0,0,0,8],
				   [8,0,0,0,1,2,2,2,2,2,2,2,2,2,2,2,1,0,0,0,8],
				   [8,0,0,0,1,2,2,2,2,2,2,2,2,2,2,2,1,0,0,0,8],
				   [8,0,0,0,1,2,2,1,1,1,1,1,1,1,2,2,1,0,0,0,8],
				   [8,0,0,0,1,2,2,1,0,0,0,0,0,1,2,2,1,0,0,0,8],
				   [8,0,0,0,1,2,2,1,0,0,0,0,0,1,2,2,1,0,0,0,8],
				   [8,0,0,0,1,2,2,1,0,0,0,0,0,1,2,2,1,0,0,0,8],
				   [8,0,0,0,1,2,2,1,0,0,0,0,0,1,2,2,1,0,0,0,8],
				   [8,0,0,0,1,2,2,1,0,0,0,0,0,1,2,2,1,0,0,0,8],
				   [8,0,0,0,1,2,2,1,1,1,1,1,1,1,2,2,1,0,0,0,8],
				   [8,0,0,0,1,2,2,2,2,2,2,2,2,2,2,2,1,0,0,0,8],
				   [8,0,0,0,1,2,2,2,2,2,2,2,2,2,2,2,1,0,0,0,8],
				   [8,0,0,0,1,1,1,1,1,1,1,2,2,2,2,2,1,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,1,2,2,2,2,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,1,2,2,2,2,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,1,2,2,2,2,0,0,0,0,0,8],
				   [1,7,7,7,7,7,7,7,7,7,1,1,1,1,1,1,1,7,7,7,1] ];
				   
   cubeMap[6] = [  [1,7,7,7,7,1,1,1,1,1,1,7,7,7,7,7,7,7,7,7,1],
				   [8,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,1,1,0,0,0,0,1,1,1,1,1,1,1,0,0,0,8],
				   [8,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,8],
				   [8,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,8],
				   [8,0,0,0,1,0,0,1,1,1,1,1,1,1,0,0,1,0,0,0,8],
				   [8,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,8],
				   [8,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,8],
				   [8,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,8],
				   [8,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,8],
				   [8,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,8],
				   [8,0,0,0,1,0,0,1,1,1,1,1,1,1,0,0,1,0,0,0,8],
				   [8,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,8],
				   [8,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,8],
				   [8,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,1,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,8],
				   [1,7,7,7,7,7,7,7,7,7,1,1,1,1,1,1,7,7,7,7,1] ];
	
	cubeMap[7] = [ [1,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,1],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [1,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,1] ];
				   
	cubeMap[8] = [ [1,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,1],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [1,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,1] ];
	
	cubeMap[9] = [ [1,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,1],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8],
				   [1,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,1] ];
				   
	cubeMap[10] = [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
				   [1,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,1],
				   [1,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,1],
				   [1,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,1],
				   [1,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,1],
				   [1,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,1],
				   [1,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,1],
				   [1,9,9,9,9,9,9,1,1,1,1,1,1,1,9,9,9,9,9,9,1],
				   [1,9,9,9,9,9,9,1,0,0,0,0,0,1,9,9,9,9,9,9,1],
				   [1,9,9,9,9,9,9,1,0,0,0,0,0,1,9,9,9,9,9,9,1],
				   [1,9,9,9,9,9,9,1,0,0,0,0,0,1,9,9,9,9,9,9,1],
				   [1,9,9,9,9,9,9,1,0,0,0,0,0,1,9,9,9,9,9,9,1],
				   [1,9,9,9,9,9,9,1,0,0,0,0,0,1,9,9,9,9,9,9,1],
				   [1,9,9,9,9,9,9,1,1,1,1,1,1,1,9,9,9,9,9,9,1],
				   [1,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,1],
				   [1,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,1],
				   [1,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,1],
				   [1,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,1],
				   [1,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,1],
				   [1,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,1],
				   [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1] ];
				   
	// due to performance issues, merge all cubes with a given material into a single geometry
	
	var mergedGeo = [];
	for (var i = 0; i < 10; i++)
		mergedGeo[i] = new THREE.Geometry();
				   
	for (var y = 0; y < cubeMap.length;       y++)
	for (var x = 0; x < cubeMap[0].length;    x++)
	for (var z = 0; z < cubeMap[0][0].length; z++)
	{
		var style = cubeMap[y][x][z];
		if (style == 0) continue; // no cube/plane at this location
		var cube = new THREE.Mesh( cubeG[style] );
		cube.position.set(50*(cubeMap[0].length - x) , 50*y, 50*z);
		if (style == 4 || style == 7)
			cube.rotation.set(0,-Math.PI/2,0); // front/back
		if (style == 6 || style == 9)
			cube.rotation.set(-Math.PI/2,0,0); // floor/ceiling
		THREE.GeometryUtils.merge( mergedGeo[style], cube );
		
	}
	
	for (var i = 1; i < 10; i++)
	{
		var mesh = new THREE.Mesh( mergedGeo[i], cubeM[i] );
		scene.add(mesh);
		walls.push(mesh);
	}
	
	var floorT = THREE.ImageUtils.loadTexture("images/rocky-ground.jpg");
	floorT.wrapS = floorT.wrapT = THREE.RepeatWrapping;
	floorT.repeat.set(10,10);
	var floor = new THREE.Mesh( new THREE.CubeGeometry(5000,50,5000),
		new THREE.MeshBasicMaterial({
			map: floorT
		}) 
	);
	floor.position.set(0,-50,0);
	walls.push(floor);
	scene.add(floor);
	
	//// EXTRAS
	
	///////////////////////////////////////////////////////////////////////////
	// MODEL
	var jsonLoader = new THREE.JSONLoader();
	this.star = new THREE.Object3D();
	star.position.set(0,100,0);
	star.position = coordinator(10,11,2.5);
	scene.add(star);
	// triforce, bub, android, star, treasure-chest, mage, sword, flounder
	jsonLoader.load( "models/star.js", function( geometry, materials ) 
	{
		var material = new THREE.MeshFaceMaterial( materials );
		var starMesh = new THREE.Mesh( geometry, material );
		starMesh.scale.set(16,16,16);
		// star.position.set(0,100,0);
		star.add( starMesh );
	});
	// addModelToScene function is called back after model has loaded
	
	var ambientLight = new THREE.AmbientLight(0xaaaaaa);
	scene.add(ambientLight);

	///////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////
	
	// CHEAP GLOW EFFECT
	// colored sprite with alpha blending
	
	/*
	// use sprite b/c appears the same from all angles
	var spriteMaterial = new THREE.SpriteMaterial( 
	{ 
		map: new THREE.ImageUtils.loadTexture( 'images/glow.png' ), 
		useScreenCoordinates: false, alignment: THREE.SpriteAlignment.center,
		color: 0x0000ff, transparent: true, blending: THREE.AdditiveBlending
	});
	var sprite = new THREE.Sprite( spriteMaterial );
	sprite.scale.set(100, 100, 1.0);
	star.add(sprite);
	*/
	
	/*
	// apply the material to a surface.
	//  using a plane rather than a sprite b/c rotation desired
    var glowPlane = new THREE.Mesh( 
		new THREE.PlaneGeometry( 80, 80 ), 
		new THREE.MeshBasicMaterial(
		{
			map: new THREE.ImageUtils.loadTexture( "images/glow.png" ),
			side: THREE.DoubleSide,
			color: 0xffff00, transparent: true, blending: THREE.AdditiveBlending
		})
	);
	star.add( glowPlane );
	*/
	
	///////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////
	
	// Mouse Look (Free Look) controls 
	this.mouseLook = { x:0, y:0 };
	document.addEventListener( 'click', function ( event ) 
	{
		var havePointerLock = 'pointerLockElement' in document ||
						   'mozPointerLockElement' in document ||
						'webkitPointerLockElement' in document;
		if ( !havePointerLock ) return;
		
		var element = document.body;
		// Ask the browser to lock the pointer
		element.requestPointerLock = element.requestPointerLock ||
								  element.mozRequestPointerLock ||
							   element.webkitRequestPointerLock;
		// Ask the browser to lock the pointer
		element.requestPointerLock();
		
		// Hook pointer lock state change events
		document.addEventListener(      'pointerlockchange', pointerLockChange, false);
		document.addEventListener(   'mozpointerlockchange', pointerLockChange, false);
		document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
		
		// Hook mouse move events
		// document.addEventListener("mousemove", this.moveCallback, false);
		
	}, false );
}

function moveCallback(e)
{
	var movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
	var movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;
	// store movement amounts; will be processed by update function.
	mouseLook.x += movementX;
	mouseLook.y += movementY;
}

function pointerLockChange(event)
{
	var element = document.body;
	if (document.pointerLockElement       === element ||
	    document.mozPointerLockElement    === element ||
        document.webkitPointerLockElement === element) 
	{
		// Pointer was just locked, enable the mousemove listener
		document.addEventListener("mousemove", moveCallback, false);
	} 
	else 
	{
		// Pointer was just unlocked, disable the mousemove listener
		document.removeEventListener("mousemove", moveCallback, false);
	}
}

function projectXZ(v)
{ return new THREE.Vector3(v.x, 0, v.z); }

function animate() 
{
    requestAnimationFrame( animate );
	render();		
	update();
}

function update()
{
	stats.update();
	var delta = clock.getDelta(); // seconds since last update
	
	var moveDistance = 200 * delta; // 200 pixels per second  // should be velocity?
	var rotateAngle = Math.PI / 4 * delta;   // pi/4 radians (45 degrees) per second
	var cursorSpeed = 200 * delta;	
	
	if ( star != null )
		star.rotateY( rotateAngle * 0.9 );
	
	// for animated texture
	customUniforms.time.value += delta;
	
	if (keyboard.pressed("P"))
	{
		camera.position.set(0,35,10); // first-person view
		person.position.set(50,100,50);
		person.rotation.y = -Math.PI / 2.0;
		person.velocity = new THREE.Vector3(0,0,0);
	}
	
	// movement controls	
	var move = { xDist: 0, yAngle: 0, zDist: 0 };
	
	// check if browser supports gamepad and if a gamepad is plugged in.
	if ( Gamepad.supported && Gamepad.getState(0) ) 
	{
		var pad = Gamepad.getState(0);
		
		// forwards/backwards
		if (Math.abs(pad.leftStickY) > 0.15)
			move.zDist += moveDistance * pad.leftStickY;
		// strafe left/right
		if (Math.abs(pad.leftStickX) > 0.15)
			move.xDist += moveDistance * pad.leftStickX;
		
		// rotate left/right
		if (Math.abs(pad.rightStickX) > 0.15)
			move.yAngle -= rotateAngle * pad.rightStickX;
		// camera look up/down
		if (Math.abs(pad.rightStickY) > 0.15)
			camera.rotateX( -rotateAngle * pad.rightStickY );
			
		// press "A" to jump
		if ( pad.faceButton0 && (person.velocity.y == 0) )
			person.velocity = new THREE.Vector3(0,12,0);
	}
	
	
	// keyboard fallback
	
	// forwards/backwards
	if (keyboard.pressed("W"))
		move.zDist -= moveDistance;
	if (keyboard.pressed("S"))
		move.zDist += moveDistance;
	// turn left/right
	if (keyboard.pressed("Q"))
		move.yAngle += rotateAngle;
	if (keyboard.pressed("E"))
		move.yAngle -= rotateAngle;
	// left/right (strafe)
	if ( keyboard.pressed("A") )
		move.xDist -= moveDistance;
	if ( keyboard.pressed("D") )
		move.xDist += moveDistance;
		
	// process data from mouse look
	//  (if inactive, there will be no change)
	move.yAngle -= rotateAngle * mouseLook.x * 0.1;
	mouseLook.x = 0;
		
	// up/down (debugging fly)
	if ( keyboard.pressed("T") )
	{
		person.velocity = new THREE.Vector3(0,0,0);
		person.translateY( moveDistance );
	}
	if ( keyboard.pressed("G") )
	{
		person.velocity = new THREE.Vector3(0,0,0);
		person.translateY( -moveDistance );
	}
	
	person.translateZ( move.zDist );
	person.rotateY( move.yAngle );
	person.translateX( move.xDist );
	person.updateMatrix();
		
	// look up/down
	if ( keyboard.pressed("3") ) // third-person view
		camera.position.set(0,50,250);
	if ( keyboard.pressed("1") ) // first-person view
		camera.position.set(0,35,10);
	if ( keyboard.pressed("R") )
		camera.rotateX(  rotateAngle );
	if ( keyboard.pressed("F") )
		camera.rotateX( -rotateAngle );
		
	// process data from mouse look
	//  (if inactive, there will be no change)
	camera.rotateX( -rotateAngle * mouseLook.y * 0.05 );
	mouseLook.y = 0;
		
	// limit camera to +/- 45 degrees (0.7071 radians) or +/- 60 degrees (1.04 radians)
	camera.rotation.x = THREE.Math.clamp( camera.rotation.x, -1.04, 1.04 );
	// pressing both buttons moves look angle to horizon
	if ( keyboard.pressed("R") && keyboard.pressed("F") )
		camera.rotateX( -6 * camera.rotation.x * rotateAngle );
	
	// collision detection!
	if ( collision( walls ) )
	{
		person.translateX( -move.xDist );
		person.rotateY( -move.yAngle );
		person.translateZ( -move.zDist );
		person.updateMatrix();
		
		if ( collision( walls ) )
			console.log( "Something's wrong with collision..." );
		
	}
	
	// TODO: make sure there is no double-jump glitch
	//	(e.g. hold down space sometimes results in double-jump)
	if ( keyboard.pressed("space") && (person.velocity.y == 0) )
		person.velocity = new THREE.Vector3(0,12,0);
	
	person.velocity.add( gravity.clone().multiplyScalar( delta ) );
	person.translateY( person.velocity.y );
	person.updateMatrix();
	if ( collision(walls) )
	{
		person.translateY( -person.velocity.y );
		person.updateMatrix();
		person.velocity = new THREE.Vector3(0,0,0);
	}
	
	
	
} // end of function update()

// returns true on intersection
function collision( wallArray )
{
	/*
	// coarse collision detection, create a list of candidates to check thoroughly
	var candidates = [];
	for (var i = 0; i < walls.length; i++)
	{
		if ( person.position.distanceTo(wallArray[i].position) < 
				(person.children[1].geometry.boundingSphere.radius + wallArray[i].geometry.boundingSphere.radius) )
			candidates.push( wallArray[i] );
	}
	*/

	// send rays from center of person to each vertex in bounding geometry
	for (var vertexIndex = 0; vertexIndex < person.children[1].geometry.vertices.length; vertexIndex++)
	{		
		var localVertex = person.children[1].geometry.vertices[vertexIndex].clone();
		var globalVertex = localVertex.applyMatrix4( person.matrix );
		var directionVector = globalVertex.sub( person.position );
		
		var ray = new THREE.Raycaster( person.position, directionVector.clone().normalize() );
		var collisionResults = ray.intersectObjects( wallArray );
		if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ) 
			return true;
	}
	return false;
}

function render() 
{
	renderer.render( scene, camera );
}

