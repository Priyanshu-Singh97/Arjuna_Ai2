// Welcome.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  TextField,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  LinearProgress,
  CircularProgress,
  Alert,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import {
  Chat as ChatIcon,
  Close as CloseIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  AccountCircle as AccountCircleIcon,
  School as SchoolIcon,
  Psychology as PsychologyIcon,
  Menu as MenuIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

// Adaptive Exam Component (Inline)
const AdaptiveExam = ({ onBack, isGuest = false }) => {
  const navigate = useNavigate();
  
  const handleStartExam = () => {
    if (isGuest) {
      alert('🔐 Please login to access Adaptive Exams and track your progress!');
      navigate('/login');
      return;
    }
    alert('Starting adaptive exam...');
    // Add your exam logic here
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ color: "#60A5FA", mb: 3 }}>
        📝 Adaptive Exam Center
      </Typography>
      
      {isGuest && (
        <Alert severity="info" sx={{ mb: 3 }}>
          🔐 Login to save your exam progress and get personalized analytics!
        </Alert>
      )}
      
      <Card sx={{ 
        p: 4, 
        borderRadius: 3, 
        background: "rgba(255,255,255,0.05)",
        border: '1px solid rgba(59, 130, 246, 0.3)',
      }}>
        <Typography variant="h6" sx={{ mb: 2, color: "#60A5FA" }}>
          Exam Features:
        </Typography>
        <ul style={{ color: '#CBD5E1', marginBottom: '20px' }}>
          <li>🧠 Smart question selection</li>
          <li>📊 Real-time progress tracking</li>
          <li>⏱️ Time management tools</li>
          <li>📈 Performance analytics {isGuest ? '❌' : '✅'}</li>
          <li>🎯 Personalized difficulty {isGuest ? '❌' : '✅'}</li>
        </ul>
        
        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button
            variant="contained"
            sx={{
              background: isGuest ? 'linear-gradient(90deg, #6B7280, #9CA3AF)' : 'linear-gradient(90deg, #3B82F6, #06B6D4)',
              py: 1.5,
              fontWeight: 600,
            }}
            onClick={handleStartExam}
          >
            {isGuest ? '🔐 Login to Start Exam' : '📝 Start Exam'}
          </Button>
          
          <Button
            variant="outlined"
            sx={{
              color: '#60A5FA',
              borderColor: '#60A5FA',
              py: 1.5,
            }}
            onClick={onBack}
          >
            ← Back to Exams
          </Button>
        </Box>
      </Card>
    </Box>
  );
};

export default function Welcome() {
  const navigate = useNavigate();
  const { token, user, logout } = useAuth();

  // -------------------- STATE MANAGEMENT --------------------
  const [chatOpen, setChatOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [messages, setMessages] = useState([
    { from: "bot", text: token ? `Hey ${user?.name || 'User'}! 👋 I'm Arjuna AI. How can I help you today?` : "Hey there! 👋 I'm Arjuna AI. You're browsing as a guest. Login for full features!" },
  ]);
  const [userInput, setUserInput] = useState("");
  const [streak, setStreak] = useState(0);
  const [showAdaptiveExam, setShowAdaptiveExam] = useState(false);

  const isGuest = !token;

  // Simulate streak animation (only for authenticated users)
  useEffect(() => {
    if (!isGuest) {
      let counter = 0;
      const interval = setInterval(() => {
        if (counter < 7) {
          counter++;
          setStreak(counter);
        } else clearInterval(interval);
      }, 200);
    }
  }, [isGuest]);

  // -------------------- LOGOUT HANDLER --------------------
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // -------------------- CHATBOT LOGIC --------------------
  const handleSendMessage = () => {
    if (!userInput.trim()) return;
    const userMessage = userInput.toLowerCase();
    setMessages([...messages, { from: "user", text: userInput }]);
    setUserInput("");

    let botReply = "";

    // Basic AI logic (mocked)
    if (userMessage.includes("hi") || userMessage.includes("hello")) {
      botReply = isGuest 
        ? "Hey there! 👋 You're browsing as a guest. Login to unlock all features!" 
        : `Hey ${user?.name || 'there'}! 👋 How's your day going?`;
    } else if (userMessage.includes("how are you")) {
      botReply = "I'm doing great, thanks! Hope your studies are going well. 📚";
    } else if (userMessage.includes("exam")) {
      botReply = isGuest
        ? "Exams are available! Login to track your progress and get personalized analytics. 📊"
        : "Your next exam is DBMS Midterm on 25th Oct 2025. Don't forget to revise ER diagrams!";
    } else if (userMessage.includes("interview")) {
      botReply = isGuest
        ? "You can start interviews as a guest! Login to save your session history. 🎯"
        : "Your next Avatar Interview is scheduled for 5th Nov 2025. Practice confidence! 💪";
    } else if (userMessage.includes("login") || userMessage.includes("register")) {
      botReply = "Click the Login/Register buttons in the top right to create your account! 🚀";
    } else if (userMessage.includes("guest")) {
      botReply = "As a guest, you can explore interviews and view features. Login to save progress! 📝";
    } else {
      botReply = "Hmm... I didn't quite get that. Try asking about exams, interviews, or login. 🤔";
    }

    setTimeout(() => {
      setMessages((prev) => [...prev, { from: "bot", text: botReply }]);
    }, 600);
  };

  // -------------------- SIDEBAR NAVIGATION --------------------
  const sections = [
    { name: "Dashboard", icon: <DashboardIcon /> },
    { name: "Profile", icon: <AccountCircleIcon /> },
    { name: "Exams", icon: <SchoolIcon /> },
    { name: "Avatar Interviews", icon: <PsychologyIcon /> },
  ];

  // -------------------- DASHBOARD CONTENT --------------------
  const renderDashboard = () => (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, color: "#60A5FA", fontWeight: "600" }}>
        {isGuest ? "🎯 Welcome to Arjuna AI!" : "📊 Your Learning Dashboard"}
      </Typography>

      {isGuest && (
        <Alert severity="info" sx={{ mb: 3 }}>
          👋 You're exploring as a guest. <strong>Login to unlock all features</strong> including progress tracking, personalized exams, and session history!
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3}>
        {[
          { label: "Exams Attempted", value: isGuest ? "Guest" : 12, desc: isGuest ? "Login to track" : "Total till date" },
          { label: "Interviews Attended", value: isGuest ? "Guest" : 4, desc: isGuest ? "Available as guest" : "AI-based mock sessions" },
        ].map((stat, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
            >
              <Card
                sx={{
                  borderRadius: 4,
                  backdropFilter: "blur(20px)",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  boxShadow: "0 0 25px rgba(0,255,255,0.15)",
                }}
              >
                <CardContent>
                  <Typography variant="h5" sx={{ color: "#60A5FA", mb: 1 }}>
                    {stat.label}
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: "700", mb: 0.5 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#CBD5E1" }}>
                    {stat.desc}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}

        {/* Streak Circle - Only show for authenticated users */}
        {!isGuest && (
          <Grid item xs={12} sm={6} md={4}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card
                sx={{
                  textAlign: "center",
                  borderRadius: 4,
                  p: 3,
                  backdropFilter: "blur(20px)",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, color: "#60A5FA" }}>
                  🔥 Streak So Far
                </Typography>
                <Box sx={{ position: "relative", display: "inline-flex" }}>
                  <CircularProgress
                    variant="determinate"
                    value={streak * 14.3}
                    size={100}
                    sx={{ color: "#06B6D4" }}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: "absolute",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {streak} 🔥
                    </Typography>
                  </Box>
                </Box>
                <Typography sx={{ mt: 2, color: "#CBD5E1" }}>
                  Great consistency! Keep your streak alive.
                </Typography>
              </Card>
            </motion.div>
          </Grid>
        )}

        {/* Guest Login Card */}
        {isGuest && (
          <Grid item xs={12} sm={6} md={4}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card
                sx={{
                  textAlign: "center",
                  borderRadius: 4,
                  p: 3,
                  backdropFilter: "blur(20px)",
                  background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(6,182,212,0.2))",
                  border: "1px solid rgba(59,130,246,0.4)",
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, color: "#60A5FA" }}>
                  🚀 Unlock Full Access
                </Typography>
                <Box sx={{ position: "relative", display: "inline-flex", mb: 2 }}>
                  <PersonIcon sx={{ fontSize: 60, color: "#60A5FA" }} />
                </Box>
                <Typography sx={{ mt: 2, color: "#CBD5E1", mb: 2 }}>
                  Login to access personalized features, progress tracking, and exam analytics!
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate("/login")}
                  sx={{
                    background: "linear-gradient(90deg, #3B82F6, #06B6D4)",
                    fontWeight: 600,
                  }}
                >
                  Login / Register
                </Button>
              </Card>
            </motion.div>
          </Grid>
        )}
      </Grid>

      {/* Progress Overview - Only for authenticated users */}
      {!isGuest && (
        <Box sx={{ mt: 5 }}>
          <Typography variant="h5" sx={{ mb: 1, color: "#60A5FA" }}>
            📈 Overall Progress
          </Typography>
          <LinearProgress
            variant="determinate"
            value={78}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: "rgba(255,255,255,0.1)",
              "& .MuiLinearProgress-bar": {
                background: "linear-gradient(90deg, #3B82F6, #06B6D4)",
              },
            }}
          />
          <Typography sx={{ mt: 1, color: "#CBD5E1" }}>
            You're 78% towards your semester goals. 💪
          </Typography>
        </Box>
      )}
    </Box>
  );

  // -------------------- MAIN CONTENT SWITCH --------------------
  const renderContent = () => {
    switch (activeSection) {
      case "Dashboard":
        return renderDashboard();
      case "Profile":
        return (
          <Box>
            <Typography variant="h4" sx={{ color: "#60A5FA", mb: 2 }}>
              👤 {isGuest ? "Guest Mode" : "Student Profile"}
            </Typography>
            <Card sx={{ p: 3, borderRadius: 3, background: "rgba(255,255,255,0.05)" }}>
              {isGuest ? (
                <Box>
                  <Typography sx={{ mb: 2 }}>You're currently browsing as a guest.</Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate("/login")}
                    sx={{
                      background: "linear-gradient(90deg, #3B82F6, #06B6D4)",
                    }}
                  >
                    Login to Create Profile
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Typography>Name: {user?.name || 'User'}</Typography>
                  <Typography>Email: {user?.email || 'user@example.com'}</Typography>
                  <Typography>Course: BCA</Typography>
                  <Typography>Batch: 2025</Typography>
                </Box>
              )}
            </Card>
          </Box>
        );
      
      case "Exams":
        if (showAdaptiveExam) {
          return <AdaptiveExam onBack={() => setShowAdaptiveExam(false)} isGuest={isGuest} />;
        }
        return (
          <Box>
            <Typography variant="h4" sx={{ color: "#60A5FA", mb: 3 }}>
              🧠 Exam Center
            </Typography>
            
            {isGuest && (
              <Alert severity="info" sx={{ mb: 3 }}>
                🔐 Login to access Adaptive Exams and track your progress!
              </Alert>
            )}
            
            <Grid container spacing={3}>
              {/* Adaptive Exam Card */}
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  background: "rgba(255,255,255,0.05)",
                  border: isGuest ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(59, 130, 246, 0.3)',
                  transition: 'all 0.3s',
                  '&:hover': {
                    borderColor: isGuest ? 'rgba(255,255,255,0.3)' : '#3B82F6',
                    transform: 'translateY(-4px)',
                    boxShadow: isGuest ? '0 8px 24px rgba(255,255,255,0.1)' : '0 8px 24px rgba(59, 130, 246, 0.2)'
                  }
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{
                      width: 50,
                      height: 50,
                      borderRadius: 2,
                      background: isGuest ? 'linear-gradient(135deg, #6B7280, #9CA3AF)' : 'linear-gradient(135deg, #3B82F6, #06B6D4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      📝
                    </Box>
                    <Box sx={{
                      px: 2,
                      py: 0.5,
                      borderRadius: 2,
                      background: isGuest ? 'rgba(107, 114, 128, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                      color: isGuest ? '#9CA3AF' : '#22C55E',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      height: 'fit-content'
                    }}>
                      {isGuest ? 'LOGIN REQUIRED' : 'ACTIVE'}
                    </Box>
                  </Box>
                  
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    Adaptive Exam System
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#CBD5E1', mb: 3 }}>
                    {isGuest 
                      ? 'Login to access smart exams with adaptive difficulty and detailed analytics.' 
                      : 'Smart exams with adaptive difficulty, real-time analytics, and detailed feedback.'
                    }
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#CBD5E1', fontSize: '0.9rem' }}>
                      <span>⏱️</span>
                      <span>Duration: 30-45 minutes</span>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#CBD5E1', fontSize: '0.9rem' }}>
                      <span>📈</span>
                      <span>Difficulty: Adaptive</span>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#CBD5E1', fontSize: '0.9rem' }}>
                      <span>🎯</span>
                      <span>Questions: 15 MCQs</span>
                    </Box>
                  </Box>
                  
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => isGuest ? navigate('/login') : setShowAdaptiveExam(true)}
                    sx={{
                      background: isGuest ? 'linear-gradient(90deg, #6B7280, #9CA3AF)' : 'linear-gradient(90deg, #3B82F6, #06B6D4)',
                      py: 1.5,
                      fontWeight: 600,
                      '&:hover': {
                        boxShadow: isGuest ? '0 4px 20px rgba(107, 114, 128, 0.4)' : '0 4px 20px rgba(59, 130, 246, 0.4)'
                      }
                    }}
                  >
                    {isGuest ? '🔐 Login to Start Exam' : '▶️ Start Exam'}
                  </Button>
                </Card>
              </Grid>

              {/* Traditional Exams Card */}
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  background: "rgba(255,255,255,0.05)",
                  border: '1px solid rgba(255,255,255,0.15)'
                }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>📘 Exam Information</Typography>
                  <ul style={{ color: '#CBD5E1' }}>
                    <li>📘 DBMS Midterm - 25 Oct 2025</li>
                    <li>📗 MIS Viva - 30 Oct 2025</li>
                    <li>📙 Python Practical - 5 Nov 2025</li>
                  </ul>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );
      
      case "Avatar Interviews":
        return (
          <Box>
            <Typography variant="h4" sx={{ color: "#60A5FA", mb: 2 }}>
              🤖 Avatar-Based Interviews
            </Typography>
            
            {isGuest && (
              <Alert severity="info" sx={{ mb: 3 }}>
                🎯 You can practice interviews as a guest! Login to save your session history and get personalized feedback.
              </Alert>
            )}
            
            <Card sx={{ p: 3, borderRadius: 3, background: "rgba(255,255,255,0.05)" }}>
              <Typography sx={{ mb: 2 }}>
                Practice with AI-driven avatars to enhance your communication and soft skills.
                {isGuest && " Start immediately as a guest!"}
              </Typography>
              <Button
                variant="contained"
                sx={{
                  mt: 2,
                  background: "linear-gradient(90deg, #3B82F6, #06B6D4)",
                }}
                onClick={() => navigate("/interview")}
              >
                {isGuest ? "🎯 Start Interview as Guest" : "Start Interview"}
              </Button>
            </Card>
          </Box>
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0A192F, #1E3A8A, #3B82F6)",
        color: "#fff",
        fontFamily: "'Poppins', sans-serif",
        p: 3,
      }}
    >
      {/* -------------------- TOP BAR -------------------- */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: "#60A5FA" }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Arjuna AI
          </Typography>
        </Box>
        
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {isGuest ? (
            <>
              <Button
                onClick={() => navigate("/login")}
                sx={{
                  color: "#fff",
                  borderRadius: 2,
                  background: "linear-gradient(90deg, #3B82F6, #06B6D4)",
                }}
              >
                Login
              </Button>
              <Button
                onClick={() => navigate("/register")}
                sx={{
                  color: "#3B82F6",
                  borderRadius: 2,
                  border: "1px solid #3B82F6",
                }}
              >
                Register
              </Button>
            </>
          ) : (
            <Button
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{
                color: "#fff",
                borderRadius: 2,
                background: "linear-gradient(90deg, #3B82F6, #06B6D4)",
              }}
            >
              Logout
            </Button>
          )}
        </Box>
      </Box>

      {/* Sidebar Drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box
          sx={{
            width: 250,
            background: "linear-gradient(180deg, #0A192F, #1E3A8A)",
            height: "100%",
            color: "#fff",
            p: 2,
          }}
        >
          <Typography variant="h5" sx={{ mb: 3, textAlign: "center", color: "#60A5FA" }}>
            {isGuest ? "Guest Navigation" : "Navigation"}
          </Typography>
          <List>
            {sections.map((sec) => (
              <ListItemButton
                key={sec.name}
                onClick={() => {
                  setActiveSection(sec.name);
                  setDrawerOpen(false);
                }}
                selected={activeSection === sec.name}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  "&.Mui-selected": {
                    background: "linear-gradient(90deg, #3B82F6, #06B6D4)",
                  },
                }}
              >
                {sec.icon}
                <ListItemText sx={{ ml: 2 }} primary={sec.name} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* -------------------- MAIN CONTENT -------------------- */}
      <motion.div
        key={activeSection}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {renderContent()}
      </motion.div>

      {/* -------------------- FLOATING CHATBOT -------------------- */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "fixed",
              bottom: "90px",
              right: "30px",
              width: "320px",
              height: "400px",
              borderRadius: "16px",
              backdropFilter: "blur(20px)",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.15)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <Box
              sx={{
                p: 1.5,
                background: "linear-gradient(90deg, #3B82F6, #06B6D4)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="subtitle1">💬 Arjuna Assistant</Typography>
              <IconButton size="small" sx={{ color: "#fff" }} onClick={() => setChatOpen(false)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* Chat messages */}
            <Box sx={{ flex: 1, overflowY: "auto", p: 1.5 }}>
              {messages.map((msg, i) => (
                <Typography
                  key={i}
                  align={msg.from === "user" ? "right" : "left"}
                  sx={{
                    my: 0.5,
                    p: 1,
                    borderRadius: 2,
                    display: "inline-block",
                    background:
                      msg.from === "user"
                        ? "linear-gradient(90deg, #3B82F6, #06B6D4)"
                        : "rgba(255,255,255,0.1)",
                    color: msg.from === "user" ? "#fff" : "#E2E8F0",
                  }}
                >
                  {msg.text}
                </Typography>
              ))}
            </Box>

            {/* Input box */}
            <Box sx={{ display: "flex", p: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Type a message..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                sx={{
                  "& .MuiInputBase-root": {
                    color: "#fff",
                    background: "rgba(255,255,255,0.1)",
                  },
                }}
              />
              <IconButton onClick={handleSendMessage} sx={{ color: "#60A5FA", ml: 1 }}>
                <ChatIcon />
              </IconButton>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat Button */}
      {!chatOpen && (
        <IconButton
          onClick={() => setChatOpen(true)}
          sx={{
            position: "fixed",
            bottom: "30px",
            right: "30px",
            background: "linear-gradient(90deg, #3B82F6, #06B6D4)",
            color: "#fff",
            p: 2,
            "&:hover": { boxShadow: "0 0 20px rgba(59,130,246,0.5)" },
          }}
        >
          <ChatIcon />
        </IconButton>
      )}
    </Box>
  );
}