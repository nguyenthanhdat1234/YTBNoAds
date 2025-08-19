module.exports = {
  devServer: {
    allowedHosts: 'all',
    client: {
      webSocketURL: 'ws://localhost:3000/ws',
    },
  },
  webpack: {
    configure: (webpackConfig) => {
      // Disable source maps in development for faster builds
      if (process.env.NODE_ENV === 'development') {
        webpackConfig.devtool = false;
      }
      return webpackConfig;
    },
  },
};
