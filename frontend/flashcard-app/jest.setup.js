import { TextEncoder, TextDecoder } from 'util';
// jest.setup.js
import '@testing-library/jest-dom';
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

// Mock window.alert and window.confirm
global.alert = jest.fn();
global.confirm = jest.fn();

// Mock localStorage
beforeEach(() => {
  jest.spyOn(global.Storage.prototype, 'getItem');
  jest.spyOn(global.Storage.prototype, 'setItem');
  jest.spyOn(global.Storage.prototype, 'removeItem');
  jest.spyOn(global.Storage.prototype, 'clear');
});

afterEach(() => {
  jest.clearAllMocks();
});
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;