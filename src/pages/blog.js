import React from 'react'
import ContentButtons from '../components/ContentButtons'
import Grid from 'aurora-frontend-react-komponenter/beholdere/Grid/Grid'

const doubleColGrid = {
  sm: 10,
  smPush: 1,
  md: 10,
  mdPush: 1,
  lg: 10,
  lgPush: 1,
  xl: 3,
  xlPush: 3,
  xxl: 3,
  xxlPush: 3,
}

const singleColGrid = {
  ...doubleColGrid,
  xl: 6,
  xlPush: 3,
  xxl: 6,
  xxlPush: 3,
}

const DocsPage = ({ data: { allMarkdownRemark: { edges } } }) => {
  const contents = edges
    .filter(({ node }) => node.fields && node.fields.slug.search('/blog/') >= 0)
    .map(({ node }) => ({
      to: node.fields.slug,
      icon: node.frontmatter.icon,
      title: node.frontmatter.title,
      description: node.frontmatter.description || '',
    }))

  return (
    <Grid>
      <Grid.Row>
        <Grid.Col {...singleColGrid}>
          <ContentButtons contents={contents} />
        </Grid.Col>
      </Grid.Row>
    </Grid>
  )
}

export default DocsPage

export const pageQuery = graphql`
  query DocsQuery {
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
