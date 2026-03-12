import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, CheckCircle, XCircle, Clock, FileText, Download, Plus } from 'lucide-react';
import axios from 'axios';
import Sidebar from '../components/layout/Sidebar';
import { useAuthStore } from '../context/authStore';
import toast from 'react-hot-toast';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const LEAVE_TYPES = ['Annual Leave','Sick Leave','Casual Leave','Maternity Leave','Paternity Leave','Emergency Leave'];

export default function HRPage() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState('overview');
  const [leaves, setLeaves] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type:'Annual Leave', startDate:'', endDate:'', reason:'' });
  const [leaveBalance] = useState({ annual:12, sick:8, casual:5, remaining:18 });

  useEffect(() => { fetchLeaves(); }, []);

  const fetchLeaves = async () => {
    try {
      const { data } = await axios.get(`${API}/hr/my-leaves`);
      setLeaves(data);
    } catch {
      setLeaves([
        { _id:'1',type:'Annual Leave',startDate:'2024-12-20',endDate:'2024-12-24',status:'Approved',reason:'Family vacation' },
        { _id:'2',type:'Sick Leave',startDate:'2024-11-15',endDate:'2024-11-16',status:'Approved',reason:'Fever' },
        { _id:'3',type:'Casual Leave',startDate:'2024-10-28',endDate:'2024-10-28',status:'Rejected',reason:'Personal work' },
      ]);
    }
  };

  const submitLeave = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/hr/apply-leave`, form);
      toast.success('Leave application submitted!');
      setShowForm(false);
      fetchLeaves();
    } catch {
      toast.success('Leave application submitted! (demo)');
      setLeaves(prev => [{ _id:Date.now().toString(),...form,status:'Pending' }, ...prev]);
      setShowForm(false);
    }
  };

  const TABS = ['overview','leaves','attendance','payslips'];

  return (
    <Sidebar>
      <div style={{ maxWidth:1100 }}>
        <div style={{ marginBottom:28 }}>
          <div style={{ fontFamily:'Orbitron',fontSize:20,fontWeight:800,marginBottom:6 }}>HR PORTAL</div>
          <div style={{ fontSize:13,color:'var(--t3)',fontFamily:'Rajdhani' }}>Manage your leave, attendance, payroll and HR services</div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex',gap:8,marginBottom:24,background:'var(--bg2)',padding:5,borderRadius:12,width:'fit-content' }}>
          {TABS.map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{
              padding:'8px 20px',borderRadius:9,border:'none',cursor:'pointer',
              background:tab===t?'linear-gradient(135deg,var(--a),var(--a2))':'transparent',
              color:tab===t?'var(--bg)':'var(--t3)',
              fontFamily:'Rajdhani',fontSize:13,fontWeight:600,
              textTransform:'capitalize',transition:'all 0.2s'
            }}>{t}</button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab==='overview' && (
            <motion.div key="ov" initial={{opacity:0}} animate={{opacity:1}}>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16,marginBottom:24 }}>
                {[
                  { label:'Annual Leave', val:`${leaveBalance.annual} days`, color:'var(--ok)', icon:'🏖️' },
                  { label:'Sick Leave', val:`${leaveBalance.sick} days`, color:'var(--a2)', icon:'🏥' },
                  { label:'Casual Leave', val:`${leaveBalance.casual} days`, color:'var(--warn)', icon:'☕' },
                  { label:'Total Balance', val:`${leaveBalance.remaining} days`, color:'var(--a)', icon:'📅' },
                ].map((c,i)=>(
                  <motion.div key={i} whileHover={{y:-3}} className="glass"
                    style={{ padding:'22px',borderLeft:`3px solid ${c.color}` }}>
                    <div style={{ fontSize:24,marginBottom:10 }}>{c.icon}</div>
                    <div style={{ fontFamily:'Orbitron',fontSize:24,fontWeight:800,color:c.color }}>{c.val}</div>
                    <div style={{ fontSize:11,color:'var(--t3)',fontFamily:'Rajdhani',letterSpacing:'0.08em',textTransform:'uppercase' }}>{c.label}</div>
                  </motion.div>
                ))}
              </div>
              <motion.div className="glass" style={{ padding:24 }}>
                <div style={{ fontFamily:'Orbitron',fontSize:12,fontWeight:700,marginBottom:16 }}>LEAVE POLICY</div>
                {[
                  'Annual leave: 12 days per year, up to 5 days can be carried forward',
                  'Sick leave: 8 days per year, medical certificate required for 3+ consecutive days',
                  'Casual leave: 5 days per year, requires 24-hour advance notice',
                  'Emergency leave: As needed, subject to manager approval',
                  'Maternity/Paternity leave: As per government regulations',
                ].map((p,i)=>(
                  <div key={i} style={{ padding:'10px 0',borderBottom:i<4?'1px solid var(--b)':'none',fontSize:13,color:'var(--t2)',fontFamily:'Inter',display:'flex',gap:10 }}>
                    <span style={{ color:'var(--a)' }}>•</span>{p}
                  </div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {tab==='leaves' && (
            <motion.div key="lv" initial={{opacity:0}} animate={{opacity:1}}>
              <div style={{ display:'flex',justifyContent:'flex-end',marginBottom:16 }}>
                <button className="btn-primary" onClick={()=>setShowForm(true)} style={{ display:'flex',alignItems:'center',gap:8,fontSize:12 }}>
                  <Plus size={14}/> Apply Leave
                </button>
              </div>

              {showForm && (
                <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} className="glass" style={{ padding:24,marginBottom:20 }}>
                  <div style={{ fontFamily:'Orbitron',fontSize:12,fontWeight:700,marginBottom:16 }}>NEW LEAVE APPLICATION</div>
                  <form onSubmit={submitLeave}>
                    <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}>
                      <div>
                        <label>Leave Type</label>
                        <select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}>
                          {LEAVE_TYPES.map(l=><option key={l}>{l}</option>)}
                        </select>
                      </div>
                      <div style={{ gridColumn:'1/-1' }}>
                        <label>Reason</label>
                        <textarea value={form.reason} onChange={e=>setForm(p=>({...p,reason:e.target.value}))} rows={3} required placeholder="Brief reason for leave..."/>
                      </div>
                      <div>
                        <label>Start Date</label>
                        <input type="date" value={form.startDate} onChange={e=>setForm(p=>({...p,startDate:e.target.value}))} required/>
                      </div>
                      <div>
                        <label>End Date</label>
                        <input type="date" value={form.endDate} onChange={e=>setForm(p=>({...p,endDate:e.target.value}))} required/>
                      </div>
                    </div>
                    <div style={{ display:'flex',gap:12,marginTop:16 }}>
                      <button type="submit" className="btn-primary" style={{ fontSize:12 }}>Submit Application</button>
                      <button type="button" className="btn-ghost" style={{ fontSize:12 }} onClick={()=>setShowForm(false)}>Cancel</button>
                    </div>
                  </form>
                </motion.div>
              )}

              <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
                {leaves.map((l,i)=>(
                  <motion.div key={l._id} initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:i*0.05}} className="glass" style={{ padding:'16px 20px',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
                    <div style={{ display:'flex',alignItems:'center',gap:16 }}>
                      <div style={{ fontSize:24 }}>{l.type?.includes('Sick')?'🏥':l.type?.includes('Annual')?'🏖️':l.type?.includes('Casual')?'☕':'📅'}</div>
                      <div>
                        <div style={{ fontFamily:'Rajdhani',fontSize:14,fontWeight:700,color:'var(--t)',marginBottom:2 }}>{l.type}</div>
                        <div style={{ fontSize:12,color:'var(--t3)',fontFamily:'Inter' }}>{l.startDate} → {l.endDate}</div>
                        <div style={{ fontSize:12,color:'var(--t2)',marginTop:2,fontFamily:'Inter' }}>{l.reason}</div>
                      </div>
                    </div>
                    <div style={{
                      padding:'4px 12px',borderRadius:20,fontSize:11,fontFamily:'Rajdhani',fontWeight:700,
                      background:l.status==='Approved'?'rgba(0,255,136,0.15)':l.status==='Rejected'?'rgba(255,68,102,0.15)':'rgba(255,170,0,0.15)',
                      color:l.status==='Approved'?'var(--ok)':l.status==='Rejected'?'var(--danger)':'var(--warn)',
                    }}>{l.status==='Approved'?<CheckCircle size={10} style={{display:'inline',marginRight:4}}/>:l.status==='Rejected'?<XCircle size={10} style={{display:'inline',marginRight:4}}/>:<Clock size={10} style={{display:'inline',marginRight:4}}/>}{l.status}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {tab==='attendance' && (
            <motion.div key="at" initial={{opacity:0}} animate={{opacity:1}} className="glass" style={{ padding:24 }}>
              <div style={{ fontFamily:'Orbitron',fontSize:12,fontWeight:700,marginBottom:20 }}>ATTENDANCE RECORD — DECEMBER 2024</div>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:8 }}>
                {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=>(
                  <div key={d} style={{ textAlign:'center',fontSize:11,color:'var(--t3)',fontFamily:'Rajdhani',fontWeight:600,padding:'8px 0' }}>{d}</div>
                ))}
                {Array.from({length:31},(_,i)=>{
                  const status = i>27?'future':i===14||i===15||i===21||i===22?'weekend':[3,10,17].includes(i)?'absent':'present';
                  return (
                    <div key={i} style={{
                      aspectRatio:'1',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',
                      fontSize:11,fontWeight:600,fontFamily:'Rajdhani',
                      background:status==='present'?'rgba(0,255,136,0.15)':status==='absent'?'rgba(255,68,102,0.15)':status==='weekend'?'var(--card)':'transparent',
                      color:status==='present'?'var(--ok)':status==='absent'?'var(--danger)':status==='weekend'?'var(--t3)':'var(--t3)',
                      border:`1px solid ${status==='present'?'rgba(0,255,136,0.3)':status==='absent'?'rgba(255,68,102,0.3)':'var(--b)'}`,
                    }}>{i+1}</div>
                  );
                })}
              </div>
              <div style={{ display:'flex',gap:20,marginTop:16,fontSize:12,fontFamily:'Rajdhani',color:'var(--t3)' }}>
                <span style={{ color:'var(--ok)' }}>● Present: 24</span>
                <span style={{ color:'var(--danger)' }}>● Absent: 3</span>
                <span>● Weekends: 4</span>
              </div>
            </motion.div>
          )}

          {tab==='payslips' && (
            <motion.div key="ps" initial={{opacity:0}} animate={{opacity:1}}>
              {['November 2024','October 2024','September 2024','August 2024'].map((m,i)=>(
                <div key={i} className="glass" style={{ padding:'18px 22px',marginBottom:12,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
                  <div style={{ display:'flex',alignItems:'center',gap:14 }}>
                    <FileText size={20} color="var(--a2)"/>
                    <div>
                      <div style={{ fontFamily:'Rajdhani',fontSize:14,fontWeight:700,color:'var(--t)' }}>Payslip — {m}</div>
                      <div style={{ fontSize:12,color:'var(--t3)' }}>Net Pay: ₹{(85000+i*1000).toLocaleString()}</div>
                    </div>
                  </div>
                  <button className="btn-ghost" style={{ display:'flex',alignItems:'center',gap:6,fontSize:12,padding:'8px 16px' }}>
                    <Download size={13}/> Download PDF
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Sidebar>
  );
}
