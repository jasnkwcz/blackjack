import React, { Component } from 'react';
import Card from './Card';
import axios from 'axios';
import './Game.css';
import scoring from './scoring';

class Game extends Component {
	constructor(props) {
		super(props);
		this.state = {
			deckId: '',
			dealerHand: [],
			dealerScore: 0,
			playerHand: [],
			playerScore: 0,
			stayed: false,
			blackjack: false,
			gameOver: false,
			hasBlackjack: false
		};
		this.hit = this.hit.bind(this);
		this.handleHit = this.handleHit.bind(this);
		this.stay = this.stay.bind(this);
		this.handleStay = this.handleStay.bind(this);
		this.handlePlayerScoring = this.handlePlayerScoring.bind(this);
		this.handleDealerScoring = this.handleDealerScoring.bind(this);
	}

	componentDidMount() {
		axios.get('https://deckofcardsapi.com/api/deck/new/draw/?count=4').then((response) => {
			let newState = this.state;
			newState.deckId = response.data.deck_id;
			newState.dealerHand.push(response.data.cards[1], response.data.cards[3]);
			newState.playerHand.push(response.data.cards[0], response.data.cards[2]);
			console.log(scoring[response.data.cards[1].value]);
			this.handlePlayerScoring(response.data.cards[0], newState);
			this.handlePlayerScoring(response.data.cards[2], newState);
			this.handleDealerScoring(response.data.cards[1], newState);
			this.handleDealerScoring(response.data.cards[3], newState);
			this.setState(newState);
			console.log(response);
		});
	}

	handlePlayerScoring(card, state) {
		if (card.value === 'ACE') {
			console.log('Ace');
			if (state.playerScore <= 10) {
				state.playerScore += 11;
			} else if (state.playerScore > 10) {
				state.playerScore += 1;
			}
		} else {
			state.playerScore += scoring[card.value];
		}
	}

	handleDealerScoring(card, state) {
		if (card.value === 'ACE') {
			console.log('Ace');
			if (state.dealerScore <= 10) {
				state.dealerScore += 11;
			} else if (state.dealerScore > 10) {
				state.dealerScore += 1;
			}
		} else {
			state.dealerScore += scoring[card.value];
		}
	}

	hit() {
		axios.get(`https://deckofcardsapi.com/api/deck/${this.state.deckId}/draw/?count=1`).then((response) => {
			let updateState = this.state;
			updateState.playerHand.push(response.data.cards[0]);
			if (response.data.cards[0].value === 'ACE') {
				console.log('Ace');
				if (updateState.playerScore <= 10) {
					updateState.playerScore += 11;
				} else if (updateState.playerScore > 10) {
					updateState.playerScore += 1;
				}
			} else {
				updateState.playerScore += scoring[response.data.cards[0].value];
			}
			if (updateState.playerScore === 21) {
				updateState.blackjack = true;
			} else if (updateState.playerScore > 21) {
				updateState.stayed = true;
			}
			this.setState(updateState);
		});
	}

	handleHit(evt) {
		evt.preventDefault();
		console.log('Hit!');
		this.hit();
	}

	stay() {
		let updateState = this.state;
		updateState.stayed = true;
		while (updateState.dealerScore < 17) {
			console.log('Dealer draws a card');
			updateState.dealerScore++;
		}
		updateState.gameOver = true;
		this.setState(updateState);
	}

	handleStay(evt) {
		evt.preventDefault();
		console.log('Stay!');
		this.stay();
	}

	render() {
		return (
			<div className="Game">
				<div className="Hand">
					{this.state.deckId !== '' && this.state.dealerHand.map((card) => <Card image={card.image} />)}
				</div>
				<div>
					<p>Dealer: {this.state.dealerScore}</p>
					<p>Player: {this.state.playerScore} </p>
					{this.state.gameOver && (
						<h1>{this.state.dealerScore < this.state.playerScore ? `You win!` : `You lose!`}</h1>
					)}
				</div>
				<div className="Hand">
					{this.state.deckId !== '' && this.state.playerHand.map((card) => <Card image={card.image} />)}
				</div>
				{this.state.playerScore > 21 && <h1>BUST!</h1>}
				<div className="Buttons">
					{!this.state.stayed ? <button onClick={this.handleHit}>Hit</button> : <button disabled>Hit</button>}
					<button onClick={this.handleStay}>Stay</button>
				</div>
			</div>
		);
	}
}

export default Game;
