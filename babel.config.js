module.exports = (api) => ({
    presets: [
        [
            '@babel/preset-env',
            {
                useBuiltIns: 'usage',
                corejs: {
                    version: 3,
                    proposals: true
                },
                debug: false,
            },
            "@babel/preset-typescript"
        ],
    ],
    plugins: api.env() === 'prod' ? [] : [],
});