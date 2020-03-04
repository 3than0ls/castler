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

export class Consumable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            playerID: player.clientID,
            playerConsumable: player.consumable,
            
            images: images,

            showOverlay: {}, // keeps a dictionary of item components/names and whether or not to show the overlay for them
            amount: 0,
            constraints: {}, // constraints should be 0 and the amount of item the player has

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
            playerConsumable: player.consumable,
        });
        for (let [consumable, consumableData] of Object.entries(this.state.playerConsumable)) { // concat Image because the filename has Image at the end of it
            this.setState({
                constraints: { 
                    low: 0,
                    high: consumableData.amount,
                }
            });
            if (this.state.showOverlay[consumable] && !this.state.customValue) {
                this.setState({
                    amount: Math.round(consumableData.amount/2),
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
    handleDrop(consumable) {
        // prevent page from refreshing
        event.preventDefault();
        this.setState({customValue: false, amount: Math.round(this.state.constraints.high/2)})
        dropItem(socket, consumable, this.state.amount);
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
        for (let [consumable, consumableData] of Object.entries(this.state.playerConsumable)) { // concat Image because the filename has Image at the end of it

            let componentItem;
            if (consumableData.consumable) { // should always be true
                componentItem = 
                    <div
                        className="clickItem controlUIItem disableSelect" key={consumable}
                        onClick={() => {if (!this.state.hoverOnDropUI) this.itemClick(consumable, player)}}
                        onMouseEnter={() => this.setState(prevState => ({
                            showOverlay: {
                                ...prevState.showOverlay,
                                [consumable]: true,
                            },
                        }))}
                        onMouseLeave={() => this.setState(prevState => ({
                            showOverlay: {
                                ...prevState.showOverlay,
                                [consumable]: false,
                            },
                        }))}
                    >
                        <div className='controlUIItemName'>{`${displayRename(consumable)} x${consumableData.amount}`}</div>
                        <Image className='controlUIImage' src={this.state.images[consumable.concat('.png')] }/>

                        {this.state.showOverlay[consumable] && 
                            <Form 
                                className="dropItemForm" 
                                onSubmit={()=>{this.handleDrop(consumable)}} 
                                autoComplete="off"
                            >
                                <Form.Control 
                                    className="dropItemInput" 
                                    value={this.state.amount} 
                                    onChange={this.handleChange} 
                                    onMouseEnter={() => this.setState({hoverOnDropUI: true})}
                                    onMouseLeave={() => this.setState({hoverOnDropUI: false})}
                                    onFocus={() => this.setState({customValue: true})}
                                />

                                <Button 
                                    variant="dropItem" 
                                    type="submit" 
                                    className="disableSelect"
                                    onMouseEnter={() => this.setState({hoverOnDropUI: true})}
                                    onMouseLeave={() => this.setState({hoverOnDropUI: false})}
                                >
                                    Drop
                                </Button>
                            </Form>
                        }
                    </div>
            }
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