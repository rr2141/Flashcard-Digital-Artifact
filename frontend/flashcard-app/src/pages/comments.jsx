import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

const CommentPage = ({ selectedSet, onBackToHome, onAddComment }) => {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 10;

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);

      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to view comments');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:3000/api/flashcardSets/${selectedSet.id}/comments`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const responseData = await response.json();

        if (!response.ok) {
          console.error('Failed to fetch comments:', responseData);
          throw new Error('Failed to fetch comments');
        }

        setComments(responseData);
      } catch (error) {
        console.error('Error fetching comments:', error.message);
        setError('Error fetching comments: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [selectedSet.id]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to add a comment');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/flashcardSets/${selectedSet.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ comment: newComment }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('Failed to add comment:', responseData);
        throw new Error('Failed to add comment');
      }

      const addedComment = responseData;
      setComments([...comments, addedComment]);
      onAddComment(selectedSet.id, addedComment);
      setNewComment('');
      alert('Comment added successfully!');
    } catch (error) {
      console.error('Error adding comment:', error.message);
      setError('Error adding comment: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const indexOfLastComment = currentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComments = comments.slice(indexOfFirstComment, indexOfLastComment);

  const totalPages = Math.ceil(comments.length / commentsPerPage);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button onClick={onBackToHome} className="mb-4 bg-gray-200 px-4 py-2 rounded-md">
        Back to Sets
      </button>

      <h3 className="text-lg font-semibold text-gray-900">Add Comment to {selectedSet.name}</h3>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={handleAddComment} className="mt-4 border p-4">
        <label>
          Comment:
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="block w-full mt-1 border rounded-md p-2"
            rows="4"
          />
        </label>

        <div className="mt-4 flex space-x-2">
          <button type="submit" className="px-4 py-2 bg-green-200 text-white rounded-md hover:bg-green-300">
            Add Comment
          </button>
        </div>
      </form>

      <div className="mt-8">
        <h4 className="text-lg font-semibold text-gray-900">All Comments</h4>
        {currentComments.length === 0 ? (
          <p>No comments yet.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {currentComments.map((comment) => (
              <li key={comment.id} className="border p-4 rounded-md">
                <p>{comment.comment}</p>
                <p className="text-sm text-gray-500">Posted by {comment.user.username} on {new Date(comment.createdAt).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{indexOfFirstComment + 1}</span> to <span className="font-medium">{Math.min(indexOfLastComment, comments.length)}</span> of{' '}
              <span className="font-medium">{comments.length}</span> results
            </p>
          </div>
          <div>
            <nav aria-label="Pagination" className="isolate inline-flex -space-x-px rounded-md shadow-sm">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
              >
                <span className="sr-only">Previous</span>
                <ChevronLeftIcon aria-hidden="true" className="h-5 w-5" />
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${currentPage === index + 1 ? 'bg-indigo-600 text-white' : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'} focus:z-20 focus:outline-offset-0`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
              >
                <span className="sr-only">Next</span>
                <ChevronRightIcon aria-hidden="true" className="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentPage;