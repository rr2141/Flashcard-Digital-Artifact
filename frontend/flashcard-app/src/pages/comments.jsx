import React, { useState } from 'react';

const CommentPage = ({ selectedSet, onBackToHome, onAddComment }) => {
const [newComment, setNewComment] = useState('');

  const handleSubmitComment = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to add a comment');
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:3000/api/flashcards/sets/${selectedSet.id}/comment`, {
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
      onAddComment(selectedSet.id, addedComment); // Update parent with new comment
      alert('Comment added successfully!');
      onBackToHome(); // Navigate back to home
    } catch (error) {
      console.error('Error adding comment:', error.message);
      alert('Error adding comment: ' + error.message);
    }
  };
  
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Add Comment for {selectedSet.name}</h2>
      <textarea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        className="w-full border rounded-md p-2 mb-4"
        placeholder="Write your comment..."
      ></textarea>
      <div className="flex space-x-2">
        <button
          onClick={handleSubmitComment}
          className="px-4 py-2 bg-green-200 text-white rounded-md hover:bg-green-300"
        >
          Submit
        </button>
        <button
          onClick={onBackToHome}
          className="px-4 py-2 bg-gray-200 text-white rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CommentPage;
