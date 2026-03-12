import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Briefcase, Phone, Edit2, Save, Shield, Eye, Fingerprint } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import { useAuthStore } from '../context/authStore';
import FaceScanner from '../components/biometric/FaceScanner';
import FingerprintAuth from '../components/biometric/FingerprintAuth';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, registerFace, registerFingerprint } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [showFaceReg, setShowFaceReg] = useState(false);
  const [showFpReg, setShowFpReg] = useState(false);
  const [form, setForm] = useState({ name: user?.name||'', phone: user?.phone||'', skills: user?.skills?.join(', ')||'' });

  const handleSave = () => { toast.success('Profile updated!'); setEditing(false); };

  return (
    <Sidebar>
      <div style={{ maxWidth:800 }}>
        <div style={{ marginBottom:24 }}>
          <div style={{ fontFamily:'Orbitron',fontSize:20,fontWeight:800,marginBottom:4 }}>MY PROFILE</div>
          <div style={{ fontSize:13,color:'var(--t3)',fontFamily:'Rajdhani' }}>Manage your identity and biometric credentials</div>
        </div>

        {/* Profile card */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="glass" style={{ padding:32,marginBottom:20 }}>
          <div style={{ display:'flex',alignItems:'center',gap:24,marginBottom:28 }}>
            <div style={{ position:'relative' }}>
              <div style={{ width:80,height:80,borderRadius:'50%',background:'linear-gradient(135deg,var(--a),var(--a2))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,fontWeight:700,color:'var(--bg)',boxShadow:'var(--glow)' }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div style={{ position:'absolute',bottom:0,right:0,width:24,height:24,borderRadius:'50%',background:'var(--ok)',border:'3px solid var(--bg2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10 }}>✓</div>
            </div>
            <div>
              <div style={{ fontFamily:'Orbitron',fontSize:18,fontWeight:800,color:'var(--t)' }}>{user?.name}</div>
              <div style={{ fontSize:13,color:'var(--a)',fontFamily:'Rajdhani',fontWeight:600 }}>{user?.role} · {user?.department}</div>
              <div style={{ fontSize:12,color:'var(--t3)',fontFamily:'Inter' }}>{user?.email}</div>
            </div>
            <button onClick={()=>setEditing(!editing)} className="btn-ghost" style={{ marginLeft:'auto',display:'flex',alignItems:'center',gap:6,fontSize:12 }}>
              {editing ? <><Save size={13}/>Save</> : <><Edit2 size={13}/>Edit</>}
            </button>
          </div>

          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16 }}>
            {[
              { label:'Full Name', key:'name', icon:<User size={14}/> },
              { label:'Email', value:user?.email, icon:<Mail size={14}/>, readOnly:true },
              { label:'Department', value:user?.department, icon:<Briefcase size={14}/>, readOnly:true },
              { label:'Phone', key:'phone', icon:<Phone size={14}/> },
            ].map((f,i)=>(
              <div key={i}>
                <label style={{ display:'flex',alignItems:'center',gap:6 }}>{f.icon}{f.label}</label>
                <input value={f.readOnly ? f.value : form[f.key]||''} readOnly={f.readOnly||!editing}
                  onChange={f.key?e=>setForm(p=>({...p,[f.key]:e.target.value})):undefined}
                  style={{ opacity:f.readOnly?0.6:1 }}/>
              </div>
            ))}
            <div style={{ gridColumn:'1/-1' }}>
              <label>Skills (comma-separated)</label>
              <input value={form.skills} readOnly={!editing} onChange={e=>setForm(p=>({...p,skills:e.target.value}))}
                placeholder="React, Python, Node.js..."/>
            </div>
          </div>
          {editing && <button className="btn-primary" style={{ marginTop:16,fontSize:12 }} onClick={handleSave}>Save Changes</button>}
        </motion.div>

        {/* Biometric credentials */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="glass" style={{ padding:28 }}>
          <div style={{ fontFamily:'Orbitron',fontSize:12,fontWeight:700,marginBottom:20,display:'flex',alignItems:'center',gap:8 }}>
            <Shield size={14} color="var(--a)"/>BIOMETRIC CREDENTIALS
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:20 }}>
            <div style={{ padding:'20px',background:'var(--bg2)',borderRadius:12,border:`1px solid ${user?.faceRegistered?'rgba(0,255,136,0.3)':'var(--b)'}` }}>
              <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:10 }}>
                <Eye size={20} color={user?.faceRegistered?'var(--ok)':'var(--t3)'}/>
                <div style={{ fontFamily:'Rajdhani',fontSize:14,fontWeight:700 }}>Face Recognition</div>
              </div>
              <div style={{ fontSize:12,color:user?.faceRegistered?'var(--ok)':'var(--t3)',fontFamily:'Rajdhani',marginBottom:12 }}>
                {user?.faceRegistered ? '✓ 12 face samples enrolled' : 'Not registered'}
              </div>
              <button className="btn-ghost" style={{ fontSize:12,width:'100%' }} onClick={()=>setShowFaceReg(!showFaceReg)}>
                {user?.faceRegistered ? 'Re-register Face' : 'Register Face ID'}
              </button>
            </div>
            <div style={{ padding:'20px',background:'var(--bg2)',borderRadius:12,border:`1px solid ${user?.fingerprintRegistered?'rgba(0,255,136,0.3)':'var(--b)'}` }}>
              <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:10 }}>
                <Fingerprint size={20} color={user?.fingerprintRegistered?'var(--ok)':'var(--t3)'}/>
                <div style={{ fontFamily:'Rajdhani',fontSize:14,fontWeight:700 }}>Fingerprint</div>
              </div>
              <div style={{ fontSize:12,color:user?.fingerprintRegistered?'var(--ok)':'var(--t3)',fontFamily:'Rajdhani',marginBottom:12 }}>
                {user?.fingerprintRegistered ? '✓ WebAuthn credential registered' : 'Not registered'}
              </div>
              <button className="btn-ghost" style={{ fontSize:12,width:'100%' }} onClick={()=>setShowFpReg(!showFpReg)}>
                {user?.fingerprintRegistered ? 'Re-register Fingerprint' : 'Register Fingerprint'}
              </button>
            </div>
          </div>

          {showFaceReg && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{ marginTop:16 }}>
              <FaceScanner mode="register" onDescriptors={async (d)=>{ await registerFace(d); setShowFaceReg(false); }} targetSamples={12}/>
            </motion.div>
          )}
          {showFpReg && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{ marginTop:16 }}>
              <FingerprintAuth mode="register" userId={user?.email} onSuccess={async(c)=>{ await registerFingerprint(c); setShowFpReg(false); }}/>
            </motion.div>
          )}
        </motion.div>
      </div>
    </Sidebar>
  );
}
