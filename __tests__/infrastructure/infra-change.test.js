const rule = require('../../src/rules/infrastructure/infra-change');

describe('Infra Change Rule', () => {
  it('labels for terraform files', () => {
    const files = [{ filename: 'infra/main.tf' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('infra-change');
  });

  it('labels for terraform variables', () => {
    const files = [{ filename: 'terraform/vars.tfvars' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('infra-change');
  });

  it('labels for HCL files', () => {
    const files = [{ filename: 'config/setup.hcl' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('infra-change');
  });

  it('labels for docker-compose', () => {
    const files = [{ filename: 'docker-compose.yml' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('infra-change');
  });

  it('labels for Dockerfile', () => {
    const files = [{ filename: 'services/Dockerfile' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('infra-change');
  });

  it('labels for infra directory', () => {
    const files = [{ filename: 'infrastructure/setup.yaml' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('infra-change');
  });

  it('labels for k8s directory', () => {
    const files = [{ filename: 'k8s/deployment.yaml' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('infra-change');
  });

  it('labels for helm charts', () => {
    const files = [{ filename: 'charts/app/values.yaml' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('infra-change');
  });

  it('labels for config directory', () => {
    const files = [{ filename: 'config/production.yml' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('infra-change');
  });

  it('does not label for app code', () => {
    const files = [{ filename: 'src/app.js' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('handles empty files array', () => {
    const labels = rule({ files: [], pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('handles null filename', () => {
    const files = [{ filename: null }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('handles debug mode', () => {
    const files = [{ filename: 'infra/main.tf' }];
    expect(() => rule({ files, pr: {}, enableDebug: true })).not.toThrow();
  });
});
