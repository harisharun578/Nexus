import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Fingerprint, CheckCircle, XCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

function bufferToBase64(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}
function base64ToBuffer(base64) {
  const bin = atob(base64);
  return new Uint8Array(bin.split('').map(c => c.charCodeAt(0))).buffer;
}

export default function FingerprintAuth({ mode = 'register', userId, onSuccess, onError }) {
  const [status, setStatus] = useState('idle'); // idle | scanning | done | error
  const [message, setMessage] = useState('');

  const registerFingerprint = async () => {
    if (!window.PublicKeyCredential) {
      toast.error('WebAuthn not supported in this browser');
      onError?.('unsupported');
      return;
    }
    setStatus('scanning');
    setMessage('Waiting for biometric scan...');
    try {
      const challengeBytes = window.crypto.getRandomValues(new Uint8Array(32));
      const publicKey = {
        challenge: challengeBytes,
        rp: { name: 'NEXUS AI Workplace OS', id: window.location.hostname },
        user: {
          id: new TextEncoder().encode(userId || 'nexus-user'),
          name: userId || 'nexus-user',
          displayName: 'NEXUS Employee'
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },  // ES256
          { type: 'public-key', alg: -257 }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          requireResidentKey: false,
        },
        timeout: 60000,
        attestation: 'direct',
      };

      const credential = await navigator.credentials.create({ publicKey });
      const credData = {
        id: credential.id,
        rawId: bufferToBase64(credential.rawId),
        type: credential.type,
        response: {
          clientDataJSON: bufferToBase64(credential.response.clientDataJSON),
          attestationObject: bufferToBase64(credential.response.attestationObject),
        }
      };

      setStatus('done');
      setMessage('Fingerprint registered successfully!');
      onSuccess?.(credData);
    } catch (err) {
      setStatus('error');
      const msg = err.name === 'NotAllowedError'
        ? 'Fingerprint scan cancelled or timed out'
        : `Registration failed: ${err.message}`;
      setMessage(msg);
      onError?.(err);
    }
  };

  const verifyFingerprint = async () => {
    if (!window.PublicKeyCredential) {
      toast.error('WebAuthn not supported');
      return;
    }
    setStatus('scanning');
    setMessage('Place your finger on the sensor...');
    try {
      const challengeBytes = window.crypto.getRandomValues(new Uint8Array(32));
      const publicKey = {
        challenge: challengeBytes,
        timeout: 60000,
        userVerification: 'required',
        rpId: window.location.hostname,
      };
      const assertion = await navigator.credentials.get({ publicKey });
      const assertData = {
        id: assertion.id,
        rawId: bufferToBase64(assertion.rawId),
        type: assertion.type,
        response: {
          clientDataJSON: bufferToBase64(assertion.response.clientDataJSON),
          authenticatorData: bufferToBase64(assertion.response.authenticatorData),
          signature: bufferToBase64(assertion.response.signature),
          userHandle: assertion.response.userHandle ? bufferToBase64(assertion.response.userHandle) : null,
        }
      };
      setStatus('done');
      setMessage('Fingerprint verified!');
      onSuccess?.(assertData);
    } catch (err) {
      setStatus('error');
      setMessage(err.name === 'NotAllowedError' ? 'Scan cancelled' : `Verification failed: ${err.message}`);
      onError?.(err);
    }
  };

  const pulseColor = status === 'done' ? '#00ff88' : status === 'error' ? '#ff4466' : status === 'scanning' ? '#00ffc8' : '#666';

  return (
    <div style={{ textAlign:'center', padding:'20px 0' }}>
      <motion.div
        animate={{ scale: status === 'scanning' ? [1, 1.05, 1] : 1 }}
        transition={{ repeat: status === 'scanning' ? Infinity : 0, duration: 1.2 }}
        style={{
          width: 120, height: 120, margin: '0 auto 20px',
          borderRadius: '50%', border: `3px solid ${pulseColor}`,
          display:'flex', alignItems:'center', justifyContent:'center',
          background:'var(--card)', cursor:'pointer',
          boxShadow: `0 0 30px ${pulseColor}44`,
          transition: 'all 0.3s',
          position: 'relative', overflow: 'hidden'
        }}
        onClick={mode === 'register' ? registerFingerprint : verifyFingerprint}
      >
        {status === 'scanning' && (
          <div style={{
            position:'absolute', inset:0, borderRadius:'50%',
            background:`radial-gradient(circle, ${pulseColor}22, transparent 70%)`,
            animation:'ripple 1.5s ease infinite'
          }}/>
        )}
        {status === 'done' ? <CheckCircle size={48} color="var(--ok)"/> :
         status === 'error' ? <XCircle size={48} color="var(--danger)"/> :
         status === 'scanning' ? <Loader size={48} color="var(--a)" style={{ animation:'spin 1s linear infinite' }}/> :
         <Fingerprint size={48} color="var(--a)"/>}
      </motion.div>

      <div style={{ fontFamily:'Rajdhani', fontSize:15, fontWeight:600,
        color: status==='done' ? 'var(--ok)' : status==='error' ? 'var(--danger)' : 'var(--t)' }}>
        {message || (mode === 'register' ? 'Tap to register fingerprint' : 'Tap to scan fingerprint')}
      </div>

      {status === 'idle' && (
        <div style={{ fontSize:12, color:'var(--t3)', marginTop:8, fontFamily:'Inter' }}>
          Uses device biometric sensor (Touch ID / Windows Hello / Android fingerprint)
        </div>
      )}

      {status === 'error' && (
        <button className="btn-ghost" onClick={() => setStatus('idle')}
          style={{ marginTop:12, fontSize:13 }}>Try Again</button>
      )}
    </div>
  );
}
