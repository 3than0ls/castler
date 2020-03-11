import React from 'react';

// react bootstrap components
import Image from 'react-bootstrap/Image';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form'


// images
import { player, socket } from '../../app';
import { clientRequestConsume } from '../../sockets/player/clientRequestConsume';

import { images } from './controlUI.js';
import { dropItem } from '../../sockets/player/clientDrop';

export class Inventory extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            playerID: player.clientID,
            playerInventory: player.inventory,
            
            nickname: window.localStorage.getItem('nickname'),
            images: images,

            showOverlay: {},
            amount: 0,
            constraints: { low: 0, high: 100 },

            hoverOnDropUI: false,
            customValue: false,
        }
        this.handleChange = this.handleChange.bind(this);
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
        for (let [item, itemData] of Object.entries(this.state.playerInventory)) { // concat Image because the filename has Image at the end of it
            this.setState({
                constraints: { 
                    low: 0,
                    high: itemData.amount,
                }
            });
            if (this.state.showOverlay[item] && !this.state.customValue) {
                this.setState({
                    amount: Math.round(itemData.amount/2),
                });
            }
            if (this.state.amount < this.state.constraints.low || this.state.amount > this.state.constraints.high) {
                this.setState({
                    amount: this.state.constraints.high
                });
            }
        }
    }

    handleChange(event) {
        if (event.target.value.toString() === '') {
            this.setState({amount: ''});
        } else {
            let amount = parseInt(event.target.value.toString().replace(/\D/g, ''));
            if (amount !== amount) {
                this.setState({amount: Math.round(this.state.constraints.high/2)})
            } else if (this.state.amount < this.state.constraints.low || this.state.amount > this.state.constraints.high) {
                this.setState({
                    amount: this.state.constraints.high
                });
            } else {
                this.setState({amount: amount});
            }
        }
    }

    handleDrop(item) {
        // prevent page from refreshing
        event.preventDefault();
        dropItem(socket, item, this.state.amount)
    }

    itemClick(item, player) {
        if (item === 'workbench' || item === 'furnace' || item === 'wall') {
            if (player.structureHand === item) {
                player.structureHand = undefined;
            }
            player.structureHand = item;
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
        for (let [item, itemData] of Object.entries(this.state.playerInventory)) { // concat Image because the filename has Image at the end of it

            let componentItem;
            if (!itemData.consumable) { // should always be true
                componentItem = 
                    <div 
                        className="controlUIItem" key={item}
                        onMouseEnter={() => this.setState(prevState => ({
                            showOverlay: {
                                ...prevState.showOverlay,
                                [item]: true,
                            },
                        }))}
                        onMouseLeave={() => this.setState(prevState => ({
                            showOverlay: {
                                ...prevState.showOverlay,
                                [item]: false,
                            },
                        }))}
                    >
                        <div className='controlUIItemName'>{`${displayRename(item)} x${itemData.amount}`}</div>
                        <Image className='controlUIImage' src={this.state.images[item.concat('.png')] }/>

                        {this.state.showOverlay[item] && 
                            <Form className="dropItemForm" onSubmit={()=>{this.handleDrop(item)}} autoComplete="off">
                                <Form.Control 
                                    className="dropItemInput" 
                                    value={this.state.amount} 
                                    onChange={this.handleChange}
                                    onFocus={() => this.setState({customValue: true})}
                                />

                                <Button variant="dropItem" type="submit" className="disableSelect">
                                    Drop
                                </Button>
                            </Form>
                        }
                    </div>
            }
            inventoryComponents.push(componentItem);
        }
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