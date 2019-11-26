import React from 'react';
import ReactDOM from 'react-dom';

// how in the actual hell does react bootstrap work? find out

// react bootstrap components
import Image from 'react-bootstrap/Image';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';

// custom style sheets
import './inventory.css';

// images
import stone from "./../assets/stone.png";
import wood from "./../assets/wood.png";
import { player } from './../game';

export class Inventory extends React.Component {
    constructor() {
        super();
        this.state = {
            woodImage: wood,
            stoneImage: stone,

            wood: player.resources['wood'],
            stone: player.resources['stone'],
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
            wood: player.resources['wood'],
            stone: player.resources['stone'],
        });
    }

    render() {
        return( // return react fragment
            <> 
                <h1 className='overlay'>hello!</h1>
                <Col className='overlay'>
                    <Row className='items' variant="primary">Wood x{this.state.wood}</Row>
                    <Row variant="primary"><Image className='images' src={this.state.woodImage}/></Row>
                    <Row className='items' variant="primary">Stone x{this.state.stone}</Row>
                    <Row variant="primary"><Image className='images' src={this.state.stoneImage}/></Row>
                </Col>
            </>
        )
    }
}