import React from 'react'
import Bilde from 'aurora-frontend-react-komponenter/innhold/Bilde/Bilde'
import Bunn from 'aurora-frontend-react-komponenter/beholdere/Bunn/Bunn'
import Grid from 'aurora-frontend-react-komponenter/beholdere/Grid/Grid'

import styles from './footer.module.css'
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
  <Bunn>
    <Grid>
      <Grid.Row>
        <Grid.Col sm={12} lg={12} xl={2}>
          <Bunn.Logo />
        </Grid.Col>
        <Grid.Col sm={12} lg={12} xl={4}>
          <FooterLinks />
        </Grid.Col>
      </Grid.Row>
    </Grid>
  </Bunn>
)
