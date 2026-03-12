import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Ticket, BarChart3, UserCircle,
  LogOut, Settings, ChevronLeft, ChevronRight, Heart,
  Shield, Briefcase, Menu, X, Bell
} from 'lucide-react';
import { useAuthStore } from '../../context/authStore';
import { useThemeStore, THEMES } from '../../context/themeStore';
import ThemeSwitcher from '../common/ThemeSwitcher';
import VoiceAssistant from '../ai/VoiceAssistant';

const navItems = [
  { path: '/dashboard',  icon: <LayoutDashboard size={18}/>, label: 'Dashboard' },
  { path: '/directory',  icon: <Users size={18}/>,           label: 'Directory' },
  { path: '/hr',         icon: <Briefcase size={18}/>,       label: 'HR Portal' },
  { path: '/it',         icon: <Ticket size={18}/>,          label: 'IT Helpdesk' },
  { path: '/analytics',  icon: <BarChart3 size={18}/>,       label: 'Analytics' },
  { path: '/profile',    icon: <UserCircle size={18}/>,      label: 'Profile' },
];
const adminItems = [
  { path: '/admin', icon: <Shield size={18}/>, label: 'Admin Panel' },
];

export default function Sidebar({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { theme } = useThemeStore();

  const isActive = (path) => location.pathname === path;

  const SidebarContent = () => (
    <div style={{
      width: collapsed ? 70 : 240,
      height: '100vh',
      background: 'var(--sidebar)',
      borderRight: '1px solid var(--b)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.3s ease',
      overflow: 'hidden',
      position: 'fixed',
      left: 0, top: 0,
      zIndex: 100,
      backdropFilter: 'blur(20px)',
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 16px 20px', display:'flex', alignItems:'center', gap:12, borderBottom:'1px solid var(--b)' }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: 'linear-gradient(135deg, var(--a), var(--a2))',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize: 18, fontWeight: 900, color: 'var(--bg)',
          fontFamily: 'Orbitron', flexShrink: 0,
          boxShadow: 'var(--glow)'
        }}>N</div>
        {!collapsed && (
          <div>
            <div style={{ fontFamily:'Orbitron', fontSize:14, fontWeight:800, color:'var(--a)', letterSpacing:'0.1em' }}>NEXUS</div>
            <div style={{ fontSize:10, color:'var(--t3)', fontFamily:'Rajdhani', letterSpacing:'0.15em' }}>WORKPLACE OS</div>
          </div>
        )}
      </div>

      {/* User mini card */}
      {!collapsed && (
        <div style={{ padding:'16px', borderBottom:'1px solid var(--b)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{
              width:36, height:36, borderRadius:'50%',
              background:`linear-gradient(135deg, var(--a), var(--a2))`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:14, fontWeight:700, color:'var(--bg)', flexShrink:0
            }}>{user?.name?.[0]?.toUpperCase()}</div>
            <div style={{ overflow:'hidden' }}>
              <div style={{ fontSize:13, fontWeight:600, color:'var(--t)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user?.name}</div>
              <div style={{ fontSize:10, color:'var(--a)', fontFamily:'Rajdhani', textTransform:'uppercase', letterSpacing:'0.1em' }}>{user?.role}</div>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex:1, overflowY:'auto', padding:'12px 8px' }}>
        {navItems.map(item => (
          <button key={item.path}
            onClick={() => { navigate(item.path); setMobileOpen(false); }}
            style={{
              width:'100%', display:'flex', alignItems:'center', gap:12,
              padding: collapsed ? '12px 16px' : '11px 14px',
              borderRadius:10, border:'none', cursor:'pointer',
              background: isActive(item.path) ? 'var(--card-h)' : 'transparent',
              color: isActive(item.path) ? 'var(--a)' : 'var(--t2)',
              borderLeft: isActive(item.path) ? '3px solid var(--a)' : '3px solid transparent',
              marginBottom:4, transition:'all 0.2s',
              justifyContent: collapsed ? 'center' : 'flex-start',
              boxShadow: isActive(item.path) ? 'var(--glow)' : 'none',
              fontFamily:'Rajdhani', fontSize:14, fontWeight:600, letterSpacing:'0.04em',
            }}
          >
            {item.icon}
            {!collapsed && item.label}
          </button>
        ))}

        {(user?.role === 'admin' || user?.role === 'hr') && (
          <>
            {!collapsed && <div style={{ fontSize:10, color:'var(--t3)', padding:'12px 14px 6px', letterSpacing:'0.1em', fontFamily:'Rajdhani' }}>ADMIN</div>}
            {adminItems.map(item => (
              <button key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  width:'100%', display:'flex', alignItems:'center', gap:12,
                  padding:collapsed?'12px 16px':'11px 14px', borderRadius:10, border:'none',
                  cursor:'pointer',
                  background:isActive(item.path)?'var(--card-h)':'transparent',
                  color:isActive(item.path)?'var(--a)':'var(--t2)',
                  borderLeft:isActive(item.path)?'3px solid var(--a)':'3px solid transparent',
                  marginBottom:4, transition:'all 0.2s',
                  justifyContent:collapsed?'center':'flex-start',
                  fontFamily:'Rajdhani', fontSize:14, fontWeight:600,
                }}
              >{item.icon}{!collapsed && item.label}</button>
            ))}
          </>
        )}
      </nav>

      {/* Bottom */}
      <div style={{ padding:'12px 8px', borderTop:'1px solid var(--b)' }}>
        {!collapsed && <ThemeSwitcher />}
        <button onClick={logout} style={{
          width:'100%', display:'flex', alignItems:'center', gap:12,
          padding:'11px 14px', borderRadius:10, border:'none', cursor:'pointer',
          background:'transparent', color:'var(--danger)',
          justifyContent:collapsed?'center':'flex-start',
          fontFamily:'Rajdhani', fontSize:14, fontWeight:600, marginTop:4,
          transition:'all 0.2s',
        }}>
          <LogOut size={18}/>
          {!collapsed && 'Sign Out'}
        </button>
      </div>

      {/* Collapse btn */}
      <button onClick={() => setCollapsed(!collapsed)} style={{
        position:'absolute', right:-12, top:80,
        width:24, height:24, borderRadius:'50%', border:'1px solid var(--b)',
        background:'var(--bg2)', color:'var(--t2)', display:'flex',
        alignItems:'center', justifyContent:'center', cursor:'pointer',
        fontSize:10, zIndex:10
      }}>
        {collapsed ? <ChevronRight size={12}/> : <ChevronLeft size={12}/>}
      </button>
    </div>
  );

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg)' }}>
      {/* Desktop sidebar */}
      <div style={{ display:'flex' }}>
        <SidebarContent />
        <div style={{ width: collapsed ? 70 : 240, flexShrink:0, transition:'width 0.3s' }}/>
      </div>

      {/* Main */}
      <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
        {/* Top bar */}
        <div style={{
          height:60, background:'var(--bg2)', borderBottom:'1px solid var(--b)',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'0 24px', backdropFilter:'blur(20px)', position:'sticky', top:0, zIndex:50
        }}>
          <div style={{ fontFamily:'Orbitron', fontSize:13, color:'var(--t2)', letterSpacing:'0.08em' }}>
            {navItems.find(n=>n.path===location.pathname)?.label || 'NEXUS AI'}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <VoiceAssistant />
            <button style={{ background:'transparent', border:'1px solid var(--b)', color:'var(--t2)', padding:'6px 10px', borderRadius:8, cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontSize:12, fontFamily:'Rajdhani' }}>
              <Bell size={14}/> <span style={{ background:'var(--a)', color:'var(--bg)', borderRadius:'50%', padding:'1px 5px', fontSize:10 }}>3</span>
            </button>
            <div style={{
              width:32, height:32, borderRadius:'50%',
              background:'linear-gradient(135deg, var(--a), var(--a2))',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:13, fontWeight:700, color:'var(--bg)', cursor:'pointer'
            }} onClick={()=>navigate('/profile')}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </div>
        <main style={{ flex:1, overflowY:'auto', padding:'24px' }}>{children}</main>
      </div>
    </div>
  );
}
