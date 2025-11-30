import sys
import types
import os
import hashlib
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# ==================== PYTHON 3.13 COMPATIBILITY FIXES ====================
try:
    import audioop
except ImportError:
    class MockAudioop:
        @staticmethod
        def getsample(fragment, width, index): return 0
        @staticmethod
        def max(fragment, width): return 0
        @staticmethod
        def minmax(fragment, width): return (0, 0)
        @staticmethod
        def avg(fragment, width): return 0
        @staticmethod
        def rms(fragment, width): return 0

    audioop_module = types.ModuleType('audioop')
    for method_name in dir(MockAudioop):
        if not method_name.startswith('_'):
            setattr(audioop_module, method_name, getattr(MockAudioop, method_name))
    sys.modules['audioop'] = audioop_module

print("✅ Python 3.13 compatibility fixes applied successfully!")

# ==================== NORMAL IMPORTS ====================
import subprocess 
import whisper
import random
import io
import base64
import json
import tempfile
import asyncio
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form, BackgroundTasks, status
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt, JWTError
import google.generativeai as genai
from gtts import gTTS
from typing import List, Dict, Any, Optional
import logging
from pydub import AudioSegment
import re
import uuid
from dotenv import load_dotenv
import time
from fastapi.responses import HTMLResponse
import traceback

# ==================== DATABASE IMPORTS ====================
from database import get_db_connection, init_database

# ==================== CONFIGURATION ====================
load_dotenv()

SECRET_KEY = "_1RueE_v49cbZBT5KFx0mlDHp3izUY5WP10bU9hDH50"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Email configuration
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
EMAIL_FROM = os.getenv("EMAIL_FROM", "noreply@arjunaai.com")

# ==================== LOGGING ====================
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger("backend")

# ==================== FASTAPI APP ====================
app = FastAPI(title="Arjuna AI - Complete Backend", version="4.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== SERVICES ====================
executor = ThreadPoolExecutor(max_workers=4)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Password hashing
def get_password_hash(password: str) -> str:
    """Simple password hashing using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password using SHA256"""
    return hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password

# Email verification functions
def generate_verification_token() -> str:
    """Generate a unique verification token"""
    return hashlib.sha256(f"{uuid.uuid4()}{datetime.now().timestamp()}".encode()).hexdigest()

async def send_verification_email(email: str, name: str, verification_token: str):
    """Send verification email to user"""
    try:
        if not all([SMTP_SERVER, SMTP_USERNAME, SMTP_PASSWORD]):
            logger.warning("⚠️ Email configuration missing - verification emails disabled")
            return False

        # Create verification link
        verification_link = f"http://localhost:8000/verify-email?token={verification_token}"
        
        # Create email message
        message = MIMEMultipart()
        message["From"] = EMAIL_FROM
        message["To"] = email
        message["Subject"] = "Verify Your Arjuna AI Account"
        
        # Email body
        body = f"""
        <html>
            <body>
                <h2>Welcome to Arjuna AI, {name}!</h2>
                <p>Thank you for registering. Please verify your email address by clicking the link below:</p>
                <p><a href="{verification_link}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email Address</a></p>
                <p>Or copy and paste this link in your browser:</p>
                <p>{verification_link}</p>
                <p>This link will expire in 24 hours.</p>
                <br>
                <p>Best regards,<br>The Arjuna AI Team</p>
            </body>
        </html>
        """
        
        message.attach(MIMEText(body, "html"))
        
        # Send email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(message)
        
        logger.info(f"✅ Verification email sent to: {email}")
        return True
        
    except Exception as e:
        logger.error(f"❌ Failed to send verification email: {e}")
        return False

def is_verification_token_expired(expires_at: str) -> bool:
    """Check if verification token has expired"""
    try:
        if expires_at is None:
            return True
        expires_datetime = datetime.fromisoformat(expires_at)
        return datetime.now() > expires_datetime
    except:
        return True

# AI Configuration (Separate from JWT Auth)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        GEMINI_AVAILABLE = True
        logger.info("✅ Gemini API configured")
    except Exception as e:
        GEMINI_AVAILABLE = False
        logger.error(f"❌ Gemini API configuration failed: {e}")
else:
    GEMINI_AVAILABLE = False
    logger.warning("⚠️ Gemini API key not found")

# ==================== MODELS ====================
class UserRegister(BaseModel):
    name: str
    email: str
    password: str

class VerifyEmailRequest(BaseModel):
    token: str

class InterviewResponse(BaseModel):
    transcript: str
    question: str
    audio: str
    visemes: List[Dict[str, Any]]
    session_id: str
    timestamp: str

class MockUser:
    def __init__(self, email, name, hashed_password, is_verified=True, user_id=None):
        self.email = email
        self.name = name
        self.hashed_password = hashed_password
        self.is_verified = is_verified
        self.id = user_id

# ==================== AUTH UTILS ====================
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Get current user - CHECKS EMAIL VERIFICATION"""
    email = verify_token(token)
    if email is None:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        user_data = cursor.fetchone()
    
    if user_data is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    # CHECK IF EMAIL IS VERIFIED
    if not user_data['is_verified']:
        raise HTTPException(
            status_code=403, 
            detail="Email not verified. Please check your email for verification link."
        )
    
    return MockUser(
        email=user_data['email'],
        name=user_data['name'],
        hashed_password=user_data['hashed_password'],
        is_verified=user_data['is_verified'],
        user_id=user_data['id']
    )

async def get_current_user_optional(token: str = Depends(oauth2_scheme)):
    """Optional user dependency for endpoints that work with or without auth"""
    try:
        return await get_current_user(token)
    except HTTPException:
        return None

# ==================== INTERVIEW MANAGER ====================
class InterviewManager:
    def __init__(self):
        self.conversations = {}
        self.fallback_questions = [
            "Tell me about yourself and your background.",
            "What are your greatest strengths?",
            "Describe a challenging project you worked on.",
            "How do you handle pressure or stressful situations?",
            "Where do you see yourself in 5 years?",
            "What motivates you in your work?",
            "Tell me about a time you made a mistake and how you handled it.",
            "How do you prioritize your work?",
            "What are your salary expectations?",
            "Do you have any questions for me?"
        ]
        self.current_question_index = {}
        
        self.welcome_message = "Welcome to your AI mock interview! I'm excited to learn more about you. Let's begin with a simple introduction."

    def initialize_conversation(self, session_id: str):
        conv_id = f"session_{session_id}"
        self.conversations[conv_id] = {
            'messages': [
                {"role": "system", "content": "You are a professional AI interview coach conducting a behavioral interview."}
            ],
            'last_activity': datetime.now(),
            'has_greeted': False
        }
        self.current_question_index[session_id] = 0

    def get_fallback_question(self, session_id: str):
        if session_id not in self.current_question_index:
            self.current_question_index[session_id] = 0
        
        if self.current_question_index[session_id] < len(self.fallback_questions):
            question = self.fallback_questions[self.current_question_index[session_id]]
            self.current_question_index[session_id] += 1
            return question
        return "That covers our main questions. Is there anything else you'd like to share about your experience?"

    def add_to_conversation(self, session_id: str, role: str, content: str):
        conv_id = f"session_{session_id}"
        if conv_id not in self.conversations:
            self.initialize_conversation(session_id)
        self.conversations[conv_id]['messages'].append({"role": role, "content": content})
        self.conversations[conv_id]['last_activity'] = datetime.now()

    def get_conversation_history(self, session_id: str):
        conv_id = f"session_{session_id}"
        return self.conversations[conv_id]['messages'] if conv_id in self.conversations else []

    def reset_conversation(self, session_id: str):
        conv_id = f"session_{session_id}"
        if conv_id in self.conversations:
            del self.conversations[conv_id]
        if session_id in self.current_question_index:
            del self.current_question_index[session_id]

    def mark_greeted(self, session_id: str):
        conv_id = f"session_{session_id}"
        if conv_id in self.conversations:
            self.conversations[conv_id]['has_greeted'] = True

    def should_greet(self, session_id: str) -> bool:
        conv_id = f"session_{session_id}"
        if conv_id not in self.conversations:
            return True
        return not self.conversations[conv_id].get('has_greeted', False)

    async def generate_interview_question(self, user_answer: str, session_id: str = "default"):
        if not GEMINI_AVAILABLE:
            return self.get_fallback_question(session_id)

        try:
            conversation_history = self.get_conversation_history(session_id)
            context = "\n".join([
                f"{'Interviewer' if msg['role'] == 'assistant' else 'Candidate'}: {msg['content']}" 
                for msg in conversation_history[-4:]
            ])

            prompt = f"""You are a professional interviewer conducting a behavioral interview. 
Based on the conversation context and the candidate's latest response, ask ONE clear, relevant follow-up question.

Context:
{context}

Candidate's response: "{user_answer}"

Your follow-up interview question:"""

            loop = asyncio.get_event_loop()
            model = genai.GenerativeModel('gemini-2.0-flash-exp')
            
            response = await asyncio.wait_for(
                loop.run_in_executor(executor, lambda: model.generate_content(prompt)),
                timeout=15.0
            )

            if response and response.text:
                question = response.text.strip()
                question = re.sub(r'^["\']+|["\']+$', '', question)
                question = re.sub(r'^\d+\.\s*', '', question)
                question = re.sub(r'^Question:\s*', '', question, flags=re.IGNORECASE)

                if (question and len(question) > 10 and len(question.split()) <= 50):
                    logger.info(f"✅ Gemini generated question: {question}")
                    return question

            logger.warning("❌ Empty or invalid response from Gemini")
            return self.get_fallback_question(session_id)

        except Exception as e:
            logger.error(f"❌ Gemini API error: {str(e)}")
            return self.get_fallback_question(session_id)
    
interview_manager = InterviewManager()

# ==================== API ENDPOINTS ====================
@app.get("/")
async def root():
    return {
        "message": "Arjuna AI - Complete Backend", 
        "version": "4.0",
        "status": "running",
        "gemini_available": GEMINI_AVAILABLE,
        "database": "ready",
        "email_verification": "enabled"
    }

@app.post("/register")
async def register(user: UserRegister, background_tasks: BackgroundTasks):
    """User registration WITH email verification - DEBUG VERSION"""
    try:
        logger.info(f"🔧 Starting registration for: {user.email}")
        
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE email = ?", (user.email,))
            existing_user = cursor.fetchone()
            
            if existing_user:
                logger.warning(f"❌ Email already registered: {user.email}")
                raise HTTPException(status_code=400, detail="Email already registered")
            
            hashed_password = get_password_hash(user.password)
            verification_token = generate_verification_token()
            token_expires = (datetime.now() + timedelta(hours=24)).isoformat()
            
            logger.info(f"🔧 Generated token for: {user.email}")
            
            # Try to insert user
            cursor.execute('''
                INSERT INTO users (email, name, hashed_password, is_verified, verification_token, verification_token_expires)
                VALUES (?, ?, ?, FALSE, ?, ?)
            ''', (user.email, user.name, hashed_password, verification_token, token_expires))
            conn.commit()
            
            user_id = cursor.lastrowid
            logger.info(f"✅ User registered in database: {user.email} (ID: {user_id})")
        
        # Send verification email
        logger.info(f"🔧 Sending verification email to: {user.email}")
        email_sent = await send_verification_email(user.email, user.name, verification_token)
        logger.info(f"🔧 Email sent status: {email_sent}")
        
        return {
            "message": "Registration successful! Please check your email for verification link.",
            "status": "success",
            "user_id": user_id,
            "email_sent": email_sent
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Registration error: {str(e)}")
        logger.error(f"❌ Error type: {type(e).__name__}")
        logger.error(f"❌ Full traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@app.post("/register-quick")
async def register_quick(user: UserRegister):
    """Quick registration without email verification for testing"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE email = ?", (user.email,))
            existing_user = cursor.fetchone()
            
            if existing_user:
                raise HTTPException(status_code=400, detail="Email already registered")
            
            hashed_password = get_password_hash(user.password)
            
            cursor.execute('''
                INSERT INTO users (email, name, hashed_password, is_verified)
                VALUES (?, ?, ?, TRUE)
            ''', (user.email, user.name, hashed_password))
            conn.commit()
            
            user_id = cursor.lastrowid
        
        return {
            "message": "Quick registration successful! You can now login.",
            "status": "success", 
            "user_id": user_id
        }
        
    except Exception as e:
        logger.error(f"❌ Quick registration error: {e}")
        raise HTTPException(status_code=500, detail="Registration failed")

@app.get("/verify-email")
async def verify_email_get(token: str):
    """GET endpoint for email verification (for clickable links in emails)"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM users 
                WHERE verification_token = ? AND is_verified = FALSE
            ''', (token,))
            user_data = cursor.fetchone()
            
            if not user_data:
                # Return HTML error page
                html_content = """
                <html>
                    <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                        <h2 style="color: #ff4444;">❌ Verification Failed</h2>
                        <p>Invalid or expired verification token.</p>
                        <p>Please try registering again or request a new verification email.</p>
                        <a href="http://localhost:3000" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Return to App</a>
                    </body>
                </html>
                """
                return HTMLResponse(content=html_content, status_code=400)
            
            # Check token expiration
            if is_verification_token_expired(user_data['verification_token_expires']):
                # Generate new token
                new_token = generate_verification_token()
                new_expires = (datetime.now() + timedelta(hours=24)).isoformat()
                
                cursor.execute('''
                    UPDATE users 
                    SET verification_token = ?, verification_token_expires = ?
                    WHERE id = ?
                ''', (new_token, new_expires, user_data['id']))
                conn.commit()
                
                # Try to resend email
                await send_verification_email(user_data['email'], user_data['name'], new_token)
                
                html_content = f"""
                <html>
                    <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                        <h2 style="color: #ff8800;">⚠️ Token Expired</h2>
                        <p>Your verification token has expired.</p>
                        <p>A new verification email has been sent to {user_data['email']}.</p>
                        <p>Please check your inbox for the new link.</p>
                        <a href="http://localhost:3000" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Return to App</a>
                    </body>
                </html>
                """
                return HTMLResponse(content=html_content, status_code=400)
            
            # Mark as verified and clear token
            cursor.execute('''
                UPDATE users 
                SET is_verified = TRUE, verification_token = NULL, verification_token_expires = NULL
                WHERE id = ?
            ''', (user_data['id'],))
            conn.commit()
            
            logger.info(f"✅ Email verified via GET: {user_data['email']}")
            
            # Return success HTML page
            html_content = f"""
            <html>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                    <h2 style="color: #4CAF50;">✅ Email Verified Successfully!</h2>
                    <p>Your email {user_data['email']} has been verified.</p>
                    <p>You can now login to your Arjuna AI account.</p>
                    <a href="http://localhost:3000/login" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Login</a>
                </body>
            </html>
            """
            return HTMLResponse(content=html_content)
            
    except Exception as e:
        logger.error(f"❌ Email verification error: {e}")
        html_content = """
        <html>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                <h2 style="color: #ff4444;">❌ Server Error</h2>
                <p>Something went wrong during verification.</p>
                <p>Please try again later.</p>
                <a href="http://localhost:3000" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Return to App</a>
            </body>
        </html>
        """
        return HTMLResponse(content=html_content, status_code=500)

@app.post("/verify-email")
async def verify_email_post(request: VerifyEmailRequest):
    """POST endpoint for email verification (for API calls)"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM users 
                WHERE verification_token = ? AND is_verified = FALSE
            ''', (request.token,))
            user_data = cursor.fetchone()
            
            if not user_data:
                raise HTTPException(status_code=400, detail="Invalid or expired verification token")
            
            # Check token expiration
            if is_verification_token_expired(user_data['verification_token_expires']):
                raise HTTPException(status_code=400, detail="Verification token expired")
            
            # Mark as verified and clear token
            cursor.execute('''
                UPDATE users 
                SET is_verified = TRUE, verification_token = NULL, verification_token_expires = NULL
                WHERE id = ?
            ''', (user_data['id'],))
            conn.commit()
            
            logger.info(f"✅ Email verified via POST: {user_data['email']}")
            
            return {
                "message": "Email verified successfully! You can now login.",
                "status": "success"
            }
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Email verification error: {e}")
        raise HTTPException(status_code=500, detail="Email verification failed")

@app.post("/resend-verification")
async def resend_verification(email: str, background_tasks: BackgroundTasks):
    """Resend verification email"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM users 
                WHERE email = ? AND is_verified = FALSE
            ''', (email,))
            user_data = cursor.fetchone()
            
            if not user_data:
                raise HTTPException(status_code=400, detail="User not found or already verified")
            
            # Generate new token
            new_token = generate_verification_token()
            new_expires = (datetime.now() + timedelta(hours=24)).isoformat()
            
            cursor.execute('''
                UPDATE users 
                SET verification_token = ?, verification_token_expires = ?
                WHERE id = ?
            ''', (new_token, new_expires, user_data['id']))
            conn.commit()
            
        # Send new verification email
        email_sent = await send_verification_email(user_data['email'], user_data['name'], new_token)
        
        return {
            "message": "Verification email sent! Please check your inbox.",
            "status": "success",
            "email_sent": email_sent
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Resend verification error: {e}")
        raise HTTPException(status_code=500, detail="Failed to resend verification email")

@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login endpoint - CHECKS EMAIL VERIFICATION"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ?", (form_data.username,))
        user_data = cursor.fetchone()
    
    if not user_data:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(form_data.password, user_data['hashed_password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # CHECK IF EMAIL IS VERIFIED
    if not user_data['is_verified']:
        raise HTTPException(
            status_code=403, 
            detail="Email not verified. Please check your email for verification link."
        )
    
    # Update last login
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE email = ?", (form_data.username,))
        conn.commit()
    
    access_token = create_access_token(data={"sub": user_data['email']})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "name": user_data['name'], 
            "email": user_data['email'],
            "id": user_data['id'],
            "is_verified": user_data['is_verified']
        }
    }

@app.post("/api/auto-greeting")
async def auto_greeting(request: dict, current_user: Optional[MockUser] = Depends(get_current_user_optional)):
    """Auto-greeting endpoint for new sessions - works for both authenticated and guest users"""
    try:
        session_id = request.get("session", "default")
        user_email = current_user.email if current_user else "guest"
        
        # Generate unique session ID if default
        if session_id == "default":
            session_id = f"session_{uuid.uuid4().hex}_{int(datetime.now().timestamp())}"
        
        # Create user session only for authenticated users
        if current_user:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT OR REPLACE INTO user_sessions 
                    (user_id, session_id, is_active, start_time, conversation_history)
                    VALUES (?, ?, TRUE, CURRENT_TIMESTAMP, '[]')
                ''', (current_user.id, session_id))
                conn.commit()
        
        # Get welcome message
        interview_manager.initialize_conversation(session_id)
        welcome_message = interview_manager.welcome_message
        
        interview_manager.mark_greeted(session_id)
        interview_manager.add_to_conversation(session_id, "assistant", welcome_message)
        
        logger.info(f"✅ Auto-greeting sent: {session_id} for user: {user_email}")
        
        return {
            "text": welcome_message,
            "session_id": session_id,
            "user_authenticated": current_user is not None
        }
        
    except Exception as e:
        logger.error(f"❌ Auto-greeting error: {e}")
        return {"error": str(e)}

# Protected endpoint example
@app.get("/api/protected-data")
async def protected_data(current_user: MockUser = Depends(get_current_user)):
    """Example protected endpoint that requires verified email"""
    return {
        "message": f"Hello {current_user.name}! This is protected data.",
        "user_email": current_user.email,
        "user_id": current_user.id
    }

# Check user status
@app.get("/check-user/{email}")
async def check_user(email: str):
    """Check if user exists and verification status"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id, email, name, is_verified FROM users WHERE email = ?", (email,))
            user_data = cursor.fetchone()
            
            if user_data:
                return {
                    "exists": True,
                    "user_id": user_data['id'],
                    "email": user_data['email'],
                    "name": user_data['name'],
                    "is_verified": bool(user_data['is_verified'])
                }
            else:
                return {"exists": False}
    except Exception as e:
        return {"error": str(e)}

# Test endpoint to check email configuration
@app.get("/test-email-config")
async def test_email_config():
    """Test email configuration"""
    config_status = {
        "smtp_server": SMTP_SERVER,
        "smtp_port": SMTP_PORT,
        "smtp_username": "✅ Configured" if SMTP_USERNAME else "❌ Missing",
        "smtp_password": "✅ Configured" if SMTP_PASSWORD else "❌ Missing",
        "email_from": EMAIL_FROM,
        "email_verification_enabled": bool(SMTP_USERNAME and SMTP_PASSWORD)
    }
    return config_status

# ==================== STARTUP ====================
@app.on_event("startup")
async def startup_event():
    """Initialize application on startup"""
    try:
        init_database()
        
        logger.info("🚀 Arjuna AI Backend Started")
        logger.info(f"🤖 Gemini: {'✅ Available' if GEMINI_AVAILABLE else '⚠️ Fallback'}")
        logger.info(f"📧 Email Verification: {'✅ Enabled' if SMTP_USERNAME and SMTP_PASSWORD else '⚠️ Disabled - configure SMTP settings'}")
        logger.info("🗄️ Database: SQLite initialized and verified")
        
    except Exception as e:
        logger.error(f"❌ Startup initialization failed: {e}")

# ==================== RUN SERVER ====================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info",
        workers=1
    )