/**
 * Unit tests for Docker Configuration Change Detection Rule
 */

const dockerChangeRule = require('../../src/rules/infrastructure/docker-change');

describe('Docker Configuration Change Detection Rule', () => {
  describe('Rule Metadata', () => {
    it('should have correct metadata', () => {
      expect(dockerChangeRule.metadata).toBeDefined();
      expect(dockerChangeRule.metadata.name).toBe('Docker Configuration Change Detection');
      expect(dockerChangeRule.metadata.description).toBeDefined();
      expect(dockerChangeRule.metadata.category).toBe('infrastructure');
      expect(dockerChangeRule.metadata.labels).toHaveLength(1);
    });

    it('should define docker-change label with correct color', () => {
      const label = dockerChangeRule.metadata.labels[0];
      expect(label.name).toBe('docker-change');
      expect(label.color).toBe('384d54');
      expect(label.description).toBe('Docker configuration files modified');
    });
  });

  describe('Dockerfile Detection', () => {
    it('should detect Dockerfile in root directory', () => {
      const files = [{ filename: 'Dockerfile' }];
      const labels = dockerChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('docker-change');
      expect(labels).toHaveLength(1);
    });

    it('should detect Dockerfile in subdirectory', () => {
      const files = [{ filename: 'services/api/Dockerfile' }];
      const labels = dockerChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('docker-change');
    });

    it('should detect Dockerfile with case variations (lowercase)', () => {
      const files = [{ filename: 'dockerfile' }];
      const labels = dockerChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('docker-change');
    });

    it('should detect Dockerfile with case variations (mixed case)', () => {
      const files = [{ filename: 'DockerFile' }];
      const labels = dockerChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('docker-change');
    });

    it('should detect nested Dockerfile in deep directory structure', () => {
      const files = [{ filename: 'src/backend/services/auth/Dockerfile' }];
      const labels = dockerChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('docker-change');
    });
  });

  describe('Dockerfile Variants Detection', () => {
    it('should detect Dockerfile.production', () => {
      const files = [{ filename: 'Dockerfile.production' }];
      const labels = dockerChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('docker-change');
    });

    it('should detect Dockerfile.dev', () => {
      const files = [{ filename: 'Dockerfile.dev' }];
      const labels = dockerChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('docker-change');
    });

    it('should detect Dockerfile.prod', () => {
      const files = [{ filename: 'Dockerfile.prod' }];
      const labels = dockerChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('docker-change');
    });

    it('should detect Dockerfile.test', () => {
      const files = [{ filename: 'Dockerfile.test' }];
      const labels = dockerChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('docker-change');
    });

    it('should detect Dockerfile variants in subdirectories', () => {
      const files = [{ filename: 'docker/Dockerfile.staging' }];
      const labels = dockerChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('docker-change');
    });

    it('should detect lowercase dockerfile.dev', () => {
      const files = [{ filename: 'dockerfile.dev' }];
      const labels = dockerChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('docker-change');
    });
  });

  describe('.dockerfile Extension Detection', () => {
    it('should detect app.dockerfile', () => {
      const files = [{ filename: 'app.dockerfile' }];
      const labels = dockerChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('docker-change');
    });

    it('should detect build.dockerfile', () => {
      const files = [{ filename: 'build.dockerfile' }];
      const labels = dockerChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('docker-change');
    });

    it('should detect service.dockerfile in subdirectory', () => {
      const files = [{ filename: 'services/web/service.dockerfile' }];
      const labels = dockerChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('docker-change');
    });

    it('should detect .dockerfile with mixed case', () => {
      const files = [{ filename: 'myapp.DockerFile' }];
      const labels = dockerChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('docker-change');
    });
  });

  describe('.dockerignore Detection', () => {
    it('should detect .dockerignore in root', () => {
      const files = [{ filename: '.dockerignore' }];
      const labels = dockerChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('docker-change');
    });

    it('should detect .dockerignore in subdirectory', () => {
      const files = [{ filename: 'services/api/.dockerignore' }];
      const labels = dockerChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('docker-change');
    });

    it('should detect .dockerignore with case variations', () => {
      const files = [{ filename: '.DockerIgnore' }];
      const labels = dockerChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('docker-change');
    });
  });

  describe('docker-compose Files Detection', () => {
    it('should detect docker-compose.yml', () => {
      const files = [{ filename: 'docker-compose.yml' }];
      const labels = dockerChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('docker-change');
    });

    it('should detect docker-compose.yaml', () => {
      const files = [{ filename: 'docker-compose.yaml' }];
      const labels = dockerChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('docker-change');
    });

    it('should detect docker-compose.prod.yml', () => {
      const files = [{ filename: 'docker-compose.prod.yml' }];
      const labels = dockerChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('docker-change');
    });

    it('should detect docker-compose.dev.yaml', () => {
      const files = [{ filename: 'docker-compose.dev.yaml' }];
      const labels = dockerChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('docker-change');
    });

    it('should detect docker-compose.override.yml', () => {
      const files = [{ filename: 'docker-compose.override.yml' }];
      const labels = dockerChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('docker-change');
    });

    it('should detect docker-compose files in subdirectory', () => {
      const files = [{ filename: 'infra/docker-compose.yml' }];
      const labels = dockerChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('docker-change');
    });

    it('should detect docker-compose with case variations', () => {
      const files = [{ filename: 'Docker-Compose.yml' }];
      const labels = dockerChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('docker-change');
    });
  });

  describe('Multiple Docker Files', () => {
    it('should detect when multiple Docker files are changed', () => {
      const files = [
        { filename: 'Dockerfile' },
        { filename: '.dockerignore' },
        { filename: 'docker-compose.yml' }
      ];
      const labels = dockerChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('docker-change');
      expect(labels).toHaveLength(1); // Should only add label once
    });

    it('should detect Docker files mixed with non-Docker files', () => {
      const files = [
        { filename: 'src/app.js' },
        { filename: 'Dockerfile' },
        { filename: 'README.md' }
      ];
      const labels = dockerChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('docker-change');
    });
  });

  describe('Non-Docker Files', () => {
    it('should not detect regular files', () => {
      const files = [
        { filename: 'src/app.js' },
        { filename: 'README.md' },
        { filename: 'package.json' }
      ];
      const labels = dockerChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).not.toContain('docker-change');
      expect(labels).toHaveLength(0);
    });

    it('should not detect files with "docker" in the name but not Docker files', () => {
      const files = [
        { filename: 'docs/docker-setup.md' },
        { filename: 'scripts/docker-deploy.sh' }
      ];
      const labels = dockerChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).not.toContain('docker-change');
    });

    it('should not detect Dockerfile in the middle of filename', () => {
      const files = [
        { filename: 'my-dockerfile-notes.txt' }
      ];
      const labels = dockerChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).not.toContain('docker-change');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty files array', () => {
      const files = [];
      const labels = dockerChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toHaveLength(0);
    });

    it('should handle files with null filename', () => {
      const files = [{ filename: null }];
      const labels = dockerChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toHaveLength(0);
    });

    it('should handle files with undefined filename', () => {
      const files = [{ filename: undefined }];
      const labels = dockerChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toHaveLength(0);
    });

    it('should handle mixed valid and invalid filenames', () => {
      const files = [
        { filename: null },
        { filename: 'Dockerfile' },
        { filename: undefined }
      ];
      const labels = dockerChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('docker-change');
      expect(labels).toHaveLength(1);
    });
  });

  describe('Debug Logging', () => {
    it('should not throw error when debug is enabled', () => {
      const files = [{ filename: 'Dockerfile' }];
      
      expect(() => {
        dockerChangeRule({ files, pr: {}, enableDebug: true });
      }).not.toThrow();
    });

    it('should work with debug disabled', () => {
      const files = [{ filename: 'Dockerfile' }];
      
      expect(() => {
        dockerChangeRule({ files, pr: {}, enableDebug: false });
      }).not.toThrow();
    });
  });

  describe('Real-world Scenarios', () => {
    it('should detect changes in monorepo with multiple Dockerfiles', () => {
      const files = [
        { filename: 'services/api/Dockerfile' },
        { filename: 'services/web/Dockerfile.prod' },
        { filename: 'services/worker/app.dockerfile' }
      ];
      const labels = dockerChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('docker-change');
      expect(labels).toHaveLength(1);
    });

    it('should detect Docker setup changes', () => {
      const files = [
        { filename: 'Dockerfile' },
        { filename: '.dockerignore' },
        { filename: 'docker-compose.yml' },
        { filename: 'docker-compose.dev.yml' }
      ];
      const labels = dockerChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('docker-change');
    });

    it('should handle CI/CD with Docker changes', () => {
      const files = [
        { filename: '.github/workflows/deploy.yml' },
        { filename: 'Dockerfile.production' },
        { filename: 'scripts/deploy.sh' }
      ];
      const labels = dockerChangeRule({ files, pr: {}, enableDebug: false });
      
      expect(labels).toContain('docker-change');
    });
  });
});

