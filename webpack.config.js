const path = require('path');
const webpack = require('webpack');
module.exports = [
  {
    entry: './client/index.js',
    output: {
      filename: 'client.js',
      path: path.resolve(__dirname, 'dist')
    },
    module: {
      rules: [
        { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        'ENV': {
          'debug': true
        }
      })
    ],
    mode: "production"
  }
];
