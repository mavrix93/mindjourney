import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import api, { getEntries, getEntry, createEntry, updateEntry, deleteEntry } from '../api';

describe('api service - entries', () => {
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(api);
  });

  afterEach(() => {
    mock.reset();
  });

  test('getEntries returns list', async () => {
    const data = [{ id: 1 }, { id: 2 }];
    mock.onGet('/entries/').reply(200, data);
    await expect(getEntries()).resolves.toEqual(data);
  });

  test('getEntry returns by id', async () => {
    const item = { id: 42 };
    mock.onGet('/entries/42/').reply(200, item);
    await expect(getEntry(42)).resolves.toEqual(item);
  });

  test('createEntry posts data', async () => {
    const payload = { title: 't', content: 'c' };
    const created = { id: 10, ...payload };
    mock.onPost('/entries/').reply(201, created);
    await expect(createEntry(payload)).resolves.toEqual(created);
  });

  test('updateEntry patches by id', async () => {
    const payload = { title: 'nt' };
    const updated = { id: 1, title: 'nt' };
    mock.onPatch('/entries/1/').reply(200, updated);
    await expect(updateEntry(1, payload)).resolves.toEqual(updated);
  });

  test('deleteEntry deletes by id', async () => {
    mock.onDelete('/entries/1/').reply(204, {});
    await expect(deleteEntry(1)).resolves.toEqual({});
  });
});

