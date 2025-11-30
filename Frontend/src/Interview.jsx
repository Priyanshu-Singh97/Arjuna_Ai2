
import React, { useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import {
  Mic,
  MicOff,
  Send,
  DarkMode,
  LightMode,
  VideocamOff,
  Videocam,
  Person,
  SmartToy,
  Logout,
  Message,
  RecordVoiceOver,
  Transcribe,
  Hearing,
  QuestionAnswer,
  Warning,
  CheckCircle,
  AutoAwesome,
} from "@mui/icons-material";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  // Divider,
  // useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// Enhanced viseme mapping for lip-sync
const rhubarbToMorph = {
  0: "viseme_sil",
  1: "viseme_aa",
  2: "viseme_PP",
  3: "viseme_CH",
  4: "viseme_DD",
  5: "viseme_E",
  6: "viseme_FF",
  7: "viseme_kk",
  X: "viseme_sil",
  A: "viseme_aa", 
  B: "viseme_PP",
  C: "viseme_CH",
  D: "viseme_DD",
  E: "viseme_E",
  F: "viseme_FF",
  G: "viseme_kk",
  H: "viseme_TH",
  I: "viseme_I",
  O: "viseme_O",  
  U: "viseme_U",
  R: "viseme_RR",
  S: "viseme_SS",
  N: "viseme_nn",
};

function LipSyncAvatar({ audioRef, visemeData, isSpeaking }) {
  const { scene } = useGLTF("/Untitled.glb");
  const morphs = useRef(null);
  const morphDict = useRef({});
  const visemes = useRef([]);
  const head = useRef(null);

  useEffect(() => {
    if (!scene) return;
    
    console.log("🎭 Loading Wolf3D Avatar with enhanced gestures...");
    
    scene.traverse((obj) => {
      if (obj.name.toLowerCase().includes("head")) {
        head.current = obj;
        console.log("✅ Using head bone:", obj.name);
      }
      
      if (obj.isMesh && obj.name === "Wolf3D_Avatar") {
        if (obj.morphTargetDictionary && obj.morphTargetInfluences) {
          morphDict.current = obj.morphTargetDictionary;
          morphs.current = obj.morphTargetInfluences;
          
          console.log("✅ Wolf3D Avatar ready with", Object.keys(morphDict.current).length, "morph targets");
          
          if (morphs.current) {
            morphs.current.fill(0);
          }
        }
      }
    });
  }, [scene]);

  useEffect(() => {
    if (visemeData && visemeData.length > 0) {
      visemes.current = visemeData;
      console.log(`🎭 Loaded ${visemeData.length} animation events for lip sync`);
    }
  }, [visemeData]);

  useFrame((state) => {
  if (!morphs.current || !morphDict.current) return;

  // Reset all morphs
  if (morphs.current) {
    morphs.current.fill(0);
  }

  const currentTime = audioRef.current ? audioRef.current.currentTime * 1000 : 0;

  // Process all animation events (both visemes and behaviors)
  if (visemeData && visemeData.length > 0) {
    for (let i = 0; i < visemeData.length; i++) {
      const event = visemeData[i];
      const eventStart = event.offset || event.start || 0;
      const eventEnd = eventStart + (event.duration || 200);

      if (currentTime >= eventStart && currentTime < eventEnd) {
        const progress = (currentTime - eventStart) / (eventEnd - eventStart);
        
        // Handle both visemes (lip sync) and gestures (blinks, head movements)
        if (event.type === "viseme" || event.viseme_id) {
          const visemeId = event.viseme_id || event.id;
          const morphName = rhubarbToMorph[visemeId] || "viseme_sil";
          const morphIndex = morphDict.current[morphName];
          
          if (typeof morphIndex === "number" && morphs.current) {
            const intensity = Math.sin(progress * Math.PI) * 0.65;
            morphs.current[morphIndex] = intensity;
          }
        } else if (event.type === "gesture" || event.type === "blink") {
          const morphName = event.gesture;
          const morphIndex = morphDict.current[morphName];
          
          if (typeof morphIndex === "number" && morphs.current) {
            const intensity = event.intensity || 0.5;
            morphs.current[morphIndex] = intensity * Math.sin(progress * Math.PI);
          }
        }
      }
    }
  }
});

  return (
    <primitive
      object={scene}
      scale={[2.5, 2.5, 2.5]}
      position={[0, -1, 0]}
      dispose={null}
    />
  );
}

const VideoErrorBoundary = ({ children, onError }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (error) => {
      console.error('Video Error Boundary caught error:', error);
      setHasError(true);
      onError?.(error);
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [onError]);

  if (hasError) {
    return (
      <Box sx={{ 
        position: 'absolute', 
        bottom: 16, 
        right: 16, 
        width: 160, 
        height: 120, 
        borderRadius: 2,
        border: 2,
        borderColor: 'error.main',
        bgcolor: 'error.light',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}>
        <VideocamOff sx={{ color: 'error.main', fontSize: 32 }} />
        <Typography variant="caption" color="error.main" align="center">
          Camera Error
        </Typography>
      </Box>
    );
  }

  return children;
};

const PermissionCheck = ({ onPermissionsGranted }) => {
  const [checking, setChecking] = useState(true);
  const [hasAudio, setHasAudio] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);
  

  const checkPermissions = async () => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasAudio(true);
      audioStream.getTracks().forEach(track => track.stop());

      const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasVideo(true);
      videoStream.getTracks().forEach(track => track.stop());

      setChecking(false);
      onPermissionsGranted?.(true);
    } catch (error) {
      console.error('Permission check failed:', error);
      setChecking(false);
      onPermissionsGranted?.(false);
    }
  };

  if (checking) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <CircularProgress size={24} />
        <Typography variant="body2" sx={{ mt: 1 }}>
          Checking permissions...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Permissions Status
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {hasAudio ? <CheckCircle color="success" /> : <Warning color="error" />}
          <Typography>Microphone: {hasAudio ? 'Granted' : 'Denied'}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {hasVideo ? <CheckCircle color="success" /> : <Warning color="error" />}
          <Typography>Camera: {hasVideo ? 'Granted' : 'Denied'}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default function AvatarInterview() {
  const [currentSessionId, setCurrentSessionId] = useState(
    localStorage.getItem('currentSessionId') || 'default'
  );
  const [hasPlayedWelcome, setHasPlayedWelcome] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [micMuted, setMicMuted] = useState(false);
  const [interviewActive, setInterviewActive] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState("Welcome! Please wait while we prepare your interview...");
  const [avatarStatus, setAvatarStatus] = useState("IDLE");
  const [transcript, setTranscript] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [avatarSpeaking, setAvatarSpeaking] = useState(false);
  const [visemeData, setVisemeData] = useState([]);
  const [showUserVideo, setShowUserVideo] = useState(false);
  const [userName, setUserName] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [videoError, setVideoError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const chatPanelRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const avatarAudioRef = useRef(null);
  const videoRef = useRef(null);
  const videoStreamRef = useRef(null);
  const recordingTimeoutRef = useRef(null);
  const autoGreetingTimerRef = useRef(null);
  
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
      background: {
        default: darkMode ? '#0a1929' : '#f5f5f5',
        paper: darkMode ? '#001e3c' : '#ffffff',
      },
    },
    typography: {
      h4: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 12,
    },
  });

  // const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      'Authorization': `Bearer ${token}`,
    };
  };

  const getJsonAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  useEffect(() => {
    const initializeApp = async () => {
      await checkAuthentication();
      setIsLoading(false);
    };
    initializeApp();
  }, []);
   useEffect(() => {
    if (isAuthenticated && hasPlayedWelcome && !isRecording && !isProcessing && !avatarSpeaking) {
      triggerAvatarBehaviors("idle", 15000);
    }
  }, [isAuthenticated, hasPlayedWelcome, isRecording, isProcessing, avatarSpeaking]);

  const checkAuthentication = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      redirectToLogin();
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/welcome`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        const name = data.name || localStorage.getItem('user_name') || 'User';
        setUserName(name);
        localStorage.setItem('user_name', name);
        showSnackbar(`Welcome back, ${name}!`, 'success');
      } else {
        redirectToLogin();
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      redirectToLogin();
    }
  };

  const redirectToLogin = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_name');
    window.location.href = '/login';
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_name');
    redirectToLogin();
  };

  useEffect(() => {
    if (chatPanelRef.current) {
      chatPanelRef.current.scrollTop = chatPanelRef.current.scrollHeight;
    }
  }, [transcript]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("interviewTheme");
    if (savedTheme) {
      setDarkMode(savedTheme === "dark");
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        startUserVideo();
      }, 1000);
      
      return () => {
        clearTimeout(timer);
        stopUserVideo();
      };
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && !hasPlayedWelcome) {
      if (autoGreetingTimerRef.current) {
        clearTimeout(autoGreetingTimerRef.current);
      }
      
      autoGreetingTimerRef.current = setTimeout(() => {
        triggerAutoGreeting();
      }, 2000);
    }

    return () => {
      if (autoGreetingTimerRef.current) {
        clearTimeout(autoGreetingTimerRef.current);
      }
    };
  }, [isAuthenticated, hasPlayedWelcome]);

  useEffect(() => {
    return () => {
      stopUserVideo();
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
      }
      if (autoGreetingTimerRef.current) {
        clearTimeout(autoGreetingTimerRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // const triggerAutoGreeting = async () => {
  //   if (!isAuthenticated || hasPlayedWelcome) return;

  //   try {
  //     console.log("🎯 Triggering auto-greeting...");
  //     setAvatarStatus("PROCESSING");
      
  //     // Try the /interview endpoint with empty audio to trigger greeting
  //     const formData = new FormData();
  //     const emptyBlob = new Blob([], { type: 'audio/wav' });
  //     formData.append("file", emptyBlob, "greeting.wav");
  //     formData.append("session_id", currentSessionId || "default");
  //     formData.append("is_greeting", "true");

  //     const response = await fetch(`${BACKEND_URL}/interview/`, {
  //       method: "POST",
  //       headers: getAuthHeaders(),
  //       body: formData,
  //     });

  //     if (!response.ok) {
  //       throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  //     }

  //     const data = await response.json();
  //     console.log("🎭 Auto-greeting response:", data);
      
  //     // Extract visemes from response
  //     let visemes = [];
  //     if (data.animation?.visemes && Array.isArray(data.animation.visemes)) {
  //       visemes = data.animation.visemes;
  //       console.log("✅ Found visemes in data.animation.visemes:", visemes.length);
  //     } else if (data.visemes && Array.isArray(data.visemes)) {
  //       visemes = data.visemes;
  //       console.log("✅ Found visemes in data.visemes:", visemes.length);
  //     } else {
  //       console.warn("⚠️ No visemes found in response");
  //     }

  //     // CRITICAL: Set visemes FIRST before any other state updates
  //     if (visemes.length > 0) {
  //       console.log("🎭 Setting viseme data with", visemes.length, "events");
  //       setVisemeData(visemes);
  //     }

  //     // Update transcript with greeting
  //     const greetingText = data.question || data.text || "Welcome to your AI mock interview! I'm excited to get to know you better. Let's begin!";
      
  //     setTranscript(prev => [...prev, { 
  //       sender: "AI", 
  //       text: greetingText,
  //       timestamp: new Date().toLocaleTimeString()
  //     }]);
  //     setCurrentQuestion(greetingText);

  //     // Store session ID if provided
  //     if (data.session_id) {
  //       setCurrentSessionId(data.session_id);
  //       localStorage.setItem('currentSessionId', data.session_id);
  //     }

  //     setHasPlayedWelcome(true);

  //     // Wait for React to process state updates
  //     await new Promise(resolve => requestAnimationFrame(resolve));
  //     await new Promise(resolve => setTimeout(resolve, 150));

  //     // Play audio with lip sync
  //     if (data.audio) {
  //       console.log("🔊 Playing auto-greeting audio with", visemes.length, "visemes");
  //       playAvatarAudio(data.audio, true);
  //     } else {
  //       setAvatarStatus("LISTENING");
  //     }

  //     showSnackbar('Interview started!', 'success');
  //     console.log("✅ Auto-greeting completed successfully");

  //   } catch (error) {
  //     console.error("❌ Auto-greeting failed:", error);
      
  //     // Fallback
  //     setAvatarStatus("LISTENING");
  //     setHasPlayedWelcome(true);
  //     const fallbackText = "Welcome to your AI mock interview! I'll be asking you questions about your experience and skills. Are you ready to begin?";
  //     setTranscript(prev => [...prev, {
  //       sender: "AI",
  //       text: fallbackText,
  //       timestamp: new Date().toLocaleTimeString()
  //     }]);
  //     setCurrentQuestion(fallbackText);
  //     showSnackbar('Welcome to your interview!', 'info');
  //   }
  // };
const triggerAutoGreeting = async () => {
  if (!isAuthenticated || hasPlayedWelcome) return;

  try {
    console.log("🎯 Starting interview via start-interview endpoint...");
    setAvatarStatus("PROCESSING");
    
    // Use the new start-interview endpoint
    const response = await fetch(`${BACKEND_URL}/start-interview/`, {
      method: "POST",
      headers: getJsonAuthHeaders(),
      body: JSON.stringify({ 
        session_id: currentSessionId || "default"
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ Interview started:", data);
    
    // Extract visemes from response
    let visemes = [];
    if (data.animation?.visemes && Array.isArray(data.animation.visemes)) {
      visemes = data.animation.visemes;
      console.log("✅ Found visemes:", visemes.length);
    }

    // Set visemes FIRST
    if (visemes.length > 0) {
      setVisemeData(visemes);
    }

    // Update transcript with greeting
    const greetingText = data.question || "Welcome to AI mock interview..  I'm excited to know more about you. Let's begin with a simple introduction";
    
    setTranscript(prev => [...prev, { 
      sender: "AI", 
      text: greetingText,
      timestamp: new Date().toLocaleTimeString()
    }]);
    setCurrentQuestion(greetingText);

    // Store session ID if provided
    if (data.session_id) {
      setCurrentSessionId(data.session_id);
      localStorage.setItem('currentSessionId', data.session_id);
    }

    setHasPlayedWelcome(true);

    // Wait for React to process state updates
    await new Promise(resolve => setTimeout(resolve, 100));

    // Play audio with lip sync
    if (data.audio) {
      console.log("🔊 Playing greeting audio");
      playAvatarAudio(data.audio, true);
    } else {
      setAvatarStatus("LISTENING");
    }

    showSnackbar('Interview started!', 'success');

  } catch (error) {
    console.error("❌ Auto-greeting failed:", error);
    
    // Simple fallback without audio
    setAvatarStatus("LISTENING");
    setHasPlayedWelcome(true);
    const fallbackText = "Welcome! Let's start with your background and experience.";
    
    setTranscript(prev => [...prev, {
      sender: "AI",
      text: fallbackText,
      timestamp: new Date().toLocaleTimeString()
    }]);
    setCurrentQuestion(fallbackText);
    showSnackbar('Welcome to your interview!', 'info');
  }
};
const triggerAvatarBehaviors = async (behaviorType, durationMs = 10000) => {
  try {
    const response = await fetch(`${BACKEND_URL}/avatar/${behaviorType}`, {
      method: "POST",
      headers: getJsonAuthHeaders(),
      body: JSON.stringify({
        duration_ms: durationMs,
        session_id: currentSessionId || "default"
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.visemes && data.visemes.length > 0) {
        console.log(`🎭 Added ${behaviorType} behaviors:`, data.visemes.length);
        // Add behaviors to existing viseme data
        setVisemeData(prev => [...prev, ...data.visemes]);
      }
    }
  } catch (error) {
    console.error(`❌ ${behaviorType} behaviors failed:`, error);
  }
};


  const startUserVideo = async () => {
    try {
      setVideoError(null);
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Browser doesn't support camera access");
      }

      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach(track => track.stop());
      }

      console.log("Requesting camera access...");
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 160 },
          height: { ideal: 120 },
          facingMode: "user" 
        } 
      });
      
      console.log("Camera access granted");
      videoStreamRef.current = stream;
      setCameraActive(true);
      
      await waitForVideoElement();
      
      if (videoRef.current) {
        console.log("✅ Video ref found, assigning stream");
        videoRef.current.srcObject = stream;
        setShowUserVideo(true);
        showSnackbar('Camera activated', 'success');
      } else {
        throw new Error("Video element not available in DOM");
      }
      
    } catch (error) {
      console.error("Error accessing camera:", error);
      setVideoError(error.message);
      setShowUserVideo(false);
      setCameraActive(false);
      addSystemMessage(`Camera error: ${error.message}`);
      showSnackbar('Camera access failed', 'error');
    }
  };

  const waitForVideoElement = () => {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const checkVideo = () => {
        attempts++;
        if (videoRef.current) {
          console.log(`✅ Video element found after ${attempts} attempts`);
          resolve();
        } else if (attempts < 10) {
          setTimeout(checkVideo, 200);
        } else {
          reject(new Error("Video element never became available"));
        }
      };
      checkVideo();
    });
  };
  
  const stopUserVideo = () => {
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      videoStreamRef.current = null;
    }
    setShowUserVideo(false);
    setCameraActive(false);
  };

  const toggleUserVideo = async () => {
    if (cameraActive) {
      stopUserVideo();
      showSnackbar('Camera turned off', 'info');
    } else {
      await startUserVideo();
    }
  };

  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    localStorage.setItem("interviewTheme", newTheme ? "dark" : "light");
    showSnackbar(`Theme changed to ${newTheme ? 'dark' : 'light'} mode`, 'info');
  };

  const toggleMic = () => {
    setMicMuted(!micMuted);
    if (interviewActive) {
      const message = !micMuted ? "Microphone has been muted." : "Microphone is now active.";
      addSystemMessage(message);
      showSnackbar(message, !micMuted ? 'warning' : 'success');
    }
  };

  const addSystemMessage = (text) => {
    let messageText;
    
    if (typeof text === 'string') {
      messageText = text;
    } else if (text?.msg) {
      messageText = text.msg;
    } else if (text?.message) {
      messageText = text.message;
    } else if (text?.detail) {
      messageText = text.detail;
    } else {
      messageText = "System message";
    }
    
    setTranscript(prev => [...prev, { sender: "System", text: messageText }]);
  };

  const startRecording = async () => {
    if (!interviewActive || micMuted || !isAuthenticated || isProcessing || avatarSpeaking || !hasPlayedWelcome) {
      showSnackbar('Cannot start recording now', 'warning');
      return;
    }
    triggerAvatarBehaviors("listening", 30000);
  

    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      
      const options = { 
        mimeType: 'audio/webm;codecs=opus'
      };
      
      const mediaRecorder = new MediaRecorder(stream, options);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunksRef.current, { 
            type: 'audio/webm' 
          });
          
          await sendAudioToBackend(audioBlob);
          
        } catch (error) {
          console.error('Error processing recording:', error);
          addSystemMessage('Error processing recording');
          showSnackbar('Error processing recording', 'error');
        } finally {
          stream.getTracks().forEach(track => {
            track.stop();
            track.enabled = false;
          });
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
        setIsRecording(false);
        setAvatarStatus("LISTENING");
        showSnackbar('Recording error occurred', 'error');
        
        stream.getTracks().forEach(track => track.stop());
      };

      recordingTimeoutRef.current = setTimeout(() => {
        if (isRecording) {
          stopRecording();
          showSnackbar('Recording stopped automatically after 30 seconds', 'info');
        }
      }, 30000);

      mediaRecorder.start(1000);
      setIsRecording(true);
      setAvatarStatus("RECORDING");
      showSnackbar('Recording started - speak now', 'info');
      
    } catch (error) {
      console.error("Error accessing microphone:", error);
      addSystemMessage("Could not access microphone. Please check permissions.");
      showSnackbar('Microphone access denied', 'error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        if (recordingTimeoutRef.current) {
          clearTimeout(recordingTimeoutRef.current);
        }
        showSnackbar('Recording stopped', 'info');
      } catch (error) {
        console.error("Error stopping recording:", error);
        setIsRecording(false);
        setAvatarStatus("LISTENING");
      }
    }
  };

  const sendAudioToBackend = async (audioBlob) => {
    setIsProcessing(true);
    setAvatarStatus("PROCESSING");
    triggerAvatarBehaviors("processing", 5000);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.webm");
      formData.append("session_id", currentSessionId || "default");

      const response = await fetch(`${BACKEND_URL}/interview/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorDetail = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorDetail = errorData.detail || errorData.message || JSON.stringify(errorData);
        } catch (e) {
          const errorText = await response.text();
          errorDetail = errorText || `HTTP ${response.status}`;
        }
        throw new Error(errorDetail);
      }

      const data = await response.json();
      
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format from server');
      }
      
      const newTranscript = [...transcript];
      if (data.transcript) {
        newTranscript.push({ sender: "User", text: data.transcript });
      }
      
      if (data.question) {
        newTranscript.push({ sender: "AI", text: data.question });
        setCurrentQuestion(data.question);
      }
      
      setTranscript(newTranscript);

      // Handle visemes
      let visemes = [];
      if (data.animation?.visemes && Array.isArray(data.animation.visemes)) {
        visemes = data.animation.visemes;
      } else if (data.visemes && Array.isArray(data.visemes)) {
        visemes = data.visemes;
      }

      if (visemes.length > 0) {
        console.log("🎭 Setting", visemes.length, "visemes for response");
        setVisemeData(visemes);
      }

      // Wait for state update
      await new Promise(resolve => requestAnimationFrame(resolve));
      await new Promise(resolve => setTimeout(resolve, 100));

      if (data.audio) {
        playAvatarAudio(data.audio, true);
      } else {
        setAvatarStatus("LISTENING");
      }

      showSnackbar('Response received', 'success');

    } catch (error) {
      console.error("Error sending audio:", error);
      const errorMessage = error.name === 'AbortError' ? 'Request timeout - please try again' : error.message;
      addSystemMessage(`Processing error: ${errorMessage}`);
      setAvatarStatus("LISTENING");
      showSnackbar(`Processing failed: ${errorMessage}`, 'error');
      
      const newTranscript = [...transcript];
      newTranscript.push({ 
        sender: "AI", 
        text: "I understand your response. Could you tell me more about that experience?" 
      });
      setTranscript(newTranscript);
      setCurrentQuestion("Could you tell me more about that experience?");
    } finally {
      setIsProcessing(false);
      clearTimeout(timeoutId);
    }
  };

  const playAvatarAudio = (base64Audio, isSpeech = true) => {
    try {
      console.log("🔊 playAvatarAudio called:", { 
        hasAudio: !!base64Audio, 
        isSpeech,
        currentVisemes: visemeData?.length 
      });

      const audioData = typeof base64Audio === 'string' 
        ? base64Audio 
        : base64Audio.audio || base64Audio.data;
      
      if (!audioData) {
        console.error('No audio data received');
        setAvatarStatus("LISTENING");
        return;
      }

      const cleanBase64 = audioData.startsWith('data:') 
        ? audioData.replace(/^data:audio\/\w+;base64,/, '')
        : audioData;

      try {
        const binaryString = atob(cleanBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const blob = new Blob([bytes], { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        
        // Clear any previous audio
        if (avatarAudioRef.current) {
          avatarAudioRef.current.pause();
          try {
            URL.revokeObjectURL(avatarAudioRef.current.src);
          } catch (e) {
            console.warn('Could not revoke previous audio URL:', e);
          }
        }
        avatarAudioRef.current = audio;
        
        audio.onloadeddata = () => {
          console.log("🔊 Audio loaded and ready, viseme count:", visemeData?.length);
        };
        
        audio.onplay = () => {
          console.log("🔊 Audio started playing with viseme data:", visemeData?.length);
          if (isSpeech) {
            setAvatarSpeaking(true);
            setAvatarStatus("SPEAKING");
            console.log("✅ Lip sync activated");
          }
        };
        
        audio.onended = () => {
          console.log("🔊 Audio ended, clearing speaking state");
          if (isSpeech) {
            setAvatarSpeaking(false);
            setAvatarStatus("LISTENING");
          }
          URL.revokeObjectURL(audioUrl);
        };
        
        audio.onerror = (e) => {
          console.error('Error playing audio:', e);
          if (isSpeech) {
            setAvatarSpeaking(false);
            setAvatarStatus("LISTENING");
          }
          URL.revokeObjectURL(audioUrl);
        };
        
        console.log("🔊 Attempting to play audio with", visemeData?.length, "visemes ready");
        audio.play().catch(error => {
          console.error('Audio play failed:', error);
          if (isSpeech) {
            setAvatarSpeaking(false);
            setAvatarStatus("LISTENING");
          }
          showSnackbar('Audio playback failed - please check browser permissions', 'error');
        });
      } catch (decodeError) {
        console.error('Error decoding audio data:', decodeError);
        setAvatarStatus("LISTENING");
        showSnackbar('Error processing audio data', 'error');
      }
    } catch (error) {
      console.error("Error processing audio:", error);
      setAvatarSpeaking(false);
      setAvatarStatus("LISTENING");
    }
  };

  const handleTextResponse = () => {
    if (!interviewActive || !userInput.trim() || !isAuthenticated || !hasPlayedWelcome) {
      showSnackbar('Cannot send message now', 'warning');
      return;
    }

    const responseText = userInput.trim();
    setTranscript(prev => [...prev, { sender: "User", text: responseText }]);
    setUserInput("");
    
    setAvatarStatus("PROCESSING");
    setIsProcessing(true);
    
    setTimeout(() => {
      const nextQuestion = "That's insightful. What was the outcome, and what did you learn from that experience?";
      setCurrentQuestion(nextQuestion);
      setTranscript(prev => [...prev, { sender: "AI", text: nextQuestion }]);
      setAvatarStatus("LISTENING");
      setIsProcessing(false);
      showSnackbar('Response sent', 'success');
    }, 2000);
  };

  const endInterview = async () => {
    if (!interviewActive) {
      window.location.href = "/interview-report";
      return;
    }
    
    setInterviewActive(false);
    
    if (isRecording) stopRecording();
    if (avatarAudioRef.current) {
      avatarAudioRef.current.pause();
      avatarAudioRef.current = null;
    }

    if (isAuthenticated) {
      try {
        await fetch(`${BACKEND_URL}/reset-conversation/`, { 
          method: "POST",
          headers: getJsonAuthHeaders(),
          body: JSON.stringify({ session_id: currentSessionId })
        });
      } catch (error) {
        console.error("Error resetting conversation:", error);
      }
    }

    setTranscript(prev => [...prev, {
      sender: "AI",
      text: "Thank you for your time. Your interview is now complete. Click 'View Report' to see your performance analysis."
    }]);
    
    setCurrentQuestion("Interview Complete - Thank You!");
    setAvatarStatus("IDLE");
    stopUserVideo();
    showSnackbar('Interview ended successfully', 'success');
  };

  const getStatusColor = () => {
    switch (avatarStatus) {
      case "LISTENING": return "success";
      case "PROCESSING": return "warning";
      case "SPEAKING": return "info";
      case "RECORDING": return "error";
      case "IDLE": return "default";
      default: return "default";
    }
  };

  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            minHeight: '100vh',
            bgcolor: 'background.default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Box textAlign="center">
            <CircularProgress size={60} thickness={4} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Loading Interview Session...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Please wait while we set up your interview
            </Typography>
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            minHeight: '100vh',
            bgcolor: 'background.default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Card sx={{ maxWidth: 400, textAlign: 'center', p: 4 }}>
            <CardContent>
              <Message sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Authentication Required
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Please log in to access the interview module.
              </Typography>
              <Button 
                variant="contained" 
                size="large"
                onClick={() => window.location.href = '/login'}
                fullWidth
              >
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          color: "text.primary",
        }}
      >
        <AppBar
          position="static"
          elevation={2}
          sx={{
            bgcolor: "background.paper",
            color: "text.primary",
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Toolbar>
            <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
              <Message sx={{ mr: 2, color: "primary.main" }} />
              <Box>
                <Typography variant="h6" component="div">
                  AI Mock Interview
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Welcome back, <strong>{userName}</strong>
                  {!hasPlayedWelcome && " - Starting interview..."}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Button
                startIcon={<Logout />}
                onClick={handleLogout}
                color="inherit"
                variant="outlined"
                size="small"
              >
                Logout
              </Button>

              <IconButton onClick={toggleTheme} color="inherit">
                {darkMode ? <LightMode /> : <DarkMode />}
              </IconButton>

              <IconButton 
                onClick={() => setPermissionDialogOpen(true)} 
                color="inherit"
              >
                <Warning />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "3fr 2fr" },
              gap: 3,
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Card
                elevation={3}
                sx={{ overflow: "hidden", position: "relative" }}
              >
                <Box
                  sx={{
                    position: "relative",
                    height: { xs: 400, md: 500 },
                    bgcolor: "primary.dark",
                  }}
                >
                  <Canvas
                    camera={{ position: [0, 1.6, 4], fov: 50 }}
                    style={{ width: "100%", height: "100%" }}
                  >
                    <ambientLight intensity={0.8} />
                    <directionalLight position={[5, 10, 5]} intensity={1.2} />
                    <directionalLight position={[-5, 5, -5]} intensity={0.5} />
                    <LipSyncAvatar
                      audioRef={avatarAudioRef}
                      visemeData={visemeData}
                      isSpeaking={avatarSpeaking}
                    />
                    <OrbitControls
                      enableZoom={true}
                      enablePan={false}
                      minDistance={2}
                      maxDistance={6}
                      target={[0, 1.6, 0]}
                    />
                  </Canvas>

                  <Box
                    sx={{
                      position: "absolute",
                      top: 16,
                      left: 16,
                      right: 16,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Chip
                      icon={<SmartToy />}
                      label="AI Interviewer - Dr. Kael"
                      color="primary"
                      variant="outlined"
                      sx={{
                        bgcolor: "background.paper",
                        backdropFilter: "blur(10px)",
                      }}
                    />

                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                      <Chip
                        icon={
                          avatarStatus === "LISTENING" ? (
                            <Hearing />
                          ) : avatarStatus === "PROCESSING" ? (
                            <Transcribe />
                          ) : avatarStatus === "SPEAKING" ? (
                            <RecordVoiceOver />
                          ) : avatarStatus === "IDLE" ? (
                            <AutoAwesome />
                          ) : (
                            <Mic />
                          )
                        }
                        label={avatarStatus}
                        color={getStatusColor()}
                        variant="filled"
                      />
                      {!hasPlayedWelcome && (
                        <Chip
                          icon={<AutoAwesome />}
                          label="Starting Interview..."
                          color="warning"
                          size="small"
                          variant="outlined"
                        />
                      )}
                      {avatarSpeaking && (
                        <Chip
                          icon={<RecordVoiceOver />}
                          label={`Lip Sync: ${visemeData?.length || 0} events`}
                          color="info"
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Box>

                  <VideoErrorBoundary onError={(error) => setVideoError(error.message)}>
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 16,
                        right: 16,
                        width: 160,
                        height: 120,
                        borderRadius: 2,
                        border: 2,
                        borderColor:
                          cameraActive && showUserVideo
                            ? "success.main"
                            : "grey.500",
                        overflow: "hidden",
                        boxShadow: 3,
                        bgcolor: "grey.900",
                        zIndex: 1000,
                      }}
                    >
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transform: "scaleX(-1)",
                          display: showUserVideo ? "block" : "none",
                        }}
                        onError={(e) => {
                          console.error("Video element error:", e);
                          setVideoError("Video failed to load");
                          setShowUserVideo(false);
                        }}
                      />

                      {!showUserVideo && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "column",
                            bgcolor: "grey.800",
                          }}
                        >
                          {cameraActive ? (
                            <CircularProgress size={24} color="inherit" />
                          ) : (
                            <VideocamOff
                              sx={{ color: "grey.500", fontSize: 32 }}
                            />
                          )}
                          <Typography
                            variant="caption"
                            color="grey.400"
                            sx={{ mt: 1 }}
                          >
                            {cameraActive ? "Loading..." : "Camera Off"}
                          </Typography>
                        </Box>
                      )}

                      <IconButton
                        onClick={toggleUserVideo}
                        sx={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          bgcolor: "rgba(0,0,0,0.6)",
                          color: "white",
                          width: 32,
                          height: 32,
                          '&:hover': {
                            bgcolor: "rgba(0,0,0,0.8)",
                          },
                        }}
                        size="small"
                      >
                        {cameraActive ? <Videocam /> : <VideocamOff />}
                      </IconButton>

                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          bgcolor:
                            cameraActive && showUserVideo
                              ? "rgba(0,0,0,0.7)"
                              : "rgba(255,0,0,0.7)",
                          color: "common.white",
                          textAlign: "center",
                          py: 0.5,
                        }}
                      >
                        <Typography variant="caption" fontWeight="medium">
                          {cameraActive && showUserVideo ? "You" : "Camera Off"}
                        </Typography>
                      </Box>
                    </Box>
                  </VideoErrorBoundary>
                </Box>
              </Card>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 2,
                }}
              >
                <Card elevation={2}>
                  <CardContent>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <Mic />
                      Audio Controls
                    </Typography>
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                    >
                      <Button
                        startIcon={micMuted ? <MicOff /> : <Mic />}
                        onClick={toggleMic}
                        variant={micMuted ? "contained" : "outlined"}
                        color={micMuted ? "error" : "success"}
                        fullWidth
                        size="large"
                      >
                        {micMuted ? "Microphone Muted" : "Microphone Active"}
                      </Button>

                      <Button
                        startIcon={isRecording ? <MicOff /> : <Mic />}
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={
                          !interviewActive ||
                          isProcessing ||
                          avatarSpeaking ||
                          micMuted ||
                          !hasPlayedWelcome
                        }
                        variant={isRecording ? "contained" : "contained"}
                        color={isRecording ? "error" : "primary"}
                        fullWidth
                        size="large"
                        sx={{
                          animation: isRecording
                            ? "pulse 1.5s infinite"
                            : "none",
                          "@keyframes pulse": {
                            "0%": { opacity: 1 },
                            "50%": { opacity: 0.7 },
                            "100%": { opacity: 1 },
                          },
                        }}
                      >
                        {isRecording ? "Stop Recording" : "Start Recording"}
                        {isRecording && " (Auto-stops in 30s)"}
                      </Button>
                    </Box>
                    {!hasPlayedWelcome && (
                      <Alert severity="info" sx={{ mt: 1 }}>
                        <Typography variant="body2">
                          Interview starting shortly...
                        </Typography>
                      </Alert>
                    )}
                    {isProcessing && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <CircularProgress size={20} />
                        <Typography variant="body2" color="text.secondary">
                          Processing your response...
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>

                <Card
                  elevation={2}
                  sx={{ borderLeft: 4, borderColor: "warning.main" }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <QuestionAnswer />
                      Current Question
                    </Typography>
                    <Paper
                      variant="outlined"
                      sx={{ p: 2, bgcolor: "action.hover", minHeight: 120 }}
                    >
                      <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                        {currentQuestion}
                      </Typography>
                    </Paper>
                  </CardContent>
                </Card>
              </Box>
            </Box>

            <Card
              elevation={3}
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "fit-content",
                maxHeight: "80vh",
              }}
            >
              <CardContent
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                  p: 0,
                }}
              >
                <Box sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <Message color="primary" />
                    Interview Transcript
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Real-time conversation with your AI interviewer
                    {!hasPlayedWelcome && " - Starting in 2 seconds..."}
                  </Typography>
                </Box>

                <Box
                  ref={chatPanelRef}
                  sx={{
                    flexGrow: 1,
                    overflow: "auto",
                    p: 2,
                    maxHeight: 400,
                    "&::-webkit-scrollbar": {
                      width: 8,
                    },
                    "&::-webkit-scrollbar-track": {
                      bgcolor: "grey.100",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      bgcolor: "grey.400",
                      borderRadius: 2,
                    },
                  }}
                >
                  {transcript.map((msg, idx) => (
                    <Box
                      key={`${msg.sender}-${idx}`}
                      sx={{
                        display: "flex",
                        justifyContent:
                          msg.sender === "User" ? "flex-end" : "flex-start",
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: "85%",
                          p: 2,
                          borderRadius: 2,
                          bgcolor:
                            msg.sender === "AI"
                              ? "primary.main"
                              : msg.sender === "User"
                              ? "success.light"
                              : "grey.500",
                          color:
                            msg.sender === "System"
                              ? "grey.100"
                              : "common.white",
                          borderBottomRightRadius:
                            msg.sender === "User" ? 2 : 16,
                          borderBottomLeftRadius:
                            msg.sender === "User" ? 16 : 2,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          {msg.sender === "AI" && (
                            <SmartToy sx={{ fontSize: 16 }} />
                          )}
                          {msg.sender === "User" && (
                            <Person sx={{ fontSize: 16 }} />
                          )}
                          {msg.sender === "System" && (
                            <Message sx={{ fontSize: 16 }} />
                          )}
                          <Typography variant="caption" fontWeight="bold">
                            {msg.sender}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                          {typeof msg.text === "string"
                            ? msg.text
                            : msg.text?.msg ||
                              msg.text?.message ||
                              JSON.stringify(msg.text)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>

                <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleTextResponse()
                      }
                      placeholder={hasPlayedWelcome ? "Type your response here..." : "Interview starting..."}
                      disabled={!interviewActive || isProcessing || !hasPlayedWelcome}
                      fullWidth
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Button
                      onClick={handleTextResponse}
                      disabled={!interviewActive || !userInput.trim() || isProcessing || !hasPlayedWelcome}
                      variant="contained"
                      color="warning"
                      sx={{ minWidth: "auto", px: 2 }}
                    >
                      <Send />
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "center", pt: 3 }}>
            <Button
              onClick={endInterview}
              variant="contained"
              color={interviewActive ? "error" : "success"}
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                fontSize: "1.1rem",
                background: interviewActive
                  ? "linear-gradient(45deg, #f44336 30%, #ff6d6d 90%)"
                  : "linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)",
              }}
            >
              {interviewActive ? "End Interview" : "View Report"}
            </Button>
          </Box>
        </Container>

        <Dialog 
          open={permissionDialogOpen} 
          onClose={() => setPermissionDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Warning color="primary" />
              Permissions Status
            </Box>
          </DialogTitle>
          <DialogContent>
            <PermissionCheck />
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                If permissions are denied, please check your browser settings and allow access to microphone and camera.
              </Typography>
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPermissionDialogOpen(false)}>
              Close
            </Button>
            <Button 
              onClick={() => {
                setPermissionDialogOpen(false);
                startUserVideo();
              }}
              variant="contained"
            >
              Retry Camera
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}