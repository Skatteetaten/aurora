import React from "react";
import Grid from "@skatteetaten/frontend-components/Grid";
import NavigationTile from "@skatteetaten/frontend-components/NavigationTile";
import { SingleColumnRow } from "../components/Columns";
import { graphql, Link } from "gatsby";
import NavigationContent from "@skatteetaten/frontend-components/NavigationTile/NavigationContent";

const DocumentationPage = ({
  data: {
    allMarkdownRemark: { edges },
  },
}) => {
  const contents = edges
    .filter(
      ({ node }) =>
        node.fields && node.fields.slug.search("/documentation/") >= 0
    )
    .map(({ node }) => ({
      to: `${node.fields.slug}`,
      icon: node.frontmatter.icon,
      heading: node.frontmatter.title,
      description: node.frontmatter.description || "",
    }));

  return (
    <Grid>
      <SingleColumnRow>
        <h1>Documentation</h1>
      </SingleColumnRow>
      <SingleColumnRow>
        <NavigationTile>
          {contents.map((it) => (
            <NavigationContent
              key={it.to}
              heading={it.heading}
              icon={it.icon}
              to={it.to}
              renderContent={(to, content) => <Link to={to}>{content}</Link>}
            >
              {it.description}
            </NavigationContent>
          ))}
        </NavigationTile>
      </SingleColumnRow>
    </Grid>
  );
};

export default DocumentationPage;

export const pageQuery = graphql`
  query DocumentationQuery {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(sort: { frontmatter: { title: ASC } }) {
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

export const Head = ({ data }) => <title>{data.site.siteMetadata.title}</title>;
