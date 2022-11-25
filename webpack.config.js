const path = require("path"); //用于获取路径相关的信息
const HtmlWebpackPlugin = require("html-webpack-plugin"); //webpack中的插件，用于打包文件时可以在html中插入 script 和 link 标签
module.exports = {
  mode: "production", //编译的模式 [development,production]
  entry: {
    //入口js文件
    entry: path.join(__dirname, "/src/main.js"),
  },
  output: {
    //输出路径
    path: path.join(__dirname, "dist"),
    filename: "bundle.js",
  },

  module: {
    rules: [
      //打包的规则，不同的文件类型可以参考官网的 https://webpack.docschina.org/loaders/
      {
        test: /\.css$/i, //打包css文件 要打包css之类的文件在执行打包命令之前必须在入口js文件中引入，如( import "./banana.css" )
        use: ["style-loader", "css-loader"], //所用到的loader
      },
      {
        test: /\.less$/i,
        use: ["style-loader", "css-loader", "less-loader"],
      },
    ],
  },
  devServer: {
    //webpack-dev-server开启的服务器配置
    static: path.resolve(__dirname, "dist"), //服务器根路径
    port: "8080", //端口号
  },
};
