import React, { ReactNode, useState } from "react";

import Header from "../Header";
import Footer from "../Footer";

import "prismjs/themes/prism.css";
import "./layout.css";
import "./fill-remaining-height.css";

type Props = {
  children: ReactNode;
};

function Layout(props: Props) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const toggleMobileMenu = () => {
    setShowMobileMenu((current) => !current);
  };

  return (
    <>
      <Header
        style={{ marginBottom: "35px" }}
        onToggleMenu={toggleMobileMenu}
        showMobileMenu={showMobileMenu}
      />
      <div id="layout-content">{props.children}</div>
      <Footer />
    </>
  );
}

export default Layout;
