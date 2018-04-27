import React from 'react'
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
    <h1>Documentation</h1>
    <p>some random text</p>
    <br />
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

export default ContentButtons
