import { stage } from "./../game.js";
import { loader, assets } from "./../loader.js";

export class Player {
    constructor(clientID) {
        this.x = window.innerWidth/2;
        this.y = window.innerHeight/2;

        this.globalX = 0;
        this.globalY = 0;
        this.clientID = clientID;

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
    }

    

    update() {
        // update positioning
        this.x = this.bodyGraphic.x;
        this.y = this.bodyGraphic.y;

        this.axeHandGraphic.angle++;


        // add graphics to stage
        let bodyGraphic = this.bodyGraphic;
        let axeHandGraphic = this.axeHandGraphic;
        stage.addChild(axeHandGraphic, bodyGraphic);
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