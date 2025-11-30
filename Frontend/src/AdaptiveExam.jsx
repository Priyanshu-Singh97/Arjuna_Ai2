// frontend/src/AdaptiveExam.jsx
// COMPLETE WORKING ADAPTIVE EXAM MODULE WITH CHEATING DETECTION

import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Button, Card, CardContent, LinearProgress,
  Alert, Snackbar, CircularProgress
} from '@mui/material';
import {
  Camera, Shield, AlertTriangle, CheckCircle, 
  Monitor, Smartphone, Book, ArrowLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
const TOTAL_QUESTIONS = 10;

export default function AdaptiveExam({ onBack }) {
  // State Management
  const [currentScreen, setCurrentScreen] = useState('setup'); // setup, exam, results
  const [sessionId, setSessionId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [language, setLanguage] = useState('Python');
  
  // Cheating Detection State
  const [detectedObjects, setDetectedObjects] = useState([]);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [cameraActive, setCameraActive] = useState(false);
  
  // Results State
  const [examResults, setExamResults] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  
  // Refs
  const videoRef = useRef(null);
  const modelRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const startTimeRef = useRef(null);

  // ==================== TENSORFLOW MODEL LOADING ====================
  useEffect(() => {
    const loadModel = async () => {
      try {
        const model = await cocoSsd.load();
        modelRef.current = model;
        console.log('✅ COCO-SSD model loaded');
      } catch (error) {
        console.error('❌ Model loading error:', error);
        showNotification('Object detection model failed to load', 'warning');
      }
    };
    loadModel();
  }, []);

  // ==================== CAMERA SETUP ====================
  useEffect(() => {
    if (currentScreen === 'exam') {
      startCamera();
      startObjectDetection();
      setupTabSwitchDetection();
    }

    return () => {
      stopCamera();
      stopObjectDetection();
    };
  }, [currentScreen]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 320, height: 240 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        console.log('✅ Camera started');
      }
    } catch (error) {
      console.error('❌ Camera error:', error);
      showNotification('Camera access denied - cheating detection disabled', 'error');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  // ==================== OBJECT DETECTION ====================
  const startObjectDetection = () => {
    detectionIntervalRef.current = setInterval(async () => {
      await detectObjects();
    }, 2000); // Every 2 seconds
  };

  const stopObjectDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
  };

  const detectObjects = async () => {
    if (!modelRef.current || !videoRef.current || videoRef.current.readyState !== 4) {
      return;
    }

    try {
      const predictions = await modelRef.current.detect(videoRef.current);
      const suspicious = [];
      let personCount = 0;

      predictions.forEach(pred => {
        const obj = pred.class.toLowerCase();
        
        if (obj.includes('cell phone') || obj.includes('phone')) {
          suspicious.push('Phone');
          logCheating('phone_detected', 'high', `Phone detected with ${(pred.score * 100).toFixed(0)}% confidence`);
        }
        
        if (obj.includes('book')) {
          suspicious.push('Book');
          logCheating('book_detected', 'high', `Book/notes detected with ${(pred.score * 100).toFixed(0)}% confidence`);
        }
        
        if (obj.includes('laptop')) {
          suspicious.push('Laptop');
          logCheating('laptop_detected', 'medium', `Laptop detected with ${(pred.score * 100).toFixed(0)}% confidence`);
        }
        
        if (obj === 'person') {
          personCount++;
        }
      });

      if (personCount > 1) {
        suspicious.push('Multiple Persons');
        logCheating('multiple_persons', 'high', `${personCount} persons detected in frame`);
      }

      setDetectedObjects([...new Set(suspicious)]);
      
      if (suspicious.length > 0) {
        showNotification(`Warning: ${suspicious.join(', ')} detected!`, 'error');
      }

    } catch (error) {
      console.error('Detection error:', error);
    }
  };

  // ==================== TAB SWITCH DETECTION ====================
  const setupTabSwitchDetection = () => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        const newCount = tabSwitches + 1;
        setTabSwitches(newCount);
        logCheating('tab_switch', 'high', `Tab switched - Total switches: ${newCount}`);
        showNotification('Warning: Tab switch detected!', 'error');
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  };

  // ==================== CHEATING LOG ====================
  const logCheating = async (detectionType, severity, description) => {
    if (!sessionId) return;

    try {
      const token = localStorage.getItem('access_token');
      await axios.post(
        `${BACKEND_URL}/exam/cheating-detected`,
        {
          session_id: sessionId,
          detection_type: detectionType,
          severity: severity,
          description: description
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Cheating log error:', error);
    }
  };

  // ==================== EXAM FLOW ====================
  const startExam = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        `${BACKEND_URL}/exam/start`,
        {
          language: language,
          difficulty: difficulty,
          num_questions: TOTAL_QUESTIONS,
          use_question_bank: false
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSessionId(response.data.session_id);
      setCurrentQuestion(response.data.question);
      setQuestionNumber(1);
      setDifficulty(response.data.current_difficulty);
      setCurrentScreen('exam');
      startTimeRef.current = Date.now();
      
      console.log('✅ Exam started:', response.data);
      showNotification('Exam started! Good luck!', 'success');
    } catch (error) {
      console.error('❌ Start exam error:', error);
      showNotification('Failed to start exam. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!selectedAnswer) {
      showNotification('Please select an answer', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const token = localStorage.getItem('access_token');
      
      const response = await axios.post(
        `${BACKEND_URL}/exam/submit-answer`,
        {
          session_id: sessionId,
          question_number: questionNumber,
          user_answer: selectedAnswer,
          time_taken: timeTaken
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.exam_complete) {
        // Exam finished
        setExamResults(response.data);
        setCurrentScreen('results');
        stopCamera();
        stopObjectDetection();
        showNotification('Exam completed!', 'success');
      } else {
        // Next question
        setCurrentQuestion(response.data.question);
        setQuestionNumber(response.data.question_number);
        setDifficulty(response.data.current_difficulty);
        setSelectedAnswer(null);
        startTimeRef.current = Date.now();
        
        showNotification(
          response.data.is_correct ? 'Correct! ✓' : 'Incorrect ✗',
          response.data.is_correct ? 'success' : 'error'
        );
      }
    } catch (error) {
      console.error('Submit answer error:', error);
      showNotification('Error submitting answer', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (message, severity) => {
    setNotification({ open: true, message, severity });
  };

  // ==================== RENDER: SETUP SCREEN ====================
  if (currentScreen === 'setup') {
    return (
      <Box sx={{ p: 3, minHeight: '100vh', bgcolor: '#0a1929' }}>
        <Button 
          startIcon={<ArrowLeft />} 
          onClick={onBack}
          sx={{ mb: 3, color: '#60A5FA' }}
        >
          Back to Dashboard
        </Button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card sx={{ maxWidth: 600, mx: 'auto', bgcolor: 'rgba(255,255,255,0.05)' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ color: '#60A5FA', mb: 2 }}>
                  🧠 AI-Powered Adaptive Exam
                </Typography>
                <Typography sx={{ color: '#CBD5E1' }}>
                  Questions generated by Gemini AI with real-time cheating detection
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Typography sx={{ mb: 1, color: '#CBD5E1' }}>Programming Language</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {['Python', 'Java', 'JavaScript', 'C++'].map(lang => (
                      <Button
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        variant={language === lang ? 'contained' : 'outlined'}
                        sx={{ flex: 1 }}
                      >
                        {lang}
                      </Button>
                    ))}
                  </Box>
                </Box>

                <Box>
                  <Typography sx={{ mb: 1, color: '#CBD5E1' }}>Starting Difficulty</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {['easy', 'medium', 'hard'].map(diff => (
                      <Button
                        key={diff}
                        onClick={() => setDifficulty(diff)}
                        variant={difficulty === diff ? 'contained' : 'outlined'}
                        sx={{ flex: 1, textTransform: 'capitalize' }}
                      >
                        {diff}
                      </Button>
                    ))}
                  </Box>
                </Box>

                <Alert severity="info" sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)' }}>
                  <Typography variant="body2">
                    <strong>Features:</strong><br/>
                    • {TOTAL_QUESTIONS} adaptive questions<br/>
                    • AI-generated by Gemini<br/>
                    • Real-time cheating detection<br/>
                    • Camera + object detection monitoring
                  </Typography>
                </Alert>

                <Button
                  fullWidth
                  variant="contained"
                  onClick={startExam}
                  disabled={isLoading}
                  sx={{
                    py: 2,
                    fontSize: '1.1rem',
                    background: 'linear-gradient(90deg, #3B82F6, #06B6D4)'
                  }}
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Start Exam'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </motion.div>

        <Snackbar
          open={notification.open}
          autoHideDuration={4000}
          onClose={() => setNotification({ ...notification, open: false })}
        >
          <Alert severity={notification.severity}>{notification.message}</Alert>
        </Snackbar>
      </Box>
    );
  }

  // ==================== RENDER: EXAM SCREEN ====================
  if (currentScreen === 'exam') {
    return (
      <Box sx={{ p: 3, minHeight: '100vh', bgcolor: '#0a1929' }}>
        <Card sx={{ mb: 3, p: 2, bgcolor: 'rgba(255,255,255,0.05)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography>
              Question {questionNumber}/{TOTAL_QUESTIONS}
            </Typography>
            <Typography sx={{ 
              px: 2, 
              py: 0.5, 
              borderRadius: 2,
              bgcolor: difficulty === 'easy' ? 'rgba(34, 197, 94, 0.2)' :
                       difficulty === 'medium' ? 'rgba(251, 191, 36, 0.2)' :
                       'rgba(239, 68, 68, 0.2)',
              color: difficulty === 'easy' ? '#22C55E' :
                     difficulty === 'medium' ? '#FBBF24' : '#EF4444'
            }}>
              {difficulty.toUpperCase()}
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={(questionNumber / TOTAL_QUESTIONS) * 100} 
            sx={{ mt: 2 }}
          />
        </Card>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 3 }}>
          <Card sx={{ p: 4, bgcolor: 'rgba(255,255,255,0.05)' }}>
            {isLoading ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Loading question...</Typography>
              </Box>
            ) : currentQuestion ? (
              <>
                <Typography variant="h5" sx={{ mb: 4, color: '#fff' }}>
                  {currentQuestion.question}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                  {currentQuestion.options.map((option, idx) => (
                    <Button
                      key={idx}
                      onClick={() => setSelectedAnswer(option[0])}
                      variant={selectedAnswer === option[0] ? 'contained' : 'outlined'}
                      sx={{
                        justifyContent: 'flex-start',
                        p: 2,
                        textAlign: 'left',
                        bgcolor: selectedAnswer === option[0] ? 'rgba(59, 130, 246, 0.3)' : 'transparent'
                      }}
                    >
                      {option}
                    </Button>
                  ))}
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  onClick={submitAnswer}
                  disabled={!selectedAnswer || isLoading}
                  sx={{
                    py: 2,
                    background: 'linear-gradient(90deg, #3B82F6, #06B6D4)'
                  }}
                >
                  Submit Answer
                </Button>
              </>
            ) : (
              <Typography>Loading...</Typography>
            )}
          </Card>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Card sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.05)' }}>
              <Typography sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Camera size={18} />
                Proctoring
              </Typography>
              <Box sx={{ position: 'relative' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  style={{
                    width: '100%',
                    height: '180px',
                    borderRadius: 8,
                    background: '#000'
                  }}
                />
                {detectedObjects.length > 0 && (
                  <Box sx={{
                    position: 'absolute',
                    bottom: 8,
                    left: 8,
                    right: 8,
                    bgcolor: 'rgba(239, 68, 68, 0.9)',
                    color: '#fff',
                    p: 1,
                    borderRadius: 1,
                    fontSize: '0.75rem'
                  }}>
                    ⚠️ {detectedObjects.join(', ')}
                  </Box>
                )}
              </Box>
            </Card>

            <Card sx={{ p: 2, bgcolor: 'rgba(239, 68, 68, 0.1)' }}>
              <Typography sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: '#EF4444' }}>
                <Shield size={20} />
                Security Monitor
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, fontSize: '0.9rem' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Tab Switches</span>
                  <span style={{ color: tabSwitches > 0 ? '#EF4444' : '#22C55E' }}>
                    {tabSwitches}
                  </span>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Objects Detected</span>
                  <span style={{ color: detectedObjects.length > 0 ? '#EF4444' : '#22C55E' }}>
                    {detectedObjects.length}
                  </span>
                </Box>
              </Box>
            </Card>
          </Box>
        </Box>

        <Snackbar
          open={notification.open}
          autoHideDuration={3000}
          onClose={() => setNotification({ ...notification, open: false })}
        >
          <Alert severity={notification.severity}>{notification.message}</Alert>
        </Snackbar>
      </Box>
    );
  }

  // ==================== RENDER: RESULTS SCREEN ====================
  if (currentScreen === 'results' && examResults) {
    return (
      <Box sx={{ p: 3, minHeight: '100vh', bgcolor: '#0a1929' }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card sx={{ maxWidth: 800, mx: 'auto', bgcolor: 'rgba(255,255,255,0.05)' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <CheckCircle size={64} color="#22C55E" style={{ marginBottom: 16 }} />
                <Typography variant="h4" sx={{ color: '#60A5FA', mb: 2 }}>
                  Exam Completed!
                </Typography>
              </Box>

              <Box sx={{ display: 'grid', gridTemplates: '1fr 1fr', gap: 3, mb: 4 }}>
                <Card sx={{ p: 3, bgcolor: 'rgba(34, 197, 94, 0.1)' }}>
                  <Typography variant="h3" sx={{ color: '#22C55E', mb: 1 }}>
                    {examResults.score.toFixed(1)}%
                  </Typography>
                  <Typography sx={{ color: '#CBD5E1' }}>
                    {examResults.correct_answers}/{examResults.total_questions} Correct
                  </Typography>
                </Card>

                <Card sx={{ p: 3, bgcolor: 'rgba(239, 68, 68, 0.1)' }}>
                  <Typography variant="h3" sx={{ color: '#EF4444', mb: 1 }}>
                    {examResults.cheating_score}
                  </Typography>
                  <Typography sx={{ color: '#CBD5E1' }}>
                    Violations Detected
                  </Typography>
                </Card>
              </Box>

              <Button
                fullWidth
                variant="contained"
                onClick={onBack}
                sx={{
                  py: 2,
                  background: 'linear-gradient(90deg, #3B82F6, #06B6D4)'
                }}
              >
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </Box>
    );
  }

  return null;
}