import React from 'react'
import PostLink from '../components/post-link'
import Quote from '../components/Quote'
import Grid from 'aurora-frontend-react-komponenter/beholdere/Grid/Grid'
import { SingleColumn, DoubleColumn } from '../components/Columns'
import auroraApi from '../assets/images/aurora-api.svg'
import auroraObserve from '../assets/images/aurora-run.svg'
import auroraBuild from '../assets/images/aurora-build.svg'

const InfoSeparator = () => (
  <Grid.Row>
    <SingleColumn>
      <hr style={{ margin: '30px 0' }} />
    </SingleColumn>
  </Grid.Row>
)

const InfoRow = ({ title, picture, children, left }) => {
  const Picture = () => (
    <DoubleColumn>
      <img src={picture} style={{ maxWidth: '100%', maxHeight: '600px' }} />
    </DoubleColumn>
  )

  return (
    <div>
      <Grid.Row>
        {left && <Picture />}
        <DoubleColumn>
          {title && <h2>{title}</h2>}
          {children}
        </DoubleColumn>
        {!left && <Picture />}
      </Grid.Row>
    </div>
  )
}

const IndexPage = ({ data: { allMarkdownRemark: { edges } } }) => {
  const FrontendContent = ({ path }) => {
    const content = edges.find(edge => {
      return edge.node.fields.slug === path
    })
    return (
      content && <div dangerouslySetInnerHTML={{ __html: content.node.html }} />
    )
  }

  return (
    <div>
      <Grid className="info-grid">
        <Grid.Row>
          <DoubleColumn>
            <FrontendContent path="/frontpage/faster-development/" />
          </DoubleColumn>
          <DoubleColumn>
            <FrontendContent path="/frontpage/why/" />
          </DoubleColumn>
        </Grid.Row>
      </Grid>

      <Quote
        source="Bjarte Karlsen, Technical Architect NTA"
        style={{ margin: '30px 0' }}
      >
        In order to avoid 'wall-of-yaml' we use a declarative, composable
        configuration format with sane defaults that is transformed into
        Kubernets objects
      </Quote>

      <Grid className="info-grid">
        <InfoRow picture={auroraApi}>
          <FrontendContent path="/frontpage/deploy/" />
        </InfoRow>

        <InfoSeparator />

        <InfoRow picture={auroraBuild} left>
          <FrontendContent path="/frontpage/build/" />
        </InfoRow>

        <InfoSeparator />

        <InfoRow picture={auroraObserve}>
          <FrontendContent path="/frontpage/observe/" />
        </InfoRow>
      </Grid>
    </div>
  )
}

export default IndexPage

export const pageQuery = graphql`
  query IndexQuery {
    allMarkdownRemark {
      edges {
        node {
          html
          fields {
            slug
          }
        }
      }
    }
  }
`
