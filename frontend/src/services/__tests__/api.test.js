// Mock axios as a virtual CJS module to avoid ESM parsing issues in Jest
jest.mock('axios', () => {
  const instance = {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    defaults: { baseURL: '', headers: {}, withCredentials: false },
    interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
  };
  const axios = {
    create: jest.fn(() => instance),
    __instance: instance,
  };
  return {
    __esModule: true,
    default: axios,
    create: axios.create,
  };
}, { virtual: true });

const { default: api, getEntries, getEntry, createEntry, updateEntry, deleteEntry } = require('../api');

describe('api service - entries', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('getEntries returns list', async () => {
    const data = [{ id: 1 }, { id: 2 }];
    jest.spyOn(api, 'get').mockResolvedValueOnce({ data });
    await expect(getEntries()).resolves.toEqual(data);
    expect(api.get).toHaveBeenCalledWith('/entries/');
  });

  test('getEntry returns by id', async () => {
    const item = { id: 42 };
    jest.spyOn(api, 'get').mockResolvedValueOnce({ data: item });
    await expect(getEntry(42)).resolves.toEqual(item);
    expect(api.get).toHaveBeenCalledWith('/entries/42/');
  });

  test('createEntry posts data', async () => {
    const payload = { title: 't', content: 'c' };
    const created = { id: 10, ...payload };
    jest.spyOn(api, 'post').mockResolvedValueOnce({ data: created });
    await expect(createEntry(payload)).resolves.toEqual(created);
    expect(api.post).toHaveBeenCalledWith('/entries/', payload);
  });

  test('updateEntry patches by id', async () => {
    const payload = { title: 'nt' };
    const updated = { id: 1, title: 'nt' };
    jest.spyOn(api, 'patch').mockResolvedValueOnce({ data: updated });
    await expect(updateEntry(1, payload)).resolves.toEqual(updated);
    expect(api.patch).toHaveBeenCalledWith('/entries/1/', payload);
  });

  test('deleteEntry deletes by id', async () => {
    jest.spyOn(api, 'delete').mockResolvedValueOnce({ data: {} });
    await expect(deleteEntry(1)).resolves.toEqual({});
    expect(api.delete).toHaveBeenCalledWith('/entries/1/');
  });
});

