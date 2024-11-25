
import React from 'react';

const Navigation = () => {
  return (
    <nav className="bg-blue-500 text-white px-4 py-2 shadow">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-lg font-bold">Flashcard App</h1>
        <ul className="flex space-x-4">
          <li><a href="/" className="hover:text-blue-200">Home</a></li>
          <li><a href="/create" className="hover:text-blue-200">Create</a></li>
          <li><a href="/sets" className="hover:text-blue-200">My Sets</a></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
