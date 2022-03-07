const path = require('path')
const slsw = require('serverless-webpack')

module.exports = {
  mode: 'production',
  entry: slsw.lib.entries,
  externals: ['aws-sdk'],
  resolve: {
    extensions: ['.js', '.json', '.ts'],
  },
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
  },
  target: 'node',
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          configFile: 'tsconfig.build.json'
        },
        exclude: [/node_modules/, /serverless_sdk\.ts/],
      },
    ],
  },
}
