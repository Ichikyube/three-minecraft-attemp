export function clamp(x, a, b) {
    return Math.min(Math.max(x, a), b);
}


function onDocumentMouseWheel(event) {
    var fov = camera.fov + event.deltaY * 0.05;
    camera.fov = THREE.Math.clamp(fov, 10, 75);
    camera.updateProjectionMatrix();
}

export function degrees_to_radians(degrees) {
    var pi = Math.PI;
    return degrees * (pi / 180);
}
/**
 * degrees to radians conversion constant
 * @type {number}
 */
 var d2r = Math.PI / 180;

 /**
  * 360 degrees (2pi)
  * @type {number}
  */
 var PI2 = 2 * Math.PI;
 
 /**
  * 90 degrees
  * @type {number}
  */
 var PI_2 = Math.PI / 2;
 
 /**
  * Converts real world coordinates to map data coordinates
  * @param val
  * @returns {number}
  */
 function w(val) {
     return Math.floor(val / 100) + world.width / 2;
 }
 
 /**
  * Converts radians to degrees
  * @param val
  * @returns {number}
  */
 function r2d(val) {
     return val * 180 / Math.PI;
 }
 
 /**
  * Trims rotational angles so they don't get beyond 360 or below 0 (for developer's sanity)
  * @param rot
  * @returns {*}
  */
 function trimRot(rot) {
     if (rot < 0)
         rot = PI2;
     else
         if (rot > PI2)
             rot = 0;
     return rot;
 }
export function fullscreenEnabled() {
    return document.fullscreenEnabled ||
    document.webkitFullscreenEnabled ||
    document.mozFullScreenEnabled ||
    document.msFullscreenEnabled;
    };
/*if (fullscreenEnabled()) {
    ....
}*/
    
export function exitFullscreen() {
    document.exitFullscreen = document.exitFullscreen ||
        document.mozCancelFullScreen ||
        document.webkitExitFullscreen ||
        document.msExitFullscreen;
    document.exitFullscreen();
}

export function fullscreen(element) {
    if (!element) element = document.documentElement;
    element.requestFullscreen = element.requestFullscreen ||
        element.mozRequestFullScreen ||
        element.webkitRequestFullscreen ||
        element.msRequestFullscreen;
    element.requestFullscreen();
}
//para ver la página en pantalla completa -> fullscreen();
//para una imagen, por ejemplo al evento onclick
//fullscreen(document.getElementById(“mi_imagen”));
/*

/**
 * test if it is possible to have fullscreen
 * 
 * @returns {Boolean} true if fullscreen API is available, false otherwise
*/
THREEx.FullScreen.available	= function()
{
	return this._hasWebkitFullScreen || this._hasMozFullScreen;
}

/**
 * test if fullscreen is currently activated
 * 
 * @returns {Boolean} true if fullscreen is currently activated, false otherwise

THREEx.FullScreen.activated	= function()
{
	if( this._hasWebkitFullScreen ){
		return document.webkitIsFullScreen;
	}else if( this._hasMozFullScreen ){
		return document.mozFullScreen;
	}else{
		console.assert(false);
	}
}


 * Request fullscreen on a given element
 * @param {DomElement} element to make fullscreen. optional. default to document.body

THREEx.FullScreen.request	= function(element)
{
	element	= element	|| document.body;
	if( this._hasWebkitFullScreen ){
		element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
	}else if( this._hasMozFullScreen ){
		element.mozRequestFullScreen();
	}else{
		console.assert(false);
	}
}


 * Cancel fullscreen

THREEx.FullScreen.cancel	= function()
{
	if( this._hasWebkitFullScreen ){
		document.webkitCancelFullScreen();
	}else if( this._hasMozFullScreen ){
		document.mozCancelFullScreen();
	}else{
		console.assert(false);
	}
}

// internal functions to know which fullscreen API implementation is available
THREEx.FullScreen._hasWebkitFullScreen	= 'webkitCancelFullScreen' in document	? true : false;	
THREEx.FullScreen._hasMozFullScreen	= 'mozCancelFullScreen' in document	? true : false;	


 * Bind a key to renderer screenshot
 * usage: THREEx.FullScreen.bindKey({ charCode : 'a'.charCodeAt(0) }); 

THREEx.FullScreen.bindKey	= function(opts){
	opts		= opts		|| {};
	var charCode	= opts.charCode	|| 'f'.charCodeAt(0);
	var dblclick	= opts.dblclick !== undefined ? opts.dblclick : false;
	var element	= opts.element

	var toggle	= function(){
		if( THREEx.FullScreen.activated() ){
			THREEx.FullScreen.cancel();
		}else{
			THREEx.FullScreen.request(element);
		}		
	}

	var onKeyPress	= function(event){
		if( event.which !== charCode )	return;
		toggle();
	}.bind(this);

	document.addEventListener('keypress', onKeyPress, false);

	dblclick && document.addEventListener('dblclick', toggle, false);

	return {
		unbind	: function(){
			document.removeEventListener('keypress', onKeyPress, false);
			dblclick && document.removeEventListener('dblclick', toggle, false);
		}
	};
}

*/
function drawTexture() {

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    var img = document.getElementById("scream");
    const context = canvas.getContext('2d');
    /*
        const image = context.getImageData(0, 0, 256, 256);

        let x = 0,
            y = 0;

        for (let i = 0, j = 0, l = image.data.length; i < l; i += 4, j++) {

            x = j % 256;
            y = (x === 0) ? y + 1 : y;

            image.data[i] = 255;
            image.data[i + 1] = 255;
            image.data[i + 2] = 255;
            image.data[i + 3] = Math.floor(x ^ y);

        }*/
    context.drawImage(img, 10, 10);
    //context.putImageData(image, 0, 0);

    return canvas;

}
const texture = new THREE.CanvasTexture(generateTexture());
texture.needsUpdate = true;
//<img id="scream" width="0" height="0"
//src="assets/textures/brick_diffuse.jpg" alt="The Scream">

