module.exports = {
  devServer: {
    compress: true,
    hot: true,
    openPage: '/examples/basic',
    port: 9000,
  },
  entry: {
    basic: __dirname + '/examples/basic/index.es6',
    '2d_viewer': __dirname + '/examples/2d_viewer/index.es6',
    '3d_viewer': __dirname + '/examples/3d_viewer/index.es6',
    custom_scene: __dirname + '/examples/custom_scene/index.es6',
    custom_view: __dirname + '/examples/custom_view/index.es6',
    multiple_views: __dirname + '/examples/multiple_views/index.es6',
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.es6$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env']
        },
      },
    ],
  },
  output: {
    filename: "[name]/index.bundle.js",
    path: __dirname + "/examples/",
    publicPath: "/examples",
  },
};
