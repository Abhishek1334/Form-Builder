# 📝 Form Builder Backend API

A robust Node.js/Express backend API for the Form Builder application. This server handles form creation, response collection, file uploads, and provides a complete REST API for the frontend application.

## 🚀 Features

### 🔧 **Core Functionality**

-   **Form Management** - Create, read, update, and delete forms
-   **Response Collection** - Submit and retrieve form responses
-   **File Upload** - Image upload support via Cloudinary
-   **Scoring System** - Automatic scoring for different question types
-   **Analytics** - Response analytics and detailed breakdowns

### 📊 **Question Types Supported**

-   **Categorize** - Drag and drop categorization questions
-   **Cloze** - Fill in the blanks with provided options
-   **Comprehension** - Reading passages with sub-questions (MCQ/MCA/Short text)

### 🔒 **Security & Performance**

-   **CORS Protection** - Cross-origin request handling
-   **Input Validation** - Comprehensive request validation
-   **Error Handling** - Robust error management
-   **File Security** - Secure image upload and storage
-   **Database Optimization** - Efficient MongoDB queries

## 🛠️ Technology Stack

-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Database**: MongoDB with Mongoose ODM
-   **File Storage**: Cloudinary
-   **File Upload**: Multer
-   **Environment**: dotenv
-   **CORS**: cors middleware

## 📋 Prerequisites

-   Node.js (v16 or higher)
-   MongoDB (local or cloud)
-   Cloudinary account
-   npm or yarn package manager

## 🚀 Quick Start

### 1. **Clone the Repository**

```bash
git clone https://github.com/Abhishek-Rajoria/form-builder-backend.git
cd form-builder-backend
```

### 2. **Install Dependencies**

```bash
npm install
```

### 3. **Environment Setup**

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/form-builder
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NODE_ENV=development
```

### 4. **Start the Server**

```bash
# Development mode
npm run dev

# Production mode
npm start
```

### 5. **Verify Installation**

```bash
curl http://localhost:5000/api/health
```

Expected response:

```json
{
    "success": true,
    "message": "Server is running",
    "timestamp": "2025-08-10T16:49:01.656Z"
}
```

## 📁 Project Structure

```
server/
├── config/
│   ├── database.js      # MongoDB connection
│   └── cloudinary.js    # Cloudinary configuration
├── controllers/
│   ├── formController.js    # Form CRUD operations
│   └── responseController.js # Response handling
├── models/
│   ├── Form.js         # Form schema
│   └── Response.js     # Response schema
├── routes/
│   └── formRoutes.js   # API route definitions
├── services/
│   └── cloudinaryService.js # File upload service
├── middlewares/
│   └── upload.js       # Multer upload middleware
├── server.js           # Main server file
├── package.json        # Dependencies and scripts
└── README.md          # This file
```

## 🔧 API Endpoints

### **Health Check**

-   `GET /api/health` - Server health status

### **Forms**

-   `POST /api/forms` - Create a new form
-   `GET /api/forms/:id` - Get form by ID
-   `PUT /api/forms/:id` - Update form
-   `DELETE /api/forms/:id` - Delete form

### **Responses**

-   `POST /api/forms/:id/responses` - Submit a response
-   `GET /api/forms/:id/responses` - Get all responses for a form

## 📊 Database Schema

### **Form Schema**

```javascript
{
  title: String,
  description: String,
  headerImage: {
    url: String,
    filename: String,
    mimetype: String
  },
  questions: [{
    id: String,
    type: String, // 'categorize', 'cloze', 'comprehension'
    questionText: String,
    image: {
      url: String,
      filename: String,
      mimetype: String
    },
    // Type-specific fields
    options: Array,        // For categorize
    categories: Array,     // For categorize
    sentence: String,      // For cloze
    selectedWords: Array,  // For cloze
    answerOptions: Array,  // For cloze
    instructions: String,  // For comprehension
    passage: String,       // For comprehension
    questions: Array       // For comprehension
  }],
  createdBy: String,
  createdAt: Date,
  updatedAt: Date
}
```

### **Response Schema**

```javascript
{
  formId: ObjectId,
  submittedBy: String,
  name: String,
  responses: [{
    questionId: String,
    type: String,
    answers: Array
  }],
  score: Number,
  maxScore: Number,
  submittedAt: Date
}
```

## 🔒 Environment Variables

| Variable                | Description               | Required | Default     |
| ----------------------- | ------------------------- | -------- | ----------- |
| `PORT`                  | Server port               | No       | 5000        |
| `MONGO_URI`             | MongoDB connection string | Yes      | -           |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name     | Yes      | -           |
| `CLOUDINARY_API_KEY`    | Cloudinary API key        | Yes      | -           |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret     | Yes      | -           |
| `NODE_ENV`              | Environment mode          | No       | development |
