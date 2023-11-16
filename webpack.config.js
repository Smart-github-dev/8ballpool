const Dotenv = require("dotenv-webpack");
const FilterWarningsPlugin = require("webpack-filter-warnings-plugin");

module.exports = {
  target: "node",
  entry: "./index.js",
  externals: {
    bufferutil: "bufferutil",
    "aws-crt": "aws-crt",
    "utf-8-validate": "utf-8-validate",
  },
  output: {
    path: __dirname + "/dist",
    filename: "main.js",
  },
  module: {
    rules: [
      {
        test: [/.js$/],
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
  plugins: [
    new Dotenv(),
    new FilterWarningsPlugin({
      exclude: [
        /mongodb/,
        /mssql/,
        /mysql/,
        /mysql2/,
        /oracledb/,
        /pg/,
        /pg-native/,
        /pg-query-stream/,
        /react-native-sqlite-storage/,
        /redis/,
        /sqlite3/,
        /sql.js/,
        /typeorm-aurora-data-api-driver/,
        /Critical dependency/,
      ],
    }),
  ],
};
