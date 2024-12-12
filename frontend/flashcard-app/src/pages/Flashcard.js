import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Flashcard = ({ set, onBack }) => {
  const [flashcards, setFlashcards] = useState([]);
  const navigate = useNavigate();
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedFlashcard, setEditedFlashcard] = useState({
    question: '',
    answer: '',
  });

  // Fetches flashcards in the set
  useEffect(() => {
    const fetchFlashcards = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to view your flashcards');
        onBack();
        return;
      }

      try {
        const response = await fetch(`http://localhost:3000/api/flashcards/set/${set.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch flashcards');
        }

        const data = await response.json();
        if (data.message) {
          alert(data.message);
          navigate('/create', { state: { setId: set.id } });
        } else {
          setFlashcards(data || []);
        }
      } catch (error) {
        console.error('Error fetching flashcards:', error.message);
        alert('Error fetching flashcards: ' + error.message);
        onBack();
      }
    };

    fetchFlashcards();
  }, [set.id, onBack, navigate]);

  const handleCreateFlashcard = () => {
    navigate('/create', { state: { setId: set.id } });
  };

  const handleFlashcardNavigation = (direction) => {
    setFlipped(false);
    if (direction === 'prev') {
      setCurrentFlashcardIndex(
        (prevIndex) => (prevIndex === 0 ? flashcards.length - 1 : prevIndex - 1)
      );
    } else {
      setCurrentFlashcardIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
    }
    setIsEditing(false);
  };

  const handleEditFlashcard = () => {
    const flashcard = flashcards[currentFlashcardIndex];
    setEditedFlashcard({ question: flashcard?.question || '', answer: flashcard?.answer || '' });
    setIsEditing(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const flashcardId = flashcards[currentFlashcardIndex]?.id;

    if (!token || !flashcardId) {
      alert('Error: No flashcard ID or token');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/flashcards/${flashcardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editedFlashcard),
      });

      if (!response.ok) {
        throw new Error('Failed to update flashcard');
      }

      const updatedFlashcard = await response.json();
      const updatedFlashcards = [...flashcards];
      updatedFlashcards[currentFlashcardIndex] = updatedFlashcard;
      setFlashcards(updatedFlashcards);
      setIsEditing(false);
      alert('Flashcard updated successfully!');
    } catch (error) {
      console.error('Error updating flashcard:', error.message);
      alert('Error updating flashcard: ' + error.message);
    }
  };

  const handleDeleteFlashcard = async () => {
    const token = localStorage.getItem('token');
    const flashcardId = flashcards[currentFlashcardIndex]?.id;

    if (!token || !flashcardId) {
      alert('Error: No flashcard ID or token');
      return;
    }

    const confirmDelete = window.confirm('Are you sure you want to delete this flashcard?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:3000/api/flashcards/${flashcardId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete flashcard');
      }

      const updatedFlashcards = flashcards.filter((_, index) => index !== currentFlashcardIndex);
      setFlashcards(updatedFlashcards);

      if (updatedFlashcards.length > 0) {
        setCurrentFlashcardIndex((prevIndex) => Math.min(prevIndex, updatedFlashcards.length - 1));
      } else {
        setCurrentFlashcardIndex(0);
      }

      alert('Flashcard deleted successfully!');
    } catch (error) {
      console.error('Error deleting flashcard:', error.message);
      alert('Error deleting flashcard: ' + error.message);
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={onBack}
        className="mb-4 bg-gray-200 px-4 py-2 rounded-md"
      >
        Back to Sets
      </button>

      {flashcards.length === 0 ? (
        <p>Loading flashcards...</p>
      ) : (
        <div className="text-center">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">{set.name}</h2>
            <div className="flex gap-x-4">
              <button
                onClick={handleEditFlashcard}
                className="bg-blue-200 px-4 py-2 rounded-md shadow-sm hover:bg-blue-300"
              >
                Edit
              </button>
              <button
                onClick={handleDeleteFlashcard}
                className="bg-red-200 px-4 py-2 rounded-md shadow-sm hover:bg-red-300"
              >
                Delete
              </button>
            </div>
          </div>

          <div
            className="mt-8 h-64 w-full bg-purple-200 text-gray-900 rounded-md flex items-center justify-center text-xl font-semibold cursor-pointer shadow-md border border-purple-300 relative"
          >
            {/* Difficulty Label */}
            <div
              className={`absolute top-2 left-2 px-3 py-1 rounded-full text-white font-semibold ${
                flashcards[currentFlashcardIndex]?.difficulty === 'HARD'
                  ? 'bg-red-400'
                  : flashcards[currentFlashcardIndex]?.difficulty === 'MEDIUM'
                  ? 'bg-yellow-400'
                  : 'bg-green-400'
              }`}
            >
              {flashcards[currentFlashcardIndex]?.difficulty}
            </div>

            {/* Flashcard Content */}
            <div onClick={() => setFlipped(!flipped)} className="flex items-center justify-center w-full h-full">
              {flipped
                ? flashcards[currentFlashcardIndex]?.answer || 'No Answer'
                : flashcards[currentFlashcardIndex]?.question || 'No Question'}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-x-12">
            <button
              onClick={() => handleFlashcardNavigation('prev')}
              className="rounded-md bg-gray-200 px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-300"
            >
              Previous
            </button>

            <button
              onClick={handleCreateFlashcard}
              className="rounded-md bg-green-200 px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-green-300"
            >
              Create Flashcard
            </button>

            <button
              onClick={() => handleFlashcardNavigation('next')}
              className="rounded-md bg-gray-200 px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-300"
            >
              Next
            </button>
          </div>

          {isEditing && (
            <div className="mt-8">
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">Question</label>
                  <input
                    type="text"
                    value={editedFlashcard.question}
                    onChange={(e) =>
                      setEditedFlashcard({ ...editedFlashcard, question: e.target.value })
                    }
                    className="mt-1 p-2 w-full border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Answer</label>
                  <input
                    type="text"
                    value={editedFlashcard.answer}
                    onChange={(e) =>
                      setEditedFlashcard({ ...editedFlashcard, answer: e.target.value })
                    }
                    className="mt-1 p-2 w-full border rounded-md"
                    required
                  />
                </div>
                <div className="flex justify-center gap-x-4">
                  <button
                    type="submit"
                    className="bg-green-200 px-4 py-2 rounded-md shadow-sm hover:bg-green-300"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-200 px-4 py-2 rounded-md shadow-sm hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Flashcard;