import React from 'react'
import PropTypes from 'prop-types'
import styles from './content-buttons.module.css'
import Link from 'gatsby-link'

const Content = ({ icon, title, description }) => (
  <div>
    <i className="material-icons" style={{ fontSize: '48px' }}>
      {icon}
    </i>
    <h2>{title}</h2>
    <p>{description}</p>
  </div>
)

const ContentButtons = ({ contents }) => (
  <div>
    <nav className={styles['buttons-nav']}>
      <ul>
        {contents.map(({ to, ...rest }, index) => (
          <li key={`${to}-${index}`}>
            <Link to={to}>
              <Content {...rest} />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  </div>
)

ContentButtons.propTypes = {
  contents: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      to: PropTypes.string.isRequired,
    })
  ).isRequired,
}

export default ContentButtons
