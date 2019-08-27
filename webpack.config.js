// This library allows us to combine paths easily
const path = require('path');

const DIST = 'public';

module.exports = {
   mode: 'development',
   devtool: 'inline-source-map',
   entry: {
      "main": ["@babel/polyfill", path.join(__dirname, 'src/index.js')],
      "css": path.join(__dirname, "src/styles/main.scss"),
   },
   output: {
      path: path.resolve(__dirname, DIST),
      filename: '[name].js'
   },
   resolve: {
      extensions: ['.js']
   },
   module: {
      rules: [
         {
            test: /\.js(x*)/,
            use: {
               loader: 'babel-loader',
               options: {
                  "presets": ["@babel/env", "@babel/react"]
               }
            }
         },
         {
            test: /\.(s*)css$/,
            
            use: [
               {
                  loader: 'style-loader',
               },
               {
                  loader: 'css-loader',
                  options: {
                     sourceMap: true,
                  },
               },
               {
                  loader: 'sass-loader',
                  options: {
                     sourceMap: true,
                  },
               },
            ],
         },
         {
            test: /\.html$/,
            use: ['file-loader?name=[name].[ext]', 'extract-loader', 'html-loader'],
         },
         {
            test: /\.(png|svg|jpg|gif)$/,
            use: [
               'file-loader'
            ]
         }
      ]
   },
   devServer: {
      contentBase: DIST,
      hot: true,
      inline: true,
      watchContentBase: true,
   }
};