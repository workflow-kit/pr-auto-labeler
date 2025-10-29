/**
 * Rule Registry
 * 
 * This file exports all available rules.
 * To add a new rule, create a new file in this directory and import it here.
 */

const frontendUIRule = require('./frontend-ui');

// Export all rules as an array
module.exports = [
  frontendUIRule,
  // Add more rules here as they are created
  // Example: require('./database-migrations'),
  // Example: require('./test-coverage'),
];

