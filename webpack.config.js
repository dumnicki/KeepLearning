const path = require('path');
const webpack = require('webpack');
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
        { from: "./src/*.json", to: "./[name].json"},
        {from: "./node_modules/sql.js/dist/sql-wasm.wasm", to: "./"}
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
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process'
     }),
    new CleanWebpackPlugin()
  ],
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    fallback: { 
      "zlib": require.resolve("browserify-zlib"),
      "assert": require.resolve("assert/"),
      "stream": require.resolve("stream-browserify"),
      "util": require.resolve("util/"),
      "path": require.resolve("path-browserify"),
      "fs": require.resolve("browserify-fs")
   }
  }
};