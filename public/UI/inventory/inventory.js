import React from 'react';
import ReactDOM from 'react-dom';

// react bootstrap components
import Image from 'react-bootstrap/Image';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';

// custom style sheets
import './inventory.css';
import './../styles.css';

// images
import stone from "./../../assets/stone.png";
import wood from "./../../assets/wood.png";
import { player } from '../../game';

export class Inventory extends React.Component {
    constructor() {
        super();
        this.state = {
            playerInventory: player.inventory,

            woodImage: wood,
            stoneImage: stone,

            wood: player.inventory['wood'],
            stone: player.inventory['stone'],
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
            playerInventory: player.inventory
        });
    }

    render() {
        const inventory = [];
        for (let [item, amount] of Object.entries(this.state.playerInventory)) {
            inventory.push(
                <div key={item}>
                    <Row className='items' variant="primary">{item}{" x"}{amount}</Row>
                    <Row variant="primary"><Image className='images' src={this.state[item.concat('Image')]}/></Row>
                </div>
            )
        }
        /* 
            <Row className='items' variant="primary">Wood x{this.state.wood}</Row>
            <Row variant="primary"><Image className='images' src={this.state.woodImage}/></Row>
            <Row className='items' variant="primary">Stone x{this.state.stone}</Row>
            <Row variant="primary"><Image className='images' src={this.state.stoneImage}/></Row>
        */
        return( // return react fragment
            <> 
                <h1 className='overlayBox'>hello!</h1>
                <Col className='overlayBox'>
                    {inventory}
                </Col>
            </>
        )
    }
}