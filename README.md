# Kokuravi Bookmark Manager

Kokuravi is a bookmark management system that allows users to organize their bookmarks by categories. This project uses Node.js with the Express framework for the backend and MongoDB for data storage.

## Features

- User authentication and session management
- Add, edit, delete, and categorize bookmarks
- Organize bookmarks into categories
- Basic user profile management
- Responsive design using EJS and CSS

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/kokuravi-backend.git
   ```

2. Navigate into the project directory:

   ```bash
   cd kokuravi-backend
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Set up environment variables by creating a .env file in the root directory:

   ```makefile
   MONGODB_URI=your-mongodb-uri
   SESSION_SECRET=your-session-secret
   ```
5. Run the development server:

   ```bash
   npm start
   ```

   The application will run on http://localhost:3000.

## Project Structure

   ```plaintext
   app.js                  # Main application file
   bin/www                 # Server setup
   models/                 # Contains Mongoose models for Bookmark, Category, and User
   routes/                 # API routes for bookmarks, categories, and users
   views/                  # EJS templates for rendering the frontend
   public/stylesheets/      # CSS files
   ```

## API Endpoints

/bookmarks: CRUD operations for bookmarks
/categories: Manage categories
/users: User registration and authentication

## License

This project is licensed under the MIT License.
