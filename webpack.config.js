const path = require("path"); //用于获取路径相关的信息
const HtmlWebpackPlugin = require("html-webpack-plugin"); //webpack中的插件，用于打包文件时可以在html中插入 script 和 link 标签
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  mode: "production",
  devtool: "inline-source-map",
  entry: {
    entry: path.join(__dirname, "/src/main.js"),
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: "main.js",
    // filename: "[name].[contenthash].js", 随机hash名称
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
      },
      {
        test: /\.less$/i,
        use: ["style-loader", "css-loader", "less-loader"],
      },
      {
        test: /\.js$/i,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
  devServer: {
    static: path.resolve(__dirname, "dist"), //服务器根路径
    port: "8080", //端口号
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./index.html",
      favicon: path.join(__dirname, "/src/img/favicon.ico"),
    }),
  ],
};
