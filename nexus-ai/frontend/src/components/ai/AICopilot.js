import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader, X, Maximize2, Minimize2 } from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const QUICK_CMDS = [
  'Show open IT tickets',
  'Apply leave tomorrow',
  'My leave balance',
  'Find React developers',
  'Generate weekly report',
  'Show announcements',
];

export default function AICopilot({ embedded = false }) {
  const [messages, setMessages] = useState([
    { role:'assistant', content:'Hello! I\'m NEXUS AI. I can help you with tickets, HR tasks, analytics, and more. What do you need?', ts: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(embedded);
  const [open, setOpen] = useState(embedded);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    const userMsg = { role:'user', content: msg, ts: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/ai/chat`, {
        message: msg,
        history: messages.slice(-10)
      });
      setMessages(prev => [...prev, { role:'assistant', content: data.reply, action: data.action, ts: new Date() }]);
    } catch {
      setMessages(prev => [...prev, { role:'assistant', content:'Sorry, I encountered an error. Please try again.', ts: new Date() }]);
    }
    setLoading(false);
  };

  const ChatWindow = () => (
    <div style={{
      display:'flex', flexDirection:'column',
      height: embedded ? '100%' : (expanded ? 560 : 420),
      width: embedded ? '100%' : (expanded ? 420 : 340),
      background:'var(--bg2)', border:'1px solid var(--b)',
      borderRadius: embedded ? 16 : '16px 16px 0 0',
      overflow:'hidden', transition:'all 0.3s',
      boxShadow: embedded ? 'none' : 'var(--glows)',
    }}>
      {/* Header */}
      <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--b)', display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--card)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg, var(--a), var(--a2))', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Bot size={16} color="var(--bg)"/>
          </div>
          <div>
            <div style={{ fontFamily:'Orbitron', fontSize:12, fontWeight:700, color:'var(--a)' }}>NEXUS AI</div>
            <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, color:'var(--t3)' }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--ok)', animation:'blink 2s ease infinite' }}/>
              Online · Powered by LLM
            </div>
          </div>
        </div>
        {!embedded && (
          <div style={{ display:'flex', gap:6 }}>
            <button onClick={() => setExpanded(!expanded)} style={{ background:'transparent', border:'none', color:'var(--t3)', cursor:'pointer' }}>
              {expanded ? <Minimize2 size={14}/> : <Maximize2 size={14}/>}
            </button>
            <button onClick={() => setOpen(false)} style={{ background:'transparent', border:'none', color:'var(--t3)', cursor:'pointer' }}>
              <X size={14}/>
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:12 }}>
        {messages.map((m, i) => (
          <motion.div key={i} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
            style={{ display:'flex', gap:8, justifyContent: m.role==='user' ? 'flex-end' : 'flex-start' }}>
            {m.role === 'assistant' && (
              <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg, var(--a), var(--a2))', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Bot size={14} color="var(--bg)"/>
              </div>
            )}
            <div style={{
              maxWidth:'78%', padding:'10px 14px', borderRadius: m.role==='user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
              background: m.role==='user' ? 'linear-gradient(135deg, var(--a), var(--a2))' : 'var(--card)',
              color: m.role==='user' ? 'var(--bg)' : 'var(--t)',
              border: m.role==='assistant' ? '1px solid var(--b)' : 'none',
              fontSize:13, fontFamily:'Inter', lineHeight:1.5,
            }}>
              {m.content}
              {m.action && (
                <div style={{ marginTop:8, padding:'6px 10px', background:'rgba(0,255,200,0.1)', borderRadius:8, fontSize:11, color:'var(--a)', fontFamily:'Rajdhani', fontWeight:600 }}>
                  ✓ Action: {m.action}
                </div>
              )}
            </div>
            {m.role === 'user' && (
              <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--card)', border:'1px solid var(--b)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <User size={14} color="var(--t2)"/>
              </div>
            )}
          </motion.div>
        ))}
        {loading && (
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg, var(--a), var(--a2))', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Bot size={14} color="var(--bg)"/>
            </div>
            <div style={{ padding:'10px 14px', borderRadius:'4px 16px 16px 16px', background:'var(--card)', border:'1px solid var(--b)' }}>
              <Loader size={14} color="var(--a)" style={{ animation:'spin 1s linear infinite' }}/>
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Quick commands */}
      <div style={{ padding:'8px 12px', borderTop:'1px solid var(--b)', display:'flex', gap:6, overflowX:'auto' }}>
        {QUICK_CMDS.slice(0,3).map(cmd => (
          <button key={cmd} onClick={() => sendMessage(cmd)} style={{
            background:'var(--card)', border:'1px solid var(--b)', color:'var(--t2)',
            padding:'5px 10px', borderRadius:20, fontSize:11, fontFamily:'Rajdhani', cursor:'pointer',
            whiteSpace:'nowrap', transition:'all 0.2s', flexShrink:0,
          }}>{cmd}</button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding:'12px 16px', borderTop:'1px solid var(--b)', display:'flex', gap:8 }}>
        <input value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&sendMessage()}
          placeholder="Ask NEXUS AI anything..."
          style={{ flex:1, padding:'10px 14px', borderRadius:10, fontSize:13 }}/>
        <button onClick={() => sendMessage()} className="btn-primary"
          style={{ padding:'10px 14px', minWidth:44, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Send size={14}/>
        </button>
      </div>
    </div>
  );

  if (embedded) return <ChatWindow />;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity:0, scale:0.9, y:20 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.9, y:20 }}
            style={{ position:'fixed', bottom:80, right:24, zIndex:1000 }}>
            <ChatWindow />
          </motion.div>
        )}
      </AnimatePresence>
      <button onClick={() => setOpen(!open)} style={{
        position:'fixed', bottom:24, right:24, width:56, height:56,
        borderRadius:'50%', background:'linear-gradient(135deg, var(--a), var(--a2))',
        border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
        boxShadow:'var(--glows)', zIndex:1000, transition:'all 0.3s',
        animation:'pulse 3s ease infinite',
      }}>
        <Bot size={24} color="var(--bg)"/>
      </button>
    </>
  );
}
