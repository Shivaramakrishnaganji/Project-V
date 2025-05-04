# Vignan Attendance Portal

A comprehensive web application for managing student attendance, classifying students as slow or normal learners, providing feedback, and generating reports.

## Features

- **Authentication:** Separate login for faculty and administrators
- **Attendance Management:** Faculty can record and track student attendance
- **Student Classification:** Identify and manage slow/normal learners
- **SMS Notifications:** Send real-time notifications to parents about student feedback and performance
- **Reporting:** Generate and download Excel reports for attendance and student data
- **Role-Based Access:** Different interfaces and permissions for admin and faculty users

## Tech Stack

- **Frontend:** ReactJS with Bootstrap for responsive UI
- **State Management:** React Context API
- **Data Persistence:** LocalStorage for data storage
- **Reporting:** XLSX for Excel generation
- **Notifications:** Twilio for SMS notifications (via backend proxy)

## Project Structure

```
vignan-attendance-portal/
├── src/
│   ├── components/
│   │   ├── Login.js
│   │   ├── Homepage.js
│   │   ├── Attendance.js
│   │   ├── Summary.js
│   │   ├── ManageStudents.js
│   │   ├── ManageStudentTypes.js
│   │   ├── DownloadReports.js
│   │   ├── Navbar.js
│   │   └── RoleGuard.js
│   ├── context/
│   │   └── DataContext.js
│   ├── App.js
│   ├── index.js
│   └── styles.css
├── backend/
│   ├── server.js (Node.js proxy for Twilio)
│   ├── .env (Twilio credentials)
│   └── package.json
└── package.json
```

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)
- Twilio account for SMS functionality

### Step-by-Step Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd vignan-attendance-portal
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   cd ..
   ```

### Setting Up SMS Functionality

The application uses Twilio to send real-time SMS notifications to parents when feedback is submitted for students.

1. **Create a Twilio account:**
   - Go to [Twilio's website](https://www.twilio.com) and sign up
   - Get a Twilio phone number that supports SMS
   - Note your Account SID and Auth Token from the dashboard

2. **Configure backend environment:**
   - In the `backend` directory, make sure the `.env` file exists with the following content:
     ```
     # Twilio Credentials
     TWILIO_ACCOUNT_SID=your_account_sid
     TWILIO_AUTH_TOKEN=your_auth_token
     TWILIO_PHONE_NUMBER=your_twilio_phone_number
     ```
   - Replace the placeholders with your actual Twilio credentials

### Running the Project

1. **Start the backend server:**
   ```bash
   cd backend
   npm start
   ```
   You should see output confirming:
   - "SMS Notification server running on port 5000"
   - "Twilio client initialized successfully"
   - "Using Twilio number: [your Twilio number]"

2. **In a new terminal, start the React frontend:**
   ```bash
   # From the project root directory
   npm start
   ```
   The application should open in your browser at http://localhost:3000

### Testing SMS Functionality

1. **Log in using the demo credentials**
   - For faculty access: 
     - Username: shiva
     - Password: shiva123

2. **Navigate to the Summary section**
   - Select a course
   - Click "Pick Student" to randomly select a student
   - Fill out the feedback form
   - Click "Submit Feedback"

3. **SMS Verification**
   - A success message should appear confirming the SMS was sent
   - The backend console will show details of the SMS delivery
   - The parent's phone (as configured in the system) will receive an SMS with the feedback details

## Troubleshooting SMS Functionality

If SMS sending fails, check the following:

1. **Backend Server:**
   - Ensure the backend server is running on port 5000
   - Check console for any error messages

2. **Twilio Credentials:**
   - Verify your Account SID and Auth Token are correct
   - Make sure your Twilio phone number is SMS-capable

3. **Phone Number Format:**
   - Ensure recipient phone numbers are in E.164 format (e.g., +91XXXXXXXXXX for India)
   - The system automatically adds +91 prefix to 10-digit numbers

4. **Twilio Account Status:**
   - Check if your Twilio account has sufficient credits
   - Verify your account is not in trial mode or has passed restrictions

## Commands Reference

Here are all the essential commands for running and managing the application:

### Frontend Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

### Backend Commands

```bash
# Navigate to backend directory
cd backend

# Install backend dependencies
npm install

# Start backend server
npm start

# Start backend in development mode with SMS simulation (no actual SMS sent)
npm run dev

# Start backend with debugging
DEBUG=* npm start
```

### Combined Commands (using concurrently)

If you have concurrently installed (`npm install -g concurrently`), you can run both frontend and backend with a single command:

```bash
# Start both frontend and backend
concurrently "npm start" "cd backend && npm start"

# Start both in development mode
concurrently "npm start" "cd backend && npm run dev"
```

### Database Setup (LocalStorage)

The application uses browser's LocalStorage for data persistence. No additional database setup is required.

1. **Clearing Data** (if needed):
   ```
   # In browser console
   localStorage.clear()
   ```

2. **Resetting to Default Data** (if needed):
   ```
   # Log out and log back in
   # OR in browser console:
   localStorage.clear();
   window.location.reload();
   ```

## Usage

### Demo Credentials

- **Admin:**
  - Username: admin
  - Password: admin123

- **Faculty:**
  - Username: shiva
  - Password: shiva123

### Admin Features

- Manage student information
- Classify students as normal or slow learners
- Generate and download various reports

### Faculty Features

- Record and track student attendance
- Provide feedback for randomly selected students
- Send real-time SMS notifications to parents
- Generate Excel reports of feedback data

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Running on a New Computer

If you want to run this project on a different computer, follow these steps:

### 1. Copy or Clone the Project

- Copy all files to the new computer, or
- Clone from repository if available

### 2. Install Dependencies

```bash
# Install frontend dependencies
cd vignan-attendance-portal
npm install

# Install backend dependencies
cd backend
npm install
```

### 3. Configure the Backend

- Ensure the `.env` file in the backend directory has the correct settings:
  ```
  # Twilio Credentials
  TWILIO_ACCOUNT_SID=your_account_sid
  TWILIO_AUTH_TOKEN=your_auth_token
  TWILIO_PHONE_NUMBER=your_twilio_phone_number
  PORT=5001
  ```
- Note: PORT=5001 is required to avoid conflicts with other services

### 4. Start the Servers

```bash
# Start backend first (from the backend directory)
cd backend
node server.js
# or
npm start

# Start frontend (from the project root)
cd ..
npm start
```

### 5. Access the Application

- Frontend: http://localhost:3000
- Backend: http://localhost:5001

## Troubleshooting Common Issues

### Port Conflicts

If you see an error like "Something is already running on port 3000" or "EADDRINUSE: address already in use":

1. **Accept the prompt to use another port** (recommended for frontend)
   ```
   Would you like to run the app on another port instead? (Y/n)
   ```
   Type `Y` and press Enter.

2. **Find and kill the process using the port**:
   ```bash
   # For Windows:
   netstat -ano | findstr :PORT_NUMBER
   taskkill /F /PID PID_NUMBER
   
   # Example for port 5001:
   netstat -ano | findstr :5001
   taskkill /F /PID 12345
   ```

3. **Change the port in code**:
   - For backend: Edit the `server.js` file and change `const PORT = 5001` to another port
   - For frontend: Set the PORT environment variable before starting:
     ```bash
     # Windows
     set PORT=3001 && npm start
     
     # Linux/Mac
     PORT=3001 npm start
     ```

### CORS Issues

If you see "Cross-Origin Request Blocked" errors in the console:

1. Ensure both servers are running
2. Check that the backend CORS settings match the frontend URL
3. If frontend is running on a port other than 3000, update the backend CORS settings

### Module Not Found Errors

If you see `Error: Cannot find module`:

1. Ensure you're in the correct directory
2. Try running `npm install` again
3. Check for any missing dependencies in package.json

### Quick Reference Commands

```bash
# Start frontend
cd vignan-attendance-portal
npm start

# Start backend
cd vignan-attendance-portal/backend
node server.js

# Kill process using a port (Windows)
netstat -ano | findstr :PORT_NUMBER
taskkill /F /PID PID_NUMBER
```

Remember: Always start the backend server before the frontend application for the best experience.
