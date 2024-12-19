const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3003', // Frontend URL
    env: {
      apiUrl: 'http://localhost:3000', // Backend API URL
    },
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
