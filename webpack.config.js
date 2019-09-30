const path = require("path")

module.exports = {
    entry: "./assets/javascript/index.js",
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "assets/javascript"),
    },
    devServer: {
        compress: true,
        port: 9000,
        writeToDisk: true,
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/env"],
                    },
                },
            },
        ],
    },
}
