

// Using Material Ui
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Box, Button, TextField, Typography, Alert, Link } from "@mui/material";

// export default function Login({ onLoginSuccess }) {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [message, setMessage] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleLogin = async () => {
//     setLoading(true);
//     setMessage("");
//     try {
//       const formData = new URLSearchParams();
//       formData.append("username", email);
//       formData.append("password", password);

//       const res = await fetch("http://localhost:8000/token", {
//         method: "POST",
//         headers: { "Content-Type": "application/x-www-form-urlencoded" },
//         body: formData.toString(),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         setMessage(data.detail || "Login failed");
//         setLoading(false);
//         return;
//       }

//       localStorage.setItem("access_token", data.access_token);
//       setMessage("Login successful!");
//       setLoading(false);
//       onLoginSuccess();
//     } catch {
//       setMessage("Failed to connect to server");
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
//         Login
//       </Typography>

//       {message && (
//         <Alert severity={message.includes("success") ? "success" : "error"} sx={{ mb: 2 }}>
//           {message}
//         </Alert>
//       )}

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
//         onClick={handleLogin}
//         disabled={loading || !email || !password}
//       >
//         {loading ? "Logging in..." : "Login"}
//       </Button>

//       <Typography variant="body2" sx={{ mt: 3 }}>
//         Don't have an account?{" "}
//         <Link href="#" onClick={(e) => { e.preventDefault(); navigate("/register"); }} underline="hover">
//           Register
//         </Link>
//       </Typography>
//     </Box>
//   );
// }


// This crashes when trying to reLogin into the platform
// import React, { useState } from "react";
// import {
//   Box,
//   Typography,
//   TextField,
//   Button,
//   Alert,
//   Link,
//   CircularProgress,
// } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";

// export default function Login({ onLoginSuccess }) {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [message, setMessage] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleLogin = async () => {
//     setLoading(true);
//     setMessage("");
//     try {
//       const formData = new URLSearchParams();
//       formData.append("username", email);
//       formData.append("password", password);

//       const res = await fetch("http://localhost:8000/token", {
//         method: "POST",
//         headers: { "Content-Type": "application/x-www-form-urlencoded" },
//         body: formData.toString(),
//       });

//       const data = await res.json();

//       if (res.ok) {
//   localStorage.setItem("access_token", data.access_token);
//   setTimeout(() => {
//     navigate("/welcome");  // Make sure this is /welcome not /
//   }, 2500);
// }
//       if (!res.ok) {
//         setMessage(data.detail || "Login failed");
//         setLoading(false);
//         return;
//       }

//       localStorage.setItem("access_token", data.access_token);
//       setMessage("Login successful!");
//       setLoading(false);
//       onLoginSuccess();
//     } catch {
//       setMessage("Failed to connect to server");
//       setLoading(false);
//     }
//   };

//   return (
//     <Box
//       sx={{
//         minHeight: "100vh",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         background: "linear-gradient(135deg, #0A192F, #1E3A8A, #3B82F6)",
//         color: "#fff",
//         fontFamily: "'Poppins', sans-serif",
//       }}
//     >
//       <motion.div
//         initial={{ opacity: 0, y: 40 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6 }}
//       >
//         <Box
//           sx={{
//             width: 380,
//             p: 5,
//             borderRadius: 4,
//             backdropFilter: "blur(15px)",
//             background: "rgba(255, 255, 255, 0.08)",
//             boxShadow: "0 0 40px rgba(0, 255, 255, 0.2)",
//             textAlign: "center",
//             border: "1px solid rgba(255,255,255,0.15)",
//           }}
//         >
//           <Typography
//             variant="h3"
//             sx={{
//               fontWeight: "700",
//               background: "linear-gradient(90deg, #3B82F6, #06B6D4)",
//               WebkitBackgroundClip: "text",
//               WebkitTextFillColor: "transparent",
//               mb: 1,
//             }}
//           >
//             Arjuna AI
//           </Typography>
//           <Typography variant="subtitle2" sx={{ mb: 3, color: "#CBD5E1" }}>
//             Welcomes You Onboard
//           </Typography>

//           {message && (
//             <Alert
//               severity={message.includes("successful") ? "success" : "error"}
//               sx={{
//                 mb: 2,
//                 borderRadius: 2,
//                 backgroundColor: "rgba(255,255,255,0.1)",
//                 color: "#fff",
//               }}
//             >
//               {message}
//             </Alert>
//           )}

//           <TextField
//             variant="outlined"
//             label="Email"
//             fullWidth
//             sx={{
//               mb: 3,
//               input: { color: "#fff" },
//               "& .MuiOutlinedInput-root": {
//                 "& fieldset": { borderColor: "#3B82F6" },
//                 "&:hover fieldset": { borderColor: "#60A5FA" },
//               },
//               "& .MuiInputLabel-root": { color: "#A5B4FC" },
//             }}
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             disabled={loading}
//           />

//           <TextField
//             variant="outlined"
//             label="Password"
//             type="password"
//             fullWidth
//             sx={{
//               mb: 4,
//               input: { color: "#fff" },
//               "& .MuiOutlinedInput-root": {
//                 "& fieldset": { borderColor: "#3B82F6" },
//                 "&:hover fieldset": { borderColor: "#60A5FA" },
//               },
//               "& .MuiInputLabel-root": { color: "#A5B4FC" },
//             }}
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             disabled={loading}
//           />

//           <Button
//             variant="contained"
//             fullWidth
//             disabled={loading || !email || !password}
//             onClick={handleLogin}
//             sx={{
//               py: 1.5,
//               fontWeight: "bold",
//               fontSize: "1rem",
//               borderRadius: 2,
//               background: "linear-gradient(90deg, #3B82F6, #06B6D4)",
//               boxShadow: "0 0 20px rgba(59,130,246,0.5)",
//               transition: "0.3s",
//               "&:hover": {
//                 background: "linear-gradient(90deg, #2563EB, #0EA5E9)",
//                 boxShadow: "0 0 30px rgba(14,165,233,0.6)",
//               },
//             }}
//           >
//             {loading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Login"}
//           </Button>

//           <Typography variant="body2" sx={{ mt: 3, color: "#E2E8F0" }}>
//             Don’t have an account?{" "}
//             <Link
//               href="#"
//               underline="hover"
//               sx={{
//                 color: "#60A5FA",
//                 fontWeight: "bold",
//                 "&:hover": { color: "#93C5FD" },
//               }}
//               onClick={(e) => {
//                 e.preventDefault();
//                 navigate("/register");
//               }}
//             >
//               Register
//             </Link>
//           </Typography>
//         </Box>
//       </motion.div>
//     </Box>
//   );
// }



// New Version

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
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function Login() {
  const navigate = useNavigate();
  const { logIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setMessage("");

    try {
      // Use URLSearchParams for form-urlencoded format
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      console.log("Attempting login for:", email);

      const res = await fetch("http://localhost:8000/token", {
        method: "POST",
        headers: { 
          "Content-Type": "application/x-www-form-urlencoded" 
        },
        body: formData.toString(),
      });

      const data = await res.json();
      console.log("Response:", data);

      if (res.ok) {
        // Success - store token and user data
        const token = data.access_token;
        const userData = data.user || { email: email, name: "User" };
        
        // Store in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        
        // Call auth context login
        if (logIn) {
          logIn(token, userData);
        }
        
        setMessage("Login successful! Redirecting...");
        
        // Redirect after short delay
        setTimeout(() => {
          navigate("/welcome");
        }, 1000);
        
      } else {
        // Error handling
        const errorMsg = data.detail || data.message || "Login failed";
        setMessage(errorMsg);
        setLoading(false);
      }

    } catch (error) {
      console.error("Login error:", error);
      setMessage("Failed to connect to server. Please check if backend is running.");
      setLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && email && password && !loading) {
      handleLogin();
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
            width: 380,
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
            Welcomes You Onboard
          </Typography>

          {message && (
            <Alert 
              severity={message.includes("successful") ? "success" : "error"} 
              sx={{ mb: 2 }}
            >
              {message}
            </Alert>
          )}

          <TextField
            label="Email"
            fullWidth
            type="email"
            autoComplete="email"
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
            onKeyPress={handleKeyPress}
            disabled={loading}
          />

          <TextField
            label="Password"
            type="password"
            fullWidth
            autoComplete="current-password"
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
            onKeyPress={handleKeyPress}
            disabled={loading}
          />

          <Button
            variant="contained"
            fullWidth
            disabled={!email || !password || loading}
            onClick={handleLogin}
            sx={{
              py: 1.5,
              fontWeight: "bold",
              fontSize: "1rem",
              borderRadius: 2,
              background: "linear-gradient(90deg, #3B82F6, #06B6D4)",
              boxShadow: "0 0 20px rgba(59,130,246,0.5)",
              "&:hover": {
                background: "linear-gradient(90deg, #2563EB, #0891B2)",
              },
              "&:disabled": {
                background: "rgba(59, 130, 246, 0.3)",
                cursor: "not-allowed"
              }
            }}
          >
            {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Login"}
          </Button>

          <Typography variant="body2" sx={{ mt: 3, color: "#E2E8F0" }}>
            Don't have an account?{" "}
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
                navigate("/register");
              }}
            >
              Register
            </Link>
          </Typography>
        </Box>
      </motion.div>
    </Box>
  );
}








// import React, { useState } from "react";
// import {
//   Box, Typography, TextField, Button, Alert, Link, CircularProgress
// } from "@mui/material";
// import { motion } from "framer-motion";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "./AuthProvider";

// export default function Login() {
//   const navigate = useNavigate();
//   const { logIn } = useAuth();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [message, setMessage] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleLogin = async () => {
//     setLoading(true);
//     setMessage("");

//     try {
//       const formData = new URLSearchParams();
//       formData.append("username", email);
//       formData.append("password", password);

//       const res = await fetch("http://localhost:8000/token", {
//         method: "POST",
//         headers: { "Content-Type": "application/x-www-form-urlencoded" },
//         body: formData.toString(),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         // Backend sends detail as string always
//         setMessage(typeof data.detail === "string" ? data.detail : "Login failed");
//         setLoading(false);
//         return;
//       }

//       // ✅ Success
//       const token = data.access_token;
//       const user = data.user || { email, name: "User" };

//       localStorage.setItem("token", token);
//       localStorage.setItem("user", JSON.stringify(user));

//       if (logIn) logIn(token, user);

//       setMessage("Login successful! Redirecting...");

//       setTimeout(() => navigate("/welcome"), 1000);

//     } catch (err) {
//       setMessage("Cannot connect to server. Is backend running?");
//       setLoading(false);
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === "Enter" && email && password && !loading) handleLogin();
//   };

//   return (
//     <Box
//       sx={{
//         minHeight: "100vh",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         background: "linear-gradient(135deg, #0A192F, #1E3A8A, #3B82F6)",
//         color: "#fff",
//       }}
//     >
//       <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
//         <Box sx={{ width: 380, p: 5, borderRadius: 4, backdropFilter: "blur(15px)", background: "rgba(255,255,255,0.08)" }}>
          
//           <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>Arjuna AI</Typography>
//           <Typography variant="subtitle2" sx={{ mb: 2 }}>Welcomes You Onboard</Typography>

//           {message && (
//             <Alert severity={message.includes("success") ? "success" : "error"} sx={{ mb: 2 }}>
//               {message}
//             </Alert>
//           )}

//           <TextField
//             label="Email"
//             type="email"
//             fullWidth
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             onKeyPress={handleKeyPress}
//             disabled={loading}
//             sx={{ mb: 3 }}
//           />

//           <TextField
//             label="Password"
//             type="password"
//             fullWidth
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             onKeyPress={handleKeyPress}
//             disabled={loading}
//             sx={{ mb: 3 }}
//           />

//           <Button
//             variant="contained"
//             fullWidth
//             disabled={!email || !password || loading}
//             onClick={handleLogin}
//           >
//             {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Login"}
//           </Button>

//           <Typography variant="body2" sx={{ mt: 3 }}>
//             Don't have an account?
//             <Link href="#" underline="hover" sx={{ ml: 1 }} onClick={(e) => { e.preventDefault(); navigate("/register"); }}>
//               Register
//             </Link>
//           </Typography>
//         </Box>
//       </motion.div>
//     </Box>
//   );
// }
