import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const COMMANDS = [
  { patterns: ['open dashboard', 'go to dashboard', 'home'], action: (nav) => nav('/dashboard'), response: 'Opening dashboard...' },
  { patterns: ['open hr', 'hr portal', 'leave'], action: (nav) => nav('/hr'), response: 'Opening HR portal...' },
  { patterns: ['open it', 'helpdesk', 'raise ticket', 'create ticket'], action: (nav) => nav('/it'), response: 'Opening IT Helpdesk...' },
  { patterns: ['analytics', 'reports', 'statistics'], action: (nav) => nav('/analytics'), response: 'Opening Analytics...' },
  { patterns: ['directory', 'employees', 'find employee'], action: (nav) => nav('/directory'), response: 'Opening Employee Directory...' },
  { patterns: ['profile', 'my profile', 'account'], action: (nav) => nav('/profile'), response: 'Opening your profile...' },
  { patterns: ['admin', 'administration'], action: (nav) => nav('/admin'), response: 'Opening Admin panel...' },
];

function speak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = 1.1; utt.pitch = 1.0; utt.volume = 0.8;
  window.speechSynthesis.speak(utt);
}

export default function VoiceAssistant() {
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const text = Array.from(event.results).map(r => r[0].transcript).join('').toLowerCase();
      setTranscript(text);
      if (event.results[0].isFinal) processCommand(text);
    };
    recognition.onend = () => { setListening(false); };
    recognition.onerror = (e) => {
      setListening(false);
      if (e.error !== 'no-speech') toast.error(`Voice error: ${e.error}`);
    };
    recognitionRef.current = recognition;
  }, []);

  const processCommand = (text) => {
    setProcessing(true);
    setTimeout(() => {
      const matched = COMMANDS.find(cmd => cmd.patterns.some(p => text.includes(p)));
      if (matched) {
        speak(matched.response);
        toast.success(`🎙️ "${matched.response}"`);
        matched.action(navigate);
      } else {
        speak("I didn't understand that. Try saying open dashboard or open HR portal.");
        toast(`🎙️ Command: "${text}"`, { icon: '🤔' });
      }
      setProcessing(false);
      setTranscript('');
    }, 400);
  };

  const toggleListening = () => {
    if (!SpeechRecognition) { toast.error('Voice not supported in this browser'); return; }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
    } else {
      recognitionRef.current?.start();
      setListening(true);
      speak('Listening...');
    }
  };

  if (!SpeechRecognition) return null;

  return (
    <div style={{ position:'relative' }}>
      <button onClick={toggleListening} title="Voice Command" style={{
        background: listening ? 'linear-gradient(135deg, var(--a), var(--a2))' : 'var(--card)',
        border: `1px solid ${listening ? 'var(--a)' : 'var(--b)'}`,
        color: listening ? 'var(--bg)' : 'var(--t2)',
        padding:'7px 10px', borderRadius:8, cursor:'pointer',
        display:'flex', alignItems:'center', gap:6, fontSize:12,
        fontFamily:'Rajdhani', fontWeight:600,
        boxShadow: listening ? 'var(--glow)' : 'none',
        animation: listening ? 'pulse 1.5s ease infinite' : 'none',
        transition: 'all 0.2s',
      }}>
        {processing ? <Loader size={14} style={{ animation:'spin 1s linear infinite' }}/> :
         listening ? <Mic size={14}/> : <MicOff size={14}/>}
        {listening ? 'Listening...' : 'Voice'}
      </button>

      {transcript && (
        <div style={{
          position:'absolute', top:'110%', right:0, minWidth:200,
          background:'var(--bg2)', border:'1px solid var(--b)',
          borderRadius:8, padding:'8px 12px',
          fontFamily:'Inter', fontSize:12, color:'var(--t2)',
          whiteSpace:'nowrap', zIndex:100
        }}>
          🎙️ {transcript}
        </div>
      )}
    </div>
  );
}
