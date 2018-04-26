import React from 'react'
import styles from './header.module.css'
import Link from 'gatsby-link'

const HeaderMenu = ({ links = [] }) => (
  <nav className={styles['main-header-nav']}>
    <ul className={styles['main-header-menu']}>
      {links.map(link => (
        <li id={link.name}>
          <Link
            exact={link.href === '/'}
            to={link.href}
            activeClassName={styles['main-header-menu-active']}
          >
            {link.name}
          </Link>
        </li>
      ))}
    </ul>
  </nav>
)

const Header = ({ title, links, ...rest }) => (
  <div {...rest} className={styles['main-header']}>
    <h1 className={styles['main-header-title']}>{title}</h1>
    {links && <HeaderMenu links={links} />}
  </div>
)

export default Header
