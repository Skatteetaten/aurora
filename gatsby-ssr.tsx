/**
 * Implement Gatsby's SSR (Server Side Rendering) APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/ssr-apis/
 */
import React from "react";
import { SkeBasis } from "@skatteetaten/frontend-components/SkeBasis";
import Layout from "./src/components/Layout";
import type { GatsbySSR } from "gatsby";

export const wrapPageElement: GatsbySSR["wrapPageElement"] = (props) => {
  return (
    <SkeBasis>
      <Layout>{props.element}</Layout>
    </SkeBasis>
  );
};
