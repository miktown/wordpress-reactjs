var path = require('path')

const PATH = {
  public: path.resolve(__dirname, 'mimotic_informes_plugin/lib/modules/informes/app'),
  app: path.resolve(__dirname, 'app')
}

var ExtractTextPlugin = require('extract-text-webpack-plugin')

var config = {
  cache: true,
  resolve: {
    extensions: ['', '.js', '.jsx', '.css', '.styl']
  },
  entry: {
    app: [
      PATH.app + '/stylus',
      PATH.app
    ]
  },
  output: {
    path: PATH.public,
    filename: '[name].js',
    publicPath: 'mimotic_informes_plugin/lib/modules/informes/app'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        query: { presets: ['stage-3', 'es2015', 'react'], compact: true }
      },
      {
        test: /\.styl$/,
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader!stylus-loader')
      },
      {test: /\.(ttf|eot|svg)/, loader: 'url-loader'},
      {test: /\.(png|jpg|gif)/, loader: 'url-loader'}
    ]
  },

  stylus: {
    use: [require('nib')()],
    import: ['~nib/lib/nib/index.styl']
  },
  plugins: [
    new ExtractTextPlugin('styles.css', {allChunks: true})
  ]
}

module.exports = config
