# Video Upload and Management App

## Overview

This web application allows users to upload videos, view all uploaded videos, and manage their accounts. It utilizes Vite for the frontend and Node.js for the backend server. FFmpeg is used for video resolution changes.

## Features

- **Login Page:** Secure user authentication and session management.
- **Upload Video Page:** Upload videos with title and description.
- **View All Videos Page:** Display a list of all uploaded videos.

## Technologies Used

- **Frontend:** Vite, React
- **Backend:** Node.js, Express
- **Video Processing:** FFmpeg
- **Package Manager:** Yarn
- **More:** Microservices, Aws services (cognito, s3, secrets manager, parameters manager, dynamodb, lambda, sns, sqs)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <repository-directory>

# Install frontend dependencies
cd app
yarn install

# Install backend dependencies
cd server
yarn install 
brew install ffmpeg (in local system(terminal) for mac)
```

### Configure Environment Variables
- Create a `.env` file in the backend directory in each micro service and update values accordingly'

# Start the frontend development server
cd app
yarn dev


# Start the backend server
cd microservices
yarn start (run this command by moving to each service)

- This will start the Node.js server at http://localhost:${port}


This file now includes headings for `Technologies Used`, `Getting Started`, `Scripts`, and `License`, providing a more structured and comprehensive guide for setting up and running the application.


