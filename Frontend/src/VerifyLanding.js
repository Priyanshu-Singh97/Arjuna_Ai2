import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function VerifyLanding() {
  const query = useQuery();
  const token = query.get("token");
  const [message, setMessage] = useState("Verifying your email...");
  const navigate = useNavigate();

  useEffect(() => {
    async function verify() {
      try {
        const response = await fetch(`http://localhost:8000/verify-email?token=${token}`);
        const data = await response.json();

        if (!response.ok) {
          setMessage(data.detail || "Verification failed.");
          return;
        }

        setMessage(data.msg);
        setTimeout(() => navigate("/login"), 3000);
      } catch {
        setMessage("Unable to connect. Please try later.");
      }
    }

    if (token) {
      verify();
    } else {
      setMessage("Invalid verification link.");
    }
  }, [token, navigate]);

  return (
    <div style={{ margin: 20 }}>
      <h2>{message}</h2>
    </div>
  );
}
