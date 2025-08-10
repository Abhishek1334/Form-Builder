# 📝 Form Builder

A modern, interactive form builder application built with React, Node.js, and MongoDB. Create dynamic forms with multiple question types, collect responses, and analyze results in real-time.

## ✨ Features

### 🎯 **Core Functionality**

-   **Interactive Form Builder** - Intuitive drag & drop interface
-   **Multiple Question Types** - Categorize, Cloze, and Comprehension questions
-   **Real-time Preview** - Instant form preview as you build
-   **Response Collection** - Public form access with unique IDs
-   **Analytics Dashboard** - Detailed response analysis

### 📱 **Question Types**

-   **Categorize** - Organize items into categories
-   **Cloze** - Fill-in-the-blank with provided options
-   **Comprehension** - Reading passages with sub-questions (MCQ/MCA/Short text)

### 🎨 **User Experience**

-   **Fully Responsive** - Works on all devices
-   **Touch Support** - Optimized for touch interfaces
-   **Real-time Validation** - Instant feedback
-   **Easy Sharing** - One-click form sharing

## 🚀 Quick Start

### Prerequisites

-   Node.js (v18 or higher)
-   MongoDB (local or Atlas)
-   Cloudinary account (for media uploads)
-   Git

### Installation

1. **Clone the repository**

    ```bash
    git clone https://github.com/yourusername/form-builder.git
    cd form-builder
    ```

2. **Install dependencies**

    ```bash
    # Install server dependencies
    cd server
    npm install

    # Install client dependencies
    cd ../client
    npm install
    ```

3. **Environment Setup**

    **Backend (.env in server directory):**

    ```env
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/form-builder
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    NODE_ENV=development
    ```

    **Frontend (.env in client directory):**

    ```env
    VITE_BASE_URL=http://localhost:5000
    ```

4. **Start the application**

    ```bash
    # Start backend (from server directory)
    npm start

    # Start frontend (from client directory)
    npm run dev
    ```

5. **Access the application**
    - Frontend: http://localhost:5173
    - Backend API: http://localhost:5000

## 📁 Project Structure

```
form-builder/
├── client/                    # React frontend
│   ├── public/               # Static files
│   ├── src/
│   │   ├── api/             # API services
│   │   ├── components/      # React components
│   │   │   ├── common/      # Shared components
│   │   │   └── ...          # Question builders
│   │   ├── hooks/           # Custom hooks
│   │   ├── pages/           # Page components
│   │   └── utils/           # Utility functions
│   ├── package.json
│   └── vite.config.js
├── server/                   # Node.js backend
│   ├── config/              # Configuration files
│   ├── controllers/         # Route controllers
│   ├── middlewares/         # Express middlewares
│   ├── models/              # MongoDB models
│   ├── routes/              # API routes
│   ├── services/            # Business logic
│   └── server.js            # Entry point
├── vercel.json              # Vercel configuration
└── README.md
```

## 🛠️ Technology Stack

### Frontend

-   **React 19** - UI framework
-   **Vite** - Build tool and dev server
-   **Tailwind CSS** - Utility-first CSS framework
-   **React Router** - Client-side routing
-   **Axios** - HTTP client
-   **Lucide React** - Icon library
-   **@dnd-kit** - Drag and drop functionality

### Backend

-   **Node.js** - Runtime environment
-   **Express.js** - Web framework
-   **MongoDB** - NoSQL database
-   **Mongoose** - MongoDB ODM
-   **Cloudinary** - Cloud image storage
-   **Multer** - File upload handling

## 📚 API Documentation

### Forms Endpoints

-   `GET /api/forms` - Get all forms
-   `POST /api/forms` - Create new form
-   `GET /api/forms/:id` - Get specific form
-   `PUT /api/forms/:id` - Update form
-   `DELETE /api/forms/:id` - Delete form

### Responses Endpoints

-   `POST /api/responses` - Submit form response
-   `GET /api/responses/:formId` - Get form responses
-   `GET /api/responses/:formId/analytics` - Get response analytics
