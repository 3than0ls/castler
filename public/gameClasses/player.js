import { stage, socket, renderer, clientState, worker, player, windowFocused } from "../app.js";
import { loader, assets } from "./../utils/loader.js";
import { clientEmit } from "../sockets/player/clientEmit.js";
import { ratio, gameWidth } from "./../utils/windowResize.js";
import { bump } from "../bump/bump.js";
import { harvest } from "../sockets/resources/harvest.js";
import { attack } from "../sockets/entities/attack.js";
import { charm } from "../charm/charm.js";
import { renderDeathMenu } from "../UI/death/menu.js";
import { clientCreateStructure } from "../sockets/player/clientCreateStructure.js";


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
        this.craftingState = {
            crafting: false,
            craftingComplete: 1,
        };

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
    }

    movementKeys() {
        // movement keys
        this.w = keyboard(87);
        this.a = keyboard(65);
        this.s = keyboard(83);
        this.d = keyboard(68);

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
        
        this.one.release = () => {
            if (this.displayHand !== 'hand') {

                stage.removeChild(this.handSprites[this.handSpriteKey]);
                this.swingAngle = 0;
                this.swingAvailable = true;
                this.displayHand = 'hand';
            }
        }
        this.two.release = () => {
            if (this.displayHand !== 'AxeHand') {

                stage.removeChild(this.handSprites[this.handSpriteKey]);
                this.swingAngle = 0;
                this.swingAvailable = true;
                this.displayHand = 'AxeHand';
            }
        }
        this.three.release = () => {
            if (this.displayHand !== 'SwordHand') {

                stage.removeChild(this.handSprites[this.handSpriteKey]);
                this.swingAngle = 0;
                this.swingAvailable = true;
                this.displayHand = 'SwordHand';
            }
        }
    }

    swing() {
        if (this.swingAvailable) {
            this.swingAngle = 0;
            this.stopRotation = 70;
            this.swingBack = false;
            
            this.swingAvailable = false;
        }
        
        
        if (!this.swingBack) {
            if (this.displayHand === "AxeHand") this.swingAngle += this.harvestSpeed;
            else if (this.displayHand === "SwordHand") this.swingAngle += this.attackSpeed;
        } else {
            if (this.displayHand === "AxeHand") this.swingAngle -= this.harvestSpeed;
            else if (this.displayHand === "SwordHand") this.swingAngle -= this.attackSpeed;
        }

        if (this.swingAngle < this.stopRotation) {
            // harvest: if collided with resource during swing and before sto2p rotation, call resource function
            if (this.displayHand === "AxeHand") {
                this.resourceHarvest();
            } else if (this.displayHand === "SwordHand") {
                this.entityAttack();
            }
        } else if (this.swingAngle >= this.stopRotation) {
            this.swingBack = true;
        }

        
        if (this.swingAngle <= 0 && this.swingBack) { // end of animation - swingAvailable is true (another swing is available)
            /* test tracking
            let circle = new PIXI.Graphics();
            circle.beginFill(0x9966FF);
            circle.drawCircle(this.collisionPoints['axeHand'].x, this.collisionPoints['axeHand'].y, 10);
            circle.endFill();
            this.viewpoint.addChild(circle);
            */
            this.swingAvailable = true;
            this.swingAngle = 0;
        }
        // determine hand sprite key
        this.handSpriteKey = this.displayHand === 'hand' ? 'hand' : this.toolTier.concat(this.displayHand);

        this.handSprites[this.handSpriteKey].angle += this.swingAngle;
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
        this.inventory = inventory;
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
        this.displayStructureHand = structureHand;
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

        for (let resource of Object.values(clientState.resources)) {
            if (Math.hypot(resource.globalX - this.globalX, resource.globalY - this.globalY) < 750) {
                let test = bump.hitTestCircle(resource.resourceGraphic, this.structureSprites[structureHand]);
                if (test) {
                    this.placeable = false;
                    break;
                }
            }
        }

        if (this.placeable) {
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

        // update viewpoint
        this.viewpointUpdate();

        // update client needed hand/tool collision points
        this.updateCollisionPoints();

        // update angle 
        this.angle = -Math.atan2(this.mouseX - this.x, this.mouseY - this.y);
        this.handSprites[this.handSpriteKey].rotation = this.angle;
        this.bodyGraphic.rotation = this.angle;

        // test and handle collisions  for resources and entities
        this.collisions();

        // detect clicks and respond
        if ((this.mouseHeld || this.swingAngle > 0) && (this.displayHand !== "hand")) { // if mouse held or effectively the swing has already started 
            this.swing();
        } else {
            this.swingAvailable = true;
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
        
        // emit client info to server
        clientEmit(socket, {
            vx: this.vx,
            vy: this.vy,
            collisionvx: this.collisionvx,
            collisionvy: this.collisionvy,
            angle: this.angle,
            swingAngle: this.swingAngle,
            displayHand: this.displayHand,
            structureHand: this.structureHand,
            focused: windowFocused,
        });
    }

    collisions() {
        this.collisionvx = 0;
        this.collisionvy = 0;

        for (let resource of Object.values(clientState.resources)) {
            resource.collide(this.bodyGraphic);
        }
        for (let entity of Object.values(clientState.entities)) {
            entity.collide(this.bodyGraphic);
        }
        for (let structure of Object.values(clientState.structures)) {
            structure.collide(this.bodyGraphic);
        }
    }

    resourceHarvest() {
        for (let resource of Object.values(clientState.resources)) {
            if (resource.handSpriteCollision(this.collisionPoints[this.displayHand]) && !resource.alreadyHit) {
                resource.alreadyHit = true; // if it's already hit, don't allow another hit to be registered and it to be harvested again
                // create velocity and direction in which a resource bumps towards
                let a = resource.globalX - this.collisionPoints[this.displayHand].x;
                let b = resource.globalY - this.collisionPoints[this.displayHand].y;
                let vx = (Math.asin(a / Math.hypot(a, b))*10);
                let vy = (Math.asin(b / Math.hypot(a, b))*10);

                // then emit harvest
                harvest(socket, {
                    resourceID: resource.resourceID,
                    amount: 1,
                    vx: vx,
                    vy: vy,
                    collisionX: this.collisionPoints[this.displayHand].x,
                    collisionY: this.collisionPoints[this.displayHand].y,
                    harvestSpeed: this.harvestSpeed
                })
            }
            if (this.swingAngle <= 0) { // once swing resets, reset alreadyHit to false
                resource.alreadyHit = false;
            }
        }
    }

    entityAttack() {
        for (let entity of Object.values(clientState.entities)) {
            if (entity.handSpriteCollision(this.collisionPoints[this.displayHand]) && !entity.alreadyHit) {
                entity.alreadyHit = true; // if it's already hit, don't allow another hit to be registered and it to be harvested again

                // create velocity and direction in which an entity gets hit towards
                let a = entity.globalX - this.collisionPoints[this.displayHand].x;
                let b = entity.globalY - this.collisionPoints[this.displayHand].y;
                let vx = (Math.asin(a / Math.hypot(a, b))*10);
                let vy = (Math.asin(b / Math.hypot(a, b))*10);

                // then emit harvest
                attack(socket, {
                    entityID: entity.entityID,
                    vx: vx,
                    vy: vy,
                    collisionX: this.collisionPoints[this.displayHand].x,
                    collisionY: this.collisionPoints[this.displayHand].y,
                    attackSpeed: this.attackSpeed
                })
            }
            if (this.swingAngle <= 0) { // once swing resets, reset alreadyHit to false
                entity.alreadyHit = false;
            }
        }
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