/**
 * Implement Gatsby's SSR (Server Side Rendering) APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/ssr-apis/
 */

let themeLoader = require('@microsoft/load-themed-styles')
themeLoader.configureLoadStyles(styles => {
  // noop
})

let library = require('office-ui-fabric-react/lib/Utilities')
library.setSSR(true)
library.setRTL(false)
