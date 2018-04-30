import React from 'react'
import styles from './header.module.css'
import Link from 'gatsby-link'
import classnames from 'classnames/bind'

const cx = classnames.bind(styles)

const HeaderMenu = ({ menu = [], showMobileMenu }) => (
  <nav
    className={cx({
      'main-header-nav': true,
      'main-header-nav-hidden': !showMobileMenu,
    })}
  >
    <ul className={styles['main-header-menu']}>
      {menu.map((item, index) => (
        <li key={`${item.href}-${index}`}>
          <Link
            exact={item.href === '/'}
            to={item.href}
            activeClassName={styles['main-header-menu-active']}
          >
            {item.name}
          </Link>
        </li>
      ))}
    </ul>
  </nav>
)

const Header = ({ title, menu, onToggleMenu, showMobileMenu, ...rest }) => (
  <div {...rest} className={styles['main-header']}>
    <h1 className={styles['main-header-title']}>{title}</h1>
    <button onClick={onToggleMenu}>
      <i className="material-icons">menu</i>
    </button>
    {menu && <HeaderMenu menu={menu} showMobileMenu={showMobileMenu} />}
  </div>
)

export default Header
