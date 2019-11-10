import { stage, socket, renderer, player } from "./../game.js";
import { loader, assets } from "./../utils/loader.js";
import { clientEmit } from "../sockets/clientEmit.js";
import { ratio } from "./../utils/windowResize.js";

export class Player {
    constructor(clientID) {
        this.x = window.innerWidth/2;
        this.y = window.innerHeight/2; // are these really needed?

        this.globalX = 40;
        this.globalY = 0;
        this.clientID = clientID;

        this.mouseX;
        this.mouseY;

        this.displayHand = 'hand';
        this.handSprites = {};

        this.vx = 0;
        this.vy = 0;

        this.viewpoint = new PIXI.Container();

        // player game stats
        this.speed = 2;
    }

    movementKeys() {
        // movement keys
        this.w = keyboard(87);
        this.a = keyboard(65);
        this.s = keyboard(83);
        this.d = keyboard(68);

        this.e = keyboard(69);


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

        this.e.press = () => {
            stage.removeChild(this.handSprites[this.displayHand]);
            this.displayHand = 'axeHand';
        }
        this.e.release = () => {
            stage.removeChild(this.handSprites[this.displayHand]);
            this.displayHand = 'hand';
        }
    }

    render() {
        // render body graphic
        this.bodyGraphic = new PIXI.Sprite(loader.resources['playerBody'].texture);
        // set positions
        this.bodyGraphic.anchor.x = 0.5;
        this.bodyGraphic.anchor.y = 0.5;
        this.bodyGraphic.position.set(this.x, this.y);

        // render and create hands
        Player.createHandSprites(this.handSprites, this.x, this.y);

        // movement keys
        this.movementKeys();

        // finally, render each to the stage
        let handGraphic = this.handSprites[this.displayHand];
        let bodyGraphic = this.bodyGraphic;
        stage.addChild(handGraphic, bodyGraphic); // hands drawn below body

        /* viewpoint testing */
        this.testShape = new PIXI.Sprite(loader.resources['blueCastle'].texture);
        this.testShape.position.set(500, 500);
        let testShape = this.testShape;
        this.viewpoint.addChild(testShape);


        // allow viewpoint to have sortable children
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
        /* viewpoint testing */
        let testShape = this.testShape;
        this.viewpoint.addChild(testShape);
        

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
        this.handSprites[this.displayHand].position.set(this.x, this.y)

        // update global positioning
        this.globalX += this.vx;
        this.globalY += this.vy;
        // perhaps a viewpoint window update here

        // update angle 
        this.angle = -Math.atan2(this.mouseX - this.x, this.mouseY - this.y);
        this.handSprites[this.displayHand].rotation = this.angle;
        this.bodyGraphic.rotation = this.angle;

        // update viewpoint
        this.viewpointUpdate();

        // add graphics to stage
        let handGraphic = this.handSprites[this.displayHand];
        let bodyGraphic = this.bodyGraphic;
        stage.addChild(handGraphic, bodyGraphic); // hands drawn below body

        // emit client info to server
        clientEmit(socket, {
            globalX: this.globalX,
            globalY: this.globalY,
            angle: this.angle,
            displayHand: this.displayHand
        });
    }

    resizeAdjust(x, y) {
        // re adjusts viewpoint and position of player when the window is resized
        this.x = x;
        this.y = y;
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