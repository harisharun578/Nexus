import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import axios from 'axios';
import Sidebar from '../components/layout/Sidebar';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const BURNOUT_DATA = [
  { dept:'Engineering',risk:72,workHrs:52,meetings:18 },
  { dept:'HR',risk:45,workHrs:44,meetings:22 },
  { dept:'Finance',risk:58,workHrs:48,meetings:14 },
  { dept:'Marketing',risk:38,workHrs:42,meetings:12 },
  { dept:'Sales',risk:65,workHrs:50,meetings:20 },
];

const TICKET_TREND = [
  {month:'Jul',IT:45,HR:20,Finance:12},{month:'Aug',IT:52,HR:18,Finance:15},
  {month:'Sep',IT:38,HR:25,Finance:10},{month:'Oct',IT:60,HR:22,Finance:18},
  {month:'Nov',IT:55,HR:30,Finance:14},{month:'Dec',IT:42,HR:28,Finance:11},
];

const TICKET_DIST = [
  {name:'IT',value:45,color:'#00ffc8'},{name:'HR',value:28,color:'#00aaff'},
  {name:'Finance',value:15,color:'#ff00aa'},{name:'Operations',value:12,color:'#ffaa00'},
];

const SKILL_DATA = [
  {skill:'React',A:85},{skill:'Python',A:72},{skill:'Node',A:68},{skill:'ML/AI',A:55},{skill:'DevOps',A:60},{skill:'Security',A:48}
];

export default function AnalyticsPage() {
  const [burnoutPredictions, setBurnoutPredictions] = useState(BURNOUT_DATA);
  const [attritionRisk] = useState([
    { name:'Low Risk', value:65, color:'var(--ok)' },
    { name:'Medium Risk', value:25, color:'var(--warn)' },
    { name:'High Risk', value:10, color:'var(--danger)' },
  ]);

  const MetricCard = ({ label, value, sub, color, trend }) => (
    <motion.div whileHover={{y:-3}} className="glass" style={{ padding:'22px',borderLeft:`3px solid ${color}` }}>
      <div style={{ fontSize:11,color:'var(--t3)',fontFamily:'Rajdhani',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:8 }}>{label}</div>
      <div style={{ fontFamily:'Orbitron',fontSize:26,fontWeight:800,color }}>{value}</div>
      <div style={{ fontSize:11,color:trend>0?'var(--ok)':'var(--danger)',marginTop:4,fontFamily:'Rajdhani' }}>
        {trend>0?'↑':'↓'} {Math.abs(trend)}% vs last month — {sub}
      </div>
    </motion.div>
  );

  return (
    <Sidebar>
      <div style={{ maxWidth:1400 }}>
        <div style={{ marginBottom:28 }}>
          <div style={{ fontFamily:'Orbitron',fontSize:20,fontWeight:800,marginBottom:4 }}>ML ANALYTICS</div>
          <div style={{ fontSize:13,color:'var(--t3)',fontFamily:'Rajdhani' }}>
            AI-powered workforce intelligence · Random Forest burnout prediction · Isolation Forest anomaly detection
          </div>
        </div>

        {/* KPI Cards */}
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16,marginBottom:28 }}>
          <MetricCard label="Avg Burnout Risk" value="55%" sub="across all depts" color="var(--warn)" trend={-8}/>
          <MetricCard label="Attrition Risk" value="10%" sub="high-risk employees" color="var(--danger)" trend={2}/>
          <MetricCard label="Tickets Resolved" value="87%" sub="SLA compliance" color="var(--ok)" trend={5}/>
          <MetricCard label="Anomalies Detected" value="3" sub="security flags" color="var(--a2)" trend={-1}/>
        </div>

        {/* Charts row 1 */}
        <div style={{ display:'grid',gridTemplateColumns:'2fr 1fr',gap:20,marginBottom:20 }}>
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="glass" style={{ padding:24 }}>
            <div style={{ fontFamily:'Orbitron',fontSize:12,fontWeight:700,marginBottom:4 }}>TICKET VOLUME TREND (6 MONTHS)</div>
            <div style={{ fontSize:11,color:'var(--t3)',fontFamily:'Rajdhani',marginBottom:16 }}>By department · ML-classified</div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={TICKET_TREND}>
                <defs>
                  {[['gIT','var(--a)'],['gHR','var(--a2)'],['gFin','var(--a3)']].map(([id,c])=>(
                    <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={c} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={c} stopOpacity={0}/>
                    </linearGradient>
                  ))}
                </defs>
                <XAxis dataKey="month" tick={{fill:'var(--t3)',fontSize:11,fontFamily:'Rajdhani'}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:'var(--t3)',fontSize:11}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:'var(--bg2)',border:'1px solid var(--b)',borderRadius:8,fontFamily:'Rajdhani',fontSize:12}}/>
                <Area type="monotone" dataKey="IT" stroke="var(--a)" strokeWidth={2} fill="url(#gIT)"/>
                <Area type="monotone" dataKey="HR" stroke="var(--a2)" strokeWidth={2} fill="url(#gHR)"/>
                <Area type="monotone" dataKey="Finance" stroke="var(--a3)" strokeWidth={2} fill="url(#gFin)"/>
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="glass" style={{ padding:24 }}>
            <div style={{ fontFamily:'Orbitron',fontSize:12,fontWeight:700,marginBottom:4 }}>TICKET DISTRIBUTION</div>
            <div style={{ fontSize:11,color:'var(--t3)',fontFamily:'Rajdhani',marginBottom:8 }}>NLP auto-classification</div>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={TICKET_DIST} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4} dataKey="value">
                  {TICKET_DIST.map((e,i)=><Cell key={i} fill={e.color}/>)}
                </Pie>
                <Tooltip contentStyle={{background:'var(--bg2)',border:'1px solid var(--b)',borderRadius:8,fontFamily:'Rajdhani',fontSize:12}}/>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display:'flex',flexWrap:'wrap',gap:'8px 16px',justifyContent:'center' }}>
              {TICKET_DIST.map(d=>(
                <div key={d.name} style={{ display:'flex',alignItems:'center',gap:5,fontSize:11,fontFamily:'Rajdhani',color:'var(--t2)' }}>
                  <div style={{ width:8,height:8,borderRadius:2,background:d.color }}/>
                  {d.name}: {d.value}%
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Charts row 2 */}
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20 }}>
          {/* Burnout */}
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}} className="glass" style={{ padding:24 }}>
            <div style={{ fontFamily:'Orbitron',fontSize:12,fontWeight:700,marginBottom:4 }}>🧠 BURNOUT PREDICTION</div>
            <div style={{ fontSize:11,color:'var(--t3)',fontFamily:'Rajdhani',marginBottom:16 }}>Random Forest model · By department</div>
            <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
              {BURNOUT_DATA.map((d,i)=>(
                <div key={i}>
                  <div style={{ display:'flex',justifyContent:'space-between',marginBottom:5,fontSize:12,fontFamily:'Rajdhani',color:'var(--t2)' }}>
                    <span>{d.dept}</span>
                    <span style={{ color:d.risk>65?'var(--danger)':d.risk>45?'var(--warn)':'var(--ok)',fontWeight:700 }}>{d.risk}%</span>
                  </div>
                  <div style={{ height:6,borderRadius:3,background:'var(--bg2)',overflow:'hidden' }}>
                    <motion.div initial={{width:0}} animate={{width:`${d.risk}%`}} transition={{delay:0.3+i*0.1,duration:0.8}}
                      style={{ height:'100%',borderRadius:3,background:d.risk>65?'var(--danger)':d.risk>45?'var(--warn)':'var(--ok)' }}/>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Skill Radar */}
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.25}} className="glass" style={{ padding:24 }}>
            <div style={{ fontFamily:'Orbitron',fontSize:12,fontWeight:700,marginBottom:4 }}>WORKFORCE SKILL COVERAGE</div>
            <div style={{ fontSize:11,color:'var(--t3)',fontFamily:'Rajdhani',marginBottom:8 }}>Company-wide proficiency levels</div>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={SKILL_DATA}>
                <PolarGrid stroke="var(--b)"/>
                <PolarAngleAxis dataKey="skill" tick={{fill:'var(--t3)',fontSize:11,fontFamily:'Rajdhani'}}/>
                <Radar name="Skills" dataKey="A" stroke="var(--a)" fill="var(--a)" fillOpacity={0.15} strokeWidth={2}/>
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Attrition Risk */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.35}} className="glass" style={{ padding:24 }}>
          <div style={{ fontFamily:'Orbitron',fontSize:12,fontWeight:700,marginBottom:4 }}>ATTRITION RISK ANALYSIS</div>
          <div style={{ fontSize:11,color:'var(--t3)',fontFamily:'Rajdhani',marginBottom:20 }}>ML model: gradient boosting · Updated daily</div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16 }}>
            {attritionRisk.map((r,i)=>(
              <div key={i} style={{ textAlign:'center',padding:'20px',background:'var(--bg2)',borderRadius:12,border:`1px solid ${r.color}30` }}>
                <div style={{ fontFamily:'Orbitron',fontSize:32,fontWeight:900,color:r.color,marginBottom:4 }}>{r.value}%</div>
                <div style={{ fontSize:12,color:'var(--t2)',fontFamily:'Rajdhani',fontWeight:600 }}>{r.name}</div>
                <div style={{ marginTop:10,height:4,borderRadius:2,background:'var(--bg3)',overflow:'hidden' }}>
                  <motion.div initial={{width:0}} animate={{width:`${r.value}%`}} transition={{delay:0.5+i*0.1,duration:0.8}}
                    style={{ height:'100%',background:r.color,borderRadius:2 }}/>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </Sidebar>
  );
}
