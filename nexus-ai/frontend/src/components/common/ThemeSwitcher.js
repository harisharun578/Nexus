import React, { useState } from 'react';
import { THEMES, useThemeStore } from '../../context/themeStore';

export default function ThemeSwitcher() {
  const { theme, setTheme } = useThemeStore();
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position:'relative', marginBottom:4 }}>
      <button onClick={() => setOpen(!open)} style={{
        width:'100%', display:'flex', alignItems:'center', gap:10,
        padding:'10px 14px', borderRadius:10, border:'1px solid var(--b)',
        background:'var(--card)', color:'var(--t2)', cursor:'pointer',
        fontFamily:'Rajdhani', fontSize:13, fontWeight:600,
      }}>
        <span>{THEMES.find(t=>t.id===theme)?.icon}</span>
        <span>{THEMES.find(t=>t.id===theme)?.name}</span>
        <span style={{ marginLeft:'auto', fontSize:10 }}>▾</span>
      </button>
      {open && (
        <div style={{
          position:'absolute', bottom:'110%', left:0, right:0,
          background:'var(--bg2)', border:'1px solid var(--b)',
          borderRadius:12, overflow:'hidden', zIndex:200,
          backdropFilter:'blur(20px)'
        }}>
          {THEMES.map(t => (
            <button key={t.id} onClick={() => { setTheme(t.id); setOpen(false); }}
              style={{
                width:'100%', display:'flex', alignItems:'center', gap:10,
                padding:'10px 14px', border:'none', cursor:'pointer',
                background: theme===t.id ? 'var(--card-h)' : 'transparent',
                color: theme===t.id ? 'var(--a)' : 'var(--t2)',
                fontFamily:'Rajdhani', fontSize:13, fontWeight:600,
                borderLeft: theme===t.id ? '3px solid var(--a)' : '3px solid transparent',
                transition:'all 0.2s'
              }}>
              <span>{t.icon}</span><span>{t.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
