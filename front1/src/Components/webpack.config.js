module.exports = {
    // autres configurations Webpack...
    module: {
      rules: [
        {
          test: /\.svg$/,
          use: [
            {
              loader: '@svgr/webpack',
              options: {
                throwIfNamespace: false,  // Désactive l'exception pour les tags de namespace
              }
            }
          ]
        }
      ]
    }
  };
  