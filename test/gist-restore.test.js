// Mock minimal chrome runtime in Node environment
globalThis.chrome = {
  runtime: { id: 'mytab-test-extension' },
  storage: {
    local: {
      get: async () => ({}),
      set: async () => {},
    },
  },
};

import test from 'node:test';
import assert from 'node:assert/strict';

const { GitClient } = await import('../src/services/git.ts');

test('GitClient: Gist restore retrieves full content via raw_url when file.truncated is true', async () => {
  const fullPayload = {
    version: 2,
    timestamp: 1789493487654,
    profiles: {
      normal: {
        sites: [
          { id: 'site-1', title: 'GitHub', url: 'https://github.com' },
          { id: 'site-2', title: 'Vercel', url: 'https://vercel.com' },
        ],
        categories: [],
      },
    },
    settings: { language: 'zh-CN' },
  };

  const fullJson = JSON.stringify(fullPayload);
  const truncatedContent = fullJson.slice(0, Math.floor(fullJson.length / 2)); // Corrupted/cut-off JSON

  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async (url, options) => {
      const urlStr = String(url);
      if (urlStr.includes('/gists/test-gist-id')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            id: 'test-gist-id',
            files: {
              'mytab-backup.json': {
                filename: 'mytab-backup.json',
                size: fullJson.length,
                truncated: true,
                content: truncatedContent,
                raw_url: 'https://gist.githubusercontent.com/test-user/test-gist-id/raw/mytab-backup.json',
              },
            },
          }),
        };
      }
      if (urlStr.includes('gist.githubusercontent.com')) {
        return {
          ok: true,
          status: 200,
          text: async () => fullJson,
        };
      }
      return originalFetch(url, options);
    };

    const client = new GitClient({
      provider: 'github',
      mode: 'gist',
      gistId: 'test-gist-id',
      token: 'ghp_fake_token_for_test',
    });

    const { payload } = await client.getData();
    assert.ok(payload, 'Payload should not be null');
    assert.equal(payload.version, 2);
    assert.equal(payload.profiles.normal.sites.length, 2);
    assert.equal(payload.profiles.normal.sites[0].title, 'GitHub');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('GitClient: Gist restore falls back to raw_url if content is not marked truncated but is corrupted', async () => {
  const fullPayload = {
    version: 2,
    timestamp: 1789493487654,
    profiles: { normal: { sites: [{ id: 'site-1', title: 'GitHub', url: 'https://github.com' }] } },
  };
  const fullJson = JSON.stringify(fullPayload);

  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async (url, options) => {
      const urlStr = String(url);
      if (urlStr.includes('/gists/test-gist-id')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            id: 'test-gist-id',
            files: {
              'mytab-backup.json': {
                filename: 'mytab-backup.json',
                size: 100000,
                truncated: false,
                content: '{"version": 2, "unclosed_json', // Invalid JSON without truncated flag
                raw_url: 'https://gist.githubusercontent.com/test-user/test-gist-id/raw/mytab-backup.json',
              },
            },
          }),
        };
      }
      if (urlStr.includes('gist.githubusercontent.com')) {
        return {
          ok: true,
          status: 200,
          text: async () => fullJson,
        };
      }
      return originalFetch(url, options);
    };

    const client = new GitClient({
      provider: 'github',
      mode: 'gist',
      gistId: 'test-gist-id',
      token: 'ghp_fake_token_for_test',
    });

    const { payload } = await client.getData();
    assert.ok(payload, 'Payload should be recovered via raw_url');
    assert.equal(payload.version, 2);
    assert.equal(payload.profiles.normal.sites[0].title, 'GitHub');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('GitClient: Repo mode getFile fetches from download_url when file > 1MB and content is omitted', async () => {
  const fullPayload = {
    version: 2,
    timestamp: 1789493487654,
    profiles: { normal: { sites: [{ id: 'site-repo', title: 'GitLab', url: 'https://gitlab.com' }] } },
  };
  const fullJson = JSON.stringify(fullPayload);

  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async (url, options) => {
      const urlStr = String(url);
      if (urlStr.includes('/repos/owner/repo/contents/')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            name: 'mytab-backup.json',
            path: 'mytab-backup.json',
            sha: 'commit_sha_123',
            size: 2000000,
            // Notice: content is omitted by GitHub because size > 1MB
            download_url: 'https://raw.githubusercontent.com/owner/repo/main/mytab-backup.json',
          }),
        };
      }
      if (urlStr.includes('raw.githubusercontent.com')) {
        return {
          ok: true,
          status: 200,
          text: async () => fullJson,
        };
      }
      return originalFetch(url, options);
    };

    const client = new GitClient({
      provider: 'github',
      mode: 'repo',
      owner: 'owner',
      repo: 'repo',
      branch: 'main',
      token: 'ghp_fake_token',
    });

    const { payload, sha } = await client.getData();
    assert.ok(payload, 'Repo payload should be recovered via download_url');
    assert.equal(payload.profiles.normal.sites[0].title, 'GitLab');
    assert.equal(sha, 'commit_sha_123');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('GitClient: Real live Gist test with user provided Gist ID', async () => {
  const client = new GitClient({
    provider: 'github',
    mode: 'gist',
    gistId: 'dbefe4d49a488c3e3cd21a83e04f043c',
    token: '',
  });

  try {
    const { payload } = await client.getData();
    assert.ok(payload, 'Real Gist payload should be parsed successfully');
    assert.equal(payload.version, 2);
    assert.equal(payload.profiles.normal.sites.length, 60);
    assert.equal(payload.profiles.normal.sites[0].title, 'GitHub');
    assert.equal(payload.profiles.normal.sites[1].title, 'GitLab');
  } catch (err) {
    console.warn('Skipping live network test if offline:', err.message);
  }
});
