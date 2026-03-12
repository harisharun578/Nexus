import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Ticket, BarChart3, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';

export default function AdminPage() {
  const [tab, setTab] = useState('overview');
  const securityLogs = [
    { type:'warning', msg:'Multiple failed login attempts — ip: 192.168.1.45', time:'2 mins ago' },
    { type:'info', msg:'New employee registered: Ravi Kumar', time:'15 mins ago' },
    { type:'error', msg:'Unusual data access pattern detected — user: temp_user', time:'1 hr ago' },
    { type:'info', msg:'Face recognition model updated', time:'3 hrs ago' },
  ];

  return (
    <Sidebar>
      <div style={{ maxWidth:1200 }}>
        <div style={{ marginBottom:24 }}>
          <div style={{ fontFamily:'Orbitron',fontSize:20,fontWeight:800,marginBottom:4 }}>ADMIN PANEL</div>
          <div style={{ fontSize:13,color:'var(--t3)',fontFamily:'Rajdhani' }}>System management · Security monitoring · User administration</div>
        </div>

        <div style={{ display:'flex',gap:8,marginBottom:24,background:'var(--bg2)',padding:5,borderRadius:12,width:'fit-content' }}>
          {['overview','users','security','system'].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{
              padding:'8px 20px',borderRadius:9,border:'none',cursor:'pointer',
              background:tab===t?'linear-gradient(135deg,var(--a),var(--a2))':'transparent',
              color:tab===t?'var(--bg)':'var(--t3)',fontFamily:'Rajdhani',fontSize:13,fontWeight:600,textTransform:'capitalize',
            }}>{t}</button>
          ))}
        </div>

        {tab==='overview' && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}}>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16,marginBottom:24 }}>
              {[
                { label:'Total Employees',value:'248',icon:<Users size={18}/>,color:'var(--a)' },
                { label:'Open Tickets',value:'34',icon:<Ticket size={18}/>,color:'var(--warn)' },
                { label:'System Uptime',value:'99.9%',icon:<BarChart3 size={18}/>,color:'var(--ok)' },
                { label:'Security Alerts',value:'3',icon:<Shield size={18}/>,color:'var(--danger)' },
              ].map((c,i)=>(
                <motion.div key={i} whileHover={{y:-3}} className="glass" style={{ padding:'22px',borderLeft:`3px solid ${c.color}` }}>
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start' }}>
                    <div>
                      <div style={{ fontSize:11,color:'var(--t3)',fontFamily:'Rajdhani',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:8 }}>{c.label}</div>
                      <div style={{ fontFamily:'Orbitron',fontSize:26,fontWeight:800,color:c.color }}>{c.value}</div>
                    </div>
                    <div style={{ width:38,height:38,borderRadius:10,background:`${c.color}18`,border:`1px solid ${c.color}40`,display:'flex',alignItems:'center',justifyContent:'center',color:c.color }}>{c.icon}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Security Logs */}
            <motion.div className="glass" style={{ padding:24 }}>
              <div style={{ fontFamily:'Orbitron',fontSize:12,fontWeight:700,marginBottom:16,display:'flex',alignItems:'center',gap:8 }}>
                <Shield size={14} color="var(--a)"/>SECURITY LOGS — REAL-TIME
              </div>
              {securityLogs.map((log,i)=>(
                <div key={i} style={{ display:'flex',alignItems:'center',gap:12,padding:'12px 0',borderBottom:i<securityLogs.length-1?'1px solid var(--b)':'none' }}>
                  {log.type==='error'?<AlertTriangle size={14} color="var(--danger)"/>:log.type==='warning'?<AlertTriangle size={14} color="var(--warn)"/>:<CheckCircle size={14} color="var(--ok)"/>}
                  <div style={{ flex:1,fontSize:13,color:'var(--t2)',fontFamily:'Inter' }}>{log.msg}</div>
                  <div style={{ fontSize:11,color:'var(--t3)',fontFamily:'Rajdhani',flexShrink:0 }}>{log.time}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {tab==='users' && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="glass" style={{ padding:24 }}>
            <div style={{ fontFamily:'Orbitron',fontSize:12,fontWeight:700,marginBottom:20 }}>USER MANAGEMENT</div>
            {['admin@nexus.ai','john@nexus.ai','priya@nexus.ai','rahul@nexus.ai'].map((email,i)=>(
              <div key={i} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 0',borderBottom:i<3?'1px solid var(--b)':'none' }}>
                <div style={{ display:'flex',alignItems:'center',gap:12 }}>
                  <div style={{ width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,var(--a),var(--a2))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,color:'var(--bg)' }}>{email[0].toUpperCase()}</div>
                  <div>
                    <div style={{ fontFamily:'Rajdhani',fontSize:13,fontWeight:700,color:'var(--t)' }}>{email}</div>
                    <div style={{ fontSize:11,color:'var(--t3)',fontFamily:'Inter' }}>{i===0?'Admin':'Employee'}</div>
                  </div>
                </div>
                <div style={{ display:'flex',gap:8 }}>
                  <button className="btn-ghost" style={{ fontSize:11,padding:'6px 12px' }}>Edit Role</button>
                  <button style={{ background:'rgba(255,68,102,0.1)',border:'1px solid rgba(255,68,102,0.3)',color:'var(--danger)',padding:'6px 12px',borderRadius:8,fontSize:11,cursor:'pointer' }}>Suspend</button>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {tab==='security' && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="glass" style={{ padding:24 }}>
            <div style={{ fontFamily:'Orbitron',fontSize:12,fontWeight:700,marginBottom:20 }}>ANOMALY DETECTION — ISOLATION FOREST MODEL</div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16 }}>
              {[
                { label:'Failed Logins (24h)', value:'47', risk:'Medium', color:'var(--warn)' },
                { label:'Unusual Access Patterns', value:'3', risk:'High', color:'var(--danger)' },
                { label:'After-Hours Activity', value:'12', risk:'Low', color:'var(--ok)' },
                { label:'Data Export Events', value:'8', risk:'Low', color:'var(--ok)' },
              ].map((s,i)=>(
                <div key={i} style={{ padding:'18px',background:'var(--bg2)',borderRadius:12,border:`1px solid ${s.color}25` }}>
                  <div style={{ fontSize:11,color:'var(--t3)',fontFamily:'Rajdhani',marginBottom:8 }}>{s.label}</div>
                  <div style={{ fontFamily:'Orbitron',fontSize:24,fontWeight:800,color:s.color,marginBottom:4 }}>{s.value}</div>
                  <div style={{ fontSize:11,padding:'2px 10px',borderRadius:20,background:`${s.color}18`,color:s.color,fontFamily:'Rajdhani',fontWeight:700,display:'inline-block' }}>{s.risk} Risk</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {tab==='system' && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="glass" style={{ padding:24 }}>
            <div style={{ fontFamily:'Orbitron',fontSize:12,fontWeight:700,marginBottom:20 }}>SYSTEM HEALTH</div>
            {[
              { service:'Frontend (React)', status:'Running', port:'3000', uptime:'99.9%' },
              { service:'Backend (Node.js)', status:'Running', port:'5000', uptime:'99.8%' },
              { service:'ML Service (Python)', status:'Running', port:'8000', uptime:'99.5%' },
              { service:'MongoDB Database', status:'Running', port:'27017', uptime:'100%' },
              { service:'WebSocket Server', status:'Running', port:'5000', uptime:'99.7%' },
            ].map((s,i)=>(
              <div key={i} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 0',borderBottom:i<4?'1px solid var(--b)':'none' }}>
                <div style={{ fontFamily:'Rajdhani',fontSize:13,fontWeight:600,color:'var(--t)' }}>{s.service}</div>
                <div style={{ display:'flex',gap:20,fontSize:12,color:'var(--t3)',fontFamily:'Inter' }}>
                  <span>Port {s.port}</span>
                  <span>Uptime: {s.uptime}</span>
                  <span style={{ color:'var(--ok)',fontFamily:'Rajdhani',fontWeight:700 }}>● {s.status}</span>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </Sidebar>
  );
}
