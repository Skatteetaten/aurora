module.exports = function(config) {
  config.siteMetadata = {
    title: "the Aurora Platform",
    menu: [
      {
        href: "/",
        name: "The Aurora Platform"
      },
      {
        href: "/documentation",
        name: "Documentation"
      }
    ]
  };
  config.pathPrefix = "/aurora";
  return config;
};
