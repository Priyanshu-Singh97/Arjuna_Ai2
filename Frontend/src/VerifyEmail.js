import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function VerifyEmail() {
  const query = useQuery();
  const token = query.get("token");
  const [message, setMessage] = useState("Verifying...");
  const navigate = useNavigate();

  useEffect(() => {
    async function verify() {
      try {
        const res = await fetch(`http://localhost:8000/verify-email?token=${token}`);
        const data = await res.json();

        if (!res.ok) {
          setMessage(data.detail || "Verification failed");
          return;
        }

        setMessage(data.msg);
        setTimeout(() => navigate("/login"), 3000);
      } catch (err) {
        setMessage("Error connecting to server");
      }
    }

    if (token) {
      verify();
    } else {
      setMessage("Invalid verification link");
    }
  }, [token, navigate]);

  return (
    <div style={{ margin: 20 }}>
      <h2>{message}</h2>
    </div>
  );
}
