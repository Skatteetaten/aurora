import React from "react";
import ContentButtons from "../gatsby-starter-skatteetaten/src/components/ContentButtons";
import Grid from "aurora-frontend-react-komponenter/beholdere/Grid/Grid";
import NavigationTile from "aurora-frontend-react-komponenter/beholdere/NavigationTile/NavigationTile";
import { SingleColumnRow } from "../gatsby-starter-skatteetaten/src/components/Columns";
import Link from "gatsby-link";

const DocumentationPage = ({
  data: {
    allMarkdownRemark: { edges }
  }
}) => {
  const contents = edges
    .filter(
      ({ node }) =>
        node.fields && node.fields.slug.search("/documentation/") >= 0
    )
    .map(({ node }) => ({
      to: node.fields.slug,
      icon: node.frontmatter.icon,
      title: node.frontmatter.title,
      description: node.frontmatter.description || ""
    }));

  return (
    <Grid>
      <SingleColumnRow>
        <div>
          <h1>Documentation</h1>
          <br />
        </div>
      </SingleColumnRow>
      <SingleColumnRow>
        <NavigationTile
          contents={contents}
          renderLink={(to, content) => <Link to={to}>{content}</Link>}
        />
      </SingleColumnRow>
    </Grid>
  );
};

export default DocumentationPage;

export const pageQuery = graphql`
  query DocumentationQuery {
    allMarkdownRemark(sort: { order: ASC, fields: [frontmatter___title] }) {
      edges {
        node {
          fields {
            slug
          }
          frontmatter {
            title
            icon
            description
          }
        }
      }
    }
  }
`;
