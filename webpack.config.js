const HtmlWebpackPlugin = require('html-webpack-plugin')
const OpenBrowserPlugin = require('open-browser-webpack-plugin')

module.exports = {
  entry: {
    main: './src/main.js'
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [['@babel/plugin-transform-react-jsx']]
          }
        }
      }
    ]
  },
  mode: "development",
  optimization: {
    minimize: false
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'main.html',
    }),
    new OpenBrowserPlugin({ url: 'http://localhost:8080' }),
  ]
}