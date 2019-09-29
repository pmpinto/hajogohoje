const path = require("path")

module.exports = {
    entry: ["./assets/javascript/index.js"],
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "assets/javascript/"),
    },
    devServer: {
        contentBase: path.join(__dirname, "./"),
        compress: true,
        port: 9000,
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
