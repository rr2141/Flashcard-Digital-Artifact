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

  const preselectedSetId = location.state?.setId || ''; 
  const [isSetPreselected] = useState(Boolean(preselectedSetId)); 

  useEffect(() => {
    if (preselectedSetId) {
      setSelectedSetId(preselectedSetId);
    }
  }, [preselectedSetId]);

  // Fetch all flashcard sets.
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
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch flashcard sets. Status: ${response.status}`);
        }

        const data = await response.json();
        setSets(data);
      } catch (error) {
        console.error('Error fetching flashcard sets:', error.message);
        alert('Error fetching flashcard sets: ' + error.message);
      }
    };

    fetchSets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to create a flashcard');
      return;
    }

    try {
      let setId = selectedSetId;

      //If no set is selected, creates a new flashcard set.
      if (!selectedSetId && newSetName) {
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
        setId = newSet.id;

        // Updates the dropdown with the new set
        setSets((prevSets) => [...prevSets, newSet]);
        setSelectedSetId(newSet.id); 
      }

      // Creates the flashcard in the selected set.
      const response = await fetch('http://localhost:3000/api/flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          setId,
          question,
          answer,
          difficulty,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error creating flashcard: ${errorData.error || response.statusText}`);
      }

      alert('Flashcard created successfully!');
      setQuestion('');
      setAnswer('');
      setDifficulty('EASY');

      // Navigates back to the flashcard set page.
      navigate('/my-flashcards'); 
    } catch (error) {
      console.error('Error creating flashcard:', error.message);
      alert('Error: ' + error.message);
    }
  };

  /* From Tailwind */
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Create Flashcards</h2>

      {/* Only show the "Choose existing set" dropdown if the set isn't preselected */}
      {!isSetPreselected && (
        <>
          <div>
            <label htmlFor="setId" className="block text-sm font-medium text-gray-700">
              Choose an existing set
            </label>
            <select
              id="setId"
              value={selectedSetId}
              onChange={(e) => setSelectedSetId(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">-- Select a set --</option>
              {sets.map((set) => (
                <option key={set.id} value={set.id}>
                  {set.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="newSetName" className="block text-sm font-medium text-gray-700">
              Or create a new set
            </label>
            <input
              type="text"
              id="newSetName"
              value={newSetName}
              onChange={(e) => setNewSetName(e.target.value)}
              placeholder="New set name"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </>
      )}

      {/* Question input */}
      <div>
        <label htmlFor="question" className="block text-sm font-medium text-gray-700">
          Question
        </label>
        <input
          type="text"
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      {/* Answer input */}
      <div>
        <label htmlFor="answer" className="block text-sm font-medium text-gray-700">
          Answer
        </label>
        <input
          type="text"
          id="answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          required
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      {/* Difficulty input */}
      <div>
        <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">
          Difficulty
        </label>
        <select
          id="difficulty"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
      </div>

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-indigo-500 focus:ring-2 focus:ring-indigo-400 mt-4"
      >
        Create Flashcard
      </button>
    </div>
  );
};

export default CreateFlashcards;
