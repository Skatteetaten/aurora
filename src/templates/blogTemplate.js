import React from 'react'
import Breadcrumb from '../components/Breadcrumb'
import TableOfContents from '../components/TableOfContents'
import Grid from 'aurora-frontend-react-komponenter/beholdere/Grid/Grid'
import Link from 'gatsby-link'

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
    <Grid className="ske-main-layout">
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
          <div>
            <div
              style={{
                paddingTop: '15px',
              }}
            >
              <Breadcrumb
                path={fields.slug}
                renderLink={({ href, name }) => (
                  <Link to={href} style={{ border: 'none' }}>
                    {name}
                  </Link>
                )}
              />
            </div>
            <div className="main-content">
              <h1>{frontmatter.title}</h1>
              {frontmatter.date && <h2>{frontmatter.date}</h2>}
              <div dangerouslySetInnerHTML={{ __html: html }} />
            </div>
          </div>
        </Grid.Col>
      </Grid.Row>
    </Grid>
  )
}

export const pageQuery = graphql`
  query BlogPostByPath($slug: String!) {
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
