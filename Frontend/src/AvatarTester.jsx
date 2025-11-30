// WorkingPoseTester.jsx - No Material-UI, pure React solution
import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';

// Simple avatar component
function TestAvatar({ poseSettings }) {
  const { scene } = useGLTF("/Avatar.glb");

  useEffect(() => {
    if (!scene) return;

    console.log("Applying pose settings:", poseSettings);
    
    scene.traverse((obj) => {
      if (obj.isBone) {
        // Left Arm
        if (obj.name === 'LeftShoulder') {
          obj.rotation.x = poseSettings.leftShoulderX;
          obj.rotation.y = poseSettings.leftShoulderY;
          obj.rotation.z = poseSettings.leftShoulderZ;
        }
        if (obj.name === 'LeftArm') {
          obj.rotation.x = poseSettings.leftArmX;
          obj.rotation.y = poseSettings.leftArmY;
        }
        if (obj.name === 'LeftForeArm') {
          obj.rotation.x = poseSettings.leftForeArmX;
        }

        // Right Arm
        if (obj.name === 'RightShoulder') {
          obj.rotation.x = poseSettings.rightShoulderX;
          obj.rotation.y = poseSettings.rightShoulderY;
          obj.rotation.z = poseSettings.rightShoulderZ;
        }
        if (obj.name === 'RightArm') {
          obj.rotation.x = poseSettings.rightArmX;
          obj.rotation.y = poseSettings.rightArmY;
        }
        if (obj.name === 'RightForeArm') {
          obj.rotation.x = poseSettings.rightForeArmX;
        }

        // Spine
        if (obj.name === 'Spine') {
          obj.rotation.x = poseSettings.spineX;
          obj.rotation.y = poseSettings.spineY;
        }
        if (obj.name === 'Spine1') {
          obj.rotation.x = poseSettings.spine1X;
        }
        if (obj.name === 'Spine2') {
          obj.rotation.x = poseSettings.spine2X;
        }

        // Head
        if (obj.name === 'Neck') {
          obj.rotation.x = poseSettings.neckX;
        }
        if (obj.name === 'Head') {
          obj.rotation.x = poseSettings.headX;
        }
      }
    });
  }, [scene, poseSettings]);

  return (
    <primitive
      object={scene}
      scale={[2.2, 2.2, 2.2]}
      position={[0, -1, 0]}
    />
  );
}

// Custom slider component
const CustomSlider = ({ label, value, min, max, step, onChange }) => {
  return (
    <div style={{ marginBottom: '15px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
        <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{label}</span>
        <span style={{ fontSize: '14px', color: '#666' }}>{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: '100%' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#999' }}>
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};

// Custom button component
const CustomButton = ({ children, onClick, style = {} }) => {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 16px',
        margin: '5px',
        border: '1px solid #007acc',
        background: '#007acc',
        color: 'white',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        ...style
      }}
    >
      {children}
    </button>
  );
};

export default function WorkingPoseTester() {
  // Default pose settings
  const [poseSettings, setPoseSettings] = useState({
    // Left Arm
    leftShoulderX: 0.2,
    leftShoulderY: -0.3,
    leftShoulderZ: -0.1,
    leftArmX: -0.8,
    leftArmY: -0.2,
    leftForeArmX: -0.3,
    
    // Right Arm
    rightShoulderX: 0.2,
    rightShoulderY: 0.3,
    rightShoulderZ: 0.1,
    rightArmX: -0.8,
    rightArmY: 0.2,
    rightForeArmX: -0.3,
    
    // Spine
    spineX: 0.15,
    spineY: 0.05,
    spine1X: 0.1,
    spine2X: 0.05,
    
    // Head
    neckX: 0.3,
    headX: 0.1
  });

  // Pose presets
  const posePresets = {
    natural: {
      leftShoulderX: 0.2, leftShoulderY: -0.3, leftShoulderZ: -0.1,
      leftArmX: -0.8, leftArmY: -0.2, leftForeArmX: -0.3,
      rightShoulderX: 0.2, rightShoulderY: 0.3, rightShoulderZ: 0.1,
      rightArmX: -0.8, rightArmY: 0.2, rightForeArmX: -0.3,
      spineX: 0.15, spineY: 0.05, spine1X: 0.1, spine2X: 0.05,
      neckX: 0.3, headX: 0.1
    },
    relaxed: {
      leftShoulderX: 0.1, leftShoulderY: -0.2, leftShoulderZ: -0.05,
      leftArmX: -0.6, leftArmY: -0.1, leftForeArmX: -0.2,
      rightShoulderX: 0.1, rightShoulderY: 0.2, rightShoulderZ: 0.05,
      rightArmX: -0.6, rightArmY: 0.1, rightForeArmX: -0.2,
      spineX: 0.1, spineY: 0.02, spine1X: 0.05, spine2X: 0.02,
      neckX: 0.2, headX: 0.05
    },
    tPose: {
      leftShoulderX: 0, leftShoulderY: 0, leftShoulderZ: 0,
      leftArmX: 0, leftArmY: 0, leftForeArmX: 0,
      rightShoulderX: 0, rightShoulderY: 0, rightShoulderZ: 0,
      rightArmX: 0, rightArmY: 0, rightForeArmX: 0,
      spineX: 0, spineY: 0, spine1X: 0, spine2X: 0,
      neckX: 0, headX: 0
    }
  };

  const handleSliderChange = (setting, value) => {
    setPoseSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const applyPreset = (presetName) => {
    setPoseSettings({ ...posePresets[presetName] });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(poseSettings, null, 2));
    alert('Pose settings copied to clipboard!');
  };

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>Avatar Pose Tester</h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 400px',
        gap: '20px',
        height: '80vh'
      }}>
        
        {/* 3D Viewer */}
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <Canvas camera={{ position: [0, 1.6, 3], fov: 50 }}>
            <ambientLight intensity={0.8} />
            <directionalLight position={[5, 10, 5]} intensity={1} />
            <TestAvatar poseSettings={poseSettings} />
            <OrbitControls />
          </Canvas>
        </div>

        {/* Controls Panel */}
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          padding: '20px',
          overflow: 'auto'
        }}>
          <h2 style={{ color: '#333', marginBottom: '20px' }}>Pose Controls</h2>

          {/* Preset Buttons */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '10px', fontSize: '16px' }}>Presets:</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              <CustomButton onClick={() => applyPreset('natural')}>
                Natural
              </CustomButton>
              <CustomButton onClick={() => applyPreset('relaxed')}>
                Relaxed
              </CustomButton>
              <CustomButton onClick={() => applyPreset('tPose')}>
                T-Pose
              </CustomButton>
            </div>
          </div>

          {/* Left Arm Controls */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ borderBottom: '2px solid #007acc', paddingBottom: '5px', marginBottom: '10px' }}>
              Left Arm
            </h3>
            <CustomSlider label="Shoulder X" value={poseSettings.leftShoulderX} min={-2} max={2} step={0.1} onChange={(v) => handleSliderChange('leftShoulderX', v)} />
            <CustomSlider label="Shoulder Y" value={poseSettings.leftShoulderY} min={-2} max={2} step={0.1} onChange={(v) => handleSliderChange('leftShoulderY', v)} />
            <CustomSlider label="Shoulder Z" value={poseSettings.leftShoulderZ} min={-2} max={2} step={0.1} onChange={(v) => handleSliderChange('leftShoulderZ', v)} />
            <CustomSlider label="Arm X" value={poseSettings.leftArmX} min={-2} max={2} step={0.1} onChange={(v) => handleSliderChange('leftArmX', v)} />
            <CustomSlider label="Arm Y" value={poseSettings.leftArmY} min={-2} max={2} step={0.1} onChange={(v) => handleSliderChange('leftArmY', v)} />
            <CustomSlider label="Forearm X" value={poseSettings.leftForeArmX} min={-2} max={2} step={0.1} onChange={(v) => handleSliderChange('leftForeArmX', v)} />
          </div>

          {/* Right Arm Controls */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ borderBottom: '2px solid #007acc', paddingBottom: '5px', marginBottom: '10px' }}>
              Right Arm
            </h3>
            <CustomSlider label="Shoulder X" value={poseSettings.rightShoulderX} min={-2} max={2} step={0.1} onChange={(v) => handleSliderChange('rightShoulderX', v)} />
            <CustomSlider label="Shoulder Y" value={poseSettings.rightShoulderY} min={-2} max={2} step={0.1} onChange={(v) => handleSliderChange('rightShoulderY', v)} />
            <CustomSlider label="Shoulder Z" value={poseSettings.rightShoulderZ} min={-2} max={2} step={0.1} onChange={(v) => handleSliderChange('rightShoulderZ', v)} />
            <CustomSlider label="Arm X" value={poseSettings.rightArmX} min={-2} max={2} step={0.1} onChange={(v) => handleSliderChange('rightArmX', v)} />
            <CustomSlider label="Arm Y" value={poseSettings.rightArmY} min={-2} max={2} step={0.1} onChange={(v) => handleSliderChange('rightArmY', v)} />
            <CustomSlider label="Forearm X" value={poseSettings.rightForeArmX} min={-2} max={2} step={0.1} onChange={(v) => handleSliderChange('rightForeArmX', v)} />
          </div>

          {/* Spine Controls */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ borderBottom: '2px solid #007acc', paddingBottom: '5px', marginBottom: '10px' }}>
              Spine
            </h3>
            <CustomSlider label="Spine X" value={poseSettings.spineX} min={-1} max={1} step={0.05} onChange={(v) => handleSliderChange('spineX', v)} />
            <CustomSlider label="Spine Y" value={poseSettings.spineY} min={-1} max={1} step={0.05} onChange={(v) => handleSliderChange('spineY', v)} />
            <CustomSlider label="Spine1 X" value={poseSettings.spine1X} min={-1} max={1} step={0.05} onChange={(v) => handleSliderChange('spine1X', v)} />
            <CustomSlider label="Spine2 X" value={poseSettings.spine2X} min={-1} max={1} step={0.05} onChange={(v) => handleSliderChange('spine2X', v)} />
          </div>

          {/* Head Controls */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ borderBottom: '2px solid #007acc', paddingBottom: '5px', marginBottom: '10px' }}>
              Head & Neck
            </h3>
            <CustomSlider label="Neck X" value={poseSettings.neckX} min={-1} max={1} step={0.05} onChange={(v) => handleSliderChange('neckX', v)} />
            <CustomSlider label="Head X" value={poseSettings.headX} min={-1} max={1} step={0.05} onChange={(v) => handleSliderChange('headX', v)} />
          </div>

          {/* Copy Button */}
          <CustomButton 
            onClick={copyToClipboard}
            style={{ width: '100%', marginTop: '20px', background: '#28a745' }}
          >
            Copy Pose Settings to Clipboard
          </CustomButton>
        </div>
      </div>

      {/* Current Settings Display */}
      <div style={{ 
        marginTop: '20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        padding: '20px'
      }}>
        <h2 style={{ color: '#333', marginBottom: '10px' }}>Current Pose Settings</h2>
        <pre style={{ 
          backgroundColor: '#f8f9fa',
          padding: '15px',
          borderRadius: '5px',
          border: '1px solid #e9ecef',
          overflow: 'auto',
          fontSize: '12px'
        }}>
          {JSON.stringify(poseSettings, null, 2)}
        </pre>
      </div>
    </div>
  );
}