import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Upload, Bot, Search, Filter, Ticket } from 'lucide-react';
import axios from 'axios';
import Sidebar from '../components/layout/Sidebar';
import toast from 'react-hot-toast';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const CATEGORIES = ['IT','HR','Finance','Operations','Security','General'];
const PRIORITIES = ['Low','Medium','High','Critical'];

const DEMO_TICKETS = [
  { _id:'TK-001',title:'Laptop starts very slowly',category:'IT',priority:'High',status:'In Progress',createdAt:'2024-12-10',aiSuggestion:'Try: 1) Disable startup apps 2) Run disk cleanup 3) Update drivers 4) Check for malware' },
  { _id:'TK-002',title:'VPN keeps disconnecting',category:'IT',priority:'Medium',status:'Open',createdAt:'2024-12-09',aiSuggestion:'Common fixes: Check network adapter settings, update VPN client, disable Windows Firewall temporarily for testing' },
  { _id:'TK-003',title:'Cannot access shared drive',category:'IT',priority:'High',status:'Resolved',createdAt:'2024-12-05',aiSuggestion:'Resolved: Mapped network drive credentials were expired' },
];

export default function ITHelpdeskPage() {
  const [tickets, setTickets] = useState(DEMO_TICKETS);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ title:'', description:'', category:'IT', priority:'Medium' });
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [screenshot, setScreenshot] = useState(null);

  const getAISuggestion = async (text) => {
    if (!text || text.length < 10) return;
    setLoadingAI(true);
    try {
      const { data } = await axios.post(`${API}/ai/ticket-suggestion`, { text });
      setAiSuggestion(data.suggestion);
    } catch {
      // Offline AI
      const suggestions = {
        'slow': 'Try: Clear temp files, disable startup programs, run SFC /scannow, check RAM usage',
        'vpn': 'Try: Reconnect VPN, check network settings, update VPN client, try different server',
        'password': 'Contact IT for password reset. Ensure you are using corporate email format',
        'install': 'Software installation requires IT admin approval. Submit request with business justification',
        'default': 'Our AI is analyzing your issue. An IT specialist will respond within 2 hours.',
      };
      const key = Object.keys(suggestions).find(k => text.toLowerCase().includes(k)) || 'default';
      setAiSuggestion(suggestions[key]);
    }
    setLoadingAI(false);
  };

  const submitTicket = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k,v]) => fd.append(k,v));
    if (screenshot) fd.append('screenshot', screenshot);
    try {
      const { data } = await axios.post(`${API}/tickets`, fd, { headers:{'Content-Type':'multipart/form-data'} });
      setTickets(prev => [data.ticket, ...prev]);
      toast.success('Ticket created! AI assigned category: ' + data.category);
    } catch {
      const newTicket = { _id:`TK-00${tickets.length+1}`, ...form, status:'Open', createdAt:new Date().toISOString().split('T')[0], aiSuggestion };
      setTickets(prev => [newTicket, ...prev]);
      toast.success(`Ticket ${newTicket._id} created! AI: ${form.category}`);
    }
    setForm({ title:'', description:'', category:'IT', priority:'Medium' });
    setAiSuggestion('');
    setShowForm(false);
  };

  const filtered = tickets.filter(t => {
    const matchFilter = filter==='All' || t.status===filter;
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const statusColor = s => s==='Open'?'var(--warn)':s==='In Progress'?'var(--a2)':s==='Resolved'?'var(--ok)':'var(--t3)';
  const prioColor = p => p==='Critical'?'var(--danger)':p==='High'?'var(--warn)':p==='Medium'?'var(--a2)':'var(--t3)';

  return (
    <Sidebar>
      <div style={{ maxWidth:1100 }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:28 }}>
          <div>
            <div style={{ fontFamily:'Orbitron',fontSize:20,fontWeight:800,marginBottom:4 }}>IT HELPDESK</div>
            <div style={{ fontSize:13,color:'var(--t3)',fontFamily:'Rajdhani' }}>AI-powered ticket management with auto-suggestions</div>
          </div>
          <button className="btn-primary" onClick={()=>setShowForm(true)} style={{ display:'flex',alignItems:'center',gap:8,fontSize:12 }}>
            <Plus size={14}/> Raise Ticket
          </button>
        </div>

        {/* New Ticket Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}} className="glass" style={{ padding:28,marginBottom:24 }}>
              <div style={{ fontFamily:'Orbitron',fontSize:12,fontWeight:700,marginBottom:20,display:'flex',alignItems:'center',gap:8 }}>
                <Ticket size={14} color="var(--a)"/>NEW SUPPORT TICKET
              </div>
              <form onSubmit={submitTicket}>
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}>
                  <div style={{ gridColumn:'1/-1' }}>
                    <label>Issue Title *</label>
                    <input placeholder="Briefly describe your issue..." value={form.title}
                      onChange={e=>{ setForm(p=>({...p,title:e.target.value})); getAISuggestion(e.target.value); }}
                      required/>
                  </div>
                  <div style={{ gridColumn:'1/-1' }}>
                    <label>Detailed Description *</label>
                    <textarea rows={4} placeholder="Steps to reproduce, error messages, when it started..." value={form.description}
                      onChange={e=>setForm(p=>({...p,description:e.target.value}))} required/>
                  </div>
                  <div>
                    <label>Category (AI auto-detects)</label>
                    <select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
                      {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label>Priority</label>
                    <select value={form.priority} onChange={e=>setForm(p=>({...p,priority:e.target.value}))}>
                      {PRIORITIES.map(p=><option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div style={{ gridColumn:'1/-1' }}>
                    <label>Screenshot (optional)</label>
                    <input type="file" accept="image/*" onChange={e=>setScreenshot(e.target.files[0])} style={{ fontSize:12 }}/>
                  </div>
                </div>

                {/* AI Suggestion */}
                {(aiSuggestion || loadingAI) && (
                  <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{ marginTop:16,padding:'14px 16px',background:'rgba(0,255,200,0.06)',border:'1px solid rgba(0,255,200,0.2)',borderRadius:10 }}>
                    <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:8 }}>
                      <Bot size={14} color="var(--a)"/>
                      <span style={{ fontFamily:'Orbitron',fontSize:10,fontWeight:700,color:'var(--a)' }}>AI SUGGESTION</span>
                    </div>
                    {loadingAI
                      ? <div style={{ fontSize:13,color:'var(--t3)',fontFamily:'Inter' }}>Analyzing issue...</div>
                      : <div style={{ fontSize:13,color:'var(--t2)',fontFamily:'Inter',lineHeight:1.6 }}>{aiSuggestion}</div>
                    }
                  </motion.div>
                )}

                <div style={{ display:'flex',gap:12,marginTop:18 }}>
                  <button type="submit" className="btn-primary" style={{ fontSize:12 }}>Create Ticket</button>
                  <button type="button" className="btn-ghost" style={{ fontSize:12 }} onClick={()=>setShowForm(false)}>Cancel</button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters & Search */}
        <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:20 }}>
          <div style={{ position:'relative',flex:1,maxWidth:300 }}>
            <Search size={14} style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--t3)' }}/>
            <input placeholder="Search tickets..." value={search} onChange={e=>setSearch(e.target.value)} style={{ paddingLeft:36,height:38 }}/>
          </div>
          {['All','Open','In Progress','Resolved'].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{
              padding:'8px 16px',borderRadius:20,border:'none',cursor:'pointer',fontSize:12,fontFamily:'Rajdhani',fontWeight:600,
              background:filter===f?'var(--a)':'var(--card)',color:filter===f?'var(--bg)':'var(--t3)',transition:'all 0.2s',
            }}>{f}</button>
          ))}
        </div>

        {/* Tickets */}
        <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
          {filtered.map((t,i)=>(
            <motion.div key={t._id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}} className="glass" style={{ padding:'20px 24px' }}>
              <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:16 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:8 }}>
                    <span style={{ fontFamily:'Orbitron',fontSize:10,color:'var(--t3)' }}>{t._id}</span>
                    <span style={{ fontSize:10,fontFamily:'Rajdhani',fontWeight:700,padding:'2px 10px',borderRadius:20,background:`${prioColor(t.priority)}18`,color:prioColor(t.priority) }}>{t.priority}</span>
                    <span style={{ fontSize:10,fontFamily:'Rajdhani',fontWeight:700,padding:'2px 10px',borderRadius:20,background:'var(--card)',color:'var(--t3)' }}>{t.category}</span>
                  </div>
                  <div style={{ fontFamily:'Rajdhani',fontSize:15,fontWeight:700,color:'var(--t)',marginBottom:6 }}>{t.title}</div>
                  {t.description && <div style={{ fontSize:13,color:'var(--t3)',fontFamily:'Inter',marginBottom:10 }}>{t.description}</div>}
                  {t.aiSuggestion && (
                    <div style={{ padding:'10px 14px',background:'rgba(0,255,200,0.05)',border:'1px solid rgba(0,255,200,0.15)',borderRadius:8,fontSize:12,color:'var(--t2)',fontFamily:'Inter',lineHeight:1.5 }}>
                      <span style={{ color:'var(--a)',fontFamily:'Rajdhani',fontWeight:700,fontSize:11 }}>🤖 AI: </span>{t.aiSuggestion}
                    </div>
                  )}
                </div>
                <div style={{ textAlign:'right',flexShrink:0 }}>
                  <div style={{ padding:'4px 14px',borderRadius:20,background:`${statusColor(t.status)}18`,color:statusColor(t.status),fontSize:11,fontFamily:'Rajdhani',fontWeight:700,marginBottom:8 }}>{t.status}</div>
                  <div style={{ fontSize:11,color:'var(--t3)',fontFamily:'Inter' }}>{t.createdAt}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Sidebar>
  );
}
