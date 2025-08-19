module.exports = {
  devServer: {
    allowedHosts: 'all',
    client: {
      webSocketURL: 'ws://localhost:3000/ws',
    },
  },
  webpack: {
    configure: (webpackConfig) => {
      // Disable source maps for faster builds
      if (process.env.NODE_ENV === 'development') {
        webpackConfig.devtool = false;
      }

      // Production optimizations
      if (process.env.NODE_ENV === 'production') {
        webpackConfig.devtool = false;
        webpackConfig.optimization = {
          ...webpackConfig.optimization,
          splitChunks: {
            chunks: 'all',
            cacheGroups: {
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                chunks: 'all',
              },
            },
          },
        };
      }

      return webpackConfig;
    },
  },
};
