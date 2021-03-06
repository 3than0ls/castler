import { player, glowContainer, clientState } from "../app.js";
import { loader } from "./../utils/loader.js";
import { Player } from "./player.js";
import { charm } from "../vendors/charm/charm.js";
import { dust } from "../vendors/dust/dust.js";


export class Enemy {
    constructor(clientID, globalX, globalY, toolTier, armorTier) {
        // basically is the same as player class, but without any required user input parts
        // basically a puppet, which is controlled by server sent data
        this.globalX = globalX;
        this.globalY = globalY;
        this.clientID = clientID;

        this.displayHand = 'hand';
        this.handSpriteKey = this.displayHand === 'hand' ? 'hand' : this.toolTier.concat(this.displayHand);
        this.handSprites = {};
        this.armorSprites = {};
        this.toolTier = toolTier;
        this.armorTier = armorTier;

        this.effects = {};
        this.particleEffects = {};
    }

    attackFlash() {
        if (this.bodyGraphic.tint === 0xFFFFFF) {
            let tint = charm.tint(this.bodyGraphic, [185, 0, 0]);
            tint.onComplete = () => {
                // reset tint to nothing
                this.bodyGraphic.tint = 0xFFFFFF
            }
        }
        dust.create(
            this.globalX, this.globalY,
            () => new PIXI.Sprite(loader.resources['particles/bloodParticle'].texture),
            player.viewpoint,
            20,
            0,
            true,
            0, 6.28,
            12, 24,
            1.5, 2,
            0.02, 0.04,
            0.02, 0.04,
        );
    }

    effectsUpdate() {
        for (let [effectName, effect] of Object.entries(this.effects)) {
            switch (effectName) {
                case 'swimming':
                    if (!this.particleEffects['swimming']) {
                        this.particleEffects['swimming'] =  dust.emitter(
                            600, () => {
                                dust.create(
                                    this.globalX,
                                    this.globalY,
                                    () => {
                                        let sprite = new PIXI.Sprite(loader.resources['particles/smokeParticle'].texture);
                                        sprite.tint = 0x0e2a51;
                                        sprite.zIndex = 15;
                                        return sprite;
                                    },
                                    player.viewpoint,
                                    2,
                                    0,
                                    true,
                                    0, 6.28,
                                    15, 35,
                                    0.05, 0.1,
                                    -0.0025, -0.007,
                                    0.0025, 0.0075,
                                )
                            }
                        );
                    }
                    if (this.vx || this.vy) {
                        this.particleEffects['swimming'].play();
                    } else {
                        this.particleEffects['swimming'].stop();
                    }
                    break;
                    
                case 'poisoned':
                    if (!this.particleEffects['poisoned']) {
                        this.particleEffects['poisoned'] = dust.emitter(
                            500, () => {
                                dust.create(
                                    this.globalX+35*Math.random()-0.5,
                                    this.globalY+35*Math.random()-0.5,
                                    () => {
                                        let sprite = new PIXI.Sprite(loader.resources['particles/smokeParticle'].texture);
                                        sprite.tint = 0x0B5819;
                                        sprite.zIndex = 15;
                                        return sprite;
                                    },
                                    player.viewpoint,
                                    2,
                                    0,
                                    true,
                                    0, 6.28,
                                    10, 17,
                                    0.33, 0.35,
                                    -0.0025, -0.003,
                                    0.00375, 0.00385,
                                )
                            }
                        );
                    }
                    this.particleEffects['poisoned'].play();
                    break;
            }
        }

        for (let [effectName, effectEmitter] of Object.entries(this.particleEffects)) {
            if (!this.effects[effectName]) {
                effectEmitter.stop();
            }
        }
    }

    render() { // basically what happens for players
        // render body graphic
        this.bodyGraphic = new PIXI.Sprite(loader.resources['player/playerBody'].texture);
        // set positions
        this.bodyGraphic.anchor.x = 0.5;
        this.bodyGraphic.anchor.y = 0.5;
        this.bodyGraphic.radius = this.bodyGraphic.width;
        this.bodyGraphic.position.set(this.globalX, this.globalY);
        
        // create glow sprite
        this.glow = new PIXI.Sprite(loader.resources['particles/glow'].texture);
        this.glow.anchor.x = 0.5;
        this.glow.anchor.y = 0.5;
        this.glow.position.set(this.globalX - player.globalX + this.vx + player.x, this.globalY - player.globalY + this.vy + player.y);
        this.glow.zIndex = 2;
        this.glow.tint = 0xF7f1DC;
        this.glowColorMatrix = new PIXI.filters.ColorMatrixFilter();
        this.glowColorMatrix.padding = 700;
        this.glowColorMatrix.brightness(1.1);
        this.glowBlurFilter = new PIXI.filters.BlurFilter();
        this.glowBlurFilter.padding = 700;
        this.glowBlurFilter.blur = 15;
        this.glow.filters = [this.glowColorMatrix, this.glowBlurFilter];

        // render and create hand sprites
        Player.createHandSprites(this.handSprites, this.globalX, this.globalY, this.toolTier);

        // give it a high zIndex to render it over other objects
        this.bodyGraphic.zIndex = 50;
        this.handSprites[this.handSpriteKey].zIndex = 49;

        // finally, render each to the viewpoint of player, different from rendering to stage
        let handGraphic = this.handSprites[this.handSpriteKey];
        let bodyGraphic = this.bodyGraphic;
        player.viewpoint.addChild(handGraphic, bodyGraphic); // hands drawn below body
    }

    animate(globalX, globalY, angle, swingAngle, displayHand, toolTier, armorTier, effects) {
        // the animate function is different from the update in player class
        // animate takes input supplied from the server and applies it to the enemies
        // update positioning
        this.cachedGlobalX = JSON.parse(JSON.stringify(this.globalX)); // deep clone for cached values, which are previous values
        this.cachedGlobalY = JSON.parse(JSON.stringify(this.globalY));
        this.globalX = globalX;
        this.globalY = globalY;


        this.vx = this.globalX - this.cachedGlobalX; // used in swimming particle playing
        this.vy = this.globalY - this.cachedGlobalY;

        // update angle 
        this.angle = angle;

        // update effects
        this.effects = effects;
        this.effectsUpdate();

        // update a glow to act as light. We have to render it to the glow container in order to bypass the color filter on stage. 
        // Also, we have to translate it onto the position since it isn't being rendered in player viewpoint
        this.glow.position.set(this.globalX - player.globalX + this.vx + player.x, this.globalY - player.globalY+ this.vy + player.y);

        // remove current displayed hand and armor (which may be different) and then update it
        player.viewpoint.removeChild(this.handSprites[this.handSpriteKey]);
        player.viewpoint.removeChild(this.armorSprites[this.armorTier.concat('Armor')]);
        this.displayHand = displayHand;
        this.toolTier = toolTier;
        this.armorTier = armorTier;

        Player.createHandSprites(this.handSprites, this.globalX, this.globalY, this.toolTier);
        Player.createArmorSprites(this.armorSprites, this.globalX, this.globalY, this.armorTier);

        // determine hand sprite key
        this.handSpriteKey = this.displayHand === 'hand' ? 'hand' : this.toolTier.concat(this.displayHand);

        this.handSprites[this.handSpriteKey].zIndex = 49;
        this.armorSprites[this.armorTier.concat('Armor')].zIndex = 52;

        // update rendered position
        this.handSprites[this.handSpriteKey].position.set(globalX, globalY); 
        this.armorSprites[this.armorTier.concat('Armor')].position.set(globalX, globalY);
        this.bodyGraphic.position.set(globalX, globalY);
        // update rendered angle
        this.handSprites[this.handSpriteKey].rotation = angle;
        this.handSprites[this.handSpriteKey].angle += swingAngle // add on the swingAngle angle, in degrees
        this.bodyGraphic.rotation = angle;
        this.armorSprites[this.armorTier.concat('Armor')].rotation =  this.angle + Math.PI; // add one radian to turn it around 180 degrees

        // add graphics to stage
        let handGraphic = this.handSprites[this.handSpriteKey];
        let bodyGraphic = this.bodyGraphic;
        let armorGraphic = this.armorSprites[this.armorTier.concat('Armor')];
        player.viewpoint.addChild(handGraphic,  armorGraphic, bodyGraphic); // hands drawn below body
        
        if (clientState.timeTick >= clientState.dayTimeLength/2) {
            glowContainer.addChild(this.glow);
        } else {
            glowContainer.removeChild(this.glow);
        }

    }

    delete() { // delete user when disconnected
        let bodyGraphic = this.bodyGraphic 
        let hand = this.handSprites[this.handSpriteKey];
        let armor = this.armorSprites[this.armorTier.concat('Armor')];
        player.viewpoint.removeChild(bodyGraphic, hand, armor);
        glowContainer.removeChild(this.glow);
        for (let [effectName, effectEmitter] of Object.entries(this.particleEffects)) {
            effectEmitter.stop();
        }
        // add more sprite removals if needed
    }
}