import React, { Component } from 'react';
//import './Card.css';

class Card extends Component {
	render() {
		return (
			<div className="Card">
				<img src={this.props.image} />
			</div>
		);
	}
}

export default Card;
