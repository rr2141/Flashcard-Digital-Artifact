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
- **Feature 7:**  Authenticated users can view admin page.


## Technologies Used

The frontend of this project is built using a modern and efficient stack, leveraging several powerful libraries and tools to ensure a seamless and responsive user experience.

### **Core Technologies**

- **React.js:**  
  A JavaScript library for building user interfaces. React enables the creation of reusable UI components, managing the application's state efficiently.

- **React Router DOM:**  
  A standard library for routing in React applications. It allows for dynamic routing and navigation within the app without full page reloads.

### **Styling and UI Components**

- **Tailwind CSS:**  
  A utility-first CSS framework that provides low-level utility classes to build custom designs without leaving your HTML. It promotes rapid UI development and consistent styling across the application.

- **@headlessui/react:**  
  Completely unstyled, fully accessible UI components designed to integrate beautifully with Tailwind CSS. It provides interactive components like modals, dropdowns, and more.

- **@heroicons/react:**  
  A set of free MIT-licensed high-quality SVG icons for you to use in your web projects. Seamlessly integrates with React for scalable and customizable icons.

### **Build and Development Tools**

- **React Scripts:**  
  Provides a set of scripts from Create React App to streamline the development process, including build, start, and test commands.

- **Babel:**  
  A JavaScript compiler that transforms modern JavaScript (ES6+) and JSX syntax into a format compatible with older browsers. Configured with presets for React and environment-specific transformations.

### **Testing**

- **Jest:**  
  A delightful JavaScript Testing Framework with a focus on simplicity. It provides an extensive API for writing and running tests.

- **@testing-library/react:**  
  Simple and complete React DOM testing utilities that encourage good testing practices. It helps in testing the UI components in a user-centric manner.

- **@testing-library/jest-dom:**  
  Custom Jest matchers to test the state of the DOM. It allows for more readable and expressive assertions in tests.

- **@testing-library/user-event:**  
  Simulates user interactions with the UI, such as clicks, typing, and form submissions, to test component behavior.

- **jest-fetch-mock:**  
  A mock for the Fetch API, allowing you to control and inspect fetch calls in your tests.

### **Utility Libraries**

- **Util:**  
  Provides utility functions that are primarily used internally by Node.js, but also useful for developers to handle common tasks.

### **Additional Libraries**

- **Web Vitals:**  
  A library to measure essential performance metrics for your web application, ensuring a high-quality user experience.

---

### **Development Enhancements**

- **Nodemon:** *(If applicable for frontend development)*  
  A utility that monitors for any changes in your source and automatically restarts your server. It ensures that development is smooth without manual restarts.

---

By combining these technologies, the frontend of this project achieves a balance between performance, scalability, and maintainability, providing users with a responsive and intuitive interface.

### Prerequisites

Before you begin, ensure you have met the following requirements:

- **Node.js:**  
  Ensure you have Node.js installed. [Download Node.js](https://nodejs.org/)

- **npm or Yarn:**  
  Package manager for JavaScript.  
  - [npm documentation](https://www.npmjs.com/)  
  - [Yarn documentation](https://yarnpkg.com/)

- **Git:**  
  Version control system. [Download Git](https://git-scm.com/)

- **Backend API:**  
  Ensure the backend API is set up and running. Refer to the [Backend README](./backend/README.md) for setup instructions.

- **Tailwind CSS:**  
  Tailwind CSS is included as a dependency and configured in the project. No additional installation is necessary beyond installing dependencies.
 [`tailwind.config.js`](./tailwind.config.js) 
---

### Additional Setup

After meeting the prerequisites, follow these steps to set up the frontend application:

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/yourusername/your-repo.git
   cd your-repo/frontend


2. **Install dependencies:**

npm install

3. **Set up environment variables:**
create an .env file in the root directory and add the following code below:

REACT_APP_API_URL=http://localhost:3000
REACT_APP_OTHER_ENV_VAR=your_value


3. **Start the server:**

npm start

The server will start on http://localhost:3002 / http://localhost:3003 by default.

If not responding, please check in app.js file and edit the following code to the correct link.

// Enable CORS if the frontend and backend are on different ports
app.use(cors({
    origin: 'http://localhost:3003',  
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
}));

