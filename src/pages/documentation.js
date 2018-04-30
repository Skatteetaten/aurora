import React from 'react'
import ContentButtons from '../components/ContentButtons'
import Grid from 'aurora-frontend-react-komponenter/beholdere/Grid/Grid'
import { SingleColumn } from '../components/Columns'

const DocumentationPage = ({ data: { allMarkdownRemark: { edges } } }) => {
  const contents = edges
    .filter(
      ({ node }) =>
        node.fields && node.fields.slug.search('/documentation/') >= 0
    )
    .map(({ node }) => ({
      to: node.fields.slug,
      icon: node.frontmatter.icon,
      title: node.frontmatter.title,
      description: node.frontmatter.description || '',
    }))

  return (
    <Grid>
      <Grid.Row>
        <SingleColumn>
          <h1>Documentation</h1>
          <p>some random text</p>
          <br />
        </SingleColumn>
      </Grid.Row>
      <Grid.Row>
        <SingleColumn>
          <ContentButtons contents={contents} />
        </SingleColumn>
      </Grid.Row>
    </Grid>
  )
}

export default DocumentationPage

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
`
