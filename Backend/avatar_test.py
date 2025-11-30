# avatar_test_backend.py - Separate test backend
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Avatar Test Backend")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MorphTestRequest(BaseModel):
    target_name: str
    intensity: float = 1.0

@app.get("/test-avatar-targets")
async def test_avatar_targets():
    """Test endpoint to check available morph targets"""
    try:
        # This is just for testing - returns common morph target names
        common_targets = [
            "viseme_sil", "viseme_aa", "viseme_PP", "viseme_CH", "viseme_DD",
            "viseme_E", "viseme_FF", "viseme_kk", "viseme_TH", "viseme_I",
            "viseme_O", "viseme_U", "viseme_RR", "viseme_SS", "viseme_nn",
            "eyesClosed", "eyesLookUp", "eyesLookDown", "mouthSmile",
            "mouthOpen", "browUp", "browDown", "relax", "relaxed", "pose_relax",
            "arms_down", "idle", "neutral", "rest", "calm"
        ]
        
        logger.info("🎯 Testing common morph targets")
        return {
            "available_targets": common_targets,
            "message": "This is a test endpoint to identify working morph targets"
        }
        
    except Exception as e:
        logger.error(f"❌ Test error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/test-morph-effect")
async def test_morph_effect(request: MorphTestRequest):
    """Test individual morph target effect"""
    try:
        logger.info(f"🧪 Testing morph target: {request.target_name} with intensity {request.intensity}")
        
        # Simulate testing different targets
        test_results = {
            "target_name": request.target_name,
            "intensity": request.intensity,
            "effect_description": f"Testing {request.target_name} at {request.intensity} intensity",
            "is_pose_related": any(pose in request.target_name.lower() for pose in ['relax', 'arm', 'pose', 'idle', 'neutral']),
            "is_face_related": any(face in request.target_name.lower() for face in ['eye', 'mouth', 'brow', 'viseme', 'smile'])
        }
        
        return test_results
        
    except Exception as e:
        logger.error(f"❌ Morph test error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    logger.info("🚀 Starting Avatar Test Backend on http://localhost:8001")
    uvicorn.run(app, host="0.0.0.0", port=8001)