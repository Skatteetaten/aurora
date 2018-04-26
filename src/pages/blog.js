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
  const FrontendContent = ({ path }) => {
    const content = edges.find(edge => {
      return edge.node.fields.slug === path
    })
    return (
      content && <div dangerouslySetInnerHTML={{ __html: content.node.html }} />
    )
  }

  const WhatAndWhyRow = () => (
    <Grid.Row>
      <Grid.Col {...doubleColGrid}>
        <FrontendContent path="/frontpage/faster-development/" />
      </Grid.Col>
      <Grid.Col {...doubleColGrid}>
        <FrontendContent path="/frontpage/why/" />
      </Grid.Col>
    </Grid.Row>
  )

  return (
    <div>
      <Grid>
        <Grid.Row>
          <Grid.Col {...singleColGrid}>
            <ContentButtons />
          </Grid.Col>
        </Grid.Row>
      </Grid>
    </div>
  )
}

export default DocsPage

export const pageQuery = graphql`
  query DocsQuery {
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
