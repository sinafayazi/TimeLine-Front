module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }], // Configure jsxImportSource
      "nativewind/babel",
    ],
  };
};
