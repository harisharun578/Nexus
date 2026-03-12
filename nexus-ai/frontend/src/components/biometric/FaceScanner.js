import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Camera, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

// NOTE: face-api.js models must be in /public/models/
// Download from: https://github.com/justadudewhohacks/face-api.js/tree/master/weights
// Required: tiny_face_detector, face_recognition_net, face_landmark_68_net

let faceapi = null;

async function loadFaceApi() {
  if (!faceapi) {
    faceapi = await import('face-api.js');
    const MODEL_URL = '/models';
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
  }
  return faceapi;
}

export default function FaceScanner({
  mode = 'register',        // 'register' | 'login'
  onDescriptor,             // called with descriptor array (login)
  onDescriptors,            // called with array of descriptors (register)
  targetSamples = 12,
  livenessCheck = true,
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  const [status, setStatus] = useState('loading'); // loading | scanning | capturing | done | error
  const [message, setMessage] = useState('Loading AI models...');
  const [progress, setProgress] = useState(0);
  const [samples, setSamples] = useState([]);
  const [livenessState, setLivenessState] = useState({ blinks: 0, headMovements: 0 });
  const prevLandmarks = useRef(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const fa = await loadFaceApi();
        if (!mounted) return;
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 480, height: 360, facingMode: 'user' }
        });
        if (!mounted) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await new Promise(r => videoRef.current.addEventListener('loadeddata', r, { once: true }));
        }
        setStatus('scanning');
        setMessage('Position your face in the frame');
        startDetection(fa);
      } catch (err) {
        if (!mounted) return;
        setStatus('error');
        setMessage('Camera access denied. Please allow camera permissions.');
      }
    };
    init();
    return () => { mounted = false; stopCamera(); };
  }, [stopCamera]);

  const detectBlink = (landmarks) => {
    // EAR (Eye Aspect Ratio) blink detection
    const lm = landmarks.positions;
    if (!lm || lm.length < 68) return false;
    const leftEye = [lm[36], lm[37], lm[38], lm[39], lm[40], lm[41]];
    const rightEye = [lm[42], lm[43], lm[44], lm[45], lm[46], lm[47]];
    const ear = (eye) => {
      const A = Math.hypot(eye[1].x - eye[5].x, eye[1].y - eye[5].y);
      const B = Math.hypot(eye[2].x - eye[4].x, eye[2].y - eye[4].y);
      const C = Math.hypot(eye[0].x - eye[3].x, eye[0].y - eye[3].y);
      return (A + B) / (2.0 * C);
    };
    return (ear(leftEye) + ear(rightEye)) / 2 < 0.22;
  };

  const detectHeadMovement = (landmarks) => {
    if (!prevLandmarks.current) { prevLandmarks.current = landmarks; return false; }
    const nose = landmarks.positions[30];
    const prevNose = prevLandmarks.current.positions[30];
    const moved = Math.hypot(nose.x - prevNose.x, nose.y - prevNose.y) > 15;
    prevLandmarks.current = landmarks;
    return moved;
  };

  const startDetection = (fa) => {
    const collectedDescriptors = [];
    let blinkCount = 0, headMoveCount = 0;
    let eyeWasClosed = false;

    intervalRef.current = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const displaySize = { width: video.videoWidth || 480, height: video.videoHeight || 360 };
      fa.matchDimensions(canvas, displaySize);

      try {
        const detection = await fa.detectSingleFace(video, new fa.TinyFaceDetectorOptions({ scoreThreshold: 0.5 }))
          .withFaceLandmarks()
          .withFaceDescriptor();

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!detection) {
          setMessage('No face detected — center yourself');
          return;
        }

        // Draw box
        const resized = fa.resizeResults(detection, displaySize);
        const box = resized.detection.box;
        ctx.strokeStyle = 'var(--a, #00ffc8)';
        ctx.lineWidth = 2;
        ctx.strokeRect(box.x, box.y, box.width, box.height);

        // Corner brackets
        const cs = 20;
        ctx.lineWidth = 3;
        [[box.x, box.y], [box.x + box.width - cs, box.y],
         [box.x, box.y + box.height - cs], [box.x + box.width - cs, box.y + box.height - cs]
        ].forEach(([x, y], i) => {
          ctx.beginPath();
          ctx.moveTo(x + (i % 2 === 0 ? 0 : cs), y);
          ctx.lineTo(x + (i % 2 === 0 ? cs : 0), y);
          ctx.moveTo(x, y + (i < 2 ? 0 : cs));
          ctx.lineTo(x, y + (i < 2 ? cs : 0));
          ctx.stroke();
        });

        // Landmarks
        resized.landmarks.positions.forEach(pt => {
          ctx.fillStyle = 'rgba(0,255,200,0.6)';
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        });

        // Liveness checks
        if (livenessCheck) {
          const isBlinking = detectBlink(resized.landmarks);
          if (isBlinking && !eyeWasClosed) { blinkCount++; eyeWasClosed = true; setLivenessState(s => ({ ...s, blinks: blinkCount })); }
          if (!isBlinking) eyeWasClosed = false;
          if (detectHeadMovement(resized.landmarks)) { headMoveCount++; setLivenessState(s => ({ ...s, headMovements: headMoveCount })); }
        }

        const descriptor = Array.from(detection.descriptor);

        if (mode === 'login') {
          clearInterval(intervalRef.current);
          stopCamera();
          setStatus('done');
          setMessage('Face captured! Verifying...');
          onDescriptor && onDescriptor(descriptor);
          return;
        }

        // Register mode — collect samples
        const livenessOk = !livenessCheck || (blinkCount >= 1 && headMoveCount >= 2);
        if (!livenessOk) {
          setMessage(`Liveness check: blink ${blinkCount}/1 blink, move head ${headMoveCount}/2`);
          return;
        }

        // Only collect if different enough from existing
        const isDuplicate = collectedDescriptors.some(d => {
          const dist = Math.sqrt(d.reduce((sum, v, i) => sum + (v - descriptor[i]) ** 2, 0));
          return dist < 0.15;
        });
        if (!isDuplicate) {
          collectedDescriptors.push(descriptor);
          const pct = Math.round((collectedDescriptors.length / targetSamples) * 100);
          setProgress(pct);
          setSamples([...collectedDescriptors]);
          setMessage(`Capturing sample ${collectedDescriptors.length}/${targetSamples}...`);
        }

        if (collectedDescriptors.length >= targetSamples) {
          clearInterval(intervalRef.current);
          stopCamera();
          setStatus('done');
          setMessage(`${targetSamples} samples captured successfully!`);
          onDescriptors && onDescriptors(collectedDescriptors);
        }
      } catch (err) {
        // silently continue
      }
    }, 300);
  };

  const retry = () => { window.location.reload(); };

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        position: 'relative', display: 'inline-block',
        borderRadius: 16, overflow: 'hidden',
        border: `2px solid ${status === 'done' ? 'var(--ok, #00ff88)' : status === 'error' ? 'var(--danger, #ff4466)' : 'var(--a, #00ffc8)'}`,
        boxShadow: `0 0 30px ${status === 'done' ? 'rgba(0,255,136,0.3)' : 'rgba(0,255,200,0.3)'}`,
      }}>
        <video ref={videoRef} autoPlay muted playsInline
          style={{ display: 'block', width: 380, height: 285, objectFit: 'cover', background: '#000' }}/>
        <canvas ref={canvasRef}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}/>

        {/* Scan line animation */}
        {status === 'scanning' && (
          <div style={{
            position:'absolute', left:0, right:0, height:2,
            background:'linear-gradient(90deg, transparent, var(--a, #00ffc8), transparent)',
            animation:'scanLine 2.5s linear infinite', top:0
          }}/>
        )}

        {/* Corner overlay */}
        <div style={{ position:'absolute', top:8, left:8, width:20, height:20, borderTop:'2px solid var(--a)', borderLeft:'2px solid var(--a)', borderRadius:'4px 0 0 0' }}/>
        <div style={{ position:'absolute', top:8, right:8, width:20, height:20, borderTop:'2px solid var(--a)', borderRight:'2px solid var(--a)', borderRadius:'0 4px 0 0' }}/>
        <div style={{ position:'absolute', bottom:8, left:8, width:20, height:20, borderBottom:'2px solid var(--a)', borderLeft:'2px solid var(--a)', borderRadius:'0 0 0 4px' }}/>
        <div style={{ position:'absolute', bottom:8, right:8, width:20, height:20, borderBottom:'2px solid var(--a)', borderRight:'2px solid var(--a)', borderRadius:'0 0 4px 0' }}/>
      </div>

      {/* Status */}
      <div style={{ marginTop: 16 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:8 }}>
          {status === 'done' ? <CheckCircle size={16} color="var(--ok)"/> :
           status === 'error' ? <XCircle size={16} color="var(--danger)"/> :
           <Camera size={16} color="var(--a)" style={{ animation: status==='scanning' ? 'blink 1.5s ease infinite' : 'none' }}/>}
          <span style={{ fontFamily:'Rajdhani', fontSize:14, fontWeight:600,
            color: status==='done' ? 'var(--ok)' : status==='error' ? 'var(--danger)' : 'var(--t)' }}>
            {message}
          </span>
        </div>

        {mode === 'register' && status === 'scanning' && (
          <>
            <div style={{ background:'var(--card)', borderRadius:8, overflow:'hidden', height:6, margin:'8px 0' }}>
              <div style={{ width:`${progress}%`, height:'100%', background:'linear-gradient(90deg, var(--a), var(--a2))', transition:'width 0.3s', borderRadius:8 }}/>
            </div>
            <div style={{ fontSize:12, color:'var(--t3)', fontFamily:'Rajdhani' }}>
              Liveness — Blinks: {livenessState.blinks}/1 · Head moves: {livenessState.headMovements}/2
            </div>
          </>
        )}

        {status === 'error' && (
          <button onClick={retry} className="btn-ghost" style={{ marginTop:8, display:'inline-flex', alignItems:'center', gap:6 }}>
            <RefreshCw size={14}/> Retry
          </button>
        )}
      </div>
    </div>
  );
}
