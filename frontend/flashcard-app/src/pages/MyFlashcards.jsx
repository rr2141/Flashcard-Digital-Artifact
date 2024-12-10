import React, { useState, useEffect } from 'react';
import Flashcard from './Flashcard';
import CommentPage from './comments';

const FlashcardsPage = () => {
  const [sets, setSets] = useState([]);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedSet, setSelectedSet] = useState(null);
  const [newSetName, setNewSetName] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [recentComments, setRecentComments] = useState({});

  useEffect(() => {
    const fetchSets = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to view your flashcard sets');
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/api/flashcards/getflashcardsets', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch flashcard sets');
        }

        const data = await response.json();
        setSets(data);

        // Fetches the most recent comment for each set
        const recentCommentsPromises = data.map((set) =>
          fetch(`http://localhost:3000/api/flashcards/sets/${set.id}/recentComment`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).then((res) => (res.ok ? res.json() : null))
        );

        const comments = await Promise.all(recentCommentsPromises);
        const commentsMap = data.reduce((acc, set, index) => {
          acc[set.id] = comments[index];
          return acc;
        }, {});
        setRecentComments(commentsMap);

      } catch (error) {
        console.error('Error fetching flashcard sets:', error.message);
        alert('Error fetching flashcard sets: ' + error.message);
      }
    };

    fetchSets();
  }, []);

  const handleViewSet = (set) => {
    setSelectedSet(set);
    setCurrentPage('set');
  };

  // If the "View More" link is pressed, shows all the comments for the set.
  const handleViewMoreComments = (set) => {
    setSelectedSet(set);
    setCurrentPage('comments');
  };

  // User can add a comment to a set.
  const handleAddNewComment = (setId, addedComment) => {
    setRecentComments((prevComments) => ({
      ...prevComments,
      [setId]: addedComment,
    }));
  };

  // Directs back to the flashcard page.
  const handleBackToHome = () => {
    setCurrentPage('home');
    setSelectedSet(null);
  };

  // User can create a new set.
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

      const response = await fetch('http://localhost:3000/api/flashcards/flashcardsets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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
      console.error('Error creating flashcard set:', error.message);
      alert('Error creating flashcard set:', error.message);
    }
  };

  // User can cancel creation of flashcard set.
  const handleCancelCreate = () => {
    setNewSetName('');
    setShowForm(false);
  };

  // User can delete flashcard set.
  // User can delete set containing flashcards.
  const handleDeleteSet = async (setId) => {
    const token = localStorage.getItem('token');
    if (!token || !setId) {
      alert('Error: No set ID or token');
      return;
    }

    const confirmDelete = window.confirm('Are you sure you want to delete this set?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:3000/api/flashcards/deleteSet/${setId}`, {
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
      console.error('Error deleting flashcard set:', error);
      alert('Error deleting flashcard set: ' + error.message);
    }
  };

  /* From Tailwind */
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
                        e.stopPropagation(); // Prevent triggering view action
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

                {recentComments[set.id] ? (
                  <div className="mt-4 border-t pt-4">
                    <div className="text-xs text-gray-500">{recentComments[set.id].date}</div>
                    <p className="text-sm text-gray-900 line-clamp-2">{recentComments[set.id].comment}</p>
                    <div className="flex items-center mt-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{recentComments[set.id]?.user?.name}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewMoreComments(set)}
                      className="mt-4 text-blue-500 hover:underline"
                    >
                      View More
                    </button>
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
