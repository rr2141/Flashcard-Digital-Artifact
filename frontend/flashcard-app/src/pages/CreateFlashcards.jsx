import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const CreateFlashcards = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sets, setSets] = useState([]);
  const [selectedSetId, setSelectedSetId] = useState('');
  const [newSetName, setNewSetName] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [difficulty, setDifficulty] = useState('EASY');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const preselectedSetId = location.state?.setId || '';
  const [isSetPreselected] = useState(Boolean(preselectedSetId));

  useEffect(() => {
    if (preselectedSetId) {
      setSelectedSetId(preselectedSetId);
    }
  }, [preselectedSetId]);

  useEffect(() => {
    const fetchSets = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to view your flashcard sets');
        setLoading(false);
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
        setSets(data || []);
      } catch (error) {
        console.error('Error fetching flashcard sets:', error.message);
        setError('Failed to fetch flashcard sets: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSets();
  }, []);

  const handleCreateFlashcard = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');

    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to create a flashcard');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          setId: selectedSetId,
          question,
          answer,
          difficulty,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create flashcard');
      }

      const newFlashcard = await response.json();
      setSuccessMessage('Flashcard created successfully');
      setQuestion('');
      setAnswer('');
      setDifficulty('EASY');
    } catch (error) {
      console.error('Error creating flashcard:', error.message);
      setError('Failed to create flashcard: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSet = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to create a flashcard set');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/flashcardSets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newSetName }),
      });

      if (!response.ok) {
        throw new Error('Failed to create flashcard set');
      }

      const newSet = await response.json();
      setSets([...sets, newSet]);
      setSelectedSetId(newSet.id);
      setNewSetName('');
      alert('Flashcard set created successfully');
    } catch (error) {
      console.error('Error creating flashcard set:', error.message);
      setError('Failed to create flashcard set: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h3 className="text-lg font-semibold text-gray-900">Create Flashcard</h3>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {successMessage && <p className="text-green-500">{successMessage}</p>}

      <form onSubmit={handleCreateFlashcard} className="mt-4 border p-4">
        <label>
          Select Flashcard Set:
          <select
            value={selectedSetId}
            onChange={(e) => setSelectedSetId(e.target.value)}
            className="block w-full mt-1 border rounded-md p-2"
            disabled={isSetPreselected}
          >
            <option value="">Select a set</option>
            {sets.map((set) => (
              <option key={set.id} value={set.id}>
                {set.name}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-4 block">
          Question:
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="block w-full mt-1 border rounded-md p-2"
          />
        </label>

        <label className="mt-4 block">
          Answer:
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="block w-full mt-1 border rounded-md p-2"
          />
        </label>

        <label className="mt-4 block">
          Difficulty:
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="block w-full mt-1 border rounded-md p-2"
          >
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </label>

        <div className="mt-4 flex space-x-2">
          <button type="submit" className="px-4 py-2 bg-green-200 text-white rounded-md hover:bg-green-300">
            Create Flashcard
          </button>
        </div>
      </form>

      <h3 className="text-lg font-semibold text-gray-900 mt-8">Create New Flashcard Set</h3>
      <form onSubmit={handleCreateSet} className="mt-4 border p-4">
        <label>
          Set Name:
          <input
            type="text"
            value={newSetName}
            onChange={(e) => setNewSetName(e.target.value)}
            className="block w-full mt-1 border rounded-md p-2"
          />
        </label>

        <div className="mt-4 flex space-x-2">
          <button type="submit" className="px-4 py-2 bg-blue-200 text-white rounded-md hover:bg-blue-300">
            Create Set
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateFlashcards;