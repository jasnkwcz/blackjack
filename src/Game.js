import React, { Component } from "react";
import Card from "./Card";
import axios from "axios";
import "./Game.css";
import scoring from "./scoring";

/**
 * PERHAPS STUFF TO DISCUSS
 *
 * 1. try/catch
 *
 * 2. async/await
 *
 * 3. rest operator
 *
 * 4. spread operator
 *
 * 5. object and array destructuring.
 *
 * 6. avoid directly mutating references to this.state
 */

/**
 * TODOS
 *
 * 1. Use arrow methods, instead of method binding.
 *
 * 2. Prevent multiple sources-of-truth regarding "scores".
 *    Scores should always be calculated based on the cards in hand, and not as separate state key.
 *    We should create a function calculateHandScore() and move a few things around.
 *
 * 3. Practice writing tests with Jest.
 *
 * 4. More styling to make this even more slick.
 */

const doGet = (...params) => axios.get(...params);

const getNextScore = (card, score) => {
  if (card.value === "ACE") {
    console.log("Ace");
    if (score <= 10) {
      return score + 11;
    } else if (score > 10) {
      return score + 1;
    }
  } else {
    return score + scoring[card.value];
  }
};

class Game extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      deckId: null,
      dealerHand: [],
      dealerScore: 0,
      playerHand: [],
      playerScore: 0,
      stayed: false,
      gameOver: false,
    };

    this.handleHit = this.handleHit.bind(this);
    this.handleStay = this.handleStay.bind(this);
  }

  componentDidMount() {
    this.handleGameStart();
  }

  async handleGameStart() {
    const { dealerHand, dealerScore, playerHand, playerScore } = this.state;

    let response;
    try {
      response = await doGet(
        "https://deckofcardsapi.com/api/deck/new/draw/?count=4"
      );
    } catch (error) {
      this.setState({
        error: "Game data failed to load 😞",
      });
      return;
    }

    const {
      data: {
        deck_id,
        cards: [card0, card1, card2, card3],
      },
    } = response;

    this.setState({
      deckId: deck_id,
      playerHand: [...playerHand, card0, card2],
      dealerHand: [...dealerHand, card1, card3],
      playerScore: getNextScore(card2, getNextScore(card0, playerScore)),
      dealerScore: getNextScore(card3, getNextScore(card1, dealerScore)),
    });
  }

  async hit() {
    const { playerHand, playerScore, deckId } = this.state;

    let response;
    try {
      response = await doGet(
        `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`
      );
    } catch (error) {
      this.setState({
        error: "Game data failed to load 😞",
      });
      return;
    }

    const {
      data: {
        cards: [card0],
      },
    } = response;

    const nextPlayerScore = getNextScore(card0, playerScore);
    const isGameOver = nextPlayerScore >= 21;

    this.setState({
      playerScore: nextPlayerScore,
      playerHand: [...playerHand, card0],
      stayed: isGameOver,
      gameOver: isGameOver,
    });
  }

  handleHit(evt) {
    evt.preventDefault();
    console.log("Hit!");
    this.hit();
  }

  async stay() {
    const { deckId, dealerScore, dealerHand } = this.state;

    let localHand = [...dealerHand];
    let localScore = dealerScore;
    console.log("before loop:", localScore);

    while (this.didPlayerWin() && localScore < 21) {
      let response;
      try {
        response = await doGet(
          `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`
        );
      } catch (error) {
        this.setState({
          error: "Game data failed to load 😞",
        });
        return;
      }

      const {
        data: {
          cards: [card0],
        },
      } = response;

      localHand = [...localHand, card0];
      localScore = getNextScore(card0, localScore);
      console.log("in loop:", localScore);
    }

    this.setState({
      stayed: true,
      gameOver: true,
      dealerHand: localHand,
      dealerScore: localScore,
    });
  }

  handleStay(evt) {
    evt.preventDefault();
    console.log("Stay!");
    this.stay();
  }

  didPlayerWin() {
    const { playerScore, dealerScore } = this.state;
    if (dealerScore > 21) return true;
    return playerScore > dealerScore && playerScore <= 21;
  }

  render() {
    const {
      dealerHand,
      dealerScore,
      error,
      gameOver,
      playerHand,
      playerScore,
      stayed,
    } = this.state;

    return error ? (
      <h1>{error}</h1>
    ) : (
      <div className="Game">
        <div className="Hand">
          {dealerHand.map(({ image, value, suit }) => (
            <Card key={image} {...{ image, value, suit }} />
          ))}
        </div>
        <div>
          <p>Dealer: {dealerScore}</p>
          <p>Player: {playerScore} </p>
          <div className="GameStatus">
            {playerScore > 21 && <h1>BUST!</h1>}
            {gameOver && (
              <h1>{this.didPlayerWin() ? `You win!` : `You lose!`}</h1>
            )}
          </div>
        </div>
        <div className="Hand">
          {playerHand.map(({ image, value, suit }) => (
            <Card key={image} {...{ image, value, suit }} />
          ))}
        </div>
        <div className="Buttons">
          <button disabled={stayed} onClick={this.handleHit}>
            Hit
          </button>
          <button disabled={stayed} onClick={this.handleStay}>
            Stay
          </button>
        </div>
      </div>
    );
  }
}

export default Game;
