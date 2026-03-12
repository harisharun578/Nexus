import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Cpu, Zap, Users, BarChart3, Mic, Eye, Fingerprint } from 'lucide-react';

const features = [
  { icon: <Shield size={22}/>, title:'Biometric Auth', desc:'Real face recognition + fingerprint WebAuthn multi-layer security' },
  { icon: <Cpu size={22}/>, title:'AI Copilot', desc:'Natural language workplace assistant — create tickets, apply leaves, get insights' },
  { icon: <Eye size={22}/>, title:'Emotion AI', desc:'Webcam emotion detection for workplace wellness monitoring' },
  { icon: <BarChart3 size={22}/>, title:'Predictive ML', desc:'Burnout prediction, attrition risk, anomaly detection' },
  { icon: <Users size={22}/>, title:'Smart Directory', desc:'AI-searchable employee graph with skill matching' },
  { icon: <Mic size={22}/>, title:'Voice Commands', desc:'Hands-free navigation using Web Speech API + intent detection' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme','neon');
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const dots = Array.from({length:100},()=>({
      x: Math.random()*canvas.width, y: Math.random()*canvas.height,
      vx:(Math.random()-0.5)*0.4, vy:(Math.random()-0.5)*0.4,
      r: Math.random()*1.5+0.5,
    }));
    let animId;
    const draw = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      dots.forEach(d=>{
        d.x+=d.vx; d.y+=d.vy;
        if(d.x<0||d.x>canvas.width) d.vx*=-1;
        if(d.y<0||d.y>canvas.height) d.vy*=-1;
        ctx.beginPath(); ctx.arc(d.x,d.y,d.r,0,Math.PI*2);
        ctx.fillStyle='rgba(0,255,200,0.35)'; ctx.fill();
      });
      for(let i=0;i<dots.length;i++) for(let j=i+1;j<dots.length;j++){
        const dist=Math.hypot(dots[i].x-dots[j].x,dots[i].y-dots[j].y);
        if(dist<130){
          ctx.beginPath(); ctx.moveTo(dots[i].x,dots[i].y); ctx.lineTo(dots[j].x,dots[j].y);
          ctx.strokeStyle=`rgba(0,255,200,${0.1*(1-dist/130)})`; ctx.lineWidth=0.5; ctx.stroke();
        }
      }
      animId=requestAnimationFrame(draw);
    };
    draw();
    return ()=>{ cancelAnimationFrame(animId); window.removeEventListener('resize',resize); };
  },[]);

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', color:'var(--t)', overflow:'hidden' }} data-theme="neon">
      <canvas ref={canvasRef} style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0 }}/>

      {/* Nav */}
      <nav style={{ position:'relative', zIndex:10, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 48px', borderBottom:'1px solid var(--b)', backdropFilter:'blur(20px)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:40,height:40,borderRadius:12,background:'linear-gradient(135deg,#00ffc8,#00aaff)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Orbitron',fontSize:18,fontWeight:900,color:'#020408',boxShadow:'0 0 20px rgba(0,255,200,0.4)' }}>N</div>
          <div>
            <div style={{ fontFamily:'Orbitron',fontSize:16,fontWeight:800,color:'#00ffc8',letterSpacing:'0.12em' }}>NEXUS AI</div>
            <div style={{ fontSize:9,color:'rgba(200,255,240,0.5)',fontFamily:'Rajdhani',letterSpacing:'0.2em' }}>WORKPLACE OS</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:12 }}>
          <button className="btn-ghost" onClick={()=>navigate('/login')} style={{ fontSize:13 }}>Sign In</button>
          <button className="btn-primary" onClick={()=>navigate('/signup')} style={{ fontSize:13 }}>Get Started →</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ position:'relative', zIndex:5, maxWidth:1200, margin:'0 auto', padding:'80px 48px 60px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:40 }}>
        <motion.div initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} transition={{duration:0.8}} style={{maxWidth:580}}>
          <div style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'6px 14px',borderRadius:20,background:'rgba(0,255,200,0.1)',border:'1px solid rgba(0,255,200,0.25)',fontSize:11,fontFamily:'Rajdhani',fontWeight:600,letterSpacing:'0.1em',color:'#00ffc8',marginBottom:24 }}>
            <div style={{ width:6,height:6,borderRadius:'50%',background:'#00ffc8',animation:'blink 1.5s ease infinite' }}/>
            NEXT-GENERATION AI WORKPLACE PLATFORM
          </div>
          <h1 style={{ fontFamily:'Orbitron',fontSize:'clamp(32px,4vw,52px)',fontWeight:900,lineHeight:1.15,marginBottom:20 }}>
            The Future of<br/>
            <span style={{ background:'linear-gradient(135deg,#00ffc8,#00aaff)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>Enterprise</span><br/>
            Intelligence
          </h1>
          <p style={{ fontSize:16,lineHeight:1.7,color:'rgba(200,255,240,0.65)',fontFamily:'Inter',marginBottom:32 }}>
            Biometric auth · AI copilot · Real-time analytics · Voice commands · ML-powered HR insights. Built for the modern enterprise.
          </p>
          <div style={{ display:'flex',gap:16,marginBottom:32 }}>
            <motion.button whileHover={{scale:1.04}} whileTap={{scale:0.97}} className="btn-primary" onClick={()=>navigate('/signup')} style={{fontSize:14,padding:'14px 32px'}}>
              Launch System
            </motion.button>
            <motion.button whileHover={{scale:1.04}} className="btn-ghost" onClick={()=>navigate('/login')} style={{fontSize:14,padding:'14px 32px'}}>
              Demo Login →
            </motion.button>
          </div>

          {/* Demo creds */}
          <div style={{ padding:'16px 20px', background:'rgba(0,255,200,0.06)', border:'1px solid rgba(0,255,200,0.2)', borderRadius:12, fontFamily:'Inter', fontSize:13 }}>
            <div style={{ fontFamily:'Orbitron',fontSize:10,color:'#00ffc8',letterSpacing:'0.1em',marginBottom:10 }}>🎯 DEMO CREDENTIALS</div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px 20px',color:'rgba(200,255,240,0.7)' }}>
              <div><strong style={{color:'#00ffc8'}}>Admin:</strong> admin@nexus.ai</div>
              <div><strong style={{color:'#00ffc8'}}>Pass:</strong> Admin@123</div>
              <div><strong style={{color:'#00aaff'}}>Employee:</strong> john@nexus.ai</div>
              <div><strong style={{color:'#00aaff'}}>Pass:</strong> Pass@123</div>
            </div>
          </div>
        </motion.div>

        {/* Right visual */}
        <motion.div initial={{opacity:0,x:40}} animate={{opacity:1,x:0}} transition={{duration:0.8,delay:0.3}} style={{ display:'flex',flexDirection:'column',gap:12,minWidth:280 }}>
          {[
            { val:'99.7%', label:'Face Recognition Accuracy', icon:'👁️' },
            { val:'< 0.8s', label:'Biometric Auth Speed', icon:'⚡' },
            { val:'5 Layers', label:'Security Depth', icon:'🛡️' },
            { val:'Real ML', label:'TensorFlow + DeepFace', icon:'🧠' },
          ].map((s,i)=>(
            <motion.div key={i} initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} transition={{delay:0.5+i*0.1}}
              className="glass" style={{padding:'16px 20px',display:'flex',alignItems:'center',gap:14}}>
              <span style={{fontSize:24}}>{s.icon}</span>
              <div>
                <div style={{fontFamily:'Orbitron',fontSize:18,fontWeight:800,color:'#00ffc8'}}>{s.val}</div>
                <div style={{fontSize:11,color:'rgba(200,255,240,0.55)',fontFamily:'Rajdhani'}}>{s.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Features */}
      <div style={{ position:'relative',zIndex:5,maxWidth:1200,margin:'0 auto',padding:'40px 48px 80px' }}>
        <h2 style={{ fontFamily:'Orbitron',fontSize:24,fontWeight:800,textAlign:'center',marginBottom:40,color:'rgba(200,255,240,0.9)' }}>
          Enterprise Intelligence Platform
        </h2>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:20 }}>
          {features.map((f,i)=>(
            <motion.div key={i} initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} transition={{delay:i*0.08}} viewport={{once:true}}
              className="glass" style={{padding:'24px'}}>
              <div style={{ width:44,height:44,borderRadius:12,background:'rgba(0,255,200,0.1)',border:'1px solid rgba(0,255,200,0.2)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16,color:'#00ffc8' }}>{f.icon}</div>
              <div style={{ fontFamily:'Orbitron',fontSize:13,fontWeight:700,marginBottom:8,color:'rgba(200,255,240,0.9)' }}>{f.title}</div>
              <div style={{ fontSize:13,lineHeight:1.6,color:'rgba(200,255,240,0.55)',fontFamily:'Inter' }}>{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>

      <div style={{ textAlign:'center',padding:'20px',borderTop:'1px solid rgba(0,255,200,0.1)',color:'rgba(200,255,240,0.3)',fontSize:12,fontFamily:'Rajdhani',position:'relative',zIndex:5 }}>
        NEXUS AI Workplace OS · Built with React + Node.js + Python ML + MongoDB
      </div>
    </div>
  );
}
