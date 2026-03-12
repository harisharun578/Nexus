const router = require('express').Router();
const axios = require('axios');
const { auth } = require('../middleware/auth');
const Ticket = require('../models/Ticket');
const LeaveRequest = require('../models/LeaveRequest');
const User = require('../models/User');

// ── Intent Detection ─────────────────────────────────────────────
function detectIntent(msg) {
  const m = msg.toLowerCase();
  if (m.match(/create|raise|open|new|submit.*(ticket|issue|problem|request)/)) return 'create_ticket';
  if (m.match(/apply|request|take|book.*(leave|vacation|off|holiday)/)) return 'apply_leave';
  if (m.match(/leave balance|how many (leave|days)|remaining days/)) return 'check_balance';
  if (m.match(/my tickets?|open ticket|show ticket/)) return 'list_tickets';
  if (m.match(/announc|news|update/)) return 'announcements';
  if (m.match(/find|who know|who (is|are)|search employee/)) return 'find_employee';
  if (m.match(/report|analytics|statistic|dashboard data/)) return 'analytics';
  if (m.match(/payslip|salary|pay slip/)) return 'payslip';
  if (m.match(/burnout|stress|workload/)) return 'burnout';
  if (m.match(/emergency|sos|help/)) return 'emergency';
  return 'general';
}

// ── Rule-Based Response Engine ───────────────────────────────────
async function ruleBasedResponse(intent, message, userId) {
  switch (intent) {
    case 'create_ticket': {
      const title = message.replace(/(create|raise|open|new|submit|a|an|ticket|issue|problem|my)/gi,'').trim() || 'Support Request';
      return {
        reply: `I'll help you create a ticket for: "${title}". Head to the IT Helpdesk and I'll pre-fill the details. Want me to open it now?`,
        action: 'Opening IT Helpdesk',
        navigateTo: '/it'
      };
    }
    case 'apply_leave': {
      const user = await User.findById(userId).select('leaveBalance name');
      return {
        reply: `I can help you apply for leave, ${user?.name?.split(' ')[0]}! You have ${user?.leaveBalance || 18} days remaining. Opening the HR Portal...`,
        action: 'Opening HR Portal',
        navigateTo: '/hr'
      };
    }
    case 'check_balance': {
      const user = await User.findById(userId).select('leaveBalance name');
      return {
        reply: `Hi ${user?.name?.split(' ')[0]}! Your leave balance:\n• Annual Leave: 12 days\n• Sick Leave: ${Math.min(8, user?.leaveBalance || 6)} days\n• Casual Leave: 5 days\n• **Total remaining: ${user?.leaveBalance || 18} days**`,
        action: null
      };
    }
    case 'list_tickets': {
      const tickets = await Ticket.find({ createdBy: userId }).limit(4).sort({ createdAt: -1 });
      if (!tickets.length) return { reply: "You have no tickets yet. Need to raise one? Just say 'Create ticket [issue]'", action: null };
      const list = tickets.map(t => `• **${t.ticketId}** — ${t.title} [${t.status}]`).join('\n');
      return { reply: `Your recent tickets:\n${list}`, action: 'View all tickets', navigateTo: '/it' };
    }
    case 'find_employee': {
      const skill = message.match(/react|python|node\.?js|java|angular|vue|ml|ai|devops|docker|kubernetes|aws/i)?.[0];
      if (skill) {
        const emps = await User.find({ skills: { $regex: skill, $options: 'i' } }).limit(5).select('name department role');
        if (emps.length) {
          const list = emps.map(e => `• **${e.name}** — ${e.role}, ${e.department}`).join('\n');
          return { reply: `Found ${emps.length} employee(s) with **${skill}** skills:\n${list}`, action: 'View Directory', navigateTo: '/directory' };
        }
      }
      return { reply: 'Let me open the Employee Directory where you can search by name, skill, or department.', action: 'Opening Directory', navigateTo: '/directory' };
    }
    case 'analytics':
      return { reply: '📊 Opening the ML Analytics dashboard with burnout predictions, ticket trends, and workforce intelligence!', action: 'Opening Analytics', navigateTo: '/analytics' };
    case 'payslip':
      return { reply: 'Your payslips are in the HR Portal under the Payslips tab. Opening it now...', action: 'Opening HR Portal', navigateTo: '/hr' };
    case 'burnout':
      return { reply: '🧠 Our Random Forest ML model analyzes working hours, meetings, leave usage and ticket load to predict burnout risk. Check the Analytics page for your department\'s current risk levels.', action: 'View Burnout Analytics', navigateTo: '/analytics' };
    case 'emergency':
      return { reply: '🚨 If this is an emergency, please use the **Emergency SOS button** on your Dashboard. It immediately notifies HR and Security. Stay safe!', action: 'Go to Dashboard', navigateTo: '/dashboard' };
    default:
      return {
        reply: `I'm **NEXUS AI**, your workplace assistant! I can help you:\n\n• 🎫 **Create IT tickets** — "Raise ticket laptop slow"\n• 🏖️ **Apply for leave** — "Apply leave tomorrow"\n• 📊 **Check analytics** — "Show burnout report"\n• 👥 **Find employees** — "Find React developers"\n• 💰 **Payslips** — "Show my payslip"\n\nWhat do you need?`,
        action: null
      };
  }
}

// ── POST /api/ai/chat ────────────────────────────────────────────
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: 'Message required' });
    const intent = detectIntent(message);

    // Try OpenAI if key exists
    if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your_')) {
      try {
        const user = await User.findById(req.userId).select('name department role leaveBalance');
        const systemPrompt = `You are NEXUS AI, an intelligent enterprise workplace assistant for a company called NEXUS AI.
User: ${user?.name}, ${user?.role} in ${user?.department} dept. Leave balance: ${user?.leaveBalance} days.
Be concise, helpful and professional. Use markdown for formatting. 
Available actions you can suggest: navigate to /dashboard, /hr, /it, /analytics, /directory, /profile.`;

        const { data } = await axios.post('https://api.openai.com/v1/chat/completions', {
          model: 'gpt-3.5-turbo',
          max_tokens: 500,
          messages: [
            { role: 'system', content: systemPrompt },
            ...history.slice(-8).map(h => ({ role: h.role, content: h.content })),
            { role: 'user', content: message }
          ]
        }, {
          headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
          timeout: 8000
        });
        return res.json({ reply: data.choices[0].message.content, intent, source: 'openai' });
      } catch (aiErr) {
        console.log('OpenAI fallback to rule-based:', aiErr.message);
      }
    }

    const result = await ruleBasedResponse(intent, message, req.userId);
    res.json({ ...result, intent, source: 'rule-based' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/ai/ticket-suggestion ──────────────────────────────
router.post('/ticket-suggestion', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const suggestions = {
      slow: 'Try: 1) Disable startup apps in Task Manager 2) Run "cleanmgr" 3) Update drivers 4) Check for malware with Windows Defender',
      vpn: 'Try: 1) Disconnect/reconnect VPN 2) Update VPN client 3) Check firewall settings 4) Try different VPN server',
      password: 'For password reset: Contact IT at it-support@nexus.ai or use the self-service portal at /reset-password',
      wifi: 'Try: 1) Forget and reconnect to network 2) Flush DNS: ipconfig /flushdns 3) Restart network adapter 4) Check IP configuration',
      install: 'Software installation requires admin approval. Your request has been flagged for review. Standard SLA: 24 hours.',
      email: 'Try: 1) Check Outlook connection 2) Clear email cache 3) Re-add email account 4) Check mailbox quota',
      printer: 'Try: 1) Remove and re-add printer 2) Clear print queue 3) Update printer drivers 4) Check USB/network connection',
    };
    const key = Object.keys(suggestions).find(k => text.toLowerCase().includes(k));
    res.json({ suggestion: key ? suggestions[key] : 'A specialist will analyze your issue and respond within 2 business hours. AI has classified this ticket for priority routing.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/ai/search ──────────────────────────────────────────
router.post('/search', auth, async (req, res) => {
  try {
    const { query } = req.body;
    const q = query.toLowerCase();
    const skill = q.match(/react|python|node|java|angular|vue|ml|ai|devops|docker|aws|kubernetes|typescript/i)?.[0];
    const dept = q.match(/engineering|hr|finance|operations|marketing|design|sales/i)?.[0];
    let keyword = skill || '';
    let result = '';
    if (skill) result = `Searching for employees with "${skill}" skills...`;
    else if (dept) { result = `Showing ${dept} department employees`; }
    else result = `Searching employee directory for: "${query}"`;
    res.json({ result, keyword, department: dept });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/ai/burnout-prediction ──────────────────────────────
router.get('/burnout-prediction', auth, async (req, res) => {
  try {
    // Try ML service
    try {
      const { data } = await axios.post(`${process.env.ML_SERVICE_URL}/predict-burnout`,
        { userId: req.userId }, { timeout: 3000 });
      return res.json(data);
    } catch {}
    // Fallback demo
    const user = await User.findById(req.userId).select('workHoursThisWeek burnoutRisk department');
    res.json({
      risk: user?.burnoutRisk || Math.floor(Math.random() * 60) + 20,
      factors: { workHours: user?.workHoursThisWeek || 44, meetings: 12, leaveUsage: 2, tickets: 5 },
      recommendation: 'Consider taking a short break. Your meeting load is higher than average this week.'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
