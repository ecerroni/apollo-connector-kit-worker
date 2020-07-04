const { EnvironmentPlugin } = require("webpack");
const config = require('./webpack.config')

module.exports = {
  ...config,
  plugins: [
    new EnvironmentPlugin({
      YOUR_ENV_SECRET: 'SECRET'
    })
  ],
}
