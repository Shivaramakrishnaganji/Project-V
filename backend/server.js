// Simple backend proxy for Twilio SMS notifications
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const twilio = require('twilio');

// Load environment variables
dotenv.config();

// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

console.log('Twilio Configuration:');
console.log('Account SID:', accountSid ? `${accountSid.substring(0, 5)}...` : 'Not set');
console.log('Auth Token:', authToken ? 'Set (hidden)' : 'Not set');
console.log('Twilio Phone:', twilioNumber);

// Create Twilio client
let client;
try {
  client = twilio(accountSid, authToken);
  console.log('Twilio client initialized successfully');
} catch (error) {
  console.error('Failed to initialize Twilio client:', error);
  // Continue without Twilio - we'll handle this in the routes
}

const app = express();
const PORT = 5001; // Explicitly set to 5001 to avoid conflicts

// In-memory data storage (would be a database in production)
let dataStore = {
  students: {},
  attendance: [],
  feedback: [],
  smsHistory: [],
  lastSync: null
};

// Middleware
app.use(cors({
  origin: '*', // Allow all origins temporarily for debugging
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Enable pre-flight for all routes
app.options('*', cors());

app.use(bodyParser.json());

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Routes
app.get('/', (req, res) => {
  res.send('Vignan Attendance Portal SMS Notification Service');
});

// Data synchronization endpoint
app.post('/api/sync', async (req, res) => {
  try {
    const { students, attendance, feedback, smsHistory } = req.body;
    
    console.log('Received sync request:');
    console.log(`- Students: ${Object.keys(students || {}).length} courses`);
    console.log(`- Attendance records: ${(attendance || []).length}`);
    console.log(`- Feedback records: ${(feedback || []).length}`);
    console.log(`- SMS history: ${(smsHistory || []).length}`);
    
    // Update the in-memory data store with the latest data from the client
    if (students) dataStore.students = students;
    if (attendance) dataStore.attendance = attendance;
    if (feedback) dataStore.feedback = feedback;
    if (smsHistory) dataStore.smsHistory = smsHistory;
    
    dataStore.lastSync = new Date().toISOString();
    
    return res.status(200).json({
      success: true,
      message: 'Data synchronized successfully',
      timestamp: dataStore.lastSync
    });
  } catch (error) {
    console.error('Error synchronizing data:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get current data state endpoint
app.get('/api/data', (req, res) => {
  res.json({
    success: true,
    data: dataStore,
    timestamp: new Date().toISOString()
  });
});

// SMS notification endpoint
app.post('/api/send-sms', async (req, res) => {
  try {
    let { to, message, simulate } = req.body;
    
    console.log('Received SMS request:');
    console.log('- To:', to);
    console.log('- Message length:', message?.length || 0);
    console.log('- Simulation requested:', simulate ? 'Yes' : 'No');
    
    if (!to || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Phone number and message are required' 
      });
    }

    // Format phone number to E.164 format if it's not already
    // Assuming Indian numbers (country code +91)
    if (to.startsWith('+')) {
      // Already has country code, leave as is
    } else if (to.startsWith('0')) {
      // Remove leading 0 and add +91
      to = '+91' + to.substring(1);
    } else if (to.length === 10) {
      // 10-digit Indian number, add +91
      to = '+91' + to;
    }

    console.log(`[SMS NOTIFICATION] To: ${to}, Message: ${message}`);
    
    // Check if Twilio client is available
    if (!client) {
      console.log('Twilio client not available - simulating SMS send');
      return res.status(200).json({ 
        success: true, 
        message: 'SMS notification simulated (Twilio not configured)',
        simulated: true
      });
    }

    // For testing without actually sending SMS
    if (process.env.NODE_ENV === 'development' || process.env.SMS_SIMULATION === 'true' || simulate === true) {
      console.log('Simulation mode enabled - not actually sending SMS');
      return res.status(200).json({ 
        success: true, 
        message: 'SMS notification simulated',
        simulated: true
      });
    }
    
    // Actually send SMS with Twilio
    try {
      const response = await client.messages.create({
        body: message,
        from: twilioNumber,
        to: to
      });
      
      console.log(`SMS sent with SID: ${response.sid}`);
      
      return res.status(200).json({ 
        success: true, 
        message: 'SMS notification sent successfully',
        sid: response.sid
      });
    } catch (twilioError) {
      console.error('Twilio error details:', twilioError);
      
      // Special handling for unverified number error (common with trial accounts)
      if (twilioError.code === 21608) {
        return res.status(400).json({
          success: false,
          error: `The number ${to} is unverified. Trial accounts can only send messages to verified numbers.`,
          code: twilioError.code,
          moreInfo: 'https://www.twilio.com/docs/errors/21608',
          verificationRequired: true,
          twilioError: true
        });
      }
      
      // Send a detailed error response
      return res.status(500).json({ 
        success: false, 
        error: twilioError.message,
        code: twilioError.code,
        moreInfo: twilioError.moreInfo,
        twilioError: true
      });
    }
    
  } catch (error) {
    console.error('Error sending SMS:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`SMS Notification server running on port ${PORT}`);
  console.log(`Using Twilio number: ${twilioNumber}`);
});

// For testing purposes
module.exports = app; 