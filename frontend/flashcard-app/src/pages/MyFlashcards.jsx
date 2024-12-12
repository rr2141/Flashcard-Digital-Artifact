import React, { useState, useEffect } from 'react';
import Flashcard from './Flashcard';
import CommentPage from './comments';

const FlashcardsPage = () => {
  const [sets, setSets] = useState([]);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedSet, setSelectedSet] = useState(null);
  const [newSetName, setNewSetName] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Fetch flashcard sets on page load
  useEffect(() => {
    const fetchSets = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to view your flashcard sets');
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/api/flashcardSets', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch flashcard sets');
        }

        const data = await response.json();
        setSets(data);
      } catch (error) {
        alert('Error fetching your flashcard sets. Please try again later!');
      }
    };

    fetchSets();
  }, []);

  const handleViewSet = (set) => {
    setSelectedSet(set);
    setCurrentPage('set');
  };

  // Add a new comment to the selected set
  const handleAddNewComment = (setId, addedComment) => {
    setSets((prevSets) =>
      prevSets.map((set) =>
        set.id === setId ? { ...set, comments: [...set.comments, addedComment] } : set
      )
    );
  };

  // Navigate back to the home page
  const handleBackToHome = () => {
    setCurrentPage('home');
    setSelectedSet(null);
  };

  // Create a new flashcard set
  const handleAddSet = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to create a flashcard set');
      return;
    }

    try {
      if (!newSetName.trim()) {
        alert('Please provide a name for this set!');
        return;
      }

      const response = await fetch('http://localhost:3000/api/flashcardSets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newSetName }),
      });

      if (!response.ok) {
        throw new Error(`Error creating flashcard set: ${response.statusText}`);
      }

      const newSet = await response.json();
      setSets((prevSets) => [...prevSets, newSet]);
      setNewSetName('');
      alert('Flashcard set successfully created!');
      setShowForm(false);
    } catch (error) {
      alert('There was a problem creating the flashcard set. Please try again later!');
    }
  };

  // Cancel creating a new flashcard set
  const handleCancelCreate = () => {
    setNewSetName('');
    setShowForm(false);
  };

  // Delete a flashcard set
  const handleDeleteSet = async (setId) => {
    const token = localStorage.getItem('token');
    if (!token || !setId) {
      alert('Error: No set ID or token');
      return;
    }

    const confirmDelete = window.confirm('Are you sure you want to delete this set?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:3000/api/flashcardSets/${setId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete flashcard set');
      }

      const updatedSets = sets.filter((set) => set.id !== setId);
      setSets(updatedSets);
      if (selectedSet && selectedSet.id === setId) {
        setSelectedSet(null);
      }

      alert('Flashcard set deleted successfully!');
    } catch (error) {
      alert('There was a problem deleting the flashcard set. Please try again later!');
    }
  };

  // Ref tailwind

  return (
    <div className="p-4">
      {currentPage === 'home' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-semibold">Flashcard Sets</h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-green-200 text-gray-900 py-1 px-3 rounded-md border border-gray-300 hover:bg-green-300"
            >
              Add Set +
            </button>
          </div>

          <ul role="list" className="divide-y divide-gray-100">
            {sets.map((set) => (
              <li key={set.id} className="flex flex-col gap-y-4 py-5 border-b pb-4">
                <div className="flex justify-between items-start gap-x-4">
                  <div className="flex min-w-0 gap-x-4">
                    <div className="min-w-0 flex-auto">
                      <p className="text-sm font-semibold text-gray-900">{set.name}</p>
                      <p className="mt-1 text-xs text-gray-500">{set.description || 'No description'}</p>
                    </div>
                  </div>
                  <div className="flex gap-x-2">
                    <button
                      onClick={() => handleViewSet(set)}
                      className="bg-blue-200 text-gray-900 py-1 px-3 rounded-md border border-gray-300 hover:bg-blue-300"
                    >
                      View
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSet(set.id);
                      }}
                      className="bg-red-200 text-gray-900 py-1 px-3 rounded-md border border-gray-300 hover:bg-red-300"
                    >
                      Delete
                    </button>

                    <button
                      onClick={() => {
                        setSelectedSet(set);
                        setCurrentPage('comments');
                      }}
                      className="bg-green-200 text-gray-900 py-1 px-3 rounded-md border border-gray-300 hover:bg-green-300"
                    >
                      Comment
                    </button>
                  </div>
                </div>

                {set.comments && set.comments.length > 0 ? (
                  <div className="mt-4 border-t pt-4">
                    <p className="text-sm text-gray-900 line-clamp-2">{set.comments[0].comment}</p>
                    <div className="flex items-center mt-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{set.comments[0]?.user?.name}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-gray-500">No comments yet.</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {currentPage === 'set' && selectedSet && (
        <Flashcard set={selectedSet} onBack={handleBackToHome} />
      )}

      {currentPage === 'comments' && selectedSet && (
        <CommentPage
          selectedSet={selectedSet}
          onBackToHome={handleBackToHome}
          onAddComment={handleAddNewComment}
        />
      )}

      {showForm && (
        <form onSubmit={handleAddSet} className="mt-4 border p-4">
          <label className="block">
            Set Name:
            <input
              type="text"
              value={newSetName}
              onChange={(e) => setNewSetName(e.target.value)}
              className="block w-full mt-1 border rounded-md p-2"
            />
          </label>
          <div className="mt-4 flex space-x-2">
            <button type="submit" className="px-4 py-2 bg-green-200 text-white rounded-md hover:bg-green-300">
              Create
            </button>
            <button
              type="button"
              onClick={handleCancelCreate}
              className="px-4 py-2 bg-green-200 text-white rounded-md hover:bg-green-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default FlashcardsPage;