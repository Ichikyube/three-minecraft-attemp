function mipmap(size, color) {

    const imageCanvas = document.createElement('canvas');
    const context = imageCanvas.getContext('2d');

    imageCanvas.width = imageCanvas.height = size;

    context.fillStyle = '#444';
    context.fillRect(0, 0, size, size);

    context.fillStyle = color;
    context.fillRect(0, 0, size / 2, size / 2);
    context.fillRect(size / 2, size / 2, size / 2, size / 2);
    return imageCanvas;

}

const canvas = mipmap(128, '#f00');
const textureCanvas1 = new THREE.CanvasTexture(canvas);
textureCanvas1.mipmaps[0] = canvas;
textureCanvas1.mipmaps[1] = mipmap(64, '#0f0');
textureCanvas1.mipmaps[2] = mipmap(32, '#00f');
textureCanvas1.mipmaps[3] = mipmap(16, '#400');
textureCanvas1.mipmaps[4] = mipmap(8, '#040');
textureCanvas1.mipmaps[5] = mipmap(4, '#004');
textureCanvas1.mipmaps[6] = mipmap(2, '#044');
textureCanvas1.mipmaps[7] = mipmap(1, '#404');
textureCanvas1.repeat.set(1000, 1000);
textureCanvas1.wrapS = THREE.RepeatWrapping;
textureCanvas1.wrapT = THREE.RepeatWrapping;

const textureCanvas2 = textureCanvas1.clone();
textureCanvas2.magFilter = THREE.NearestFilter;
textureCanvas2.minFilter = THREE.NearestMipmapNearestFilter;

const materialCanvas1 = new THREE.MeshBasicMaterial({
    map: textureCanvas1
});
const materialCanvas2 = new THREE.MeshBasicMaterial({
    color: 0xffccaa,
    map: textureCanvas2
});


const texturePainting1 = new THREE.TextureLoader().load('textures/758px-Canestra_di_frutta_(Caravaggio).jpg', callbackPainting);
const texturePainting2 = new THREE.Texture();
const materialPainting1 = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    map: texturePainting1
});
const materialPainting2 = new THREE.MeshBasicMaterial({
    color: 0xffccaa,
    map: texturePainting2
});

texturePainting2.minFilter = texturePainting2.magFilter = THREE.NearestFilter;
texturePainting1.minFilter = texturePainting1.magFilter = THREE.LinearFilter;
texturePainting1.mapping = THREE.UVMapping;