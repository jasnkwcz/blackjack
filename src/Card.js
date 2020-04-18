import React from "react";
//import './Card.css';

const Card = ({ image, value, suit }) => (
  <div className="Card">
    <img src={image} alt={`${value} ${suit}`} />
  </div>
);

export default Card;
