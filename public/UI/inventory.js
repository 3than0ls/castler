import React from 'react';
import ReactDOM from 'react-dom';

// how in the actual hell does react bootstrap work? find out

// react bootstrap components
import Image from 'react-bootstrap/Image';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';

// images
import tree from "./../assets/tree.png";
import rock from "./../assets/rock.png";

export class Inventory extends React.Component {
    constructor() {
        super();
            this.state = {
                tree: tree,
                rock: rock,
            }
    }
    render() {
        return(
            <React.Fragment>
                <ListGroup horizontal='true'>
                    <ListGroup.Item className="w-25" variant="primary">Wood<Image src={this.state.tree} fluid/></ListGroup.Item>
                    <ListGroup.Item className="w-25" variant="primary">Stone<Image src={this.state.rock} fluid/></ListGroup.Item>
                </ListGroup>
            </React.Fragment>
        )
    }
}

ReactDOM.render(<Inventory />, document.getElementById('root')); // have not yet created this element