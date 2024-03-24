const sassResourcesLoader = require('craco-sass-resources-loader');

const sassInject = require.resolve('./src/css/global.scss');

module.exports = {
  plugins: [
    {
      plugin: sassResourcesLoader,
      options: {
        resources: sassInject,
      },
    },
  ],
};
