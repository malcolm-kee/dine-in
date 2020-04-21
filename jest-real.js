const baseConfig = require('./jest-e2e');

/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
const override = {
  testRegex: ['apps\\/.*\\.e2e\\.spec\\.ts$'],
};

module.exports = Object.assign({}, baseConfig, override);
