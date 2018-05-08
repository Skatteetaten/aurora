import React from 'react'
import styles from './header.module.css'
import Link from 'gatsby-link'
import classnames from 'classnames/bind'
import Logo from 'aurora-frontend-react-komponenter/beholdere/Toppbanner/assets/ske-logo.svg'
import Bilde from 'aurora-frontend-react-komponenter/innhold/Bilde/Bilde'

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
    <div className={styles['main-header-content']}>
      <div className={styles['main-header-wrapper']}>
        <div>
          <Bilde src={Logo} className={styles['main-header-logo']} />
        </div>
        <div className={styles['main-header-button']}>
          <button onClick={onToggleMenu}>
            <i className="material-icons">menu</i>
          </button>
        </div>
      </div>
      {menu && <HeaderMenu menu={menu} showMobileMenu={showMobileMenu} />}
    </div>
  </div>
)

export default Header
