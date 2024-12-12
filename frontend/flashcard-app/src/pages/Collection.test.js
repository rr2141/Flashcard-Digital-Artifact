
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import CollectionPage from './Collection';
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

describe('CollectionPage Component', () => {
  beforeEach(() => {
   
    jest.resetAllMocks();
    fetch.resetMocks();
    Storage.prototype.getItem = jest.fn();
    window.alert = jest.fn();
  });

  test('sends API request to create a collection', async () => {

    Storage.prototype.getItem.mockReturnValue('fake-token');


    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSets,
    });


    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 1,
        comment: 'Sample Comment',
        flashcardSets: mockSets,
      }),
    });

    render(
      <MemoryRouter>
        <CollectionPage />
      </MemoryRouter>
    );

    
    await waitFor(() => {
      expect(screen.getByText('Set One')).toBeInTheDocument();
      expect(screen.getByText('Set Two')).toBeInTheDocument();
    });


    userEvent.click(screen.getByText(/Add Collection/i));


    userEvent.type(screen.getByLabelText(/Comment/i), 'Sample Comment');
    userEvent.selectOptions(screen.getByLabelText(/Select Flashcard Sets/i), ['1', '2']);


    userEvent.click(screen.getByRole('button', { name: /Create/i }));

  
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer fake-token',
        },
        body: JSON.stringify({
          comment: 'Sample Comment',
          setIds: ['1', '2'],
        }),
      });
    });
  });
});