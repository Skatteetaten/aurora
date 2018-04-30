module.exports = {
  siteMetadata: {
    title: 'the Aurora Platform',
    menu: [
      {
        href: '/',
        name: 'Home',
      },
      {
        href: '/documentation',
        name: 'Documentation',
      },
    ],
  },
  pathPrefix: '/aurora',
  plugins: [
    'gatsby-plugin-react-helmet',
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/docs`,
        name: 'markdown-pages',
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [`gatsby-remark-prismjs`, `gatsby-remark-autolink-headers`],
      },
    },
  ],
}
