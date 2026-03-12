import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Ticket, Calendar, TrendingUp, Bell, AlertTriangle, Clock, CheckCircle, Plus, Shield } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../context/authStore';
import Sidebar from '../components/layout/Sidebar';
import AICopilot from '../components/ai/AICopilot';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const activityData = [
  {day:'Mon',tasks:4,tickets:2},{day:'Tue',tasks:7,tickets:1},{day:'Wed',tasks:5,tickets:3},
  {day:'Thu',tasks:8,tickets:0},{day:'Fri',tasks:6,tickets:2},{day:'Sat',tasks:2,tickets:0},{day:'Sun',tasks:1,tickets:0}
];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ leaveBalance:18, openTickets:3, pendingApprovals:2, attendanceRate:96 });
  const [announcements, setAnnouncements] = useState([]);
  const [myTickets, setMyTickets] = useState([]);
  const [burnout, setBurnout] = useState(null);
  const [emotion, setEmotion] = useState('Neutral');
  const [sosTriggered, setSosTriggered] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, annRes, ticketsRes] = await Promise.all([
        axios.get(`${API}/dashboard/stats`).catch(()=>({data:stats})),
        axios.get(`${API}/announcements`).catch(()=>({data:[]})),
        axios.get(`${API}/tickets/my`).catch(()=>({data:[]})),
      ]);
      if (statsRes.data && !statsRes.data.message) setStats(statsRes.data);
      setAnnouncements(annRes.data?.slice?.(0,3) || []);
      setMyTickets(ticketsRes.data?.slice?.(0,4) || []);
    } catch {}
  };

  const triggerSOS = async () => {
    if (sosTriggered) return;
    setSosTriggered(true);
    try {
      await axios.post(`${API}/emergency/sos`, { location: window.location.href });
      toast.error('🚨 SOS ALERT SENT — HR & Security Notified', { duration: 5000 });
    } catch {
      toast.error('🚨 SOS Alert triggered (offline mode)');
    }
    setTimeout(() => setSosTriggered(false), 10000);
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const StatCard = ({ icon, label, value, sub, color, onClick }) => (
    <motion.div whileHover={{ y:-3, scale:1.01 }} className="glass" onClick={onClick}
      style={{ padding:'22px', cursor:onClick?'pointer':'default', borderLeft:`3px solid ${color}` }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
        <div>
          <div style={{ fontSize:11, color:'var(--t3)', fontFamily:'Rajdhani', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8 }}>{label}</div>
          <div style={{ fontFamily:'Orbitron', fontSize:28, fontWeight:800, color }}>{value}</div>
          {sub && <div style={{ fontSize:11, color:'var(--t3)', marginTop:4, fontFamily:'Inter' }}>{sub}</div>}
        </div>
        <div style={{ width:40,height:40,borderRadius:10,background:`${color}18`,border:`1px solid ${color}40`,display:'flex',alignItems:'center',justifyContent:'center',color }}>{icon}</div>
      </div>
    </motion.div>
  );

  return (
    <Sidebar>
      <div style={{ maxWidth:1400 }}>
        {/* Header */}
        <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} style={{ marginBottom:28, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontFamily:'Orbitron',fontSize:22,fontWeight:800,color:'var(--t)',marginBottom:4 }}>
              {greeting}, <span style={{ color:'var(--a)' }}>{user?.name?.split(' ')[0]}</span> 👋
            </div>
            <div style={{ fontSize:13,color:'var(--t3)',fontFamily:'Rajdhani' }}>
              {user?.department} · {user?.role} · {new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
            </div>
          </div>

          {/* SOS Button */}
          <motion.button
            whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
            onClick={triggerSOS}
            className="btn-danger"
            style={{
              display:'flex', alignItems:'center', gap:8, padding:'12px 20px',
              animation: sosTriggered ? 'pulse 0.5s ease infinite' : 'none',
              opacity: sosTriggered ? 0.7 : 1,
            }}
          >
            <AlertTriangle size={16}/>
            {sosTriggered ? '🚨 SOS SENT' : 'Emergency SOS'}
          </motion.button>
        </motion.div>

        {/* Role-based personalized banner */}
        {(user?.role === 'admin' || user?.role === 'Manager') && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="glass"
            style={{ padding:'14px 20px', marginBottom:20, borderLeft:'3px solid var(--a2)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ fontFamily:'Rajdhani',fontSize:13,color:'var(--t2)' }}>
              <span style={{ color:'var(--a2)',fontWeight:700 }}>Admin view active</span> — You have {stats.pendingApprovals} pending approvals and full analytics access
            </div>
            <button className="btn-ghost" style={{ fontSize:12,padding:'6px 14px' }} onClick={()=>navigate('/admin')}>Admin Panel →</button>
          </motion.div>
        )}

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16, marginBottom:24 }}>
          <StatCard icon={<Calendar size={18}/>} label="Leave Balance" value={stats.leaveBalance} sub="days remaining" color="var(--ok)" onClick={()=>navigate('/hr')}/>
          <StatCard icon={<Ticket size={18}/>} label="Open Tickets" value={stats.openTickets} sub="active cases" color="var(--warn)" onClick={()=>navigate('/it')}/>
          <StatCard icon={<Clock size={18}/>} label="Pending Approvals" value={stats.pendingApprovals} sub="awaiting action" color="var(--a2)"/>
          <StatCard icon={<TrendingUp size={18}/>} label="Attendance Rate" value={`${stats.attendanceRate}%`} sub="this month" color="var(--a)"/>
        </div>

        {/* Main grid */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 340px', gap:20 }}>
          {/* Activity chart */}
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="glass" style={{ padding:24, gridColumn:'1/3' }}>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20 }}>
              <div style={{ fontFamily:'Orbitron',fontSize:13,fontWeight:700,color:'var(--t)' }}>WEEKLY ACTIVITY</div>
              <div style={{ fontSize:11,color:'var(--t3)',fontFamily:'Rajdhani' }}>Tasks vs Tickets</div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="gTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--a)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--a)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gTickets" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--warn)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--warn)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fill:'var(--t3)',fontSize:11,fontFamily:'Rajdhani' }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fill:'var(--t3)',fontSize:11 }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{ background:'var(--bg2)',border:'1px solid var(--b)',borderRadius:8,fontFamily:'Rajdhani',fontSize:12 }}/>
                <Area type="monotone" dataKey="tasks" stroke="var(--a)" strokeWidth={2} fill="url(#gTasks)"/>
                <Area type="monotone" dataKey="tickets" stroke="var(--warn)" strokeWidth={2} fill="url(#gTickets)"/>
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Announcements */}
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}} className="glass" style={{ padding:24 }}>
            <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:16 }}>
              <Bell size={14} color="var(--a)"/>
              <div style={{ fontFamily:'Orbitron',fontSize:12,fontWeight:700 }}>ANNOUNCEMENTS</div>
            </div>
            {announcements.length === 0 ? (
              <div style={{ fontSize:13,color:'var(--t3)',fontFamily:'Inter',textAlign:'center',padding:'20px 0' }}>No announcements</div>
            ) : announcements.map((a,i)=>(
              <div key={i} style={{ padding:'12px 0',borderBottom:i<announcements.length-1?'1px solid var(--b)':'none' }}>
                <div style={{ fontSize:13,color:'var(--t)',fontFamily:'Inter',marginBottom:4 }}>{a.title}</div>
                <div style={{ fontSize:11,color:'var(--t3)' }}>{a.content?.slice(0,80)}...</div>
              </div>
            ))}
            {announcements.length === 0 && (
              <div style={{ fontSize:12,color:'var(--t3)',fontFamily:'Rajdhani',padding:'8px 0' }}>
                <div style={{ padding:'8px 10px',background:'var(--card)',borderRadius:8,marginBottom:6 }}>🎉 Q4 All-Hands Meeting — Dec 15th</div>
                <div style={{ padding:'8px 10px',background:'var(--card)',borderRadius:8,marginBottom:6 }}>🏖️ Holiday schedule posted for 2025</div>
                <div style={{ padding:'8px 10px',background:'var(--card)',borderRadius:8 }}>🚀 New AI features deployed to NEXUS v2.0</div>
              </div>
            )}
          </motion.div>

          {/* My Tickets */}
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3}} className="glass" style={{ padding:24 }}>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16 }}>
              <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                <Ticket size={14} color="var(--warn)"/>
                <div style={{ fontFamily:'Orbitron',fontSize:12,fontWeight:700 }}>MY TICKETS</div>
              </div>
              <button onClick={()=>navigate('/it')} style={{ background:'transparent',border:'none',color:'var(--a)',cursor:'pointer',fontSize:11,fontFamily:'Rajdhani',fontWeight:600 }}>
                <Plus size={12} style={{ display:'inline' }}/> New
              </button>
            </div>
            {[
              { id:'TK-001',title:'Laptop slow startup',status:'Open',priority:'High' },
              { id:'TK-002',title:'VPN access needed',status:'In Progress',priority:'Medium' },
              { id:'TK-003',title:'Software license renewal',status:'Resolved',priority:'Low' },
            ].map((t,i)=>(
              <div key={i} style={{ padding:'10px 12px',background:'var(--bg2)',borderRadius:10,marginBottom:8,cursor:'pointer' }} onClick={()=>navigate('/it')}>
                <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4 }}>
                  <div style={{ fontFamily:'Orbitron',fontSize:10,color:'var(--t3)' }}>{t.id}</div>
                  <div style={{
                    fontSize:10, fontFamily:'Rajdhani', fontWeight:700, padding:'2px 8px', borderRadius:20,
                    background: t.status==='Open'?'rgba(255,170,0,0.15)':t.status==='In Progress'?'rgba(0,170,255,0.15)':'rgba(0,255,136,0.15)',
                    color: t.status==='Open'?'var(--warn)':t.status==='In Progress'?'var(--a2)':'var(--ok)',
                  }}>{t.status}</div>
                </div>
                <div style={{ fontSize:12,color:'var(--t)',fontFamily:'Inter' }}>{t.title}</div>
              </div>
            ))}
          </motion.div>

          {/* Quick Actions */}
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.35}} className="glass" style={{ padding:24 }}>
            <div style={{ fontFamily:'Orbitron',fontSize:12,fontWeight:700,marginBottom:16 }}>QUICK ACTIONS</div>
            {[
              { label:'Apply Leave', icon:'🏖️', path:'/hr', color:'var(--ok)' },
              { label:'Raise IT Ticket', icon:'🎫', path:'/it', color:'var(--warn)' },
              { label:'View Analytics', icon:'📊', path:'/analytics', color:'var(--a)' },
              { label:'Employee Directory', icon:'👥', path:'/directory', color:'var(--a2)' },
            ].map((a,i)=>(
              <button key={i} onClick={()=>navigate(a.path)} style={{
                width:'100%',display:'flex',alignItems:'center',gap:12,padding:'11px 14px',
                borderRadius:10,border:`1px solid ${a.color}25`,background:`${a.color}08`,
                color:'var(--t)',cursor:'pointer',marginBottom:8,fontFamily:'Rajdhani',
                fontSize:13,fontWeight:600,transition:'all 0.2s',textAlign:'left',
              }}>
                <span style={{ fontSize:18 }}>{a.icon}</span> {a.label}
              </button>
            ))}
          </motion.div>

          {/* AI Chat embedded */}
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.4}} className="glass" style={{ gridColumn:'3/4', gridRow:'2/4', padding:0, overflow:'hidden', height:420 }}>
            <AICopilot embedded={true}/>
          </motion.div>
        </div>
      </div>

      {/* Floating AI */}
      <AICopilot/>
    </Sidebar>
  );
}
