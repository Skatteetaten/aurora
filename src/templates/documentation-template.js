import React from "react";
import Grid from "@skatteetaten/frontend-components/Grid";
import { graphql } from "gatsby";
import { renderAst } from "../components/renderAst";

import TableOfContents from "starter/components/TableOfContents";

import * as styles from "./documentation-template.module.css";
import { SingleColumnRow } from "../components/Columns";

export default function Template({ data }) {
  const { markdownRemark } = data;
  const { frontmatter, fields, htmlAst, headings } = markdownRemark;

  return (
    <Grid>
      <SingleColumnRow>
        <h1>{frontmatter.title}</h1>
        {headings && (
          <TableOfContents
            headings={headings}
            slug={fields.slug}
            minHeaders={1}
          />
        )}
        <div className={styles.documentationContainer}>
          {renderAst(htmlAst)}
        </div>
      </SingleColumnRow>
    </Grid>
  );
}

export const pageQuery = graphql`
  query DocumentationBySlug($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      htmlAst
      headings {
        value
        depth
      }
      fields {
        slug
      }
      frontmatter {
        title
      }
    }
  }
`;
export const Head = ({ data }) => (
  <title>{data.markdownRemark.frontmatter.title}</title>
);
