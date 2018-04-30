import React from 'react'
import Link from 'gatsby-link'
import GithubSlugger from 'github-slugger'
import styles from './table-of-contents.module.css'

const slugger = new GithubSlugger()

function createAnchorLink(slug, name) {
  const nameSlug = slugger.slug(name)
  return `${slug}#${nameSlug}`
}

const TableOfContents = ({ headings, slug }) => {
  slugger.reset()
  return (
    <nav className={styles.toc}>
      <ul>
        {headings.map((header, index) => (
          <li
            key={`${header}-${index}`}
            className={styles[`toc-level-${header.depth}`]}
          >
            <Link to={createAnchorLink(slug, header.value)}>
              {header.value}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default TableOfContents
