let lightShadowMapViewer, DLightShadowMapViewer;

function initShadowViewer() {
    lightShadowMapViewer = new ShadowMapViewer(light);
    DLightShadowMapViewer = new ShadowMapViewer(DLight);
    resizeShadowMapViewers();
}

function renderShadowMapViewers() {
    DLightShadowMapViewer.render(renderer);
    lightShadowMapViewer.render(renderer);
}

function resizeShadowMapViewers() {
    const w = window.innerWidth * 0.15;
    const h = window.innerHeight * 0.15;
    lightShadowMapViewer.position.x = 10;
    lightShadowMapViewer.position.y = sizes.height - (SHADOW_MAP_HEIGHT / 4) - 10;
    lightShadowMapViewer.size.width = w;
    lightShadowMapViewer.size.height = h;
    DLightShadowMapViewer.position.x = 10;
    DLightShadowMapViewer.position.y = 10;
    DLightShadowMapViewer.size.width = w;
    DLightShadowMapViewer.size.height = h;
    DLightShadowMapViewer.update(); //Required when setting position or size directly
}