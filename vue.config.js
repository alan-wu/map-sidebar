const nodeExternals = require('webpack-node-externals');

module.exports = {
  configureWebpack: config => {
    if(import.meta.env.VITE_NODE_ENV === 'production') {
      //By including element-ui and all abi projects, the problem with element-ui
      //stylesheet can be avoided.
      config.externals =   [ nodeExternals({allowlist: [/^marked/]}) ];
    }
  },
  css: {
    //Import variables into all stylesheets.
    loaderOptions: {
      sass: {
        prependData: `@import '@/assets/styles';`
      }
    }
  }
}
