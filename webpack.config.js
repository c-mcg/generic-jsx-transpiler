var path = require('path');

module.exports = {
  target: 'node',
  mode: 'development',
  entry: './src/index.js',
  output: {
    library: 'jsxTranspiler',
    libraryExport: 'default',
    libraryTarget: 'var',
    path: path.resolve(__dirname, 'dist'),
    filename: 'dist.js'
  },
  module: {
    rules: [
        {
            test: /\.m?js$/,
            exclude: [/(node_modules)/, /\*.test.js/],
            use: {
                loader: 'babel-loader'
            },
        }
    ]
  }
};
