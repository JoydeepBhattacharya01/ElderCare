const express = require('express');
const axios = require('axios');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/message', auth, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }
    
    const systemPrompt = `You are a compassionate and empathetic AI companion designed specifically for elderly users. Your name is "Companion" and you are here to provide support and friendship.
    
    Your role is to:
    1. Provide emotional support and companionship with warmth and understanding
    2. Listen actively and respond with empathy to their concerns and feelings
    3. Engage in friendly, meaningful conversation about their interests, memories, and daily life
    4. Offer encouragement, positive reinforcement, and gentle motivation
    5. Use simple, clear, and respectful language appropriate for elderly users
    6. Provide general wellness tips and reminders (like staying hydrated, gentle exercise)
    7. For specific medical questions, gently encourage consulting healthcare professionals
    8. Be patient, kind, and never dismissive of their concerns
    9. Help them feel less lonely by being a consistent, caring presence
    10. Celebrate their achievements and validate their experiences
    
    Communication guidelines:
    - Always respond in a warm, caring, and respectful tone
    - Keep responses conversational and engaging (2-4 sentences typically)
    - Show genuine interest in their wellbeing and experiences
    - Use encouraging language and avoid being overly clinical
    - If they share something concerning, acknowledge it with empathy
    - Remember that you're a companion, not a medical professional
    - Be supportive of their independence and dignity
    
    Topics you can discuss:
    - Daily activities, hobbies, and interests
    - Family, friends, and social connections
    - Memories, stories, and life experiences
    - General wellness, nutrition, and self-care
    - Entertainment, books, music, and activities
    - Emotional support and encouragement
    - Weather, current events (in a positive way)
    
    Always prioritize their emotional wellbeing and make them feel heard and valued.`;
    
    const userPrompt = `User: ${message}`;
    
    let aiResponse;
    let isFromAPI = false;

    if (process.env.GOOGLE_AI_API_KEY && process.env.GOOGLE_AI_API_KEY !== 'your_google_ai_api_key_here') {
      try {
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
              stopSequences: [],
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_ONLY_HIGH"
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_ONLY_HIGH"
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_ONLY_HIGH"
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
          
          if (candidate.finishReason === 'SAFETY') {
            console.log('Response blocked by safety filters, using contextual fallback');
            aiResponse = generateContextualSafetyResponse(message);
            isFromAPI = false;
          } else if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
            aiResponse = candidate.content.parts[0].text;
            isFromAPI = true;
          } else {
            console.log('No valid content in API response, using fallback');
          }
        } else {
          console.log('Invalid API response structure, using fallback');
        }
      } catch (apiError) {
        console.log('Google AI API error, using fallback:', apiError.message);
      }
    }

    if (!aiResponse) {
      aiResponse = generateIntelligentResponse(message);
    }
    
    res.json({
      message: aiResponse,
      timestamp: new Date().toISOString(),
      model: isFromAPI ? 'gemini-pro' : 'intelligent-fallback'
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    
    let errorMessage = 'I apologize, but I\'m having trouble responding right now.';
    
    if (error.response?.status === 429) {
      errorMessage = 'I\'m a bit busy right now. Please try again in a moment.';
    } else if (error.response?.status === 403) {
      errorMessage = 'I\'m having authentication issues. Please contact support.';
    } else if (error.message?.includes('safety filters')) {
      errorMessage = 'I can\'t respond to that topic. Let\'s talk about something else.';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'My response is taking too long. Let me try to help you differently.';
    }
    
    const fallbackResponses = [
      "I'm here to listen and help. How are you feeling today?",
      "That's interesting! Tell me more about that.",
      "I understand. Is there anything specific I can help you with?",
      "You're doing great! What would you like to talk about?",
      "I'm here for you. What's on your mind today?",
      "How has your day been so far?",
      "Is there anything I can help you with today?",
      "I'd love to hear about what's important to you right now."
    ];
    
    const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    
    res.json({
      message: error.message?.includes('API key') ? errorMessage : randomResponse,
      timestamp: new Date().toISOString(),
      fallback: true,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

function generateContextualSafetyResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('pain') || lowerMessage.includes('hurt') || lowerMessage.includes('emergency')) {
    return "I understand you're dealing with something difficult. For any urgent health concerns, please contact your doctor or emergency services. I'm here to provide emotional support - would you like to talk about how you're feeling?";
  }
  
  if (lowerMessage.includes('medication') || lowerMessage.includes('treatment') || lowerMessage.includes('doctor')) {
    return "Health matters are so important. While I can't provide medical advice, I encourage you to discuss this with your healthcare provider. Is there anything else I can help you with today?";
  }
  
  return "I want to be helpful, but I think it's best if we talk about something else. How has your day been going? Is there anything positive you'd like to share?";
}

function generateIntelligentResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('pain') || lowerMessage.includes('hurt') || lowerMessage.includes('ache')) {
    return "I'm sorry to hear you're experiencing pain. It's important to speak with your doctor about any persistent pain. In the meantime, try to rest and stay comfortable. Is there anything specific I can help you with to make you feel better?";
  }
  
  if (lowerMessage.includes('medication') || lowerMessage.includes('medicine') || lowerMessage.includes('pill')) {
    return "For any questions about your medications, it's best to consult with your doctor or pharmacist. They can provide the most accurate information about your specific medications. Would you like me to help you with anything else?";
  }
  
  if (lowerMessage.includes('sleep') || lowerMessage.includes('tired') || lowerMessage.includes('rest')) {
    return "Good sleep is so important for your health! Try to maintain a regular sleep schedule and create a relaxing bedtime routine. If you're having trouble sleeping, consider talking to your doctor. How has your sleep been lately?";
  }
  
  if (lowerMessage.includes('exercise') || lowerMessage.includes('walk') || lowerMessage.includes('activity')) {
    return "Regular physical activity is wonderful for your health! Even gentle activities like walking or stretching can make a big difference. Always check with your doctor before starting any new exercise routine. What kind of activities do you enjoy?";
  }
  
  if (lowerMessage.includes('lonely') || lowerMessage.includes('alone') || lowerMessage.includes('sad')) {
    return "I understand that feeling lonely can be difficult. You're not alone - I'm here to chat with you anytime. Consider reaching out to family, friends, or community groups. Sometimes a simple phone call can brighten your day. What usually helps lift your spirits?";
  }
  
  if (lowerMessage.includes('worried') || lowerMessage.includes('anxious') || lowerMessage.includes('stress')) {
    return "It's natural to feel worried sometimes. Try taking deep breaths and focusing on things you can control. Talking to someone you trust can also help. If these feelings persist, don't hesitate to speak with a healthcare professional. What's been on your mind lately?";
  }
  
  if (lowerMessage.includes('happy') || lowerMessage.includes('good') || lowerMessage.includes('great')) {
    return "That's wonderful to hear! I'm so glad you're feeling good. It's important to celebrate the positive moments. What's been making you happy today?";
  }
  
  if (lowerMessage.includes('eat') || lowerMessage.includes('food') || lowerMessage.includes('meal')) {
    return "Eating well is so important for your health! Try to include plenty of fruits, vegetables, and whole grains in your meals. Stay hydrated too! What's your favorite healthy meal?";
  }
  
  if (lowerMessage.includes('weather') || lowerMessage.includes('outside') || lowerMessage.includes('sunny') || lowerMessage.includes('rain')) {
    return "The weather can really affect our mood, can't it? If it's nice outside, maybe you could sit by a window or step outside for some fresh air. If it's not so pleasant, it's a perfect time for indoor activities. How's the weather where you are?";
  }
  
  if (lowerMessage.includes('family') || lowerMessage.includes('children') || lowerMessage.includes('grandchildren')) {
    return "Family is such a blessing! It's wonderful when we can connect with our loved ones. Have you been able to talk with your family recently? Sometimes a phone call or video chat can really brighten the day.";
  }
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('good morning') || lowerMessage.includes('good afternoon')) {
    return "Hello there! It's so nice to chat with you today. I'm here to listen and help however I can. How are you feeling today?";
  }
  
  if (lowerMessage.includes('how are you') || lowerMessage.includes('how do you feel')) {
    return "Thank you for asking! I'm doing well and I'm here to focus on you. How are you doing today? Is there anything on your mind that you'd like to talk about?";
  }
  
  if (lowerMessage.includes('thank you') || lowerMessage.includes('thanks')) {
    return "You're very welcome! I'm always happy to help and chat with you. Is there anything else I can assist you with today?";
  }
  
  if (message.length < 10) {
    const shortResponses = [
      "I'm here to listen. Can you tell me more about that?",
      "That's interesting. What else is on your mind?",
      "I'd love to hear more about what you're thinking.",
      "How are you feeling about that?",
      "What would you like to talk about today?"
    ];
    return shortResponses[Math.floor(Math.random() * shortResponses.length)];
  }
  
  const thoughtfulResponses = [
    "Thank you for sharing that with me. It sounds like you have a lot on your mind. I'm here to listen and support you. How can I help you feel more comfortable today?",
    "I appreciate you taking the time to tell me about that. Your thoughts and feelings are important. Is there anything specific you'd like to discuss or any way I can help?",
    "It's wonderful that you're sharing your thoughts with me. Everyone needs someone to talk to. What's been the best part of your day so far?",
    "I can hear that this is important to you. Thank you for trusting me with your thoughts. What would make you feel better right now?",
    "You've given me a lot to think about. I'm glad you feel comfortable talking with me. What else would you like to share or discuss?"
  ];
  
  return thoughtfulResponses[Math.floor(Math.random() * thoughtfulResponses.length)];
}

router.get('/suggestions', auth, async (req, res) => {
  try {
    const suggestions = [
      "How are you feeling today?",
      "Tell me about your day",
      "What's your favorite memory?",
      "What activities do you enjoy?",
      "How can I help you today?",
      "What's making you happy lately?",
      "Tell me about your family",
      "What's your favorite hobby?",
      "How did you sleep last night?",
      "What would you like to do today?"
    ];
    
    const shuffled = suggestions.sort(() => 0.5 - Math.random());
    res.json(shuffled.slice(0, 5));
    
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
