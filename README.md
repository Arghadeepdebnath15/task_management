# Task Management System

A full-stack MERN (MongoDB, Express.js, React.js, Node.js) application for managing tasks with user authentication and file upload capabilities.

## Features

- User authentication (Register/Login)
- Profile picture upload using Cloudinary
- Create, read, update, and delete tasks
- Task attachments support
- Task prioritization
- Due date tracking
- Responsive Material-UI design

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- Cloudinary account

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd task-management-system
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

## Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user

### Tasks
- GET `/api/tasks` - Get all tasks for authenticated user
- POST `/api/tasks` - Create a new task
- PATCH `/api/tasks/:id` - Update a task
- DELETE `/api/tasks/:id` - Delete a task

## Technologies Used

### Backend
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Multer for file upload
- Cloudinary for file storage
- bcryptjs for password hashing

### Frontend
- React.js with Vite
- Material-UI for styling
- React Router for routing
- Formik for form handling
- Yup for form validation
- Axios for API requests
- date-fns for date formatting
- React-Toastify for notifications 