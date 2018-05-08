import React from 'react'
import PropTypes from 'prop-types'
import Link from 'gatsby-link'
import GithubSlugger from 'github-slugger'
import styles from './table-of-contents.module.css'
import Ikon from 'aurora-frontend-react-komponenter/innhold/Ikon/Ikon'
import classNames from 'classnames'

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
            className={classNames(
              styles['toc-level'],
              styles[`toc-level-${header.depth}`]
            )}
          >
            <Ikon iconName="down" />
            <Link to={createAnchorLink(slug, header.value)}>
              {header.value}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

TableOfContents.propTypes = {
  slug: PropTypes.string.isRequired,
  headings: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      depth: PropTypes.number.isRequired,
    })
  ).isRequired,
}

export default TableOfContents
