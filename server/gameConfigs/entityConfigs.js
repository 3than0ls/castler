const imageSize = require('image-size');

/* 
    duck: class DuckData {
        constructor() {
            this.type = 'duck',
            this.neutrality = 'passive';
            this.loot = {
                feather: 1,
                rawMeat: 1,
            };
            this.health = 100;
            this.damage = 0;
            this.size = [imageSize(`./public/assets/entities/${this.type}.png`).width * 0.798, imageSize(`./public/assets/entities/${this.type}.png`).height * 0.798];
        }
    },
    boar: class BoarData {
        constructor() {
            this.type = 'boar',
            this.neutrality = 'neutral';
            this.loot = {
                fur: 1,
                rawMeat: 2,
            };
            this.health = 250;
            this.damage = 14;
            this.size = [imageSize(`./public/assets/entities/${this.type}.png`).width * 0.827, imageSize(`./public/assets/entities/${this.type}.png`).height * 0.927];
        }
    },
    beetle: class BeetleData {
        constructor() {
            this.type = 'beetle',
            this.neutrality = 'passive';
            this.loot = {
                mandibles: 1,
            };
            this.health = 100;
            this.damage = 0;
            this.size = [imageSize(`./public/assets/entities/${this.type}.png`).width * 0.798, imageSize(`./public/assets/entities/${this.type}.png`).height * 0.798];
        }
    }, */

module.exports = {
    duck: {
        type: 'duck',
        neutrality: 'passive',
        loot: {
            feather: 1,
            rawMeat: 1,
        },
        health: 100,
        damage: 0,
        speed: 2,
        size: [imageSize(`./public/assets/entities/duck.png`).width * 0.798, imageSize(`./public/assets/entities/duck.png`).height * 0.798]
    },
    boar: {
        type: 'boar',
        neutrality: 'neutral',
        loot: {
            fur: 1,
            rawMeat: 2,
        },
        health: 250,
        damage: 14,
        speed: 2,
        size: [imageSize(`./public/assets/entities/boar.png`).width * 0.827, imageSize(`./public/assets/entities/boar.png`).height * 0.827]
    },
    beetle: {
        type: 'beetle',
        neutrality: 'aggressive',
        loot: {
            mandibles: 1,
        },
        health: 125,
        damage: 8,
        speed: 2,
        size: [imageSize(`./public/assets/entities/beetle.png`).width * 0.883, imageSize(`./public/assets/entities/beetle.png`).height * 0.883]
    },
    frog: {
        type: 'frog',
        neutrality: 'neutral',
        loot: {
            // none yet
        },
        health: 125,
        damage: 6,
        speed: 2,
        size: [imageSize(`./public/assets/entities/frog.png`).width * 0.865, imageSize(`./public/assets/entities/frog.png`).height * 0.865]
    },
}