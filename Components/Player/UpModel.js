
// CHARACTER

const configOgro = {

    baseUrl: 'models/md2/ogro/',
    body: 'ogro.md2',
    skins: ['grok.jpg', 'ogrobase.png', 'arboshak.png', 'ctf_r.png', 'ctf_b.png', 'darkam.png',
        'freedom.png',
        'gib.png', 'gordogh.png', 'igdosh.png', 'khorne.png', 'nabogro.png',
        'sharokh.png'
    ],
    weapons: [
        ['weapon.md2', 'weapon.jpg']
    ],
    animations: {
        move: 'run',
        idle: 'stand',
        jump: 'jump',
        attack: 'attack',
        crouchMove: 'cwalk',
        crouchIdle: 'cstand',
        crouchAttach: 'crattack'
    },

    walkSpeed: 350,
    crouchSpeed: 175

};

const nRows = 1;
const nSkins = configOgro.skins.length;

nCharacters = nSkins * nRows;

for (let i = 0; i < nCharacters; i++) {

    const character = new MD2CharacterComplex();
    character.scale = 3;
    character.controls = controls;
    characters.push(character);

}

const baseCharacter = new MD2CharacterComplex();
baseCharacter.scale = 3;

baseCharacter.onLoadComplete = function () {

    let k = 0;

    for (let j = 0; j < nRows; j++) {

        for (let i = 0; i < nSkins; i++) {

            const cloneCharacter = characters[k];

            cloneCharacter.shareParts(baseCharacter);

            // cast and receive shadows
            cloneCharacter.enableShadows(true);

            cloneCharacter.setWeapon(0);
            cloneCharacter.setSkin(i);

            cloneCharacter.root.position.x = (i - nSkins / 2) * 150;
            cloneCharacter.root.position.z = j * 250;

            scene.add(cloneCharacter.root);

            k++;

        }

    }

    const gyro = new Gyroscope();
    gyro.add(camera);
    gyro.add(light, light.target);

    characters[Math.floor(nSkins / 2)].root.add(gyro);

};

baseCharacter.loadParts(configOgro);


let model, skeleton, mixer;

const crossFadeControls = [];

let currentBaseAction = 'idle';
const allActions = [];
const baseActions = {
    idle: {
        weight: 1
    },
    walk: {
        weight: 0
    },
    run: {
        weight: 0
    }
};
const additiveActions = {
    sneak_pose: {
        weight: 0
    },
    sad_pose: {
        weight: 0
    },
    agree: {
        weight: 0
    },
    headShake: {
        weight: 0
    }
};

let panelSettings, numAnimations;
const loader = new GLTFLoader();

loader.load('models/gltf/Xbot.glb', function (gltf) {

    model = gltf.scene;
    scene.add(model);

    model.traverse(function (object) {

        if (object.isMesh) object.castShadow = true;

    });

    skeleton = new THREE.SkeletonHelper(model);
    skeleton.visible = false;
    scene.add(skeleton);

    const animations = gltf.animations;
    mixer = new THREE.AnimationMixer(model);

    numAnimations = animations.length;

    for (let i = 0; i !== numAnimations; ++i) {

        let clip = animations[i];
        const name = clip.name;

        if (baseActions[name]) {

            const action = mixer.clipAction(clip);
            activateAction(action);
            baseActions[name].action = action;
            allActions.push(action);

        } else if (additiveActions[name]) {

            // Make the clip additive and remove the reference frame

            THREE.AnimationUtils.makeClipAdditive(clip);

            if (clip.name.endsWith('_pose')) {

                clip = THREE.AnimationUtils.subclip(clip, clip.name, 2, 3, 30);

            }

            const action = mixer.clipAction(clip);
            activateAction(action);
            additiveActions[name].action = action;
            allActions.push(action);

        }

    }

})










import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let scene, renderer, camera, stats;
let model, skeleton, mixer, clock;

const crossFadeControls = [];

let idleAction, walkAction, runAction;
let idleWeight, walkWeight, runWeight;
let actions, settings;

let singleStepMode = false;
let sizeOfNextStep = 0;

init();

function init() {

    const container = document.getElementById( 'container' );

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.set( 1, 2, - 3 );
    camera.lookAt( 0, 1, 0 );

    clock = new THREE.Clock();

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xa0a0a0 );
    scene.fog = new THREE.Fog( 0xa0a0a0, 10, 50 );

    const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
    hemiLight.position.set( 0, 20, 0 );
    scene.add( hemiLight );

    const dirLight = new THREE.DirectionalLight( 0xffffff );
    dirLight.position.set( - 3, 10, - 10 );
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 2;
    dirLight.shadow.camera.bottom = - 2;
    dirLight.shadow.camera.left = - 2;
    dirLight.shadow.camera.right = 2;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 40;
    scene.add( dirLight );

    // scene.add( new THREE.CameraHelper( dirLight.shadow.camera ) );

    // ground

    const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100 ), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } ) );
    mesh.rotation.x = - Math.PI / 2;
    mesh.receiveShadow = true;
    scene.add( mesh );

    const loader = new GLTFLoader();
    loader.load( 'models/gltf/Soldier.glb', function ( gltf ) {

        model = gltf.scene;
        scene.add( model );

        model.traverse( function ( object ) {

            if ( object.isMesh ) object.castShadow = true;

        } );

        //

        skeleton = new THREE.SkeletonHelper( model );
        skeleton.visible = false;
        scene.add( skeleton );

        //

        createPanel();


        //

        const animations = gltf.animations;

        mixer = new THREE.AnimationMixer( model );

        idleAction = mixer.clipAction( animations[ 0 ] );
        walkAction = mixer.clipAction( animations[ 3 ] );
        runAction = mixer.clipAction( animations[ 1 ] );

        actions = [ idleAction, walkAction, runAction ];

        activateAllActions();

        animate();

    } );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    container.appendChild( renderer.domElement );

    stats = new Stats();
    container.appendChild( stats.dom );

    window.addEventListener( 'resize', onWindowResize );

}

function createPanel() {

    const panel = new GUI( { width: 310 } );

    const folder1 = panel.addFolder( 'Visibility' );
    const folder2 = panel.addFolder( 'Activation/Deactivation' );
    const folder3 = panel.addFolder( 'Pausing/Stepping' );
    const folder4 = panel.addFolder( 'Crossfading' );
    const folder5 = panel.addFolder( 'Blend Weights' );
    const folder6 = panel.addFolder( 'General Speed' );

    settings = {
        'show model': true,
        'show skeleton': false,
        'deactivate all': deactivateAllActions,
        'activate all': activateAllActions,
        'pause/continue': pauseContinue,
        'make single step': toSingleStepMode,
        'modify step size': 0.05,
        'from walk to idle': function () {

            prepareCrossFade( walkAction, idleAction, 1.0 );

        },
        'from idle to walk': function () {

            prepareCrossFade( idleAction, walkAction, 0.5 );

        },
        'from walk to run': function () {

            prepareCrossFade( walkAction, runAction, 2.5 );

        },
        'from run to walk': function () {

            prepareCrossFade( runAction, walkAction, 5.0 );

        },
        'use default duration': true,
        'set custom duration': 3.5,
        'modify idle weight': 0.0,
        'modify walk weight': 1.0,
        'modify run weight': 0.0,
        'modify time scale': 1.0
    };

    folder1.add( settings, 'show model' ).onChange( showModel );
    folder1.add( settings, 'show skeleton' ).onChange( showSkeleton );
    folder2.add( settings, 'deactivate all' );
    folder2.add( settings, 'activate all' );
    folder3.add( settings, 'pause/continue' );
    folder3.add( settings, 'make single step' );
    folder3.add( settings, 'modify step size', 0.01, 0.1, 0.001 );
    crossFadeControls.push( folder4.add( settings, 'from walk to idle' ) );
    crossFadeControls.push( folder4.add( settings, 'from idle to walk' ) );
    crossFadeControls.push( folder4.add( settings, 'from walk to run' ) );
    crossFadeControls.push( folder4.add( settings, 'from run to walk' ) );
    folder4.add( settings, 'use default duration' );
    folder4.add( settings, 'set custom duration', 0, 10, 0.01 );
    folder5.add( settings, 'modify idle weight', 0.0, 1.0, 0.01 ).listen().onChange( function ( weight ) {

        setWeight( idleAction, weight );

    } );
    folder5.add( settings, 'modify walk weight', 0.0, 1.0, 0.01 ).listen().onChange( function ( weight ) {

        setWeight( walkAction, weight );

    } );
    folder5.add( settings, 'modify run weight', 0.0, 1.0, 0.01 ).listen().onChange( function ( weight ) {

        setWeight( runAction, weight );

    } );
    folder6.add( settings, 'modify time scale', 0.0, 1.5, 0.01 ).onChange( modifyTimeScale );

    folder1.open();
    folder2.open();
    folder3.open();
    folder4.open();
    folder5.open();
    folder6.open();

}


function showModel( visibility ) {

    model.visible = visibility;

}


function showSkeleton( visibility ) {

    skeleton.visible = visibility;

}


function modifyTimeScale( speed ) {

    mixer.timeScale = speed;

}


function deactivateAllActions() {

    actions.forEach( function ( action ) {

        action.stop();

    } );

}

function activateAllActions() {

    setWeight( idleAction, settings[ 'modify idle weight' ] );
    setWeight( walkAction, settings[ 'modify walk weight' ] );
    setWeight( runAction, settings[ 'modify run weight' ] );

    actions.forEach( function ( action ) {

        action.play();

    } );

}

function pauseContinue() {

    if ( singleStepMode ) {

        singleStepMode = false;
        unPauseAllActions();

    } else {

        if ( idleAction.paused ) {

            unPauseAllActions();

        } else {

            pauseAllActions();

        }

    }

}

function pauseAllActions() {

    actions.forEach( function ( action ) {

        action.paused = true;

    } );

}

function unPauseAllActions() {

    actions.forEach( function ( action ) {

        action.paused = false;

    } );

}

function toSingleStepMode() {

    unPauseAllActions();

    singleStepMode = true;
    sizeOfNextStep = settings[ 'modify step size' ];

}

function prepareCrossFade( startAction, endAction, defaultDuration ) {

    // Switch default / custom crossfade duration (according to the user's choice)

    const duration = setCrossFadeDuration( defaultDuration );

    // Make sure that we don't go on in singleStepMode, and that all actions are unpaused

    singleStepMode = false;
    unPauseAllActions();

    // If the current action is 'idle' (duration 4 sec), execute the crossfade immediately;
    // else wait until the current action has finished its current loop

    if ( startAction === idleAction ) {

        executeCrossFade( startAction, endAction, duration );

    } else {

        synchronizeCrossFade( startAction, endAction, duration );

    }

}

function setCrossFadeDuration( defaultDuration ) {

    // Switch default crossfade duration <-> custom crossfade duration

    if ( settings[ 'use default duration' ] ) {

        return defaultDuration;

    } else {

        return settings[ 'set custom duration' ];

    }

}

function synchronizeCrossFade( startAction, endAction, duration ) {

    mixer.addEventListener( 'loop', onLoopFinished );

    function onLoopFinished( event ) {

        if ( event.action === startAction ) {

            mixer.removeEventListener( 'loop', onLoopFinished );

            executeCrossFade( startAction, endAction, duration );

        }

    }

}

function executeCrossFade( startAction, endAction, duration ) {

    // Not only the start action, but also the end action must get a weight of 1 before fading
    // (concerning the start action this is already guaranteed in this place)

    setWeight( endAction, 1 );
    endAction.time = 0;

    // Crossfade with warping - you can also try without warping by setting the third parameter to false

    startAction.crossFadeTo( endAction, duration, true );

}

// This function is needed, since animationAction.crossFadeTo() disables its start action and sets
// the start action's timeScale to ((start animation's duration) / (end animation's duration))

function setWeight( action, weight ) {

    action.enabled = true;
    action.setEffectiveTimeScale( 1 );
    action.setEffectiveWeight( weight );

}

// Called by the render loop

function updateWeightSliders() {

    settings[ 'modify idle weight' ] = idleWeight;
    settings[ 'modify walk weight' ] = walkWeight;
    settings[ 'modify run weight' ] = runWeight;

}

// Called by the render loop

function updateCrossFadeControls() {

    if ( idleWeight === 1 && walkWeight === 0 && runWeight === 0 ) {

        crossFadeControls[ 0 ].disable();
        crossFadeControls[ 1 ].enable();
        crossFadeControls[ 2 ].disable();
        crossFadeControls[ 3 ].disable();

    }

    if ( idleWeight === 0 && walkWeight === 1 && runWeight === 0 ) {

        crossFadeControls[ 0 ].enable();
        crossFadeControls[ 1 ].disable();
        crossFadeControls[ 2 ].enable();
        crossFadeControls[ 3 ].disable();

    }

    if ( idleWeight === 0 && walkWeight === 0 && runWeight === 1 ) {

        crossFadeControls[ 0 ].disable();
        crossFadeControls[ 1 ].disable();
        crossFadeControls[ 2 ].disable();
        crossFadeControls[ 3 ].enable();

    }

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

    // Render loop

    requestAnimationFrame( animate );

    idleWeight = idleAction.getEffectiveWeight();
    walkWeight = walkAction.getEffectiveWeight();
    runWeight = runAction.getEffectiveWeight();

    // Update the panel values if weights are modified from "outside" (by crossfadings)

    updateWeightSliders();

    // Enable/disable crossfade controls according to current weight values

    updateCrossFadeControls();

    // Get the time elapsed since the last frame, used for mixer update (if not in single step mode)

    let mixerUpdateDelta = clock.getDelta();

    // If in single step mode, make one step and then do nothing (until the user clicks again)

    if ( singleStepMode ) {

        mixerUpdateDelta = sizeOfNextStep;
        sizeOfNextStep = 0;

    }

    // Update the animation mixer, the stats panel, and render this frame

    mixer.update( mixerUpdateDelta );

    stats.update();

    renderer.render( scene, camera );

}


import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let scene, renderer, camera, stats;
let model, skeleton, mixer, clock;

const crossFadeControls = [];

let currentBaseAction = 'idle';
const allActions = [];
const baseActions = {
    idle: { weight: 1 },
    walk: { weight: 0 },
    run: { weight: 0 }
};
const additiveActions = {
    sneak_pose: { weight: 0 },
    sad_pose: { weight: 0 },
    agree: { weight: 0 },
    headShake: { weight: 0 }
};
let panelSettings, numAnimations;

init();

function init() {

    const container = document.getElementById( 'container' );
    clock = new THREE.Clock();

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xa0a0a0 );
    scene.fog = new THREE.Fog( 0xa0a0a0, 10, 50 );

    const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
    hemiLight.position.set( 0, 20, 0 );
    scene.add( hemiLight );

    const dirLight = new THREE.DirectionalLight( 0xffffff );
    dirLight.position.set( 3, 10, 10 );
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 2;
    dirLight.shadow.camera.bottom = - 2;
    dirLight.shadow.camera.left = - 2;
    dirLight.shadow.camera.right = 2;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 40;
    scene.add( dirLight );

    // ground

    const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100 ), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } ) );
    mesh.rotation.x = - Math.PI / 2;
    mesh.receiveShadow = true;
    scene.add( mesh );

    const loader = new GLTFLoader();
    loader.load( 'models/gltf/Xbot.glb', function ( gltf ) {

        model = gltf.scene;
        scene.add( model );

        model.traverse( function ( object ) {

            if ( object.isMesh ) object.castShadow = true;

        } );

        skeleton = new THREE.SkeletonHelper( model );
        skeleton.visible = false;
        scene.add( skeleton );

        const animations = gltf.animations;
        mixer = new THREE.AnimationMixer( model );

        numAnimations = animations.length;

        for ( let i = 0; i !== numAnimations; ++ i ) {

            let clip = animations[ i ];
            const name = clip.name;

            if ( baseActions[ name ] ) {

                const action = mixer.clipAction( clip );
                activateAction( action );
                baseActions[ name ].action = action;
                allActions.push( action );

            } else if ( additiveActions[ name ] ) {

                // Make the clip additive and remove the reference frame

                THREE.AnimationUtils.makeClipAdditive( clip );

                if ( clip.name.endsWith( '_pose' ) ) {

                    clip = THREE.AnimationUtils.subclip( clip, clip.name, 2, 3, 30 );

                }

                const action = mixer.clipAction( clip );
                activateAction( action );
                additiveActions[ name ].action = action;
                allActions.push( action );

            }

        }

        createPanel();

        animate();

    } );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    container.appendChild( renderer.domElement );

    // camera
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 100 );
    camera.position.set( - 1, 2, 3 );

    const controls = new OrbitControls( camera, renderer.domElement );
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.target.set( 0, 1, 0 );
    controls.update();

    stats = new Stats();
    container.appendChild( stats.dom );

    window.addEventListener( 'resize', onWindowResize );

}

function createPanel() {

    const panel = new GUI( { width: 310 } );

    const folder1 = panel.addFolder( 'Base Actions' );
    const folder2 = panel.addFolder( 'Additive Action Weights' );
    const folder3 = panel.addFolder( 'General Speed' );

    panelSettings = {
        'modify time scale': 1.0
    };

    const baseNames = [ 'None', ...Object.keys( baseActions ) ];

    for ( let i = 0, l = baseNames.length; i !== l; ++ i ) {

        const name = baseNames[ i ];
        const settings = baseActions[ name ];
        panelSettings[ name ] = function () {

            const currentSettings = baseActions[ currentBaseAction ];
            const currentAction = currentSettings ? currentSettings.action : null;
            const action = settings ? settings.action : null;

            if ( currentAction !== action ) {

                prepareCrossFade( currentAction, action, 0.35 );

            }

        };

        crossFadeControls.push( folder1.add( panelSettings, name ) );

    }

    for ( const name of Object.keys( additiveActions ) ) {

        const settings = additiveActions[ name ];

        panelSettings[ name ] = settings.weight;
        folder2.add( panelSettings, name, 0.0, 1.0, 0.01 ).listen().onChange( function ( weight ) {

            setWeight( settings.action, weight );
            settings.weight = weight;

        } );

    }

    folder3.add( panelSettings, 'modify time scale', 0.0, 1.5, 0.01 ).onChange( modifyTimeScale );

    folder1.open();
    folder2.open();
    folder3.open();

    crossFadeControls.forEach( function ( control ) {

        control.setInactive = function () {

            control.domElement.classList.add( 'control-inactive' );

        };

        control.setActive = function () {

            control.domElement.classList.remove( 'control-inactive' );

        };

        const settings = baseActions[ control.property ];

        if ( ! settings || ! settings.weight ) {

            control.setInactive();

        }

    } );

}

function activateAction( action ) {

    const clip = action.getClip();
    const settings = baseActions[ clip.name ] || additiveActions[ clip.name ];
    setWeight( action, settings.weight );
    action.play();

}

function modifyTimeScale( speed ) {

    mixer.timeScale = speed;

}

function prepareCrossFade( startAction, endAction, duration ) {

    // If the current action is 'idle', execute the crossfade immediately;
    // else wait until the current action has finished its current loop

    if ( currentBaseAction === 'idle' || ! startAction || ! endAction ) {

        executeCrossFade( startAction, endAction, duration );

    } else {

        synchronizeCrossFade( startAction, endAction, duration );

    }

    // Update control colors

    if ( endAction ) {

        const clip = endAction.getClip();
        currentBaseAction = clip.name;

    } else {

        currentBaseAction = 'None';

    }

    crossFadeControls.forEach( function ( control ) {

        const name = control.property;

        if ( name === currentBaseAction ) {

            control.setActive();

        } else {

            control.setInactive();

        }

    } );

}

function synchronizeCrossFade( startAction, endAction, duration ) {

    mixer.addEventListener( 'loop', onLoopFinished );

    function onLoopFinished( event ) {

        if ( event.action === startAction ) {

            mixer.removeEventListener( 'loop', onLoopFinished );

            executeCrossFade( startAction, endAction, duration );

        }

    }

}

function executeCrossFade( startAction, endAction, duration ) {

    // Not only the start action, but also the end action must get a weight of 1 before fading
    // (concerning the start action this is already guaranteed in this place)

    if ( endAction ) {

        setWeight( endAction, 1 );
        endAction.time = 0;

        if ( startAction ) {

            // Crossfade with warping

            startAction.crossFadeTo( endAction, duration, true );

        } else {

            // Fade in

            endAction.fadeIn( duration );

        }

    } else {

        // Fade out

        startAction.fadeOut( duration );

    }

}

// This function is needed, since animationAction.crossFadeTo() disables its start action and sets
// the start action's timeScale to ((start animation's duration) / (end animation's duration))

function setWeight( action, weight ) {

    action.enabled = true;
    action.setEffectiveTimeScale( 1 );
    action.setEffectiveWeight( weight );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

    // Render loop

    requestAnimationFrame( animate );

    for ( let i = 0; i !== numAnimations; ++ i ) {

        const action = allActions[ i ];
        const clip = action.getClip();
        const settings = baseActions[ clip.name ] || additiveActions[ clip.name ];
        settings.weight = action.getEffectiveWeight();

    }

    // Get the time elapsed since the last frame, used for mixer update

    const mixerUpdateDelta = clock.getDelta();

    // Update the animation mixer, the stats panel, and render this frame

    mixer.update( mixerUpdateDelta );

    stats.update();

    renderer.render( scene, camera );

}
