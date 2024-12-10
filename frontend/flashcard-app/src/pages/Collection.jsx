import { useState, useEffect } from 'react';

const CollectionPage = () => {
  const [userId, setUserId] = useState(null);
  const [collections, setCollections] = useState([]);
  const [sets, setSets] = useState([]);
  const [newCollectionComment, setNewCollectionComment] = useState('');
  const [selectedSetIds, setSelectedSetIds] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Edits collection states
  const [editingCollection, setEditingCollection] = useState(null);
  const [editedComment, setEditedComment] = useState('');
  const [editedSetIds, setEditedSetIds] = useState([]);

  const decodeJwt = (token) => {
    const payload = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(payload));
    return decodedPayload;
  };

  useEffect(() => {
    const fetchUserId = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in');
        return;
      }

      try {
        const decodedToken = decodeJwt(token);
        if (decodedToken && decodedToken.id) {
          setUserId(decodedToken.id);
        } else {
          throw new Error('Invalid token');
        }
      } catch (error) {
        console.error('Error decoding token:', error.message);
        alert('Error fetching user details: ' + error.message);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchCollections = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to view your collections');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:3000/api/users/${userId}/collections/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch collections');
        }

        const data = await response.json();
        setCollections(data || []);
      } catch (error) {
        console.error('Error fetching collections:', error.message);
        setError('Failed to fetch collections: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, [userId]);

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
        setSets(data || []);
      } catch (error) {
        console.error('Error fetching flashcard sets:', error.message);
        alert('Error fetching flashcard sets: ' + error.message);
      }
    };

    fetchSets();
  }, []);

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to create a collection');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/users/${userId}/collections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          comment: newCollectionComment,
          setIds: selectedSetIds,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create collection');
      }

      const newCollection = await response.json();
      setCollections([...collections, newCollection]);
      setNewCollectionComment('');
      setSelectedSetIds([]);
      setShowForm(false);
    } catch (error) {
      console.error('Error creating collection:', error.message);
      alert('Error creating collection: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelCreate = () => {
    setNewCollectionComment('');
    setSelectedSetIds([]);
    setShowForm(false);
  };

  const handleDeleteCollection = async (collectionId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to delete a collection');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/users/${userId}/collections/${collectionId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete collection');
      }

      setCollections(collections.filter((collection) => collection.id !== collectionId));
    } catch (error) {
      console.error('Error deleting collection:', error.message);
      alert('Error deleting collection: ' + error.message);
    }
  };

  const handleEditCollection = (collection) => {
    setEditingCollection(collection);
    setEditedComment(collection.comment);
    setEditedSetIds(collection.flashcardSets.map((set) => set.id));
  };

  const handleCancelEdit = () => {
    setEditingCollection(null);
    setEditedComment('');
    setEditedSetIds([]);
  };

  const handleEditCollectionSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to edit a collection');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/users/${userId}/collections/${editingCollection.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            comment: editedComment,
            setIds: editedSetIds,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update collection');
      }

      const updatedCollection = await response.json();
      setCollections((prev) =>
        prev.map((collection) =>
          collection.id === updatedCollection.id ? updatedCollection : collection
        )
      );

      setEditingCollection(null);
    } catch (error) {
      console.error('Error updating collection:', error.message);
      alert('Error updating collection: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Your Collections</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-purple-100 text-purple-600 rounded-md hover:bg-purple-200"
        >
          Add Collection
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreateCollection} className="mt-4 border p-4">
          <label>
            Comment:
            <input
              type="text"
              value={newCollectionComment}
              onChange={(e) => setNewCollectionComment(e.target.value)}
              className="block w-full mt-1 border rounded-md p-2"
            />
          </label>
          <label className="mt-4 block">
            Select Flashcard Sets:
            <select
              multiple
              value={selectedSetIds}
              onChange={(e) =>
                setSelectedSetIds([...e.target.selectedOptions].map((option) => option.value))
              }
              className="block w-full mt-1 border rounded-md p-2"
            >
              {sets.map((set) => (
                <option key={set.id} value={set.id}>
                  {set.name}
                </option>
              ))}
            </select>
          </label>
          <div className="mt-4 flex space-x-2">
            <button type="submit" className="px-4 py-2 bg-green-200 text-white rounded-md hover:bg-green-300">
              Create
            </button>
            <button
              type="button"
              onClick={handleCancelCreate}
              className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {editingCollection && (
        <form onSubmit={handleEditCollectionSubmit} className="mt-4 border p-4">
          <h4 className="font-semibold">Edit Collection</h4>
          <label>
            Comment:
            <input
              type="text"
              value={editedComment}
              onChange={(e) => setEditedComment(e.target.value)}
              className="block w-full mt-1 border rounded-md p-2"
            />
          </label>
          <label className="mt-4 block">
            Select Flashcard Sets:
            <select
              multiple
              value={editedSetIds}
              onChange={(e) =>
                setEditedSetIds([...e.target.selectedOptions].map((option) => option.value))
              }
              className="block w-full mt-1 border rounded-md p-2"
            >
              {sets.map((set) => (
                <option key={set.id} value={set.id}>
                  {set.name}
                </option>
              ))}
            </select>
          </label>
          <div className="mt-4 space-x-2">
            <button type="submit" className="px-4 py-2 bg-green-200 text-white rounded-md hover:bg-green-300">
              Save Changes
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-4 py-2 bg-gray-300 rounded-md"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div>
          {collections.map((collection) => (
            <div key={collection.id} className="border p-4 my-2">
              <h4 className="font-semibold">{collection.comment}</h4>
              <div className="mt-2 flex justify-end space-x-2">
                <button
                  onClick={() => handleEditCollection(collection)}
                  className="px-2 py-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCollection(collection.id)}
                  className="px-2 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollectionPage;
