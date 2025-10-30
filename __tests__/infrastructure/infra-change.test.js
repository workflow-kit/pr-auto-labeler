const rule = require('../../src/rules/infrastructure/infra-change');

describe('Infra Change Rule', () => {
  it('labels for terraform files', () => {
    const files = [{ filename: 'infra/main.tf' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('infra-change');
  });

  it('labels for docker-compose', () => {
    const files = [{ filename: 'docker-compose.yml' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('infra-change');
  });

  it('does not label for app code', () => {
    const files = [{ filename: 'src/app.js' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });
});


