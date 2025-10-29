/**
 * Rule Registry
 * 
 * This file exports all available rules.
 * To add a new rule, create a new file in this directory and import it here.
 */

const frontendUIRule = require('./frontend-ui');

// Environment rules
const envChangeRule = require('./environment/env-change');
const newEnvVariableRule = require('./environment/new-env-variable');
const potentialSecretLeakRule = require('./environment/potential-secret-leak');

// Frontend rules
const styleChangeRule = require('./frontend/style-change');
const uiChangeRule = require('./frontend/ui-change');

// Infrastructure rules
const dockerChangeRule = require('./infrastructure/docker-change');

// Database rules
const migrationRule = require('./database/migration');

// Export all rules as an array
module.exports = [
  frontendUIRule,
  // Environment rules
  envChangeRule,
  newEnvVariableRule,
  potentialSecretLeakRule,
  // Frontend rules
  styleChangeRule,
  uiChangeRule,
  // Infrastructure rules
  dockerChangeRule,
  // Database rules
  migrationRule,
];

