import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Mail, Phone, Bot } from 'lucide-react';
import axios from 'axios';
import Sidebar from '../components/layout/Sidebar';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const DEMO_EMPLOYEES = [
  { _id:'1', name:'Arjun Sharma', department:'Engineering', role:'Senior Engineer', skills:['React','Node.js','Python','AWS'], email:'arjun@nexus.ai', phone:'+91 98765 43210', status:'online' },
  { _id:'2', name:'Priya Patel', department:'HR', role:'HR Manager', skills:['Recruitment','Policy','Analytics','Excel'], email:'priya@nexus.ai', phone:'+91 87654 32109', status:'away' },
  { _id:'3', name:'Rahul Gupta', department:'Engineering', role:'ML Engineer', skills:['Python','TensorFlow','PyTorch','Scikit-learn'], email:'rahul@nexus.ai', phone:'+91 76543 21098', status:'online' },
  { _id:'4', name:'Sneha Reddy', department:'Finance', role:'Financial Analyst', skills:['Excel','SAP','Power BI','Accounting'], email:'sneha@nexus.ai', phone:'+91 65432 10987', status:'offline' },
  { _id:'5', name:'Karthik Nair', department:'Operations', role:'Project Manager', skills:['Jira','Agile','Scrum','Leadership'], email:'karthik@nexus.ai', phone:'+91 54321 09876', status:'online' },
  { _id:'6', name:'Divya Menon', department:'Engineering', role:'DevOps Engineer', skills:['Docker','Kubernetes','CI/CD','AWS'], email:'divya@nexus.ai', phone:'+91 43210 98765', status:'busy' },
  { _id:'7', name:'Vikram Singh', department:'Marketing', role:'Growth Lead', skills:['SEO','Analytics','Content','Campaigns'], email:'vikram@nexus.ai', phone:'+91 32109 87654', status:'online' },
  { _id:'8', name:'Lakshmi Iyer', department:'Engineering', role:'React Developer', skills:['React','TypeScript','GraphQL','CSS'], email:'lakshmi@nexus.ai', phone:'+91 21098 76543', status:'away' },
];

const DEPT_COLORS = { Engineering:'var(--a)', HR:'var(--a2)', Finance:'var(--warn)', Operations:'var(--ok)', Marketing:'var(--a3)', Design:'#ff88ff', Sales:'#88ffaa' };
const STATUS_COLORS = { online:'var(--ok)', away:'var(--warn)', offline:'var(--t3)', busy:'var(--danger)' };

export default function EmployeeDirectoryPage() {
  const [employees, setEmployees] = useState(DEMO_EMPLOYEES);
  const [search, setSearch] = useState('');
  const [aiSearch, setAiSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [aiResult, setAiResult] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    axios.get(`${API}/employees`).then(r=>setEmployees(r.data)).catch(()=>{});
  }, []);

  const handleAISearch = async () => {
    if (!aiSearch.trim()) return;
    setLoadingAI(true);
    try {
      const { data } = await axios.post(`${API}/ai/search`, { query: aiSearch });
      setAiResult(data.result);
      setSearch(data.keyword || '');
    } catch {
      // Offline AI search simulation
      const kw = aiSearch.toLowerCase();
      if (kw.includes('react')) { setSearch('React'); setAiResult('Found React developers in Engineering department'); }
      else if (kw.includes('python') || kw.includes('ml')) { setSearch('Python'); setAiResult('Found Python/ML engineers'); }
      else if (kw.includes('hr')) { setSearch(''); setDeptFilter('HR'); setAiResult('Showing HR department employees'); }
      else { setAiResult(`Searching for: "${aiSearch}"`); setSearch(aiSearch); }
    }
    setLoadingAI(false);
  };

  const filtered = employees.filter(e => {
    const s = search.toLowerCase();
    const matchSearch = !s || e.name.toLowerCase().includes(s) || e.skills?.some(sk=>sk.toLowerCase().includes(s)) ||
      e.role.toLowerCase().includes(s) || e.department.toLowerCase().includes(s);
    const matchDept = deptFilter==='All' || e.department===deptFilter;
    return matchSearch && matchDept;
  });

  const depts = ['All', ...new Set(employees.map(e=>e.department))];

  return (
    <Sidebar>
      <div style={{ maxWidth:1300 }}>
        <div style={{ marginBottom:24 }}>
          <div style={{ fontFamily:'Orbitron',fontSize:20,fontWeight:800,marginBottom:4 }}>EMPLOYEE DIRECTORY</div>
          <div style={{ fontSize:13,color:'var(--t3)',fontFamily:'Rajdhani' }}>
            AI-searchable workforce graph — {employees.length} employees
          </div>
        </div>

        {/* AI Search */}
        <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} className="glass" style={{ padding:'16px 20px',marginBottom:20,display:'flex',gap:12,alignItems:'center',flexWrap:'wrap' }}>
          <Bot size={16} color="var(--a)"/>
          <input value={aiSearch} onChange={e=>setAiSearch(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&handleAISearch()}
            placeholder='AI search: "Find React developers" or "Who knows Python in Finance?"'
            style={{ flex:1,minWidth:200,background:'transparent',border:'none',outline:'none',padding:'0',fontSize:13,color:'var(--t)' }}/>
          <button onClick={handleAISearch} className="btn-primary" style={{ fontSize:12,padding:'8px 16px',display:'flex',alignItems:'center',gap:6 }}>
            <Bot size={12}/> {loadingAI ? 'Searching...' : 'AI Search'}
          </button>
        </motion.div>

        {aiResult && (
          <div style={{ marginBottom:16,padding:'10px 16px',background:'rgba(0,255,200,0.08)',border:'1px solid rgba(0,255,200,0.2)',borderRadius:10,fontSize:13,color:'var(--a)',fontFamily:'Rajdhani',fontWeight:600 }}>
            🤖 {aiResult}
          </div>
        )}

        {/* Regular search + filters */}
        <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:20,flexWrap:'wrap' }}>
          <div style={{ position:'relative',flex:1,maxWidth:280 }}>
            <Search size={14} style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--t3)' }}/>
            <input placeholder="Name, skill, role..." value={search} onChange={e=>setSearch(e.target.value)} style={{ paddingLeft:36,height:38 }}/>
          </div>
          {depts.map(d=>(
            <button key={d} onClick={()=>setDeptFilter(d)} style={{
              padding:'6px 14px',borderRadius:20,border:'none',cursor:'pointer',fontSize:12,fontFamily:'Rajdhani',fontWeight:600,
              background:deptFilter===d?'var(--a)':'var(--card)',
              color:deptFilter===d?'var(--bg)':'var(--t3)',transition:'all 0.2s'
            }}>{d}</button>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:16 }}>
          {filtered.map((emp,i)=>(
            <motion.div key={emp._id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}
              whileHover={{y:-4,boxShadow:'var(--glows)'}} className="glass" style={{ padding:'22px',cursor:'default' }}>
              <div style={{ display:'flex',alignItems:'center',gap:14,marginBottom:16 }}>
                <div style={{ position:'relative' }}>
                  <div style={{
                    width:52,height:52,borderRadius:'50%',
                    background:`linear-gradient(135deg,${DEPT_COLORS[emp.department]||'var(--a)'},var(--a2))`,
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:20,fontWeight:700,color:'var(--bg)',
                  }}>{emp.name[0]}</div>
                  <div style={{
                    position:'absolute',bottom:1,right:1,width:12,height:12,borderRadius:'50%',
                    background:STATUS_COLORS[emp.status],border:'2px solid var(--bg2)'
                  }}/>
                </div>
                <div style={{ flex:1,overflow:'hidden' }}>
                  <div style={{ fontFamily:'Rajdhani',fontSize:15,fontWeight:700,color:'var(--t)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{emp.name}</div>
                  <div style={{ fontSize:12,color:'var(--t3)',fontFamily:'Inter' }}>{emp.role}</div>
                  <div style={{ fontSize:11,color:DEPT_COLORS[emp.department]||'var(--a)',fontFamily:'Rajdhani',fontWeight:600 }}>{emp.department}</div>
                </div>
              </div>
              <div style={{ display:'flex',flexWrap:'wrap',gap:5,marginBottom:14 }}>
                {emp.skills?.slice(0,4).map(s=>(
                  <span key={s} style={{ padding:'3px 8px',borderRadius:20,background:'var(--bg2)',border:'1px solid var(--b)',fontSize:10,fontFamily:'Rajdhani',fontWeight:600,color:'var(--t3)' }}>{s}</span>
                ))}
              </div>
              <div style={{ display:'flex',flexDirection:'column',gap:5 }}>
                <div style={{ display:'flex',alignItems:'center',gap:7,fontSize:12,color:'var(--t3)',fontFamily:'Inter' }}>
                  <Mail size={11} color="var(--a2)"/>{emp.email}
                </div>
                <div style={{ display:'flex',alignItems:'center',gap:7,fontSize:12,color:'var(--t3)',fontFamily:'Inter' }}>
                  <Phone size={11} color="var(--ok)"/>{emp.phone}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign:'center',padding:'60px',color:'var(--t3)',fontFamily:'Rajdhani',fontSize:14 }}>
            No employees found matching your search.
          </div>
        )}
      </div>
    </Sidebar>
  );
}
