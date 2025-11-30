import React from "react";
import { useNavigate } from "react-router-dom";

export default function VerifyNotice() {
  const navigate = useNavigate();

  return (
    <div style={{ margin: 20 }}>
      <h2>Registration Successful!</h2>
      <p>
        Thank you for registering. Please check your email inbox and click on the verification link to activate your account.
      </p>
      <p>If you don't see the email, check your spam folder.</p>
      <button onClick={() => navigate("/login")} style={{ marginTop: 20 }}>
        Go to Login
      </button>
    </div>
  );
}
