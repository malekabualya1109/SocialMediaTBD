const { defineConfig } = require("cypress");
const webpackPreprocessor = require("@cypress/webpack-preprocessor");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // Webpack Preprocessor
      const options = webpackPreprocessor.defaultOptions;
      on("file:preprocessor", webpackPreprocessor(options));

      // Cypress Code Coverage Plugin
      require("@cypress/code-coverage/task")(on, config);

      return config;
    },
    baseUrl: "http://localhost:3000", // Adjust if needed
  },
});


