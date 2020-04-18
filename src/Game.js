import React, { Component } from "react";
import Card from "./Card";
import axios from "axios";
import "./Game.css";
import scoring from "./scoring";

/**
 * TODOS
 *
 * 1. Prevent multiple sources-of-truth regarding "scores".
 *    Scores should always be calculated based on the cards in hand, and not as separate state key.
 *    We should create a function calculateHandScore() and move a few things around.
 *
 * 2. Practice writing tests with Jest.
 *
 * 3. More styling to make this even more slick.
 *
 * 4. Practice Redux
 */

/**
 * STUFF TO DISCUSS
 *
 * 1. try/catch
 *
 * 2. async/await
 *
 * 3. "rest operator"
 *
 * 4. "spread operator"
 *
 * 5. "destructuring" objects and arrays
 *
 * 6. Only mutate this.state via this.setState()
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
      dealerHand: [],
      dealerScore: 0,
      deckId: null,
      error: null,
      gameOver: false,
      playerHand: [],
      playerScore: 0,
      stayed: false,
    };
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
      this.setState({ error: "Game data failed to load 😞" });
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

  handleHit = async () => {
    console.log("Hit!");
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
  };

  handleStay = async () => {
    console.log("Stay!");
    const { deckId } = this.state;

    await this.setState({ stayed: true });

    while (this.playerIsWinning() && this.state.dealerScore < 21) {
      await new Promise((resolve) => setTimeout(resolve, 800));

      let response;
      try {
        response = await doGet(
          `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`
        );
      } catch (error) {
        this.setState({ error: "Game data failed to load 😞" });
        return;
      }

      const {
        data: {
          cards: [card0],
        },
      } = response;

      await this.setState({
        dealerHand: [...this.state.dealerHand, card0],
        dealerScore: getNextScore(card0, this.state.dealerScore),
      });
    }

    this.setState({ gameOver: true });
  };

  playerIsWinning() {
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
      <div className="ErrorContainer">
        <h1>{error}</h1>
      </div>
    ) : (
      <div className="Game">
        <div className="Hand">
          {dealerHand.map((card) => (
            <Card key={card.image} {...card} />
          ))}
        </div>
        <div>
          <p>Dealer: {dealerScore}</p>
          <p>Player: {playerScore} </p>
          <div className="GameStatus">
            {playerScore > 21 && <h1>BUST!</h1>}
            {gameOver && (
              <h1>{this.playerIsWinning() ? `You win!` : `You lose!`}</h1>
            )}
          </div>
        </div>
        <div className="Hand">
          {playerHand.map((card) => (
            <Card key={card.image} {...card} />
          ))}
        </div>
        <div className="Buttons">
          <button disabled={stayed} type="button" onClick={this.handleHit}>
            Hit
          </button>
          <button disabled={stayed} type="button" onClick={this.handleStay}>
            Stay
          </button>
        </div>
      </div>
    );
  }
}

export default Game;
