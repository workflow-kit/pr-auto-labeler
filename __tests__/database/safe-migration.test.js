const rule = require('../../src/rules/database/safe-migration');

describe('Safe Migration Rule', () => {
  it('labels for additive migrations without risky ops', () => {
    const files = [{ filename: 'migrations/001_add_users.sql', patch: '+ ALTER TABLE users ADD COLUMN age INT;' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toContain('safe-migration');
  });

  it('does not label when risky ops are present', () => {
    const files = [{ filename: 'migrations/002_drop_table.sql', patch: '+ DROP TABLE users;' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });

  it('does not label when no migrations found', () => {
    const files = [{ filename: 'src/app.ts', patch: '+ const x = 1;' }];
    const labels = rule({ files, pr: {}, enableDebug: false });
    expect(labels).toEqual([]);
  });
});


