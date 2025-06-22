// src/assetLoader.js

export class AssetLoader {
    constructor() {
        this.assets = {};
        this.promises = [];
    }

    // 이미지를 로드하는 메서드
    loadImage(key, src) {
        const img = new Image();
        const promise = new Promise((resolve, reject) => {
            img.onload = () => {
                this.assets[key] = img;
                resolve(img);
            };
            img.onerror = () => {
                reject(`Failed to load image: ${src}`);
            };
        });
        img.src = src;
        this.promises.push(promise);
    }

    // 모든 이미지가 로드될 때까지 기다렸다가, 로드가 끝나면 콜백 함수를 실행하는 메서드
    onReady(callback) {
        Promise.all(this.promises)
            .then(() => callback(this.assets))
            .catch(error => console.error(error));
    }

    // 신규 무기 이미지들을 한 번에 로드하는 헬퍼 메서드
    loadWeaponImages() {
        const weapons = [
            ['axe', 'assets/images/axe.png'],
            ['mace', 'assets/images/mace.png'],
            ['staff', 'assets/images/staff.png'],
            ['spear', 'assets/images/spear.png'],
            ['estoc', 'assets/images/Estoc.png'],
            ['scythe', 'assets/images/scythe.png'],
            ['whip', 'assets/images/whip.png'],
            ['dagger', 'assets/images/dagger.png'],
        ];
        weapons.forEach(([key, src]) => this.loadImage(key, src));
    }

    // 휘장 아이템 이미지를 한 번에 로드하는 헬퍼 메서드
    loadEmblemImages() {
        const emblems = [
            ['emblem_guardian', 'assets/images/emblem_guardian.png'],
            ['emblem_destroyer', 'assets/images/emblem_destroyer.png'],
            ['emblem_devotion', 'assets/images/emblem_devotion.png'],
            ['emblem_conductor', 'assets/images/emblem_conductor.png'],
        ];
        emblems.forEach(([key, src]) => this.loadImage(key, src));
    }
}
