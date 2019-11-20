import { stage, socket, renderer, player, clientState } from "./../game.js";
import { loader, assets } from "./../utils/loader.js";
import { clientEmit } from "../sockets/clientEmit.js";
import { ratio, gameWidth } from "./../utils/windowResize.js";
import { bump } from "../bump/bump.js";
import { harvest } from "../sockets/harvest.js";

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

        this.viewpoint = new PIXI.Container();

        // player game stats
        this.speed = 4;
        this.harvestSpeed = 3;

        // player statuses and small stuff
        // swing animation variables
        this.swingAngle = 0;
        this.swingAvailable = true;
        this.stopRotation = 40;
        this.swingBack = false;
        // mouse variable
        this.mouseHeld = false;
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
            if (this.w.isDown || this.s.isDown) {
                this.vx = -this.speed * Math.sin(45);
            } else {
                this.vx = -this.speed;
            }
        };
        this.a.release = () => {
            if (!this.d.isDown) {
                this.vx = 0;
            }
        };
    
        // Up
        this.w.press = () => {
            if (this.a.isDown || this.d.isDown) {
                this.vy = -this.speed * Math.sin(45);
            } else {
                this.vy = -this.speed;
            }
        };
        this.w.release = () => {
            if (!this.s.isDown) {
                this.vy = 0;
            }
        };
    
        // Right
        this.d.press = () => {
            if (this.w.isDown || this.s.isDown) {
                this.vx = this.speed * Math.sin(45);
            } else {
                this.vx = this.speed;
            }
        };
        this.d.release = () => {
            if (!this.a.isDown) {
                this.vx = 0;
            }
        };
    
        // Down
        this.s.press = () => {
            if (this.a.isDown || this.d.isDown) {
                this.vy = this.speed * Math.sin(45);
            } else {
                this.vy = this.speed;
            }
        };
        this.s.release = () => {
            if (!this.w.isDown) {
                this.vy = 0;
            }
        };
        this.one.release = () => {
            stage.removeChild(this.handSprites[this.displayHand]);
            this.swingAvailable = true;
            this.displayHand = 'hand';
        }
        this.two.release = () => {
            stage.removeChild(this.handSprites[this.displayHand]);
            this.swingAvailable = true;
            this.displayHand = 'axeHand';
        }
        this.three.release = () => {
            stage.removeChild(this.handSprites[this.displayHand]);
            this.swingAvailable = true;
            this.displayHand = 'pickaxeHand';
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
            this.swingAngle += this.harvestSpeed;
        } else {
            this.swingAngle -= this.harvestSpeed;
        }

        if (this.swingAngle < this.stopRotation) {
        } else if (this.swingAngle >= this.stopRotation) {
            this.swingBack = true;
        }

        // harvest: if collided with resource during swing, call resource function
        if (!this.swingAvailable) this.resourceHarvest();
        
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
        this.handSprites[this.displayHand].angle += this.swingAngle;
    }

    mouse() {
        renderer.plugins.interaction.on('mousedown', () => {
            this.mouseHeld = true;
        });
        renderer.plugins.interaction.on('mouseup', () => {
            this.mouseHeld = false;
        })
    }

    render() {
        // render body graphic
        this.bodyGraphic = new PIXI.Sprite(loader.resources['playerBody'].texture);
        this.bodyGraphic.circular = true; // bump js settings
        // set positions
        this.bodyGraphic.anchor.x = 0.5;
        this.bodyGraphic.anchor.y = 0.5;
        this.bodyGraphic.position.set(this.x, this.y);

        // render and create hands
        Player.createHandSprites(this.handSprites, this.x, this.y);

        // create client needed hand/tool collision points
        this.updateCollisionPoints();

        // movement keys
        this.movementKeys();
        // mouse event detection
        this.mouse();

        // finally, render each to the stage
        let handGraphic = this.handSprites[this.displayHand];
        let bodyGraphic = this.bodyGraphic;
        stage.addChild(handGraphic, bodyGraphic); // hands drawn below body

        // allow viewpoint to have sortable children, so zIndex works
        this.viewpoint.sortableChildren = true;

        // render viewpoint to stage
        this.viewpoint.position.set(-this.globalX+this.x, -this.gloalY+this.y); // adjust so its positioned in the middle
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
    
    update() {
        // update mouse position variables
        this.mouseX = renderer.plugins.interaction.mouse.global.x/ratio;
        this.mouseY = renderer.plugins.interaction.mouse.global.y/ratio;

        // update positioning to x and y display (not global). x and y will only ever change in screen resizes
        this.bodyGraphic.position.set(this.x, this.y);
        this.handSprites[this.displayHand].position.set(this.x, this.y);

        // update global positioning
        this.globalX += this.vx;
        this.globalY += this.vy;
        // perhaps a viewpoint window update here

        // update client needed hand/tool collision points
        this.updateCollisionPoints();

        // update angle 
        this.angle = -Math.atan2(this.mouseX - this.x, this.mouseY - this.y);
        this.handSprites[this.displayHand].rotation = this.angle;
        this.bodyGraphic.rotation = this.angle;

        // update viewpoint
        this.viewpointUpdate();

        // detect clicks and respond
        if ((this.mouseHeld || this.swingAngle > 0) && this.displayHand === 'axeHand') { // if mouse held or effectively the swing has already started 
            this.swing();
        } else {
            this.swingAvailable = true;
        }

        // add graphics to stage
        let handGraphic = this.handSprites[this.displayHand];
        let bodyGraphic = this.bodyGraphic;
        stage.addChild(handGraphic, bodyGraphic); // hands drawn below body

        // test and handle collisions 
        this.resourceCollision();

        // emit client info to server
        clientEmit(socket, {
            globalX: this.globalX,
            globalY: this.globalY,
            angle: this.angle,
            swingAngle: this.swingAngle,
            displayHand: this.displayHand
        });
    }

    resourceCollision() {
        const resourceIDs = Object.keys(clientState.resources);
        for(let i = 0; i < resourceIDs.length; i++) {
            clientState.resources[resourceIDs[i]].collide(this.bodyGraphic);
        }
    }

    resourceHarvest() {
        const resourceIDs = Object.keys(clientState.resources);
        for (let i = 0; i < resourceIDs.length; i++) {
            if (clientState.resources[resourceIDs[i]].handSpriteCollision(this.collisionPoints[this.displayHand]) && !clientState.resources[resourceIDs[i]].alreadyHit) {
                clientState.resources[resourceIDs[i]].alreadyHit = true; // if it's already hit, don't allow another hit to be registered and it to be harvested again
                // create velocity and direction in which a resource bumps towards
                let a = clientState.resources[resourceIDs[i]].globalX - this.globalX;
                let b = clientState.resources[resourceIDs[i]].globalY - this.globalY;
                const vx = (Math.asin(a / Math.hypot(a, b))*10);
                const vy = (Math.asin(b / Math.hypot(a, b))*10);

                // then emit harvest
                harvest(socket, {
                    resourceID: clientState.resources[resourceIDs[i]].resourceID,
                    amount: 1,
                    vx: vx,
                    vy: vy,
                    harvestSpeed: this.harvestSpeed
                })
            }
            if (this.swingAngle <= 0) { // once swing resets, reset alreadyHit to falsesss
                clientState.resources[resourceIDs[i]].alreadyHit = false;
            }
        }
    }

    resizeAdjust(x, y) {
        // re adjusts viewpoint and position of player when the window is resized
        this.x = x;
        this.y = y;
    }

    updateCollisionPoints() {
        this.collisionPoints['axeHand'] = {
            x: this.globalX + 
            (this.handSprites['axeHand'].width/
            (this.handSprites['axeHand'].width/this.bodyGraphic.width))*Math.sin(-this.angle - (this.swingAngle * (Math.PI/180))), // update based on angle

            y: this.globalY +
            (this.handSprites['axeHand'].height/
            (this.handSprites['axeHand'].height/this.bodyGraphic.height))*Math.cos(-this.angle - (this.swingAngle * (Math.PI/180)))
        }
        /* point test, to see where the collision point for axeHand is
        this.pointTest = new PIXI.Graphics();
        this.pointTest.lineStyle(4, 0xFF3300, 1);
        this.pointTest.beginFill(0x66CCFF);
        this.pointTest.drawCircle(this.collisionPoints['axeHand'].x, this.collisionPoints['axeHand'].y, 10);
        this.pointTest.endFill();
        this.pointTest.position.set(this.collisionPoints['axeHand'].x, this.collisionPoints['axeHand'].y);
        this.viewpoint.addChild(this.pointTest)*/
    }

    static createHandSprites(handSprites, x, y) {
        /* this creates all hand sprites and puts them into the dictionary handSprites.
           handSprites are given a key (that describes what kind) which is connected to their corresponding sprite
           enemy and player classes have a displayHand string which is used as a key to pick which handSprite is currently being displayed.
           ex: displayHand = 'hand';
               handSprites[displayHand] references the handSprite 'hand', which is then rendered.
        */
        // creates sprites and sets anchor positions and locations for them
        handSprites['hand'] = new PIXI.Sprite(loader.resources['hand'].texture);
        handSprites['hand'].anchor.x = 0.5;
        handSprites['hand'].anchor.y = 0.5;
        handSprites['hand'].position.set(x, y);
        handSprites['hand'].zIndex = 49;

        // axe hand
        handSprites['axeHand'] = new PIXI.Sprite(loader.resources['axeHand'].texture);
        handSprites['axeHand'].anchor.x = 0.4; // anchor positions have been pre calculated
        handSprites['axeHand'].anchor.y = 0.55;
        handSprites['axeHand'].position.set(x, y);
        handSprites['axeHand'].zIndex = 49;

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