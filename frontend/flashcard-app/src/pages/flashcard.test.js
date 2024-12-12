import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Flashcard from './Flashcard';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

// Mock useNavigate from react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Mock localStorage
beforeEach(() => {
  Storage.prototype.getItem = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

const mockSet = { id: 1, name: 'Test Set' };
const mockOnBack = jest.fn();

const mockFlashcards = [
  { id: 1, question: 'What is React?', answer: 'A JavaScript library for building user interfaces.', difficulty: 'EASY', setId: 1 },
  { id: 2, question: 'What is useState?', answer: 'A React hook for managing state.', difficulty: 'MEDIUM', setId: 1 },
];

describe('Flashcard Component', () => {
  test('renders flashcards after successful fetch', async () => {
    Storage.prototype.getItem.mockReturnValue('fake-token');
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockFlashcards,
    });

    render(
      <MemoryRouter>
        <Flashcard set={mockSet} onBack={mockOnBack} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Loading flashcards/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('What is React?')).toBeInTheDocument();
      expect(screen.getByText('EASY')).toBeInTheDocument();
    });
  });

  test('handles fetch error', async () => {
    Storage.prototype.getItem.mockReturnValue('fake-token');
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Failed to fetch flashcards' }),
    });

    window.alert = jest.fn();

    render(
      <MemoryRouter>
        <Flashcard set={mockSet} onBack={mockOnBack} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Error fetching flashcards: Failed to fetch flashcards');
      expect(mockOnBack).toHaveBeenCalled();
    });
  });

  test('navigates to create flashcard', () => {
    Storage.prototype.getItem.mockReturnValue('fake-token');

    render(
      <MemoryRouter>
        <Flashcard set={mockSet} onBack={mockOnBack} />
      </MemoryRouter>
    );

    const createButton = screen.getByText(/Create Flashcard/i);
    userEvent.click(createButton);

    // Add assertions for navigation if needed
  });

  test('navigates between flashcards', async () => {
    Storage.prototype.getItem.mockReturnValue('fake-token');
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockFlashcards,
    });

    render(
      <MemoryRouter>
        <Flashcard set={mockSet} onBack={mockOnBack} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('What is React?')).toBeInTheDocument();
    });

    const nextButton = screen.getByText(/Next/i);
    userEvent.click(nextButton);

    expect(screen.getByText('What is useState?')).toBeInTheDocument();

    const prevButton = screen.getByText(/Previous/i);
    userEvent.click(prevButton);

    expect(screen.getByText('What is React?')).toBeInTheDocument();
  });

  test('edits a flashcard', async () => {
    Storage.prototype.getItem.mockReturnValue('fake-token');
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockFlashcards,
    });

    render(
      <MemoryRouter>
        <Flashcard set={mockSet} onBack={mockOnBack} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('What is React?')).toBeInTheDocument();
    });

    const editButton = screen.getByText(/Edit/i);
    userEvent.click(editButton);

    const questionInput = screen.getByLabelText(/Question/i);
    const answerInput = screen.getByLabelText(/Answer/i);

    userEvent.clear(questionInput);
    userEvent.type(questionInput, 'Updated Question');

    userEvent.clear(answerInput);
    userEvent.type(answerInput, 'Updated Answer');

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockFlashcards[0], question: 'Updated Question', answer: 'Updated Answer' }),
    });

    const saveButton = screen.getByText(/Save/i);
    userEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Updated Question')).toBeInTheDocument();
      expect(window.alert).toHaveBeenCalledWith('Flashcard updated successfully!');
    });
  });

  test('deletes a flashcard', async () => {
    Storage.prototype.getItem.mockReturnValue('fake-token');
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockFlashcards,
    });

    render(
      <MemoryRouter>
        <Flashcard set={mockSet} onBack={mockOnBack} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('What is React?')).toBeInTheDocument();
    });

    window.confirm = jest.fn().mockReturnValue(true);
    window.alert = jest.fn();

    global.fetch.mockResolvedValueOnce({
      ok: true,
    });

    const deleteButton = screen.getByText(/Delete/i);
    userEvent.click(deleteButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Flashcard deleted successfully!');
      expect(screen.queryByText('What is React?')).not.toBeInTheDocument();
    });
  });

  test('handles unauthorized access', async () => {
    Storage.prototype.getItem.mockReturnValue(null);
    window.alert = jest.fn();

    render(
      <MemoryRouter>
        <Flashcard set={mockSet} onBack={mockOnBack} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('You must be logged in to view your flashcards');
      expect(mockOnBack).toHaveBeenCalled();
    });
  });
});