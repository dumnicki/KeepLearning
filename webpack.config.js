const path = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: 'development',
  entry: {
    background: './src/background.js',
    options: './src/options.js'
  },
  devtool: 'inline-source-map',
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "./src/manifest.json", to: "./" }
      ],
    }),
    new HtmlWebpackPlugin({
        filename: "options.html",
        template: "./src/options.html",
        chunks: ["options"]
    }),
    new HtmlWebpackPlugin({
        filename: "popup.html",
        template: "./src/popup.html",
        chunks: []
    }),
    new CleanWebpackPlugin()
  ],
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
};