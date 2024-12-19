Flashcard Application

A flashcard application for users to create and organise flashcards into sets and collections.

Table of Contents

Introduction
Features
Technologies Used
Prerequisites
Setup
Usage
Testing
Additional Information
Introduction

This project is a flashcard application that allows users to create flashcards, organize them into sets, and group these sets into collections. Users can access these features, while admins have additional access to the admin dashboard where they can change the limits of the sets that can be created in a day and delete users if necessary. Other features such as commenting, editing, changing passwords, and deleting have been considered.

Features

User Authentication:
Users can sign up and log in.
Flashcard Management:
Authenticated users can create, edit, and delete flashcards.
Flashcard Set Management:
Authenticated users can create, edit, and delete flashcard sets.
Collection Management:
Authenticated users can create, edit, and delete collections.
Commenting:
Authenticated users can add and view comments for sets.
Admin Dashboard:
Admins can view the admin page, change set limits, and delete users.
Technologies Used

Frontend

React.js: JavaScript library for building user interfaces.
React Router DOM: Routing for frontend applications.
Tailwind CSS: Utility-first CSS framework.
@headlessui/react: Unstyled, fully accessible UI components.
@heroicons/react: High-quality SVG icons.
Jest: Testing framework.
@testing-library/react: React DOM testing utilities.
@testing-library/jest-dom: Custom Jest matchers for the DOM.
@testing-library/user-event: Simulates user interactions.
jest-fetch-mock: Mock for the Fetch API.
Web Vitals: Measure essential performance metrics.
Nodemon: Automatically restart the server during development.
Cypress: End to End Testing.
Backend

Node.js: JavaScript runtime environment.
Express.js: Web framework for building APIs.
Prisma: ORM for database interactions.
SQLite: Lightweight relational database.
JWT (jsonwebtoken): Secure token-based authentication.
bcrypt & bcryptjs: Password hashing for secure storage.
Cors: Enable Cross-Origin Resource Sharing.
dotenv: Manage environment variables.
Supertest: HTTP assertions for testing APIs.
Prerequisites

Before you begin, ensure you have met the following requirements:

Node.js: Ensure you have Node.js installed. Download Node.js
npm or Yarn: Package manager for JavaScript. npm documentation | Yarn documentation
Git: Version control system. Download Git
Prisma: Prisma is included as a dependency in this project. No additional installation is required beyond installing dependencies. Prisma will handle database migrations and interactions.
SQLite: This project uses SQLite as the database. Ensure SQLite is installed on your system. Download SQLite
Setup

Backend Setup

Clone the Repository:

git clone https://github.com/rr2141/Flashcard-Digital-Artifact.git
cd your-repo
Install dependencies:

npm install

Set up environment variables: create an .env file in the root directory and add the following code below:
PORT=3000 DATABASE_URL="file:./dev.db" JWT_SECRET_KEY=your_jwt_secret

Run database migrations:
npx prisma migrate dev --name init

Start the server:
npm start

The server will start on http://localhost:3000 by default.

Frontend Setup

Navigate to frontend directory:
cd ../frontend

Instal dependencies:
npm install

Set up environment variables:
create an .env file in the root directory and add the following code below:

REACT_APP_API_URL=http://localhost:3000 REACT_APP_OTHER_ENV_VAR=your_value

Start the server:
npm start

The server will start on http://localhost:3002 / http://localhost:3003 by default.

If not responding, please check in app.js file and edit the following code to the correct link.

// Enable CORS if the frontend and backend are on different ports app.use(cors({ origin: 'http://localhost:3003',
methods: 'GET,POST,PUT,DELETE', allowedHeaders: 'Content-Type,Authorization', }));

Testing

Backend

Run Unit Tests:
npm test

Frontend

Run End-to-End Tests:
npm run cypress:open

Additional Information

To see the admin page, you can use the admin user credentials:

username: testuser5 password: password123
