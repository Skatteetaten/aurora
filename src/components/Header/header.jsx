import React from 'react'
import styles from './header.module.css'
import Link from 'gatsby-link'
import classnames from 'classnames/bind'

const cx = classnames.bind(styles)

const HeaderMenu = ({ links = [], showMobileMenu }) => (
  <nav
    className={cx({
      'main-header-nav': true,
      'main-header-nav-hidden': !showMobileMenu,
    })}
  >
    <ul className={styles['main-header-menu']}>
      {links.map((link, index) => (
        <li key={`${link.href}-${index}`}>
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

const Header = ({ title, links, onToggleMenu, showMobileMenu, ...rest }) => (
  <div {...rest} className={styles['main-header']}>
    <h1 className={styles['main-header-title']}>{title}</h1>
    <button onClick={onToggleMenu}>
      <i className="material-icons">menu</i>
    </button>
    {links && <HeaderMenu links={links} showMobileMenu={showMobileMenu} />}
  </div>
)

export default Header
