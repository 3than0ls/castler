const imageSize = require('image-size');

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
    ghoul: {
        type: 'ghoul',
        neutrality: 'aggressive',
        loot: {
            
        },
        health: 100,
        damage: 15,
        speed: 1.25,
        size: [imageSize(`./public/assets/entities/ghoul.png`).width * 0.865, imageSize(`./public/assets/entities/ghoul.png`).height * 0.865]
    },
}