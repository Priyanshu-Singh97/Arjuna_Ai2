

// Using Material Ui
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Box, Button, TextField, Typography, Alert, Link } from "@mui/material";

// export default function Register() {
//   const navigate = useNavigate();
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [message, setMessage] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleRegister = async () => {
//     setLoading(true);
//     setMessage("");
//     try {
//       const res = await fetch("http://localhost:8000/register", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ name, email, password }),
//       });
//       const data = await res.json();
//       setMessage(data.msg || "Registration failed");

//       if (res.ok) {
//         navigate("/verify-notice");
//       }
//     } catch {
//       setMessage("Failed to connect to server");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Box
//       maxWidth={400}
//       mx="auto"
//       mt={8}
//       p={4}
//       boxShadow={3}
//       borderRadius={2}
//       bgcolor="background.paper"
//       textAlign="center"
//     >
//       <Typography variant="h4" component="h1" gutterBottom>
//         Register
//       </Typography>

//       {message && (
//         <Alert severity={message.includes("successful") ? "success" : "error"} sx={{ mb: 2 }}>
//           {message}
//         </Alert>
//       )}

//       <TextField
//         label="Name"
//         type="text"
//         fullWidth
//         margin="normal"
//         value={name}
//         onChange={(e) => setName(e.target.value)}
//         disabled={loading}
//       />
//       <TextField
//         label="Email"
//         type="email"
//         fullWidth
//         margin="normal"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//         disabled={loading}
//       />
//       <TextField
//         label="Password"
//         type="password"
//         fullWidth
//         margin="normal"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//         disabled={loading}
//       />

//       <Button
//         variant="contained"
//         color="primary"
//         fullWidth
//         sx={{ mt: 2 }}
//         onClick={handleRegister}
//         disabled={loading || !name || !email || !password}
//       >
//         {loading ? "Registering..." : "Register"}
//       </Button>

//       <Typography variant="body2" sx={{ mt: 3 }}>
//         Already have an account?{" "}
//         <Link href="#" onClick={(e) => { e.preventDefault(); navigate("/login"); }} underline="hover">
//           Login
//         </Link>
//       </Typography>
//     </Box>
//   );
// }

import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Link,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("http://localhost:8000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      setMessage(data.msg || "Registration failed");

      if (res.ok) {
        setTimeout(() => {
          navigate("/login");
        }, 2500);
      }
    } catch {
      setMessage("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0A192F, #1E3A8A, #3B82F6)",
        color: "#fff",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box
          sx={{
            width: 400,
            p: 5,
            borderRadius: 4,
            backdropFilter: "blur(15px)",
            background: "rgba(255, 255, 255, 0.08)",
            boxShadow: "0 0 40px rgba(0, 255, 255, 0.2)",
            textAlign: "center",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: "700",
              background: "linear-gradient(90deg, #3B82F6, #06B6D4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 1,
            }}
          >
            Arjuna AI
          </Typography>
          <Typography variant="subtitle2" sx={{ mb: 3, color: "#CBD5E1" }}>
            Create your account
          </Typography>

          {message && (
            <Alert
              severity={message.toLowerCase().includes("success") ? "success" : "error"}
              sx={{
                mb: 2,
                borderRadius: 2,
                backgroundColor: "rgba(255,255,255,0.1)",
                color: "#fff",
              }}
            >
              {message}
            </Alert>
          )}

          <TextField
            variant="outlined"
            label="Full Name"
            fullWidth
            sx={{
              mb: 3,
              input: { color: "#fff" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#3B82F6" },
                "&:hover fieldset": { borderColor: "#60A5FA" },
              },
              "& .MuiInputLabel-root": { color: "#A5B4FC" },
            }}
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />

          <TextField
            variant="outlined"
            label="Email"
            fullWidth
            sx={{
              mb: 3,
              input: { color: "#fff" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#3B82F6" },
                "&:hover fieldset": { borderColor: "#60A5FA" },
              },
              "& .MuiInputLabel-root": { color: "#A5B4FC" },
            }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          <TextField
            variant="outlined"
            label="Password"
            type="password"
            fullWidth
            sx={{
              mb: 4,
              input: { color: "#fff" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#3B82F6" },
                "&:hover fieldset": { borderColor: "#60A5FA" },
              },
              "& .MuiInputLabel-root": { color: "#A5B4FC" },
            }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          <Button
            onClick={handleRegister}
            disabled={loading || !name || !email || !password}
            variant="contained"
            fullWidth
            sx={{
              py: 1.5,
              fontWeight: "bold",
              fontSize: "1rem",
              borderRadius: 2,
              background: "linear-gradient(90deg, #3B82F6, #06B6D4)",
              boxShadow: "0 0 20px rgba(59,130,246,0.5)",
              transition: "0.3s",
              "&:hover": {
                background: "linear-gradient(90deg, #2563EB, #0EA5E9)",
                boxShadow: "0 0 30px rgba(14,165,233,0.6)",
              },
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Register"}
          </Button>

          <Typography variant="body2" sx={{ mt: 3, color: "#E2E8F0" }}>
            Already have an account?{" "}
            <Link
              href="#"
              underline="hover"
              sx={{
                color: "#60A5FA",
                fontWeight: "bold",
                "&:hover": { color: "#93C5FD" },
              }}
              onClick={(e) => {
                e.preventDefault();
                navigate("/login");
              }}
            >
              Login
            </Link>
          </Typography>
        </Box>
      </motion.div>
    </Box>
  );
}
