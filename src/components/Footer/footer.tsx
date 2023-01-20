import React from "react";
import { FooterContent } from "@skatteetaten/frontend-components/FooterContent";
import { Grid } from "@skatteetaten/frontend-components/Grid";
import { LinkGroup } from "@skatteetaten/frontend-components/LinkGroup";
import { LinkGroupProps } from "@skatteetaten/frontend-components/LinkGroup/LinkGroup.types";

import * as styles from "./footer.module.css";

console.log(styles);

const links: LinkGroupProps["links"] = [
  {
    path: "https://github.com/Skatteetaten",
    text: "Github Skatteetaten",
  },
  {
    path: "https://uustatus.no/nb/erklaringer/publisert/e6745fbf-76e5-469b-abb6-3e9fd52c7e9c",
    text: "Tilgjengelighetserklæring",
  },
  {
    path: "https://www.skatteetaten.no",
    text: "skatteetaten.no",
  },
];

export default () => (
  <FooterContent>
    <Grid>
      <Grid.Row>
        <Grid.Col sm={12} lg={12} xl={2}>
          <FooterContent.Logo />
        </Grid.Col>
        <Grid.Col sm={12} lg={12} xl={4} className={styles.footerLinkgroup}>
          <h2>Skatteetaten</h2>
          <LinkGroup links={links} />
        </Grid.Col>
      </Grid.Row>
    </Grid>
  </FooterContent>
);
