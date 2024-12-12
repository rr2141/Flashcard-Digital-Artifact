# Flashcard Application

Created flashcard applicaton for users to create and organise flashcards into sets and collections.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Prerequistites](#Prerequisites)
- [SetUp](#Setup)
-
## Introduction

In this project, created flashcard application that can create flashcards, put them into flashcard sets, and also put these flashcard sets into collections. Other features such as commenting, admin users, editing, and deleting have been considered.

## Features

- **Feature 1:** Users can sign up.
- **Feature 2:** Users can login.
- **Feature 3:**  Authenticated users can create, edit and delete flashcards.
- **Feature 4:**  Authenticated users can create, edit and delete flashcards sets.
- **Feature 5:**  Authenticated users can create, edit and delete collections.
- **Feature 6:**  Authenticated users can add and view comments for sets.
- **Feature 7:**  Authenticated users can view admin page.


## Technologies Used

- **Node.js:** JavaScript runtime environment.
- **Express.js:** Web framework for building APIs.
- **Prisma:** ORM for database interactions.
- **SQLite:** Lightweight relational database.
- **JWT (jsonwebtoken):** Secure token-based authentication.
- **bcrypt & bcryptjs:** Password hashing for secure storage.
- **Cors:** Enable Cross-Origin Resource Sharing.
- **dotenv:** Manage environment variables.
- **React Router DOM:** (If applicable) Routing for frontend applications.
- **Jest:** Testing framework.
- **Supertest:** HTTP assertions for testing APIs.
- **Nodemon:** Automatically restart the server during development.

### Prerequisites

Before you begin, ensure you have met the following requirements:

- **Node.js:** Ensure you have Node.js installed. [Download Node.js](https://nodejs.org/)

- **npm or Yarn:** Package manager for JavaScript. [npm documentation](https://www.npmjs.com/) | [Yarn documentation](https://yarnpkg.com/)

- **Git:** Version control system. [Download Git](https://git-scm.com/)

- **Prisma:** Prisma is included as a dependency in this project. No additional installation is required beyond installing dependencies. Prisma will handle database migrations and interactions.

- **SQLite:** This project uses SQLite as the database. Ensure SQLite is installed on your system. [Download SQLite](https://www.sqlite.org/download.html)

---

### Setup

After installing the prerequisites, follow these steps to set up the project:

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/yourusername/your-repo.git
   cd your-repo

2. **Install dependencies:**

npm install

3. **Set up environment variables:**
create an .env file in the root directory and add the following code below:

PORT=3000
DATABASE_URL="file:./dev.db"
JWT_SECRET_KEY=your_jwt_secret

4. **Run database migrations:**

npx prisma migrate dev --name init

3. **Start the server:**

npm start

The server will start on http://localhost:3000 by default.

