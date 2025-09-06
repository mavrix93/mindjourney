import path from 'path';
import { Pact } from '@pact-foundation/pact';
import api, { getEntries, getEntry } from '../services/api';

// Pact mock provider
const provider = new Pact({
  consumer: 'mindjourney-frontend',
  provider: 'mindjourney-backend',
  port: 9999,
  log: path.resolve(process.cwd(), 'contracts', 'logs', 'pact.log'),
  dir: path.resolve(process.cwd(), 'contracts', 'pacts'),
  spec: 2,
});

describe('Pact - entries API', () => {
  beforeAll(() => provider.setup());
  afterAll(() => provider.finalize());

  describe('GET /entries/', () => {
    beforeAll(() =>
      provider.addInteraction({
        state: 'there are entries',
        uponReceiving: 'a request for entries',
        withRequest: {
          method: 'GET',
          path: '/entries/',
          headers: { 'Content-Type': 'application/json' },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: [{ id: 1, title: 'Sample', content: 'c', is_public: false }],
        },
      })
    );

    it('returns entries as expected by consumer', async () => {
      // Point frontend API to pact mock server
      process.env.REACT_APP_API_URL = 'http://localhost:9999';
      api.defaults.baseURL = 'http://localhost:9999';
      const data = await getEntries();
      expect(Array.isArray(data)).toBe(true);
      expect(data[0]).toHaveProperty('id');
    });
  });

  describe('GET /entries/:id/', () => {
    const entry = { id: 2, title: 'Second', content: 'x', is_public: true };
    beforeAll(() =>
      provider.addInteraction({
        state: 'entry with id 2 exists',
        uponReceiving: 'a request for a single entry',
        withRequest: {
          method: 'GET',
          path: '/entries/2/',
          headers: { 'Content-Type': 'application/json' },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: entry,
        },
      })
    );

    it('returns entry by id', async () => {
      process.env.REACT_APP_API_URL = 'http://localhost:9999';
      api.defaults.baseURL = 'http://localhost:9999';
      const data = await getEntry(2);
      expect(data).toMatchObject(entry);
    });
  });
});

