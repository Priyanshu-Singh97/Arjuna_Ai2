import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import {
  Psychology,
  EmojiEvents,
  TrendingUp,
  QuestionAnswer,
  MenuBook,
  AutoAwesome,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: <Psychology sx={{ fontSize: 48 }} />,
      title: "AI-Powered Learning",
      description: "Adaptive learning paths personalized to your strengths and weaknesses",
    },
    {
      icon: <EmojiEvents sx={{ fontSize: 48 }} />,
      title: "Mock Interviews",
      description: "Practice with AI interviewers that simulate real interview scenarios",
    },
    {
      icon: <QuestionAnswer sx={{ fontSize: 48 }} />,
      title: "Instant Feedback",
      description: "Get detailed analysis and improvement suggestions in real-time",
    },
    {
      icon: <TrendingUp sx={{ fontSize: 48 }} />,
      title: "Progress Tracking",
      description: "Monitor your improvement with comprehensive analytics dashboards",
    },
    {
      icon: <MenuBook sx={{ fontSize: 48 }} />,
      title: "Practice Tests",
      description: "Access thousands of questions across multiple exam categories",
    },
    {
      icon: <AutoAwesome sx={{ fontSize: 48 }} />,
      title: "Smart Recommendations",
      description: "AI suggests topics and resources based on your learning pattern",
    },
  ];

  const steps = [
    { step: "01", title: "Create Account", desc: "Sign up and tell us about your goals" },
    { step: "02", title: "Start Learning", desc: "Practice with AI-powered questions and mock interviews" },
    { step: "03", title: "Track Progress", desc: "Monitor your improvement and achieve your goals" },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a, #1e3a8a, #0f172a)",
        color: "#fff",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {/* Navigation */}
      <AppBar
        position="fixed"
        sx={{
          background: "rgba(15, 23, 42, 0.8)",
          backdropFilter: "blur(10px)",
          boxShadow: "none",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", py: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: "linear-gradient(135deg, #3B82F6, #06B6D4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AutoAwesome />
            </Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                background: "linear-gradient(90deg, #3B82F6, #06B6D4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Arjuna AI
            </Typography>
          </Box>

          {/* Desktop Menu */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 3, alignItems: "center" }}>
            <Button href="#features" sx={{ color: "#fff", "&:hover": { color: "#06B6D4" } }}>
              Features
            </Button>
            <Button href="#how-it-works" sx={{ color: "#fff", "&:hover": { color: "#06B6D4" } }}>
              How It Works
            </Button>
            <Button
              onClick={() => navigate("/login")}
              variant="outlined"
              sx={{
                borderColor: "#3B82F6",
                color: "#fff",
                borderWidth: 2,
                fontWeight: 600,
                "&:hover": {
                  borderColor: "#60A5FA",
                  borderWidth: 2,
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                },
              }}
            >
              Login
            </Button>
            <Button
              onClick={() => navigate("/register")}
              variant="contained"
              sx={{
                background: "linear-gradient(90deg, #3B82F6, #06B6D4)",
                fontWeight: 600,
                boxShadow: "0 0 20px rgba(59,130,246,0.5)",
                "&:hover": {
                  background: "linear-gradient(90deg, #2563EB, #0EA5E9)",
                  boxShadow: "0 0 30px rgba(14,165,233,0.6)",
                  transform: "scale(1.05)",
                },
              }}
            >
              Register
            </Button>
          </Box>

          {/* Mobile Menu Button */}
          <IconButton
            sx={{ display: { xs: "block", md: "none" }, color: "#fff" }}
            onClick={() => setMobileMenuOpen(true)}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
        <Box
          sx={{
            width: 250,
            background: "linear-gradient(135deg, #0f172a, #1e3a8a)",
            height: "100%",
            color: "#fff",
          }}
        >
          <List>
            <ListItem>
              <ListItemButton href="#features" onClick={() => setMobileMenuOpen(false)}>
                <ListItemText primary="Features" />
              </ListItemButton>
            </ListItem>
            <ListItem>
              <ListItemButton href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>
                <ListItemText primary="How It Works" />
              </ListItemButton>
            </ListItem>
            <ListItem>
              <Button
                fullWidth
                onClick={() => navigate("/login")}
                variant="outlined"
                sx={{
                  borderColor: "#3B82F6",
                  color: "#fff",
                  borderWidth: 2,
                }}
              >
                Login
              </Button>
            </ListItem>
            <ListItem>
              <Button
                fullWidth
                onClick={() => navigate("/register")}
                variant="contained"
                sx={{
                  background: "linear-gradient(90deg, #3B82F6, #06B6D4)",
                  fontWeight: 600,
                }}
              >
                Register
              </Button>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Hero Section */}
      <Box sx={{ pt: 16, pb: 10, px: 3 }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ textAlign: "center" }}>
              <Box
                sx={{
                  display: "inline-block",
                  mb: 3,
                  px: 3,
                  py: 1,
                  borderRadius: 10,
                  background: "rgba(59, 130, 246, 0.2)",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                }}
              >
                <Typography sx={{ fontSize: "0.9rem", color: "#67E8F9" }}>
                  🚀 AI-Powered Exam & Interview Prep
                </Typography>
              </Box>

              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: "2.5rem", md: "4rem" },
                  fontWeight: 700,
                  mb: 3,
                  lineHeight: 1.2,
                }}
              >
                Master Your
                <br />
                <span
                  style={{
                    background: "linear-gradient(90deg, #60A5FA, #06B6D4, #3B82F6)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Exams & Interviews
                </span>
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  mb: 5,
                  color: "#CBD5E1",
                  maxWidth: 700,
                  mx: "auto",
                  lineHeight: 1.6,
                }}
              >
                Train with advanced AI that adapts to your learning style. Get personalized
                feedback, practice with realistic scenarios, and achieve your goals faster.
              </Typography>

              <Button
                variant="outlined"
                size="large"
                sx={{
                  borderColor: "#3B82F6",
                  color: "#fff",
                  borderWidth: 2,
                  px: 5,
                  py: 2,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  "&:hover": {
                    borderWidth: 2,
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                  },
                }}
              >
                Watch Demo
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Features Section */}
     {/* Features Section */}
      <Box id="features" sx={{ py: 10, px: 3, background: "rgba(0,0,0,0.2)" }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Typography variant="h2" sx={{ fontSize: { xs: "2rem", md: "3rem" }, fontWeight: 700, mb: 2 }}>
              Powerful Features for
              <br />
              <span
                style={{
                  background: "linear-gradient(90deg, #60A5FA, #06B6D4)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Your Success
              </span>
            </Typography>
            <Typography variant="h6" sx={{ color: "#CBD5E1" }}>
              Everything you need to ace your exams and interviews in one intelligent platform
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, justifyContent: "center" }}>
            {features.map((feature, idx) => (
              <Box
                key={idx}
                sx={{
                  width: { xs: "100%", sm: "calc(50% - 12px)", lg: "calc(33.333% - 16px)" },
                  minWidth: { xs: "100%", sm: "280px", lg: "300px" },
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card
                    sx={{
                      background: "rgba(255, 255, 255, 0.05)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 3,
                      height: 300,
                      display: "flex",
                      flexDirection: "column",
                      transition: "all 0.3s",
                      "&:hover": {
                        borderColor: "rgba(6, 182, 212, 0.5)",
                        boxShadow: "0 0 30px rgba(6, 182, 212, 0.2)",
                        transform: "translateY(-5px)",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 4, display: "flex", flexDirection: "column", height: "100%" }}>
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: 2,
                          background: "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(6, 182, 212, 0.2))",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mb: 3,
                          color: "#06B6D4",
                          flexShrink: 0,
                        }}
                      >
                        {feature.icon}
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                        {feature.title}
                      </Typography>
                      <Typography sx={{ color: "#CBD5E1", lineHeight: 1.6, fontSize: "0.95rem" }}>
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>


      {/* How It Works */}
      <Box id="how-it-works" sx={{ py: 10, px: 3 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Typography variant="h2" sx={{ fontSize: { xs: "2rem", md: "3rem" }, fontWeight: 700, mb: 2 }}>
              How It Works
            </Typography>
            <Typography variant="h6" sx={{ color: "#CBD5E1" }}>
              Get started in three simple steps
            </Typography>
          </Box>

          <Grid container spacing={5}>
            {steps.map((item, idx) => (
              <Grid item xs={12} md={4} key={idx}>
                <Box sx={{ textAlign: "center" }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #3B82F6, #06B6D4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 3,
                      fontSize: "2rem",
                      fontWeight: 700,
                    }}
                  >
                    {item.step}
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                    {item.title}
                  </Typography>
                  <Typography sx={{ color: "#CBD5E1" }}>{item.desc}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: 10,
          px: 3,
          background: "linear-gradient(90deg, rgba(37, 99, 235, 0.2), rgba(6, 182, 212, 0.2))",
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h2" sx={{ fontSize: { xs: "2rem", md: "3rem" }, fontWeight: 700, mb: 3 }}>
              Ready to Transform Your Preparation?
            </Typography>
            <Typography variant="h6" sx={{ color: "#CBD5E1", mb: 5 }}>
              Join thousands of successful candidates who achieved their dreams with Arjuna AI
            </Typography>
            <Button
              onClick={() => navigate("/register")}
              variant="contained"
              size="large"
              sx={{
                background: "linear-gradient(90deg, #3B82F6, #06B6D4)",
                px: 6,
                py: 2,
                fontSize: "1.2rem",
                fontWeight: 700,
                boxShadow: "0 0 30px rgba(59,130,246,0.5)",
                "&:hover": {
                  background: "linear-gradient(90deg, #2563EB, #0EA5E9)",
                  boxShadow: "0 0 40px rgba(14,165,233,0.6)",
                  transform: "scale(1.05)",
                },
              }}
            >
              Get Started Free
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 6, px: 3, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "space-between",
              alignItems: "center",
              gap: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: "linear-gradient(135deg, #3B82F6, #06B6D4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AutoAwesome />
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  background: "linear-gradient(90deg, #3B82F6, #06B6D4)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Arjuna AI
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 4 }}>
              <Button href="#" sx={{ color: "#CBD5E1", "&:hover": { color: "#06B6D4" } }}>
                About
              </Button>
              <Button href="#" sx={{ color: "#CBD5E1", "&:hover": { color: "#06B6D4" } }}>
                Contact
              </Button>
              <Button href="#" sx={{ color: "#CBD5E1", "&:hover": { color: "#06B6D4" } }}>
                Privacy
              </Button>
              <Button href="#" sx={{ color: "#CBD5E1", "&:hover": { color: "#06B6D4" } }}>
                Terms
              </Button>
            </Box>
          </Box>

          <Typography sx={{ textAlign: "center", mt: 4, color: "#94A3B8" }}>
            &copy; 2025 Arjuna AI. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}