export class LayerManager {
    constructor() {
        this.layers = {
            mapBase: document.getElementById('map-base-canvas'),
            mapDecor: document.getElementById('map-decor-canvas'),
            groundFx: document.getElementById('ground-fx-canvas'),
            entity: document.getElementById('entity-canvas'),
            vfx: document.getElementById('vfx-canvas'),
            weather: document.getElementById('weather-canvas'),
        };
        this.contexts = {};
        for (const key in this.layers) {
            this.contexts[key] = this.layers[key].getContext('2d');
        }

        window.addEventListener('resize', () => this.resize());
        this.resize();
    }

    resize() {
        for (const key in this.layers) {
            this.layers[key].width = window.innerWidth;
            this.layers[key].height = window.innerHeight;
        }
    }

    clear(layerKey) {
        if (layerKey) {
            const layer = this.layers[layerKey];
            this.contexts[layerKey].clearRect(0, 0, layer.width, layer.height);
        } else {
            for (const key in this.contexts) {
                const layer = this.layers[key];
                this.contexts[key].clearRect(0, 0, layer.width, layer.height);
            }
        }
    }
}
