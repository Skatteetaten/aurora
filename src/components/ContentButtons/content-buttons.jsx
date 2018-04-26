import React from 'react'
import styles from './content-buttons.module.css'
import Ikon from 'aurora-frontend-react-komponenter/innhold/Ikon/Ikon'
import Link from 'gatsby-link'

const Content = () => (
  <div>
    <Ikon iconName="Person" style={{ fontSize: '48px' }} />
    <h2>Aurora OpenShift</h2>
    <p>Something important stuff</p>
  </div>
)

const ContentButtons = () => (
  <div>
    <h1>Documentation</h1>
    <p>some random text</p>
    <br />
    <nav className={styles['buttons-nav']}>
      <ul>
        <li>
          <Link to="/blog/openshift/">
            <Content />
          </Link>
        </li>
        <li>
          <Link to="/blog/test/">
            <Content />
          </Link>
        </li>
        <li>
          <Link to="/blog/openshift">
            <Content />
          </Link>
        </li>
        <li>
          <Link to="/blog/openshift">
            <Content />
          </Link>
        </li>
      </ul>
    </nav>
  </div>
)

export default ContentButtons
