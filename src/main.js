import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, renderer, controls, container, stats;

let light;

let perspectiveCamera, topCamera, frontCamera, sideCamera;

let MovingCube;

let SCREEN_WIDTH, SCREEN_HEIGHT;

let raycaster = new THREE.Raycaster();
let pointer = new THREE.Vector2();


init();
animate();

function init()
{
    scene = new THREE.Scene();

    SCREEN_WIDTH = window.innerWidth;
    SCREEN_HEIGHT = window.innerHeight;

    /*********************** camera **************************/
    const PERS_CAMERA_FOV = 50;
    const PERS_CAMERA_ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT;
    const PERS_CAMERA_NEAR = 0.1;
    const PERS_CAMERA_FAR = 10000;
    perspectiveCamera = new THREE.PerspectiveCamera(PERS_CAMERA_FOV, PERS_CAMERA_ASPECT, PERS_CAMERA_NEAR, PERS_CAMERA_FAR);
    perspectiveCamera.position.set(0, 0, 300); 

    topCamera = new THREE.OrthographicCamera(
        SCREEN_WIDTH / -4,		// Left
        SCREEN_WIDTH / 4,		// Right
        SCREEN_HEIGHT / 4,		// Top
        SCREEN_HEIGHT / -4,	// Bottom
        -5000,            			// Near 
        10000 );           			// Far -- enough to see the skybox
    topCamera.up = new THREE.Vector3(0,0,-1);
    topCamera.lookAt( new THREE.Vector3(0,-1,0) );
    scene.add(topCamera);
        
    frontCamera = new THREE.OrthographicCamera(
        SCREEN_WIDTH / -4,	SCREEN_WIDTH / 4,		
        SCREEN_HEIGHT / 4,	SCREEN_HEIGHT / -4,	
        -5000, 10000 );           			
    frontCamera.lookAt( new THREE.Vector3(0,0,-1) );
    scene.add(frontCamera);
    
    sideCamera = new THREE.OrthographicCamera(
        SCREEN_WIDTH / -4,	SCREEN_WIDTH / 4,		
        SCREEN_HEIGHT / 4,	SCREEN_HEIGHT / -4,	
        -5000, 10000 );           			
    sideCamera.lookAt( new THREE.Vector3(1,0,0) );
    scene.add(sideCamera);

    /****************** renderer ***************************/
    renderer = new THREE.WebGLRenderer( {antialias: true} );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    renderer.autoClear = false;

    container = document.getElementById('container');
    container.appendChild( renderer.domElement );

    /****************** plain Help ***************************/
    const size = 1000;
    const divisions = 100;
    const gridHelperXZ = new THREE.GridHelper( size, divisions );
    scene.add( gridHelperXZ );

    // const gridHelperYZ = new THREE.GridHelper( size, divisions );
    // gridHelperYZ.rotation.x = Math.PI / 2;
    // scene.add( gridHelperYZ );

    // const gridHelperXY = new THREE.GridHelper( size, divisions );
    // gridHelperXY.rotation.z = Math.PI / 2;
    // scene.add( gridHelperXY );

    controls = new OrbitControls( perspectiveCamera, renderer.domElement );
    controls.listenToKeyEvents( window );

    light = new THREE.PointLight(0xffffff);
    light.position.set(100, 100, 100);
    scene.add(light);
    const sphereSize = 20;
    const pointLightHelper = new THREE.PointLightHelper( light, sphereSize );
    scene.add( pointLightHelper );

    const cubeGeometry = new THREE.BoxGeometry( 30, 30, 30 );
    const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00, metalness: 1.0, roughness: 1 });
    MovingCube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    MovingCube.position.set(0, 2.5, 0);
    scene.add(MovingCube);

    document.addEventListener("keydown", onDocumentKeyDown, false);
    window.addEventListener( 'resize', onWindowResize );

    window.addEventListener( 'pointermove', onPointerMove );
    
}

function render() {
    renderer.setViewport( 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT );
	renderer.clear();
	
	// upper left corner
	renderer.setViewport( 1, 0.5 * SCREEN_HEIGHT + 1, 0.5 * SCREEN_WIDTH - 2, 0.5 * SCREEN_HEIGHT - 2 );
	renderer.render( scene, perspectiveCamera );
	
	// upper right corner
	renderer.setViewport( 0.5 * SCREEN_WIDTH + 1, 0.5 * SCREEN_HEIGHT + 1, 0.5 * SCREEN_WIDTH - 2, 0.5 * SCREEN_HEIGHT - 2 );
	renderer.render( scene, topCamera );
	
	// lower left corner
	renderer.setViewport( 1, 1,   0.5 * SCREEN_WIDTH - 2, 0.5 * SCREEN_HEIGHT - 2 );
	renderer.render( scene, sideCamera );
	
	// lower right corner
	renderer.setViewport( 0.5 * SCREEN_WIDTH + 1, 1,   0.5 * SCREEN_WIDTH - 2, 0.5 * SCREEN_HEIGHT - 2 );
	renderer.render( scene, frontCamera );
}

function onWindowResize() {
    perspectiveCamera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
	perspectiveCamera.updateProjectionMatrix();
    renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
}


function animate() {
    requestAnimationFrame(animate)

    // MovingCube.rotation.z += 0.02;
    // update();

    render();
}

function onDocumentKeyDown(event) {
    var keyCode = event.which;
    // up
    if (keyCode == 87) {
        MovingCube.position.y += 1;
        // down
    } else if (keyCode == 83) {
        MovingCube.position.y -= 1;
        // left
    } else if (keyCode == 65) {
        MovingCube.position.x -= 1;
        // right
    } else if (keyCode == 68) {
        MovingCube.position.x += 1;
        // space
    } else if (keyCode == 32) {
        MovingCube.position.x = 0.0;
        MovingCube.position.y = 0.0;
    } else if(keyCode == 81) {
        MovingCube.rotation.y += 0.1;
    } else if(keyCode == 69) {
        MovingCube.rotation.y -= 0.1;
    }
    render();
};

function update() {
    raycaster.setFromCamera( pointer, perspectiveCamera );

    const intersects = raycaster.intersectObjects( scene.children );

    for( let i = 0; i < intersects.length; i++ ) {
        intersects[i].object.material.color.set( 0x0000ff )
    }
}

function onPointerMove( event ) {
    pointer.x = ( event.clientX / SCREEN_WIDTH ) * 2 - 1;
    pointer.y = - ( event.clientY / SCREEN_HEIGHT ) * 2 - 1;
    update();
    render();
}