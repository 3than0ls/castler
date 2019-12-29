import React from 'react';
import ReactDOM from 'react-dom';

// react bootstrap components
import Image from 'react-bootstrap/Image';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import Pagination from 'react-bootstrap/Pagination';
import Button from 'react-bootstrap/Button';

// custom style sheets
import './controlUI.css';
import './../styles.css';


// images
import { player } from '../../app';
import { Inventory } from './inventory/inventory';
import { CraftingUI } from './crafting/crafting';


export class ControlUI extends React.Component {
    constructor() {
        super();
        this.state = {
            inventoryView: true,
        }

        this.inventoryClick = this.inventoryClick.bind(this);
        this.craftingClick = this.craftingClick.bind(this);
    }
    /*
    componentDidMount() {
        this.timerID = setInterval(() => this.tick(), 60); // learn more about this
    }
    componentWillUnmount() {
        clearInterval(this.timerID);
    }
    tick() { 
        this.setState({
        });
    }*/

    inventoryClick() {
        this.setState({
            inventoryView: true,
        });
    }

    craftingClick() {
        this.setState({
            inventoryView: false,
        });
    }

    render() {
        return(
            <> 
                <div id="controlUIWrapper">
                    <div id="controlUIContainer">
                        <Row>
                            <Button variant='customItem' key={'inventory'} active={this.state.inventoryView} onClick={this.inventoryClick}>
                                Inv
                            </Button>
                            <Button variant='customItem' key={'crafting'} active={!this.state.inventoryView} onClick={this.craftingClick}>
                                Cra
                            </Button>
                        </Row>
                        {this.state.inventoryView ? (
                            <div id='inventoryContainer'><Inventory /></div>
                        ) : (
                            <div id='craftingContainer'><CraftingUI /></div>
                        )}
                    </div>
                </div>
            </>
        )
    }
}