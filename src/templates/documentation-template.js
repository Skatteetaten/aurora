import React from 'react'
import Breadcrumb from '../components/Breadcrumb'
import TableOfContents from '../components/TableOfContents'
import Grid from 'aurora-frontend-react-komponenter/beholdere/Grid/Grid'
import Link from 'gatsby-link'
import styles from './documentation-template.module.css'

const mainGrid = {
  sm: 10,
  smPush: 1,
  md: 10,
  mdPush: 1,
  lg: 8,
  lgPush: 2,
  xl: 6,
  xlPush: 1,
  xxl: 6,
}

const menuGrid = {
  xl: 2,
  xxl: 2,
}

export default function Template({ data }) {
  const { markdownRemark } = data
  const { frontmatter, fields, html, headings } = markdownRemark
  return (
    <Grid>
      <Grid.Row>
        <Grid.Col {...menuGrid}>
          {headings && (
            <div>
              <h3>Table of contents</h3>
              <TableOfContents headings={headings} slug={fields.slug} />
            </div>
          )}
        </Grid.Col>
        <Grid.Col {...mainGrid}>
          <Breadcrumb
            className={styles.breadcrumb}
            path={fields.slug}
            renderLink={({ href, name }) => <Link to={href}>{name}</Link>}
          />
          <h1>{frontmatter.title}</h1>
          <div
            className={styles['documentation-container']}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </Grid.Col>
      </Grid.Row>
    </Grid>
  )
}

export const pageQuery = graphql`
  query DocumentationBySlug($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
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
`
