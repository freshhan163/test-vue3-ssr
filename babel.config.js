module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                useBuiltIns: 'usage',
                corejs: {
                    version: 3,
                    proposals: true
                },
                debug: false
            },
            "@babel/preset-typescript"
        ]
    ],
    plugins: [
        "@babel/plugin-transform-runtime",
        "@babel/plugin-syntax-jsx",
        "transform-vue-jsx",
        "lodash"
    ]
};