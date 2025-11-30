const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  candidateName: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  emotions: [{
    emotion: String,
    timestamp: Date,
    questionNumber: Number
  }],
  cheatDetection: {
    tabSwitches: { type: Number, default: 0 },
    multipleFaces: { type: Number, default: 0 },
    noFaceDetected: { type: Number, default: 0 },
    phoneDetected: { type: Number, default: 0 },
    bookDetected: { type: Number, default: 0 },
    unauthorizedObjects: { type: Number, default: 0 },
    suspiciousActivity: [{
      type: String,
      timestamp: Date,
      severity: String
    }]
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Interview', interviewSchema);