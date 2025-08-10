# 📝 Form Builder

A modern, interactive form builder application built with React, Node.js, and MongoDB. Create dynamic forms with multiple question types, collect responses, and analyze results in real-time.

## ✨ Features

### 🎯 **Core Functionality**

- **Interactive Form Builder** - Intuitive drag & drop interface
- **Multiple Question Types** - Categorize, Cloze, and Comprehension questions
- **Real-time Preview** - Instant form preview as you build
- **Response Collection** - Public form access with unique IDs
- **Analytics Dashboard** - Detailed response analysis

### 📱 **Question Types**

- **Categorize** - Organize items into categories
- **Cloze** - Fill-in-the-blank with provided options
- **Comprehension** - Reading passages with sub-questions (MCQ/MCA/Short text)

### 🎨 **User Experience**

- **Fully Responsive** - Works on all devices
- **Touch Support** - Optimized for touch interfaces
- **Real-time Validation** - Instant feedback
- **Easy Sharing** - One-click form sharing

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Cloudinary account (for media uploads)
- Git

### Installation

1. **Clone the repository**

    ```bash
    git clone https://github.com/Abhishek-Rajoria/form-builder.git
    cd form-builder
    ```

2. **Set up environment variables**

    Create `.env` files in both `client` and `server` directories with required configurations.

3. **Install dependencies**

    ```bash
    # Install server dependencies
    cd server
    npm install
    
    # Install client dependencies
    cd ../client
    npm install
    ```

4. **Environment Setup**

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
├── client/           # React frontend
│   ├── public/      # Static files
│   └── src/         # React components and logic
├── server/          # Node.js backend
│   ├── config/     # Configs
│   ├── controllers/# Route handlers
│   └── models/     # DB models
└── .env.*          # Environment configs
```

## 🌐 API Endpoints

### Auth
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login

### Forms
- `GET /api/forms` - List forms
- `POST /api/forms` - Create form
- `GET /api/forms/:id` - Get form
- `PUT /api/forms/:id` - Update form
- `DELETE /api/forms/:id` - Delete form


### Environment Variables

**Server (.env)**
```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
NODE_ENV=production
```

**Client (.env)**
```
REACT_APP_API_URL=/api
```

## 🙏 Built With
- React
- Node.js
- Express
- MongoDB
- Tailwind CSS
2. Enter the form ID
3. View analytics and individual responses
4. See detailed answer breakdowns

## 🛠️ Technology Stack

### Frontend

-   **React 19** - UI framework
-   **Vite** - Build tool
-   **Tailwind CSS** - Styling
-   **React Router** - Navigation
-   **Axios** - HTTP client
-   **Lucide React** - Icons

### Backend

-   **Node.js** - Runtime environment
-   **Express.js** - Web framework
-   **MongoDB** - Database
-   **Mongoose** - ODM
-   **Cloudinary** - Image storage
-   **Multer** - File upload handling
