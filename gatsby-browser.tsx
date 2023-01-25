/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/browser-apis/
 */
import React from "react";
import Layout from "./src/components/Layout";
import { SkeBasis } from "@skatteetaten/frontend-components/SkeBasis";
import type { GatsbyBrowser } from "gatsby";

export const onInitialClientRender = () => {
  const body = document.getElementsByTagName("body")[0];
  body.setAttribute("style", "display: block");
};

export const wrapPageElement: GatsbyBrowser["wrapPageElement"] = (props) => {
  return (
    <SkeBasis>
      <Layout>{props.element}</Layout>
    </SkeBasis>
  );
};
