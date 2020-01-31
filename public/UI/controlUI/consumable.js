import React from 'react';
import ReactDOM from 'react-dom';

// react bootstrap components
import Image from 'react-bootstrap/Image';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';


// images
import { player, socket } from '../../app';
import { clientRequestConsume } from '../../sockets/player/clientRequestConsume';

import { images } from './controlUI.js';

export class Consumable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            playerID: player.clientID,
            playerConsumable: player.consumable,
            
            images: images,
        }
    }
    componentDidMount() {
        this.timerID = setInterval(() => this.tick(), 60); // learn more about this
    }
    componentWillUnmount() {
        clearInterval(this.timerID);
    }
    tick() { 
        this.setState({
            playerConsumable: player.consumable,
        });
    }

    itemClick(item, player) {
        if (item === 'workbench' || item === 'furnace' || item === 'wall') {
            if (player.structureHand === item) {
                player.structureHand = undefined;
            } else {
                player.structureHand = item;
            }
        } else {
            clientRequestConsume(socket, item);
        }
    }

    render() {
        function displayRename(itemName) {
            let name = '';
            for (let i = 0; i < itemName.length; i++) {
                let char = itemName.charAt(i);
                if (char == char.toUpperCase()) {
                    name += ` ${char.toLowerCase()}`;
                } else {
                    name += char;
                }
            }
            return name;
        }

        const consumableComponents = [];
        // <Row className='items' variant="primary">{item}{" x"}{amount}</Row>
        for (let [consumable, consumableData] of Object.entries(this.state.playerConsumable)) { // concat Image because the filename has Image at the end of it

            let componentItem = 
            <Button variant="clickItem" key={consumable} className="controlUIItem disableSelect" onClick={() => this.itemClick(consumable, player)}>
                <div className='controlUIItemName'>{displayRename(consumable)}{" x"}{consumableData.amount}</div>
                <Image className='controlUIImage' src={this.state.images[consumable.concat('.png')]}/>
            </Button>
            consumableComponents.push(componentItem);
            
        }
        return(
            <> 
                <div>
                    {consumableComponents.length !== 0 && 
                        <Col>
                            {consumableComponents}
                        </Col>
                    }
                </div>
            </>
        )
    }
}