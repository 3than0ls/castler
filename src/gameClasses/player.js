import { stage, socket, renderer } from "./../game.js";
import { loader, assets } from "./../loader.js";
import { clientEmit } from "../sockets/clientEmit.js";

export class Player {
    constructor(clientID) {
        this.x = window.innerWidth/2;
        this.y = window.innerHeight/2;

        this.globalX = 40;
        this.globalY = 0;
        this.clientID = clientID;

        this.mouseX;
        this.mouseY;

        this.vx = 0;
        this.vy = 0;

        this.viewpoint = new PIXI.Container();

        // player game stats
        this.speed = 2;
    }
    movementKeys() {
        this.w = keyboard(87);
        this.a = keyboard(65);
        this.s = keyboard(83);
        this.d = keyboard(68);

        // Left
        this.a.press = () => {
            if (this.w.isDown || this.s.isDown) {
                this.vx = -this.speed * Math.sin(45);
                console.log('left')
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
                console.log('up')
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
                console.log('right')
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
                console.log('down')
            } else {
                this.vy = this.speed;
            }
        };
        this.s.release = () => {
            if (!this.w.isDown) {
                this.vy = 0;
            }
        };
    }

    render() {
        // render body graphic
        this.bodyGraphic = new PIXI.Sprite(loader.resources['playerBody'].texture);
        // set positions
        this.bodyGraphic.anchor.x = 0.5;
        this.bodyGraphic.anchor.y = 0.5;
        this.bodyGraphic.position.set(this.x, this.y);

        // render hands (maybe later, when multiple hands are added, make each one pre loaded and switch which one is rendered)
        // each one has a different name: normal hands will be handGraphic, axe will be axeHandGraphic
        this.axeHandGraphic = new PIXI.Sprite(loader.resources['axeHand'].texture);
        // set positions
        this.axeHandGraphic.anchor.x = 0.4; // anchor positions have been pre calculated
        this.axeHandGraphic.anchor.y = 0.55;
        this.axeHandGraphic.position.set(this.x, this.y);

        // movement keys
        this.movementKeys();

        // finally, render each to the stage
        let axeHandGraphic = this.axeHandGraphic;
        let bodyGraphic = this.bodyGraphic;
        stage.addChild(axeHandGraphic, bodyGraphic); // hands drawn below body

        /* viewpoint testing */
        this.testShape = new PIXI.Sprite(loader.resources['blueCastle'].texture);
        this.testShape.position.set(500, 500);
        let testShape = this.testShape;
        this.viewpoint.addChild(testShape);

        // render viewpoint to stage
        this.viewpoint.position.set(this.globalX, this.globalY);
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
        console.log(this.testShape.getGlobalPosition().x);


        this.viewpoint.position.set(-this.globalX, -this.globalY);
        let viewpoint = this.viewpoint; // render viewpoint to stage
        stage.addChild(viewpoint);
    }
    
    update() {
        // update mouse position variables
        this.mouseX = renderer.plugins.interaction.mouse.global.x;
        this.mouseY = renderer.plugins.interaction.mouse.global.y;

        // update positioning
        this.x = this.bodyGraphic.x;
        this.y = this.bodyGraphic.y;

        // update global positioning
        this.globalX += this.vx;
        this.globalY += this.vy;
        // perhaps a viewpoint window update here

        // update angle 
        this.angle = -Math.atan2(this.mouseX - this.x, this.mouseY - this.y);
        this.axeHandGraphic.rotation = this.angle;
        this.bodyGraphic.rotation = this.angle;

        // update viewpoint
        this.viewpointUpdate();

        // add graphics to stage
        let bodyGraphic = this.bodyGraphic;
        let axeHandGraphic = this.axeHandGraphic;
        stage.addChild(axeHandGraphic, bodyGraphic);

        // emit client info to server
        clientEmit(socket, {
            globalX: this.globalX,
            globalY: this.globalY,
            angle: this.angle,
        });
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