import React from 'react'
import Bilde from 'aurora-frontend-react-komponenter/innhold/Bilde/Bilde'
import Grid from 'aurora-frontend-react-komponenter/beholdere/Grid/Grid'

import styles from './footer.module.css'

import logo from 'aurora-frontend-react-komponenter/beholdere/Bunn/assets/ske-logo.svg'
import footerDekor from 'aurora-frontend-react-komponenter/beholdere/Bunn/assets/footer-dekor.svg'

import GitHubLogo from '../../assets/github-mark/PNG/GitHub-Mark-Light-32px.png'

const FooterLink = ({ to, name, image }) => (
  <a href={to} target="blank" className={styles['footer-link']}>
    <img src={image} height={32} width={32} />
    {name}
  </a>
)

const FooterLinks = () => (
  <div className={styles['footer-links']}>
    <div>
      <h3>Follow</h3>
      <div>
        <FooterLink
          to="https://github.com/Skatteetaten"
          name="GitHub"
          image={GitHubLogo}
        />
      </div>
    </div>
  </div>
)

export default () => (
  <div>
    <Bilde src={footerDekor} />
    <footer className={styles['footer-wrapper']}>
      <div className={styles['footer-content']}>
        <Grid>
          <Grid.Row>
            <Grid.Col sm={12} lg={12} xl={2}>
              <div className={styles.logo}>
                <Bilde src={logo} height="74px" />
              </div>
            </Grid.Col>
            <Grid.Col sm={12} lg={12} xl={3}>
              <FooterLinks />
            </Grid.Col>
          </Grid.Row>
        </Grid>
      </div>
    </footer>
  </div>
)
