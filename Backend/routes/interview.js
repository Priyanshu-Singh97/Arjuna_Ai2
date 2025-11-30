const express = require('express');
const router = express.Router();
const Interview = require('../models/Interview');
const auth = require('../middleware/auth');

// Generate question using Gemini API
router.post('/generate-question', auth, async (req, res) => {
  const { language, difficulty } = req.body;
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate a ${difficulty} level multiple choice question about ${language}. 
              Return ONLY valid JSON in this exact format:
              {
                "question": "question text",
                "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
                "correctAnswer": "A",
                "explanation": "brief explanation",
                "difficulty": "${difficulty}"
              }`
            }]
          }]
        })
      }
    );

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const question = JSON.parse(jsonMatch[0]);
      res.json({ question });
    } else {
      throw new Error('Failed to parse question');
    }
  } catch (error) {
    console.error('Error generating question:', error);
    res.status(500).json({ error: 'Failed to generate question' });
  }
});

// Save interview results
router.post('/save-results', auth, async (req, res) => {
  try {
    const { candidateName, language, difficulty, score, emotions, cheatDetection } = req.body;
    
    const interview = new Interview({
      userId: req.user._id,
      candidateName,
      language,
      difficulty,
      score,
      emotions,
      cheatDetection,
      completedAt: new Date()
    });
    
    await interview.save();
    res.json({ success: true, interviewId: interview._id });
  } catch (error) {
    console.error('Error saving interview:', error);
    res.status(500).json({ error: 'Failed to save interview' });
  }
});

// Get interview history
router.get('/history', auth, async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.user._id })
      .sort({ completedAt: -1 })
      .limit(10);
    res.json({ interviews });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

module.exports = router;