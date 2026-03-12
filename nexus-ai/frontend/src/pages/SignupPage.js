import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Briefcase, Phone, ChevronRight, Check, Loader } from 'lucide-react';
import { useAuthStore } from '../context/authStore';
import FaceScanner from '../components/biometric/FaceScanner';
import FingerprintAuth from '../components/biometric/FingerprintAuth';
import toast from 'react-hot-toast';

const STEPS = ['Account', 'Face ID', 'Fingerprint', 'Complete'];
const DEPARTMENTS = ['Engineering','HR','Finance','Operations','Marketing','Design','Sales','Legal'];
const ROLES = ['Employee','Manager','Team Lead','Director','Intern'];

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup, registerFace, registerFingerprint, loading } = useAuthStore();
  const [step, setStep] = useState(0);
  const [faceSkipped, setFaceSkipped] = useState(false);
  const [fpSkipped, setFpSkipped] = useState(false);
  const [form, setForm] = useState({ name:'', email:'', password:'', confirmPassword:'', department:'Engineering', role:'Employee', phone:'' });
  const [photo, setPhoto] = useState(null);
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    const fd = new FormData();
    Object.entries(form).forEach(([k,v]) => fd.append(k,v));
    if (photo) fd.append('photo', photo);
    const res = await signup(fd);
    if (res.success) setStep(1);
  };

  const handleFaceDescriptors = async (descriptors) => {
    const res = await registerFace(descriptors);
    if (res.success) setStep(2);
  };

  const handleFingerprintSuccess = async (credential) => {
    const res = await registerFingerprint(credential);
    setStep(3);
  };

  const progressPct = (step / (STEPS.length - 1)) * 100;

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ position:'fixed',inset:0,background:'radial-gradient(ellipse at 30% 50%, rgba(0,255,200,0.06) 0%, transparent 60%)',pointerEvents:'none' }}/>

      <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} className="glass"
        style={{ width:'100%', maxWidth:500, padding:'36px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute',left:0,right:0,height:1,background:'linear-gradient(90deg,transparent,var(--a),transparent)',animation:'scanLine 4s linear infinite',opacity:0.4 }}/>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ fontFamily:'Orbitron',fontSize:18,fontWeight:800,color:'var(--a)',letterSpacing:'0.1em' }}>CREATE ACCOUNT</div>
          <div style={{ fontSize:12,color:'var(--t3)',marginTop:4,fontFamily:'Rajdhani' }}>Set up your NEXUS AI workplace identity</div>
        </div>

        {/* Step indicators */}
        <div style={{ display:'flex', alignItems:'center', marginBottom:28 }}>
          {STEPS.map((s,i) => (
            <React.Fragment key={i}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flex:1 }}>
                <div style={{
                  width:32, height:32, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                  background: i<step ? 'var(--ok)' : i===step ? 'linear-gradient(135deg,var(--a),var(--a2))' : 'var(--card)',
                  border: `2px solid ${i<=step ? 'transparent' : 'var(--b)'}`,
                  color: i<=step ? 'var(--bg)' : 'var(--t3)', fontSize:12, fontWeight:700,
                  boxShadow: i===step ? 'var(--glow)' : 'none', transition:'all 0.3s',
                }}>
                  {i < step ? <Check size={14}/> : i+1}
                </div>
                <div style={{ fontSize:10, color:i===step?'var(--a)':'var(--t3)', marginTop:5, fontFamily:'Rajdhani', fontWeight:600, letterSpacing:'0.05em' }}>{s}</div>
              </div>
              {i < STEPS.length-1 && <div style={{ flex:1, height:2, background:'var(--b)', maxWidth:30, margin:'0 4px', marginBottom:20 }}/>}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 0 — Account */}
          {step === 0 && (
            <motion.form key="s0" initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-30}} onSubmit={handleAccountSubmit}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
                <div style={{ gridColumn:'1/-1' }}>
                  <label>Full Name *</label>
                  <div style={{ position:'relative' }}>
                    <User size={14} style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--t3)' }}/>
                    <input placeholder="John Smith" value={form.name} onChange={e=>set('name',e.target.value)} required style={{ paddingLeft:36 }}/>
                  </div>
                </div>
                <div style={{ gridColumn:'1/-1' }}>
                  <label>Work Email *</label>
                  <div style={{ position:'relative' }}>
                    <Mail size={14} style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--t3)' }}/>
                    <input type="email" placeholder="you@company.com" value={form.email} onChange={e=>set('email',e.target.value)} required style={{ paddingLeft:36 }}/>
                  </div>
                </div>
                <div>
                  <label>Department</label>
                  <select value={form.department} onChange={e=>set('department',e.target.value)}>
                    {DEPARTMENTS.map(d=><option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label>Role</label>
                  <select value={form.role} onChange={e=>set('role',e.target.value)}>
                    {ROLES.map(r=><option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label>Password *</label>
                  <div style={{ position:'relative' }}>
                    <Lock size={14} style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--t3)' }}/>
                    <input type="password" placeholder="••••••••" value={form.password} onChange={e=>set('password',e.target.value)} required style={{ paddingLeft:36 }}/>
                  </div>
                </div>
                <div>
                  <label>Confirm Password *</label>
                  <div style={{ position:'relative' }}>
                    <Lock size={14} style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--t3)' }}/>
                    <input type="password" placeholder="••••••••" value={form.confirmPassword} onChange={e=>set('confirmPassword',e.target.value)} required style={{ paddingLeft:36 }}/>
                  </div>
                </div>
                <div style={{ gridColumn:'1/-1' }}>
                  <label>Profile Photo</label>
                  <input type="file" accept="image/*" onChange={e=>setPhoto(e.target.files[0])} style={{ fontSize:12 }}/>
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ width:'100%',padding:'13px',fontSize:13 }} disabled={loading}>
                {loading ? <Loader size={16} style={{ animation:'spin 1s linear infinite',display:'inline' }}/> : 'Next: Register Face ID →'}
              </button>
            </motion.form>
          )}

          {/* STEP 1 — Face */}
          {step === 1 && (
            <motion.div key="s1" initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-30}}>
              <div style={{ textAlign:'center',marginBottom:16 }}>
                <div style={{ fontFamily:'Rajdhani',fontSize:14,color:'var(--t2)',lineHeight:1.6 }}>
                  We'll capture <span style={{ color:'var(--a)',fontWeight:700 }}>12 face embeddings</span> using TensorFlow facial recognition.<br/>
                  Liveness detection active — please blink and move your head.
                </div>
              </div>
              <FaceScanner mode="register" onDescriptors={handleFaceDescriptors} targetSamples={12} livenessCheck={true}/>
              <button onClick={()=>{setFaceSkipped(true);setStep(2);}} className="btn-ghost" style={{ width:'100%',marginTop:12,fontSize:12 }}>
                Skip (not recommended)
              </button>
            </motion.div>
          )}

          {/* STEP 2 — Fingerprint */}
          {step === 2 && (
            <motion.div key="s2" initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-30}}>
              <div style={{ textAlign:'center',marginBottom:12 }}>
                <div style={{ fontFamily:'Rajdhani',fontSize:14,color:'var(--t2)',lineHeight:1.6 }}>
                  Register your <span style={{ color:'var(--a)',fontWeight:700 }}>fingerprint</span> using WebAuthn / Touch ID / Windows Hello
                </div>
              </div>
              <FingerprintAuth mode="register" userId={form.email} onSuccess={handleFingerprintSuccess}/>
              <button onClick={()=>{setFpSkipped(true);setStep(3);}} className="btn-ghost" style={{ width:'100%',marginTop:12,fontSize:12 }}>
                Skip Fingerprint
              </button>
            </motion.div>
          )}

          {/* STEP 3 — Done */}
          {step === 3 && (
            <motion.div key="s3" initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} style={{ textAlign:'center',padding:'20px 0' }}>
              <motion.div animate={{ scale:[1,1.1,1] }} transition={{ duration:0.6 }}
                style={{ width:80,height:80,borderRadius:'50%',background:'rgba(0,255,136,0.15)',border:'2px solid var(--ok)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px',boxShadow:'0 0 30px rgba(0,255,136,0.3)' }}>
                <Check size={36} color="var(--ok)"/>
              </motion.div>
              <div style={{ fontFamily:'Orbitron',fontSize:16,fontWeight:700,color:'var(--ok)',marginBottom:10 }}>IDENTITY REGISTERED</div>
              <div style={{ fontFamily:'Rajdhani',fontSize:13,color:'var(--t2)',marginBottom:6 }}>
                {!faceSkipped && '✓ Face recognition enrolled'}<br/>
                {!fpSkipped && '✓ Fingerprint registered'}
              </div>
              <div style={{ fontSize:13,color:'var(--t3)',marginBottom:24,fontFamily:'Inter' }}>Your biometric identity has been secured in the system</div>
              <button className="btn-primary" style={{ width:'100%',padding:'13px',fontSize:13 }} onClick={()=>navigate('/dashboard')}>
                Enter Workplace →
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ textAlign:'center',marginTop:20,fontSize:13,color:'var(--t3)',fontFamily:'Inter' }}>
          Have account? <Link to="/login" style={{ color:'var(--a)',textDecoration:'none',fontWeight:600 }}>Sign In →</Link>
        </div>
      </motion.div>
    </div>
  );
}
