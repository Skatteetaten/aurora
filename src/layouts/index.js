import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'

import Header from '../components/Header'
import Footer from '../components/Footer'
import SkeBasis from 'aurora-frontend-react-komponenter/beholdere/SkeBasis/SkeBasis'
import 'prismjs/themes/prism.css'
import './index.css'

const links = [
  {
    href: '/',
    name: 'Home',
  },
  {
    href: '/blog',
    name: 'Docs',
  },
  {
    href: '/tutorial',
    name: 'Tutorial',
  },
  {
    href: '/about',
    name: 'About',
  },
]

class Layout extends React.Component {
  state = {
    showMobileMenu: false,
  }

  toggleMobileMenu = () => {
    this.setState(state => ({
      showMobileMenu: !state.showMobileMenu,
    }))
  }

  render() {
    const { children, data } = this.props
    return (
      <SkeBasis>
        <Helmet
          title={data.site.siteMetadata.title}
          meta={[
            { name: 'description', content: 'Sample' },
            { name: 'keywords', content: 'sample, something' },
          ]}
          link={[
            {
              href: 'https://fonts.googleapis.com/icon?family=Material+Icons',
              rel: 'stylesheet',
            },
            {
              href: 'https://fonts.googleapis.com/css?family=Gugi',
              rel: 'stylesheet',
            },
          ]}
        />
        <Header
          links={links}
          title={data.site.siteMetadata.title}
          style={{ marginBottom: '35px' }}
          onToggleMenu={this.toggleMobileMenu}
          showMobileMenu={this.state.showMobileMenu}
        />
        {children()}
        <Footer />
      </SkeBasis>
    )
  }
}

Layout.propTypes = {
  children: PropTypes.func,
}

export default Layout

export const query = graphql`
  query SiteTitleQuery {
    site {
      siteMetadata {
        title
      }
    }
  }
`
