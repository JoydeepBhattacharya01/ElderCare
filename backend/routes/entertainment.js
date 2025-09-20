const express = require('express');
const axios = require('axios');
const auth = require('../middleware/auth');

const router = express.Router();

// Get news feed
router.get('/news', auth, async (req, res) => {
  try {
    const { category = 'health', country = 'us', pageSize = 10 } = req.query;
    
    // Mock news data for demo (since News API requires subscription)
    const mockNews = [
      {
        title: "New Study Shows Benefits of Daily Walking for Seniors",
        description: "Research indicates that 30 minutes of daily walking can significantly improve cardiovascular health in elderly individuals.",
        url: "#",
        publishedAt: new Date().toISOString(),
        source: { name: "Health Today" }
      },
      {
        title: "Technology Helps Seniors Stay Connected",
        description: "New apps and devices are making it easier for elderly people to stay in touch with family and friends.",
        url: "#",
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        source: { name: "Tech for Seniors" }
      },
      {
        title: "Healthy Eating Tips for Seniors",
        description: "Nutritionists share simple dietary changes that can improve energy and overall health in older adults.",
        url: "#",
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        source: { name: "Senior Health" }
      },
      {
        title: "Mental Health Awareness for Elderly",
        description: "Experts discuss the importance of mental health support and social connection for seniors.",
        url: "#",
        publishedAt: new Date(Date.now() - 10800000).toISOString(),
        source: { name: "Mental Wellness" }
      },
      {
        title: "Exercise Programs Designed for Seniors",
        description: "Local community centers are offering specialized fitness programs tailored for older adults.",
        url: "#",
        publishedAt: new Date(Date.now() - 14400000).toISOString(),
        source: { name: "Community Health" }
      }
    ];
    
    res.json({
      articles: mockNews,
      totalResults: mockNews.length
    });
    
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get music/radio stations
router.get('/music', auth, async (req, res) => {
  try {
    const musicStations = [
      {
        id: 1,
        name: "Classical Music",
        description: "Relaxing classical music for meditation and relaxation",
        url: "https://www.youtube.com/embed/5qap5aO4i9A",
        type: "youtube",
        category: "classical"
      },
      {
        id: 2,
        name: "Jazz Lounge",
        description: "Smooth jazz music for a peaceful evening",
        url: "https://www.youtube.com/embed/Dx5qFachd3A",
        type: "youtube",
        category: "jazz"
      },
      {
        id: 3,
        name: "Oldies Radio",
        description: "Classic hits from the 50s, 60s, and 70s",
        url: "https://www.youtube.com/embed/9Auq9mYxFEE",
        type: "youtube",
        category: "oldies"
      },
      {
        id: 4,
        name: "Nature Sounds",
        description: "Calming nature sounds for relaxation",
        url: "https://www.youtube.com/embed/1ZYbU82GVz4",
        type: "youtube",
        category: "nature"
      },
      {
        id: 5,
        name: "Gospel Music",
        description: "Inspirational gospel and spiritual music",
        url: "https://www.youtube.com/embed/3JZ_D3ELwOQ",
        type: "youtube",
        category: "gospel"
      }
    ];
    
    res.json(musicStations);
    
  } catch (error) {
    console.error('Get music error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get brain games/puzzles
router.get('/games', auth, async (req, res) => {
  try {
    const games = [
      {
        id: 1,
        name: "Memory Match",
        description: "Test your memory with this classic matching game",
        type: "memory",
        difficulty: "easy",
        instructions: "Click on cards to flip them and find matching pairs"
      },
      {
        id: 2,
        name: "Word Search",
        description: "Find hidden words in the letter grid",
        type: "word",
        difficulty: "medium",
        instructions: "Look for words hidden horizontally, vertically, or diagonally"
      },
      {
        id: 3,
        name: "Number Puzzle",
        description: "Arrange numbers in the correct order",
        type: "number",
        difficulty: "easy",
        instructions: "Click on numbers to move them to the correct position"
      },
      {
        id: 4,
        name: "Color Memory",
        description: "Remember the sequence of colors",
        type: "memory",
        difficulty: "medium",
        instructions: "Watch the color sequence and repeat it back"
      },
      {
        id: 5,
        name: "Trivia Quiz",
        description: "Answer fun trivia questions",
        type: "quiz",
        difficulty: "easy",
        instructions: "Choose the correct answer for each question"
      }
    ];
    
    res.json(games);
    
  } catch (error) {
    console.error('Get games error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific game data
router.get('/games/:id', auth, async (req, res) => {
  try {
    const gameId = parseInt(req.params.id);
    
    // Mock game data based on game type
    const gameData = {
      1: { // Memory Match
        cards: [
          { id: 1, value: "A", matched: false },
          { id: 2, value: "A", matched: false },
          { id: 3, value: "B", matched: false },
          { id: 4, value: "B", matched: false },
          { id: 5, value: "C", matched: false },
          { id: 6, value: "C", matched: false },
          { id: 7, value: "D", matched: false },
          { id: 8, value: "D", matched: false }
        ]
      },
      2: { // Word Search
        grid: [
          ["C", "A", "T", "D", "O", "G"],
          ["A", "R", "T", "I", "S", "T"],
          ["R", "E", "D", "B", "L", "U"],
          ["E", "N", "D", "I", "N", "G"],
          ["S", "U", "N", "S", "H", "I"],
          ["N", "E", "W", "S", "P", "A"]
        ],
        words: ["CAT", "ART", "RED", "SUN", "NEW"]
      },
      3: { // Number Puzzle
        numbers: [1, 2, 3, 4, 5, 6, 7, 8, null],
        target: [1, 2, 3, 4, 5, 6, 7, 8, null]
      },
      4: { // Color Memory
        colors: ["red", "blue", "green", "yellow", "purple", "orange"],
        sequence: ["red", "blue", "green", "yellow"]
      },
      5: { // Trivia Quiz
        questions: [
          {
            question: "What is the capital of France?",
            options: ["London", "Berlin", "Paris", "Madrid"],
            correct: 2
          },
          {
            question: "How many days are in a week?",
            options: ["5", "6", "7", "8"],
            correct: 2
          },
          {
            question: "What color is the sun?",
            options: ["Blue", "Green", "Yellow", "Red"],
            correct: 2
          }
        ]
      }
    };
    
    res.json(gameData[gameId] || { error: "Game not found" });
    
  } catch (error) {
    console.error('Get game data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save game score
router.post('/games/:id/score', auth, async (req, res) => {
  try {
    const { score, time, completed } = req.body;
    
    // In a real app, you'd save this to a database
    // For now, just return success
    res.json({
      message: 'Score saved successfully',
      score,
      time,
      completed
    });
    
  } catch (error) {
    console.error('Save score error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
