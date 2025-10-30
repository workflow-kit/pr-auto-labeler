const rule = require('../../src/rules/database/safe-migration');

describe('Safe Migration Rule', () => {
  it('labels for additive migrations without risky ops', () => {
    const files = [{ filename: 'migrations/001_add_users.sql', patch: '+ ALTER TABLE users ADD COLUMN age INT;' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('safe-migration');
  });

  it('labels for CREATE INDEX operations', () => {
    const files = [{ filename: 'db/migrations/002_add_index.sql', patch: '+ CREATE INDEX idx_email ON users(email);' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('safe-migration');
  });

  it('labels for CREATE TABLE operations', () => {
    const files = [{ filename: 'database/migrations/003_create.sql', patch: '+ CREATE TABLE posts (id INT);' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('safe-migration');
  });

  it('does not label when risky ops are present', () => {
    const files = [{ filename: 'migrations/002_drop_table.sql', patch: '+ DROP TABLE users;' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('does not label when ALTER DROP is present', () => {
    const files = [{ filename: 'migrations/003_alter.sql', patch: '+ ALTER TABLE users DROP COLUMN age;' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('does not label when no migrations found', () => {
    const files = [{ filename: 'src/app.ts', patch: '+ const x = 1;' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('does not label when migration has no patch', () => {
    const files = [{ filename: 'migrations/004_test.sql' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('does not label when only risky ops without additive', () => {
    const files = [{ filename: 'migrations/005_truncate.sql', patch: '+ TRUNCATE TABLE users;' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('handles empty files array', () => {
    const labels = rule({ files: [], pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('handles debug mode', () => {
    const files = [{ filename: 'migrations/006_add.sql', patch: '+ ADD COLUMN name VARCHAR(255);' }];
    expect(() => rule({ files, pr: {}, enableDebug: true })).not.toThrow();
  });
});


