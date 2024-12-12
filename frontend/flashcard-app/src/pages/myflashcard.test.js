import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FlashcardsPage from './Flashcard'; // Ensure the correct import
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

beforeAll(() => {
  global.localStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
  };

  global.alert = jest.fn();
});

beforeEach(() => {
  fetchMock.resetMocks();
  jest.clearAllMocks();
});

describe('FlashcardsPage', () => {
  it('renders the flashcard sets', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify([
        { id: 1, name: 'Set 1', description: 'Description 1' },
        { id: 2, name: 'Set 2', description: 'Description 2' },
      ])
    );

    localStorage.getItem.mockReturnValue('fake-token');

    render(<FlashcardsPage />);

    await waitFor(() => {
      expect(screen.getByText('Set 1')).toBeInTheDocument();
      expect(screen.getByText('Set 2')).toBeInTheDocument();
    });
  });

  it('shows an error message when fetching sets fails', async () => {
    fetchMock.mockRejectOnce(new Error('Failed to fetch'));

    localStorage.getItem.mockReturnValue('fake-token');

    render(<FlashcardsPage />);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Error fetching your flashcard sets. Please try again later!');
    });
  });

  it('allows the user to add a new set', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({ id: 3, name: 'New Set', description: 'New Description' })
    );

    localStorage.getItem.mockReturnValue('fake-token');

    render(<FlashcardsPage />);

    fireEvent.click(screen.getByText('Add Set +'));

    fireEvent.change(screen.getByLabelText(/set name/i), { target: { value: 'New Set' } });

    fireEvent.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(screen.getByText('New Set')).toBeInTheDocument();
    });
  });

  it('allows the user to delete a set', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ id: 1, name: 'Set 1' }));

    localStorage.getItem.mockReturnValue('fake-token');

    render(<FlashcardsPage />);

    await waitFor(() => {
      expect(screen.getByText('Set 1')).toBeInTheDocument();
    });

    fetchMock.mockResponseOnce(() => Promise.resolve());

    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(screen.queryByText('Set 1')).toBeNull();
    });
  });

  it('shows the comments when clicking on "Comment"', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify([
        { id: 1, name: 'Set 1', description: 'Description 1' },
      ])
    );

    fetchMock.mockResponseOnce(
      JSON.stringify({ date: '2024-12-11', comment: 'Great set!', user: { name: 'User 1' } })
    );

    localStorage.getItem.mockReturnValue('fake-token');

    render(<FlashcardsPage />);

    await waitFor(() => {
      expect(screen.getByText('Set 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Comment'));

    await waitFor(() => {
      expect(screen.getByText('Great set!')).toBeInTheDocument();
    });
  });

  it('shows an alert if user is not logged in', async () => {
    localStorage.getItem.mockReturnValue(null);

    render(<FlashcardsPage />);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('You must be logged in to view your flashcard sets');
    });
  });
});