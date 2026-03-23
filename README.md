"# Placement-Test-Management-System

A comprehensive placement test management system with AI-powered quiz and coding contest generation.

## Setup

### Environment Variables

Create a `.env` file in the backend directory or set the following environment variables:

- `HUGGINGFACE_API_KEY`: Your Hugging Face API key for AI-powered question generation
- `JWT_SECRET`: Secret key for JWT token generation
- `JUDGE0_URL`: URL for Judge0 code execution service (default: http://localhost:2358)

### Running the Application

1. Start the backend:
   ```bash
   cd backend
   mvn spring-boot:run
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Start supporting services (Docker):
   ```bash
   docker-compose up
   ```

## Features

- AI-powered quiz and coding contest generation using Hugging Face API
- Multiple choice questions and coding problems
- Real-time code execution and testing
- Admin dashboard for contest management
- Student assessment environment" 
