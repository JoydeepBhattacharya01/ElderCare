const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const configPath = path.join(__dirname, 'config.env');
if (!fs.existsSync(configPath)) {
  const defaultConfig = `PORT=5000
MONGODB_URI=mongodb://localhost:27017/eldercare
JWT_SECRET=eldercare_jwt_secret_key_2024
GOOGLE_AI_API_KEY=AIzaSyDJpgN_dQOuxfpSKrQwca8IpYYjjpE2FyY
NEWS_API_KEY=your_news_api_key_here`;
  
  fs.writeFileSync(configPath, defaultConfig);
  console.log('Created config.env file with default values');
}

require('dotenv').config({ path: './config.env' });

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is working!', 
    timestamp: new Date().toISOString(),
    env: {
      hasApiKey: !!process.env.GOOGLE_AI_API_KEY,
      apiKeyLength: process.env.GOOGLE_AI_API_KEY ? process.env.GOOGLE_AI_API_KEY.length : 0
    }
  });
});

app.post('/api/chat/demo', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const systemPrompt = `You are a caring AI health companion for elderly users. Your role is to:
    1. Provide emotional support and companionship
    2. Answer general health questions (but always recommend consulting doctors for medical advice)
    3. Engage in friendly conversation
    4. Offer encouragement and positive reinforcement
    5. Be patient, understanding, and speak in simple, clear language
    6. Avoid medical advice but encourage consulting healthcare professionals
    7. Be warm, caring, and respectful
    
    Always respond in a warm, caring tone. Keep responses concise but meaningful.`;
    
    const userPrompt = `User: ${message}`;
    
    let aiResponse = "Thank you for sharing that with me. I'm here to listen and support you. How can I help you feel more comfortable today?";
    let isFromAPI = false;

    if (process.env.GOOGLE_AI_API_KEY && process.env.GOOGLE_AI_API_KEY !== 'your_google_ai_api_key_here') {
      try {
        const axios = require('axios');
        const response = await axios.post(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
          {
            contents: [{
              parts: [{
                text: `${systemPrompt}\n\n${userPrompt}`
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              }
            ]
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            params: {
              key: process.env.GOOGLE_AI_API_KEY
            },
            timeout: 30000
          }
        );

        if (response.data && response.data.candidates && response.data.candidates.length > 0) {
          const candidate = response.data.candidates[0];
          
          if (candidate.finishReason !== 'SAFETY' && candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
            aiResponse = candidate.content.parts[0].text;
            isFromAPI = true;
          }
        }
      } catch (apiError) {
        console.log('Google AI API error, using fallback:', apiError.message);
      }
    }

    res.json({
      message: aiResponse,
      timestamp: new Date().toISOString(),
      model: isFromAPI ? 'gemini-pro' : 'intelligent-fallback'
    });
    
  } catch (error) {
    console.error('Demo chat error:', error);
    res.status(500).json({ 
      message: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
      timestamp: new Date().toISOString(),
      fallback: true
    });
  }
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/medications', require('./routes/medications'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/health', require('./routes/health'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/entertainment', require('./routes/entertainment'));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eldercare')
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
