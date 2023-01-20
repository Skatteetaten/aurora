import React from "react";
import "./quote.css";

const Quote = ({ children, source, ...rest }) => (
  <div {...rest} className="quote">
    <p>{children}</p>
    <strong>{source}</strong>
  </div>
);

export default Quote;
