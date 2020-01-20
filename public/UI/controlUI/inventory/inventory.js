import React from 'react';
import ReactDOM from 'react-dom';

// react bootstrap components
import Image from 'react-bootstrap/Image';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';


// images
import { player, socket } from '../../../app';
import { clientRequestConsume } from '../../../sockets/player/clientRequestConsume';

function importAll (r) {
    let images = {};
    r.keys().map((item, index) => { images[item.replace('./', '')] = r(item); });
    return images;
}

const itemImages = importAll(require.context('./../../../assets/items', false,  /\.png$/));
const structureImages = importAll(require.context('./../../../assets/structures', false,  /\.png$/));
const images = {...itemImages, ...structureImages}; 
// possibly edit this so images are loaded dynamically, and only when the player has the item

export class Inventory extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            playerID: player.clientID,
            playerInventory: player.inventory,
            
            nickname: window.localStorage.getItem('nickname'),
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
            playerInventory: player.inventory,
        });
    }

    itemClick(item, player) {
        if (item === 'workbench') {
            if (!player.structureHand) {
                player.structureHand = 'workbench';
            } else {
                player.structureHand = undefined;
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

        const inventoryComponents = [];
        // <Row className='items' variant="primary">{item}{" x"}{amount}</Row>
        for (let [item, itemData] of Object.entries(this.state.playerInventory)) { // concat Image because the filename has Image at the end of it

            let componentItem;
            if (!itemData.consumable) {
                componentItem = 
                    <div key={item} className="controlUIItem">
                        <div className='controlUIItemName'>{displayRename(item)}{" x"}{itemData.amount}</div>
                        <Image className='controlUIImage' src={this.state.images[item.concat('.png')] }/>
                    </div>
            } else {
                componentItem = 
                    <Button variant="clickItem" key={item} className="controlUIItem disableSelect" onClick={() => this.itemClick(item, player)}>
                        <div className='controlUIItemName'>{displayRename(item)}{" x"}{itemData.amount}</div>
                        <Image className='controlUIImage' src={this.state.images[item.concat('.png')]}/>
                    </Button>

            }
            inventoryComponents.push(componentItem);
        }
        /* 
            <Row className='items' variant="primary">Wood x{this.state.wood}</Row>
            <Row variant="primary"><Image className='images' src={this.state.woodImage}/></Row>
            <Row className='items' variant="primary">Stone x{this.state.stone}</Row>
            <Row variant="primary"><Image className='images' src={this.state.stoneImage}/></Row>
        */
        return(
            <> 
                <div>
                    {inventoryComponents.length !== 0 && 
                        <Col>
                            {inventoryComponents}
                        </Col>
                    }
                </div>
            </>
        )
    }
}