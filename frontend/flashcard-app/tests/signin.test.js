import React from 'react';
import SignIn from './components/signin'; // Update with your actual path
import { useNavigate } from 'react-router-dom';

// Mock the `useNavigate` hook from react-router-dom
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

// Mock the global fetch function
global.fetch = jest.fn();

describe('SignIn Component', () => {
  const setToken = jest.fn(); // Mock setToken function

  beforeEach(() => {
    // Clear mocks before each test to avoid test pollution
    fetch.mockClear();
    useNavigate.mockClear();
  });

  test('renders sign-in form (input fields and button)', () => {
    // Simulate the component rendering
    const signInComponent = shallow(<SignIn setToken={setToken} />);

    // Expect input fields and the sign-in button to be rendered
    expect(signInComponent.find('input[name="username"]').length).toBe(1);
    expect(signInComponent.find('input[name="password"]').length).toBe(1);
    expect(signInComponent.find('button').text()).toBe('Sign in');
  });

  test('shows alert if username or password is missing', () => {
    // Spy on window.alert
    jest.spyOn(window, 'alert').mockImplementation(() => {});

    // Simulate the SignIn component
    const signInComponent = shallow(<SignIn setToken={setToken} />);

    // Simulate form submission with missing username/password
    signInComponent.find('form').simulate('submit', { preventDefault: jest.fn() });

    // Check if the alert was called with the correct message
    expect(window.alert).toHaveBeenCalledWith('Username and password are required');
  });

  test('successful login redirects to the homepage', async () => {
    // Mock useNavigate to track the navigation
    const navigate = jest.fn();
    useNavigate.mockReturnValue(navigate);

    // Mock fetch to simulate a successful login response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'fake-token', admin: false }),
    });

    // Simulate the SignIn component
    const signInComponent = shallow(<SignIn setToken={setToken} />);

    // Simulate user entering username and password
    signInComponent.find('input[name="username"]').simulate('change', { target: { value: 'testUser' } });
    signInComponent.find('input[name="password"]').simulate('change', { target: { value: 'password123' } });

    // Simulate form submission
    signInComponent.find('form').simulate('submit', { preventDefault: jest.fn() });

    // Wait for fetch call to complete and check if fetch was called with correct parameters
    await new Promise(setImmediate); // Wait for async code to complete

    // Check if fetch was called with the correct login data
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/users/login',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'testUser', password: 'password123' }),
      })
    );

    // Check if navigation was called with '/'
    expect(navigate).toHaveBeenCalledWith('/');
  });

  test('successful admin login redirects to admin dashboard', async () => {
    const navigate = jest.fn();
    useNavigate.mockReturnValue(navigate);

    // Mock fetch to simulate a successful admin login response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'fake-token', admin: true }),
    });

    // Simulate the SignIn component
    const signInComponent = shallow(<SignIn setToken={setToken} />);

    // Simulate entering admin credentials
    signInComponent.find('input[name="username"]').simulate('change', { target: { value: 'adminUser' } });
    signInComponent.find('input[name="password"]').simulate('change', { target: { value: 'adminPass' } });

    // Simulate form submission
    signInComponent.find('form').simulate('submit', { preventDefault: jest.fn() });

    // Wait for fetch call to complete and check if fetch was called with correct parameters
    await new Promise(setImmediate); // Wait for async code to complete

    // Check if navigation was called with '/AdminDashboard'
    expect(navigate).toHaveBeenCalledWith('/AdminDashboard');
  });

  test('shows an alert on login failure', async () => {
    // Spy on window.alert
    jest.spyOn(window, 'alert').mockImplementation(() => {});

    // Mock fetch to simulate a failed login response
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid credentials' }),
    });

    // Simulate the SignIn component
    const signInComponent = shallow(<SignIn setToken={setToken} />);

    // Simulate entering wrong credentials
    signInComponent.find('input[name="username"]').simulate('change', { target: { value: 'wrongUser' } });
    signInComponent.find('input[name="password"]').simulate('change', { target: { value: 'wrongPass' } });

    // Simulate form submission
    signInComponent.find('form').simulate('submit', { preventDefault: jest.fn() });

    // Wait for fetch to complete and check if fetch was called
    await new Promise(setImmediate); // Wait for async code to complete

    // Check if the alert was called with the correct error message
    expect(window.alert).toHaveBeenCalledWith('Error: Invalid credentials');
  });
});
