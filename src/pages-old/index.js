import React from "react";
import { Grid } from "@skatteetaten/frontend-components/Grid";
import Quote from "../components/Quote";
import { SingleColumnRow, DoubleColumnRow } from "../components/Columns";
import auroraApi from "../../docs/frontpage/images/aurora-api.svg";
import auroraObserve from "../../docs/frontpage/images/aurora-run.svg";
import auroraBuild from "../../docs/frontpage/images/aurora-build.svg";
import { graphql } from "gatsby";
import { renderAst } from "../components/renderAst";

const InfoSeparator = () => (
  <SingleColumnRow>
    <hr style={{ margin: "30px 0" }} />
  </SingleColumnRow>
);

const InfoRow = ({ title, picture, children, left }) => {
  const Picture = () => (
    <img
      src={picture}
      alt={title}
      style={{ maxWidth: "100%", maxHeight: "600px" }}
    />
  );

  return (
    <DoubleColumnRow>
      {left && <Picture />}
      <div>
        {title && <h2>{title}</h2>}
        {children}
      </div>
      {!left && <Picture />}
    </DoubleColumnRow>
  );
};

const IndexPage = (props) => {
  const FrontPageContent = ({ path }) => {
    const edge = props.data.allMarkdownRemark.edges.find((edge) => {
      return edge.node.fields.slug === path;
    });
    return <div key={edge.node.id}>{renderAst(edge.node.htmlAst)}</div>;
  };

  return (
    <>
      <Grid>
        <SingleColumnRow>
          <div style={{ textAlign: "center" }}>
            <h1>The Aurora Platform</h1>
          </div>
        </SingleColumnRow>
        <DoubleColumnRow>
          <FrontPageContent path="/frontpage/faster-development/" />
          <FrontPageContent path="/frontpage/why/" />
        </DoubleColumnRow>
      </Grid>

      <Quote
        source="Bjarte Karlsen, Technical Architect NTA"
        style={{ margin: "30px 0" }}
      >
        In order to avoid 'wall-of-yaml' we use a declarative, composable
        configuration format with sane defaults that is transformed into
        Kubernets objects
      </Quote>

      <Grid>
        <InfoRow picture={auroraApi}>
          <FrontPageContent path="/frontpage/deploy/" />
        </InfoRow>

        <InfoSeparator />

        <InfoRow picture={auroraBuild} left>
          <FrontPageContent path="/frontpage/build/" />
        </InfoRow>

        <InfoSeparator />

        <InfoRow picture={auroraObserve}>
          <FrontPageContent path="/frontpage/observe/" />
        </InfoRow>
      </Grid>
    </>
  );
};

export default IndexPage;

export const pageQuery = graphql`
  query IndexQuery {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark {
      edges {
        node {
          id
          htmlAst
          fields {
            slug
          }
        }
      }
    }
  }
`;

export const Head = ({ data }) => {
  return <title>{data.site.siteMetadata.title}</title>;
};
