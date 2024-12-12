import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SignIn from './signin'; 
import '@testing-library/jest-dom';

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ token: 'fake-token', admin: false }),
  })
);

describe('SignIn Component', () => {
  const setToken = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the sign-in form', () => {
    render(
      <MemoryRouter>
        <SignIn setToken={setToken} />
      </MemoryRouter>
    );
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should show an alert if username or password is missing', () => {
    window.alert = jest.fn();
    render(
      <MemoryRouter>
        <SignIn setToken={setToken} />
      </MemoryRouter>
    );

    // Clear the input fields to simulate missing credentials
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: '' } });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(window.alert).toHaveBeenCalledWith('Username and password are required');
  });

  it('should call setToken and navigate to user page on successful login', async () => {
    render(
      <MemoryRouter>
        <SignIn setToken={setToken} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'user' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(setToken).toHaveBeenCalledWith('fake-token');
      expect(window.location.pathname).toBe('/');
    });
  });

  it('should call setToken and navigate to admin page on successful admin login', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve({ token: 'fake-token', admin: true }),
      })
    );

    render(
      <MemoryRouter>
        <SignIn setToken={setToken} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(setToken).toHaveBeenCalledWith('fake-token');
      expect(window.location.pathname).toBe('/AdminDashboard');
    });
  });

  it('should show an alert on login error', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Invalid credentials' }),
      })
    );

    window.alert = jest.fn();
    render(
      <MemoryRouter>
        <SignIn setToken={setToken} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'user' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Error: Invalid credentials');
    });
  });
});