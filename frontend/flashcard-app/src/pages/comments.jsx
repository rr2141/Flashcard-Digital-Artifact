import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, StarIcon as SolidStarIcon } from '@heroicons/react/20/solid';
import { StarIcon as OutlineStarIcon } from '@heroicons/react/24/outline';

const CommentPage = ({ selectedSet, onBackToHome }) => {
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 10;

  // Sorts the comments made by users by rating
  // 5 stars first
  const sortCommentsByRating = (commentsArray) => {
    return [...commentsArray].sort((a, b) => b.rating - a.rating);
  };

  useEffect(() => {
    console.log('[CommentPage] newRating state updated to:', newRating);
  }, [newRating]);

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      setError(null);

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
          throw new Error(responseData.error || 'Failed to fetch comments');
        }
  
        setComments(sortCommentsByRating(responseData));
      } catch (error) {
        console.error('Error fetching comments:', error.message);
        setError('Error fetching comments: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [selectedSet.id]);

  // Adds a new comment to the selected set.
  const handleAddComment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to add a comment');
      setLoading(false);
      return;
    }

    if (newRating === 0 || newComment.trim() === '') {
      alert('Please select a rating and enter a comment.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/flashcardSets/${selectedSet.id}/comments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment: newComment,
          rating: newRating,
        }),
      });

      const responseData = await response.json();
      if (!response.ok) {
        console.error('Failed to add comment:', responseData);
        throw new Error(responseData.error || 'Failed to add comment');
      }

      setComments((prevComments) => sortCommentsByRating([responseData, ...prevComments]));
      setNewComment('');
      setNewRating(0);
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

  // Renders the stars based on rating for the comments.
  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <SolidStarIcon
            key={i}
            className={`h-5 w-5 ${i <= rating ? 'text-yellow-400' : 'text-gray-200'}`}
          />
        ))}
      </div>
    );
  };

  // Handles the rating selection for comments.
  const handleRatingSelect = (rating, event) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('[handleRatingSelect] Selected rating:', rating);
    setNewRating(rating);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button onClick={onBackToHome} className="mb-4 bg-gray-200 px-4 py-2 rounded-md">
        Back to Sets
      </button>

      <h3 className="text-lg font-semibold text-gray-900">Add Comment to {selectedSet.name}</h3>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={handleAddComment} className="mt-4 border p-4">
        {/* Rating Field */}
        <label className="block mb-4">
          Rating:
          <div className="flex space-x-1 mt-1">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                type="button"
                key={rating}
                onClick={(e) => handleRatingSelect(rating, e)}
                className={`focus:outline-none ${
                  rating <= newRating ? 'text-yellow-400' : 'text-gray-200'
                } hover:text-yellow-500 transition-colors duration-200`}
              >
                {rating <= newRating ? (
                  <SolidStarIcon className="h-6 w-6" />
                ) : (
                  <OutlineStarIcon className="h-6 w-6" />
                )}
              </button>
            ))}
          </div>
        </label>

        {/* Comment Field */}
        <label className="block">
          Comment:
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="block w-full mt-1 border rounded-md p-2"
            rows="4"
            required
          />
        </label>

        {/* Submit Button */}
        <div className="mt-4 flex space-x-2">
          <button
            type="submit"
            disabled={newRating === 0 || newComment.trim() === ''}
            className={`px-4 py-2 rounded-md text-white ${
              newRating === 0 || newComment.trim() === ''
                ? 'bg-green-100 cursor-not-allowed'
                : 'bg-green-200 hover:bg-green-300'
            }`}
          >
            Add Comment
          </button>
        </div>
      </form>

      {/* Comments Section */}
      <div className="mt-8">
        <h4 className="text-lg font-semibold text-gray-900">All Comments</h4>
        {currentComments.length === 0 ? (
          <p>No comments yet.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {currentComments.map((comment) => (
              <li key={comment.id} className="border p-4 rounded-md">
                <div className="flex items-center mb-2">
                  {renderStars(comment.rating)}
                </div>
                <p>{comment.comment}</p>
                <p className="text-sm text-gray-500">
                  Posted by {comment.user?.username || 'Unknown'} on{' '}
                  {new Date(comment.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        {/* Mobile Pagination */}
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
        {/* Desktop Pagination */}
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{indexOfFirstComment + 1}</span> to{' '}
              <span className="font-medium">{Math.min(indexOfLastComment, comments.length)}</span> of{' '}
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
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                    currentPage === index + 1
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                  } focus:z-20 focus:outline-offset-0`}
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