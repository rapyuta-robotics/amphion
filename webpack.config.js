module.exports = {
  devServer: {
    compress: true,
    hot: true,
    openPage: '/examples/basic',
    port: 9000,
  },
  entry: {
    basic: __dirname + '/examples/basic/index.es6',
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
