module.exports = function (api) {
    api.cache(true);
    return {
        presets: [
            ["babel-preset-expo", { jsxImportSource: "nativewind" }],
            "nativewind/babel"
        ],
        plugins: [
            // Ensure this plugin is included for worklets
            "react-native-worklets/plugin"
        ]
    };
};