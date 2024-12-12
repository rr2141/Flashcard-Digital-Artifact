import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import CreateFlashcards from './CreateFlashcards';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockSets = [
  { id: 1, name: 'Set One' },
  { id: 2, name: 'Set Two' },
];

describe('CreateFlashcards Component', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    fetch.resetMocks();
    Storage.prototype.getItem = jest.fn();
    window.alert = jest.fn();
  });

  test('sends API request to create a flashcard', async () => {
    Storage.prototype.getItem.mockReturnValue('fake-token');

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSets,
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 1,
        setId: 1,
        question: 'Sample Question?',
        answer: 'Sample Answer.',
        difficulty: 'EASY',
      }),
    });

    render(
      <MemoryRouter>
        <CreateFlashcards />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Set One')).toBeInTheDocument();
      expect(screen.getByText('Set Two')).toBeInTheDocument();
    });

    userEvent.selectOptions(screen.getByLabelText(/Select Flashcard Set/i), '1');
    userEvent.type(screen.getByLabelText(/Question/i), 'Sample Question?');
    userEvent.type(screen.getByLabelText(/Answer/i), 'Sample Answer.');
    userEvent.selectOptions(screen.getByLabelText(/Difficulty/i), 'EASY');

    userEvent.click(screen.getByRole('button', { name: /Create Flashcard/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer fake-token',
        },
        body: JSON.stringify({
          setId: '1',
          question: 'Sample Question?',
          answer: 'Sample Answer.',
          difficulty: 'EASY',
        }),
      });
    });
  });
});