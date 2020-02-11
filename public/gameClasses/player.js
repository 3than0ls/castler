import { stage, socket, renderer, clientState, worker, player } from "../app.js";
import { loader } from "./../utils/loader.js";
import { clientEmit } from "../sockets/player/clientEmit.js";
import { ratio } from "./../utils/windowResize.js";
import { bump } from "../bump/bump.js";
import { harvest } from "../sockets/resources/harvest.js";
import { attack } from "../sockets/entities/attack.js";
import { charm } from "../charm/charm.js";
import { renderDeathMenu } from "../UI/death/menu.js";
import { clientCreateStructure } from "../sockets/player/clientCreateStructure.js";
import { swing } from "../sockets/player/swing.js";
import { dust } from "../dust/dust.js";


export class Player {
    constructor(clientID) {
        this.x = window.innerWidth/2;
        this.y = window.innerHeight/2; // are these really needed?

        this.globalX = 0;
        this.globalY = 0;
        this.clientID = clientID;

        this.mouseX;
        this.mouseY;

        // hand related variables
        this.displayHand = 'hand';
        this.handSprites = {};
        this.collisionPoints = {};

        this.vx = 0;
        this.vy = 0;
        this.collisionvx = 0;
        this.collisionvy = 0;

        this.viewpoint = new PIXI.Container();

        // player status
        this.score; // assigned from server
        this.health = 100; // set at 100, assigned from server
        this.hunger = 100; // set at 100, assigned from server
        this.dead = this.health <= 0;

        // player game stats
        this.harvestSpeed = 2; // set at 2, assigned from server
        this.attackSpeed = 2; // set at 2, assigned from server

        // player inventory and resources, and crafting status
        this.inventory = {};
        this.consumable = {};
        this.craftingState = {
            crafting: false,
            craftingComplete: 1,
        };
        this.effects = {};
        this.particleEffects = {};

        // player statuses and small stuff
        // swing animation variables
        this.swingAngle = 0;
        this.swingAvailable = true;
        this.stopRotation = 40;
        this.swingBack = false;
        // mouse variable
        this.mouseHeld = false;
        this.clicked = true;
        // building and placement
        this.structureHand;
        this.displayStructureHand;
        this.displayStructureHandGlobalX = 0;
        this.displayStructureHandGlobalY = 0;
        this.placeable = false;
        this.structureSprites = {};
        // crate status
        this.openCrate = false;
        this.targetCrate;
        this.targetCrateDist;
    }

    movementKeys() {
        // movement keys
        this.w = keyboard(87);
        this.a = keyboard(65);
        this.s = keyboard(83);
        this.d = keyboard(68);
        
        this.e = keyboard(69);

        this.one = keyboard(49);
        this.two = keyboard(50);
        this.three = keyboard(51);

        // Left
        this.a.press = () => {
            this.vx = -1;
        };
        this.a.release = () => {
            if (!this.d.isDown) {
                this.vx = 0;
            }
        };
    
        // Up
        this.w.press = () => {
            this.vy = -1;
        };
        this.w.release = () => {
            if (!this.s.isDown) {
                this.vy = 0;
            }
        };
    
        // Right
        this.d.press = () => {
            this.vx = 1;
        };
        this.d.release = () => {
            if (!this.a.isDown) {
                this.vx = 0;
            }
        };
    
        // Down
        this.s.press = () => {
            this.vy = 1;
        };
        this.s.release = () => {
            if (!this.w.isDown) {
                this.vy = 0;
            }
        };

        this.e.release = () => {
            for (let crate of Object.values(clientState.crates)) {
                let dist = Math.hypot(this.globalX - crate.globalX, this.globalY - crate.globalY);
                if (dist < 100) {
                    this.openCrate = true;
                    if (!this.targetCrate) {
                        this.targetCrate = crate;
                        this.targetCrateDist = dist;
                    } else {
                        if (dist < this.targetCrateDist) {
                            this.targetCrate = crate;
                            this.targetCrateDist = dist;
                        }
                    }
                }
            }
        }
        
        this.one.release = () => {
            if (this.displayHand !== 'hand') {

                stage.removeChild(this.handSprites[this.handSpriteKey]);
                this.swingAvailable = true;
                this.displayHand = 'hand';
            }
        }
        this.two.release = () => {
            if (this.displayHand !== 'AxeHand') {

                stage.removeChild(this.handSprites[this.handSpriteKey]);
                this.swingAvailable = true;
                this.displayHand = 'AxeHand';
            }
        }
        this.three.release = () => {
            if (this.displayHand !== 'SwordHand') {

                stage.removeChild(this.handSprites[this.handSpriteKey]);
                this.swingAvailable = true;
                this.displayHand = 'SwordHand';
            }
        }
    }

    mouse() {
        renderer.plugins.interaction.on('mousedown', () => {
            this.mouseHeld = true;
        });
        renderer.plugins.interaction.on('mouseup', () => {
            this.mouseHeld = false;
            this.clicked = true;
        });
    }

    render() {
        // render body graphic
        this.bodyGraphic = new PIXI.Sprite(loader.resources['player/playerBody'].texture);
        this.bodyGraphic.circular = true; // bump js settings
        // set positions
        this.bodyGraphic.anchor.x = 0.5;
        this.bodyGraphic.anchor.y = 0.5;
        this.bodyGraphic.position.set(this.x, this.y);

        // render and create hands
        Player.createHandSprites(this.handSprites, this.x, this.y, this.toolTier);

        // create client needed hand/tool collision points
        this.updateCollisionPoints();

        // movement keys
        this.movementKeys();
        // mouse event detection
        this.mouse();

        // determine hand sprite key
        this.handSpriteKey = this.displayHand === 'hand' ? 'hand' : this.toolTier.concat(this.displayHand);

        // finally, render each to the stage
        let handGraphic = this.handSprites[this.handSpriteKey];
        let bodyGraphic = this.bodyGraphic;
        stage.addChild(handGraphic, bodyGraphic); // hands drawn below body

        // allow viewpoint to have sortable children, so zIndex works
        this.viewpoint.sortableChildren = true;

        // render viewpoint to stage
        this.viewpoint.position.set(-this.globalX+this.x, -this.gloalY+this.y); // adjust so viewpoint positioned in the middle
        let viewpoint = this.viewpoint;
        stage.addChild(viewpoint);
    }

    effectsUpdate() {
        for (let [effectName, effect] of Object.entries(this.effects)) {
            switch (effectName) {
                case 'swimming':
                    if (!this.particleEffects['swimming']) {
                        this.particleEffects['swimming'] = 
                        this.particleStream = dust.emitter(
                            400, () => {
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
                                    0.2, 0.35,
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
            }
        }

        for (let [effectName, effectEmitter] of Object.entries(this.particleEffects)) {
            if (!this.effects[effectName]) {
                effectEmitter.stop();
            }
        }
    }

    viewpointUpdate() {
        /*
            things that appear to move when the player moves are added to the viewpoint display group
            once added, when the player inputs movement commands, anything in the viewpoint display group will move rather than the player
            this gives the illusion that the player is moving, rather than everything else
        */        

        this.viewpoint.position.set(-this.globalX+this.x, -this.globalY+this.y);
        let viewpoint = this.viewpoint; // render viewpoint to stage
        stage.addChild(viewpoint);
    }

    inventoryUpdate(inventory) {
        // maintain for use in difference waste deletion
        const serverInventory = {};
        const serverConsumable = {};
        // update inventory
        for (let [itemName, item] of Object.entries(inventory)) {
            if (item.consumable === true) {
                this.consumable[itemName] = item;
                serverConsumable[itemName] = item;
            } else {
                this.inventory[itemName] = item;
                serverInventory[itemName] = item;
            }
        }

        // delete items/consumables that the player does not have/dropped/consumed
        const clientInventory = Object.keys(this.inventory);
        let inventoryDifference = clientInventory.filter(function(item) {
            return !serverInventory[item]
        }); 
        for (let i = 0; i < inventoryDifference.length; i++) { // delete
            delete this.inventory[inventoryDifference[i]];
        }

        const clientConsumable = Object.keys(this.consumable);
        let consumableDifference = clientConsumable.filter(function(item) {
            return !serverConsumable[item]
        }); 
        for (let i = 0; i < consumableDifference.length; i++) { // delete
            delete this.consumable[consumableDifference[i]];
        }

    }
    
    healthUpdate(health) {
        if (health < this.health) {
            this.health = health;
            this.attacked();
        } else if (health > this.health) {
            this.health = health;
        }

        if (health <= 0) {
            this.health = 0;
        }
        if (this.health >= 100) {
            this.health = 100;
        }
    }
    
    hungerUpdate(hunger) {
        if (hunger < this.hunger) {
            this.hunger = hunger;
            this.movementKeys();
            // hunger flash?
        } else if (hunger > this.hunger) {
            this.hunger = hunger;
            this.movementKeys();
        }

        if (hunger <= 0) {
            this.hunger = 0;
        }
    }

    toolUpdate(toolTier) {
        if (toolTier !== this.toolTier) {
            this.toolTier = toolTier;
            stage.removeChild(this.handSprites[this.handSpriteKey]);
        }
    }

    structureBuilding(structureHand) {
        //this.structureHand = structureHand;
        if (this.displayStructureHand !== structureHand) {
            player.viewpoint.removeChild(this.structureSprites[this.displayStructureHand]);
            this.displayStructureHand = structureHand;
        }
        if (!this.structureSprites[structureHand]) { // if the sprite texture doesn't exist, create it
            this.structureSprites[structureHand] = new PIXI.Sprite(loader.resources[`structures/${structureHand}`].texture);
            this.structureSprites[structureHand].zIndex = 51;
            this.structureSprites[structureHand].anchor.x = 0.5;
            this.structureSprites[structureHand].anchor.y = 0.5;
            this.structureSprites[structureHand].circular = true;
        }

        this.displayStructureHandGlobalX = this.globalX + Math.sin(-this.angle) * 150;
        this.displayStructureHandGlobalY = this.globalY + Math.cos(this.angle) * 150;

        this.structureSprites[structureHand].position.set(this.displayStructureHandGlobalX, this.displayStructureHandGlobalY);

        this.placeable = true;

        let objects = {...clientState.resources, ...clientState.structures, ...clientState.entities, ...clientState.crates};
        for (let [objectID, object] of Object.entries(objects)) {
            if (Math.hypot(object.globalX - this.globalX, object.globalY - this.globalY) < 750) { // only calculate on resources/objects near the player
                let test;
                if (objectID.charAt(0) === 's') { // structures
                    test = bump.hitTestCircle(object.structureGraphic, this.structureSprites[structureHand]);
                } else if (objectID.charAt(0) === 'r') { // resources
                    test = bump.hitTestCircle(object.resourceGraphic, this.structureSprites[structureHand]);
                } else if (objectID.charAt(0) === 'e') { // entities
                    test = bump.hitTestCircle(object.entityGraphic, this.structureSprites[structureHand]);
                } else if (objectID.charAt(0) === 'c') { // crates
                    test = bump.hitTestCircle(object.crateGraphic, this.structureSprites[structureHand]);
                } else {
                    test = false; // unidentified object, does not match the ID system
                }
                if (test) { // if a collision is found, make object unplaceable
                    this.placeable = false;
                    break;
                }
            }
        }

        if (this.placeable) { // tint structure if not placeable
            this.structureSprites[structureHand].tint = 0xAAAAAAA;
        } else {
            this.structureSprites[structureHand].tint = 0xCC3333;
        }
        
    }

    attacked() {
        if (this.bodyGraphic.tint === 0xFFFFFF) {
            let tint = charm.redTint(this.bodyGraphic);
            tint.onComplete = () => {
                // reset tint to nothing
                this.bodyGraphic.tint = 0xFFFFFF
            }
        }
        dust.create(
            this.globalX,
            this.globalY,
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

    died() {
        socket.disconnect();
        worker.terminate();
        renderDeathMenu();
    }

    update() {
        // update mouse position variables
        this.mouseX = renderer.plugins.interaction.mouse.global.x/ratio;
        this.mouseY = renderer.plugins.interaction.mouse.global.y/ratio;

        // determine hand sprite key
        this.handSpriteKey = this.displayHand === 'hand' ? 'hand' : this.toolTier.concat(this.displayHand);
        // update positioning to x and y display (not global). x and y will only ever change in screen resizes
        this.bodyGraphic.position.set(this.x, this.y);
        this.handSprites[this.handSpriteKey].position.set(this.x, this.y);

        // update particles
        this.effectsUpdate();

        // update viewpoint
        this.viewpointUpdate();

        // update client needed hand/tool collision points
        this.updateCollisionPoints();

        // update angle 
        this.angle = -Math.atan2(this.mouseX - this.x, this.mouseY - this.y);
        this.handSprites[this.handSpriteKey].rotation = this.angle;
        this.handSprites[this.handSpriteKey].angle += this.swingAngle
        this.bodyGraphic.rotation = this.angle;

        if (this.mouseHeld && this.dislayHand !== "hand" && !this.structureHand) {
            swing(socket, { swing: true });
        }

        if (this.clicked) {
            this.clicked = false;
            if (this.displayStructureHand && this.placeable) {
                clientCreateStructure(socket, {
                    type: this.structureHand,
                    globalX: this.displayStructureHandGlobalX,
                    globalY: this.displayStructureHandGlobalY,
                });
                this.structureHand = undefined;
            }
        }

        // add graphics to stage
        let handGraphic = this.handSprites[this.handSpriteKey];
        let bodyGraphic = this.bodyGraphic;
        stage.addChild(handGraphic, bodyGraphic); // hands drawn below body

        if (this.structureHand && this.displayStructureHand) {
            player.viewpoint.addChild(this.structureSprites[this.displayStructureHand]);
        } else {
            player.viewpoint.removeChild(this.structureSprites[this.displayStructureHand]);
        }

        if (this.targetCrate && clientState.crates[this.targetCrate.crateID]) { // if the player has a target crate and it exist in the client state
            this.targetCrateDist = Math.hypot(this.globalX - this.targetCrate.globalX, this.globalY - this.targetCrate.globalY);
            if (this.targetCrateDist > 100) {
                this.openCrate = false;
                this.targetCrate = undefined;
                this.targetCrateDist = undefined;
            }
        } else {
            this.targetCrate = undefined;
            this.targetCrateDist = undefined;
            this.openCrate = false;
        }



        // emit client info to server
        clientEmit(socket, {
            vx: this.vx,
            vy: this.vy,
            angle: this.angle,
            swingAngle: this.swingAngle,
            displayHand: this.displayHand,
            structureHand: this.structureHand,
            focused: !document.hidden,
            openCrate: this.openCrate
        });
    }

    resizeAdjust(x, y) {
        // re adjusts viewpoint and position of player when the window is resized
        this.x = x;
        this.y = y;
    }

    updateCollisionPoints() { // the math is a bit off, can check later
        // we will use the current tool tiered as the sample to base all calculations off of, but all tools, no matter tier, are the same
        this.collisionPoints['AxeHand'] = {
            x: this.globalX - 
            (this.handSprites[this.toolTier.concat('AxeHand')].width+this.bodyGraphic.width-50)/2
            *-Math.sin(-this.angle - (-0.95 + this.swingAngle * (Math.PI/180))), // update based on angle

            y: this.globalY - 
            (this.handSprites[this.toolTier.concat('AxeHand')].height+this.bodyGraphic.height-50)/2
            *-Math.cos(-this.angle - (-0.95 + this.swingAngle * (Math.PI/180)))
        }
        this.collisionPoints['SwordHand'] = {
            x: this.globalX - 
            (this.handSprites[this.toolTier.concat('SwordHand')].width+this.bodyGraphic.width-20)/2
            *-Math.sin(-this.angle - (-1.2 + this.swingAngle * (Math.PI/180))), // update based on angle

            y: this.globalY - 
            (this.handSprites[this.toolTier.concat('SwordHand')].height+this.bodyGraphic.height-20)/2
            *-Math.cos(-this.angle - (-1.2 + this.swingAngle * (Math.PI/180)))
        }
        /* point test, to see where the collision point for tested is
        let tested = this.displayHand;
        this.pointTest = new PIXI.Graphics();
        this.pointTest.lineStyle(4, 0xFF3300, 1);
        this.pointTest.beginFill(0x66CCFF);
        this.pointTest.drawCircle(this.collisionPoints[tested].x/2 + this.x/2, this.collisionPoints[tested].y/2 + this.y/2, 2);
        this.pointTest.zIndex = -10;
        this.pointTest.endFill();
        this.pointTest.position.set(this.collisionPoints[tested].x/2 + this.x/2, this.collisionPoints[tested].y/2 + this.y/2);
        stage.addChild(this.pointTest)*/
    }

    static createHandSprites(handSprites, x, y, tier) {
        /* this creates all hand sprites and puts them into the dictionary handSprites.
           handSprites are given a key (that describes what kind) which is connected to their corresponding sprite
           enemy and player classes have a displayHand string which is used as a key to pick which handSprite is currently being displayed.
           ex: displayHand = 'hand';
               handSprites[displayHand] references the handSprite 'hand', which is then rendered.
            if hand sprite already exists, then don't re add it
        */
        // creates sprites and sets anchor positions and locations for them
        if (!handSprites['hand']) {
            handSprites['hand'] = new PIXI.Sprite(loader.resources['player/hand'].texture);
            handSprites['hand'].anchor.x = 0.5;
            handSprites['hand'].anchor.y = 0.5;
            handSprites['hand'].position.set(x, y);
        }

        if (tier && !handSprites[tier.concat('AxeHand')]) {
            // axe hand
            handSprites[tier.concat('AxeHand')] = new PIXI.Sprite(loader.resources[`player/${tier}AxeHand`].texture);
            handSprites[tier.concat('AxeHand')].anchor.x = 0.4; // anchor positions have been pre calculated
            handSprites[tier.concat('AxeHand')].anchor.y = 0.55;
            handSprites[tier.concat('AxeHand')].position.set(x, y);
        }

        if (tier && !handSprites[tier.concat('SwordHand')]) {
            // sword hand
            handSprites[tier.concat('SwordHand')] = new PIXI.Sprite(loader.resources[`player/${tier}SwordHand`].texture);
            handSprites[tier.concat('SwordHand')].anchor.x = 0.256; // anchor positions have been pre calculated
            handSprites[tier.concat('SwordHand')].anchor.y = 0.38;
            handSprites[tier.concat('SwordHand')].position.set(x, y);
        }


        // etc.
    }
}

function keyboard(keyCode) {
    var key = {};
    key.code = keyCode;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;

  
    //The `downHandler`
    key.downHandler = event => {
      if (event.target.matches("input")) return; // disables player movement when input is focused

      if (event.keyCode === key.code) {
        if (key.isUp && key.press) key.press();
        key.isDown = true;
        key.isUp = false;
      }
      event.preventDefault();
    };
  
    //The `upHandler` 
    key.upHandler = event => {
      if (event.keyCode === key.code) {
        if (key.isDown && key.release) key.release();
        key.isDown = false;
        key.isUp = true;
      }
      event.preventDefault();
    };  
  
    //Attach event listeners
    window.addEventListener(
        "keydown", key.downHandler.bind(key), false
    );
    window.addEventListener(
        "keyup", key.upHandler.bind(key), false
    );
    return key;  
}