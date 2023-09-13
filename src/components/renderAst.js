import React from "react";
import RehypeReact from "rehype-react";

const renderer = new RehypeReact({
  createElement: React.createElement,
}).Compiler;

export const renderAst = (htmlAst) => {
  return renderer(htmlAst);
};
