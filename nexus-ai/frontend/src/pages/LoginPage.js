import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { Mail, Lock, Eye, EyeOff, Loader } from 'lucide-react';
import { useAuthStore } from '../context/authStore';
import FaceScanner from '../components/biometric/FaceScanner';
import FingerprintAuth from '../components/biometric/FingerprintAuth';
import toast from 'react-hot-toast';

const METHODS = [
  { id:'password', label:'Password', icon:'🔑' },
  { id:'face',     label:'Face ID',  icon:'👁️' },
  { id:'fingerprint', label:'Fingerprint', icon:'👆' },
  { id:'google',   label:'Google',   icon:'🔷' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, faceLogin, googleLogin, loading } = useAuthStore();
  const [method, setMethod] = useState('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    const res = await login(email, password);
    if (res.success) navigate('/dashboard');
  };

  const handleFaceDescriptor = async (descriptor) => {
    const res = await faceLogin(descriptor);
    if (res.success) navigate('/dashboard');
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const res = await googleLogin(credentialResponse.credential);
    if (res.success) navigate('/dashboard');
  };

  const handleFingerprintSuccess = async (credential) => {
    toast.success('Fingerprint verified! Logging in...');
    setTimeout(() => navigate('/dashboard'), 800);
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      {/* Background */}
      <div style={{ position:'fixed', inset:0, background:'radial-gradient(ellipse at 50% 0%, rgba(0,255,200,0.08) 0%, transparent 60%)', pointerEvents:'none' }}/>

      <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} className="glass"
        style={{ width:'100%', maxWidth:460, padding:'40px 36px', position:'relative', overflow:'hidden' }}>

        {/* Scan line */}
        <div style={{ position:'absolute', left:0, right:0, height:1, background:'linear-gradient(90deg,transparent,var(--a),transparent)', animation:'scanLine 4s linear infinite', opacity:0.5 }}/>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ width:56,height:56,borderRadius:16,background:'linear-gradient(135deg,var(--a),var(--a2))',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Orbitron',fontSize:24,fontWeight:900,color:'var(--bg)',margin:'0 auto 14px',boxShadow:'var(--glow)' }}>N</div>
          <div style={{ fontFamily:'Orbitron',fontSize:18,fontWeight:800,color:'var(--a)',letterSpacing:'0.1em' }}>NEXUS AI</div>
          <div style={{ fontSize:12,color:'var(--t3)',fontFamily:'Rajdhani',marginTop:4 }}>Authenticate to enter the system</div>
        </div>

        {/* Method selector */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6, marginBottom:28, background:'var(--bg2)', padding:5, borderRadius:12 }}>
          {METHODS.map(m => (
            <button key={m.id} onClick={() => setMethod(m.id)} style={{
              padding:'8px 4px', borderRadius:9, border:'none', cursor:'pointer',
              background: method===m.id ? 'linear-gradient(135deg,var(--a),var(--a2))' : 'transparent',
              color: method===m.id ? 'var(--bg)' : 'var(--t3)',
              fontFamily:'Rajdhani', fontSize:11, fontWeight:600,
              display:'flex', flexDirection:'column', alignItems:'center', gap:3,
              transition:'all 0.2s',
            }}>
              <span style={{ fontSize:16 }}>{m.icon}</span>
              {m.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* PASSWORD */}
          {method === 'password' && (
            <motion.form key="pw" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}
              onSubmit={handlePasswordLogin}>
              <div style={{ marginBottom:16 }}>
                <label>Email Address</label>
                <div style={{ position:'relative' }}>
                  <Mail size={15} style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--t3)' }}/>
                  <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                    placeholder="you@company.com" required style={{ paddingLeft:38 }}/>
                </div>
              </div>
              <div style={{ marginBottom:24 }}>
                <label>Password</label>
                <div style={{ position:'relative' }}>
                  <Lock size={15} style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--t3)' }}/>
                  <input type={showPw?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)}
                    placeholder="••••••••" required style={{ paddingLeft:38, paddingRight:40 }}/>
                  <button type="button" onClick={()=>setShowPw(!showPw)}
                    style={{ position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'transparent',border:'none',color:'var(--t3)',cursor:'pointer' }}>
                    {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ width:'100%',padding:'14px',fontSize:13 }} disabled={loading}>
                {loading ? <Loader size={16} style={{ animation:'spin 1s linear infinite',display:'inline' }}/> : 'Sign In →'}
              </button>
            </motion.form>
          )}

          {/* FACE */}
          {method === 'face' && (
            <motion.div key="face" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
              <div style={{ marginBottom:16, fontFamily:'Rajdhani', fontSize:13, color:'var(--t2)', textAlign:'center', lineHeight:1.6 }}>
                <span style={{ color:'var(--a)' }}>Real ML face recognition</span> — your face embedding is matched against stored vectors
              </div>
              <FaceScanner mode="login" onDescriptor={handleFaceDescriptor} livenessCheck={true}/>
            </motion.div>
          )}

          {/* FINGERPRINT */}
          {method === 'fingerprint' && (
            <motion.div key="fp" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
              <FingerprintAuth mode="verify" onSuccess={handleFingerprintSuccess}/>
            </motion.div>
          )}

          {/* GOOGLE */}
          {method === 'google' && (
            <motion.div key="google" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}
              style={{ textAlign:'center', padding:'20px 0' }}>
              <div style={{ marginBottom:20, fontFamily:'Rajdhani', fontSize:14, color:'var(--t2)' }}>
                Sign in with your Google Workspace account
              </div>
              <div style={{ display:'flex', justifyContent:'center' }}>
                <GoogleLogin onSuccess={handleGoogleSuccess} onError={()=>toast.error('Google login failed')}
                  theme="filled_black" shape="pill" size="large" text="signin_with"/>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ textAlign:'center', marginTop:24, fontSize:13, color:'var(--t3)', fontFamily:'Inter' }}>
          No account?{' '}
          <Link to="/signup" style={{ color:'var(--a)', textDecoration:'none', fontWeight:600 }}>Create one →</Link>
        </div>
      </motion.div>
    </div>
  );
}
