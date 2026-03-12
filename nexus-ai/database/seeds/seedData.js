require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nexus-ai';

const usersData = [
  {
    name: 'Admin User',
    email: 'admin@nexus.ai',
    password: 'Admin@123',
    department: 'Engineering',
    role: 'admin',
    phone: '+91 99999 00001',
    skills: ['Management', 'Strategy', 'Analytics', 'Leadership'],
    status: 'online',
    leaveBalance: 20,
    attendanceRate: 98,
    burnoutRisk: 25,
  },
  {
    name: 'John Smith',
    email: 'john@nexus.ai',
    password: 'Pass@123',
    department: 'Engineering',
    role: 'Employee',
    phone: '+91 98765 43210',
    skills: ['React', 'Node.js', 'Python', 'AWS', 'Docker'],
    status: 'online',
    leaveBalance: 15,
    attendanceRate: 96,
    burnoutRisk: 45,
    workHoursThisWeek: 48,
  },
  {
    name: 'Priya Patel',
    email: 'priya@nexus.ai',
    password: 'Pass@123',
    department: 'HR',
    role: 'hr',
    phone: '+91 87654 32109',
    skills: ['Recruitment', 'Policy', 'Analytics', 'Excel', 'HRMS'],
    status: 'away',
    leaveBalance: 18,
    attendanceRate: 99,
    burnoutRisk: 30,
  },
  {
    name: 'Rahul Gupta',
    email: 'rahul@nexus.ai',
    password: 'Pass@123',
    department: 'Engineering',
    role: 'Team Lead',
    phone: '+91 76543 21098',
    skills: ['Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'OpenCV', 'FastAPI'],
    status: 'online',
    leaveBalance: 12,
    attendanceRate: 94,
    burnoutRisk: 72,
    workHoursThisWeek: 58,
  },
  {
    name: 'Sneha Reddy',
    email: 'sneha@nexus.ai',
    password: 'Pass@123',
    department: 'Finance',
    role: 'Employee',
    phone: '+91 65432 10987',
    skills: ['Excel', 'SAP', 'Power BI', 'Accounting', 'Tally'],
    status: 'offline',
    leaveBalance: 20,
    attendanceRate: 97,
    burnoutRisk: 38,
  },
  {
    name: 'Karthik Nair',
    email: 'karthik@nexus.ai',
    password: 'Pass@123',
    department: 'Operations',
    role: 'Manager',
    phone: '+91 54321 09876',
    skills: ['Jira', 'Agile', 'Scrum', 'Leadership', 'Risk Management'],
    status: 'online',
    leaveBalance: 10,
    attendanceRate: 95,
    burnoutRisk: 55,
    workHoursThisWeek: 52,
  },
  {
    name: 'Divya Menon',
    email: 'divya@nexus.ai',
    password: 'Pass@123',
    department: 'Engineering',
    role: 'Employee',
    phone: '+91 43210 98765',
    skills: ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Terraform', 'Jenkins'],
    status: 'busy',
    leaveBalance: 14,
    attendanceRate: 93,
    burnoutRisk: 60,
  },
  {
    name: 'Vikram Singh',
    email: 'vikram@nexus.ai',
    password: 'Pass@123',
    department: 'Marketing',
    role: 'Team Lead',
    phone: '+91 32109 87654',
    skills: ['SEO', 'Analytics', 'Content Marketing', 'Google Ads', 'HubSpot'],
    status: 'online',
    leaveBalance: 16,
    attendanceRate: 91,
    burnoutRisk: 42,
  },
  {
    name: 'Lakshmi Iyer',
    email: 'lakshmi@nexus.ai',
    password: 'Pass@123',
    department: 'Engineering',
    role: 'Employee',
    phone: '+91 21098 76543',
    skills: ['React', 'TypeScript', 'GraphQL', 'CSS', 'Figma', 'Next.js'],
    status: 'away',
    leaveBalance: 17,
    attendanceRate: 98,
    burnoutRisk: 28,
  },
  {
    name: 'Arjun Sharma',
    email: 'arjun@nexus.ai',
    password: 'Pass@123',
    department: 'Engineering',
    role: 'Director',
    phone: '+91 11098 76001',
    skills: ['Architecture', 'React', 'Node.js', 'AWS', 'Leadership', 'System Design'],
    status: 'online',
    leaveBalance: 22,
    attendanceRate: 97,
    burnoutRisk: 50,
  },
];

const ticketsData = [
  { title: 'Laptop starts very slowly', description: 'My laptop takes 5+ mins to boot. Started 3 days ago.', category: 'IT', priority: 'High', status: 'In Progress', aiSuggestion: 'Try: Disable startup apps, run disk cleanup, update drivers' },
  { title: 'VPN keeps disconnecting every hour', description: 'VPN drops connection randomly, disrupting work.', category: 'IT', priority: 'High', status: 'Open', aiSuggestion: 'Check network adapter settings, update VPN client to latest version' },
  { title: 'Need Python 3.11 installed', description: 'Require Python 3.11 for new ML project dependencies.', category: 'IT', priority: 'Medium', status: 'Open', aiSuggestion: 'Software installation request logged. IT will process within 24 hours.' },
  { title: 'Email not syncing on mobile', description: 'Outlook mobile app stopped syncing emails since yesterday.', category: 'IT', priority: 'Medium', status: 'Resolved', aiSuggestion: 'Re-add account to Outlook mobile, ensure Modern Auth is enabled' },
  { title: 'Leave policy clarification needed', description: 'Need clarification on carry-forward leave rules for 2025.', category: 'HR', priority: 'Low', status: 'Open', aiSuggestion: 'HR team will respond within 1 business day' },
];

const announcementsData = [
  { title: '🎉 Q4 All-Hands Meeting — December 15th', content: 'Join us for our quarterly all-hands meeting on Dec 15th at 3PM IST. CEO will share company vision for 2025. All teams must attend virtually or in person.', priority: 'Important' },
  { title: '🏖️ 2025 Holiday Calendar Now Available', content: 'The 2025 holiday schedule has been published in the HR Portal. 15 public holidays plus 3 company holidays. Check the HR section for details.', priority: 'Normal' },
  { title: '🚀 NEXUS AI Workplace OS v2.0 Live!', content: 'We have launched our new AI-powered workplace system with biometric login, voice commands, burnout prediction ML, and the AI Copilot assistant!', priority: 'Urgent' },
  { title: '🔐 Security Reminder: Update Passwords', content: 'As part of our quarterly security audit, all employees must update their passwords by Dec 31st. Use the Profile page to update.', priority: 'Important' },
];

async function seed() {
  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected');

    // Load models
    const User = require('../models/User');
    const Ticket = require('../models/Ticket');
    const { Announcement } = require('../models/Announcement');

    // Clear existing
    await Promise.all([User.deleteMany({}), Ticket.deleteMany({}), Announcement.deleteMany({})]);
    console.log('🗑️  Cleared existing data');

    // Seed users
    const createdUsers = [];
    for (const u of usersData) {
      const user = await User.create(u);
      createdUsers.push(user);
      console.log(`👤 Created: ${user.name} (${user.email})`);
    }

    // Seed tickets
    for (let i = 0; i < ticketsData.length; i++) {
      const t = ticketsData[i];
      await Ticket.create({ ...t, createdBy: createdUsers[i % createdUsers.length]._id });
      console.log(`🎫 Created ticket: ${t.title}`);
    }

    // Seed announcements
    for (const a of announcementsData) {
      await Announcement.create({ ...a, author: createdUsers[0]._id });
      console.log(`📢 Created announcement: ${a.title}`);
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Demo Login Credentials:');
    console.log('┌─────────────────────────┬──────────────┬──────────────┐');
    console.log('│ Role                    │ Email        │ Password     │');
    console.log('├─────────────────────────┼──────────────┼──────────────┤');
    console.log('│ Admin                   │ admin@nexus.ai│ Admin@123   │');
    console.log('│ HR Manager              │ priya@nexus.ai│ Pass@123    │');
    console.log('│ Engineer (John)         │ john@nexus.ai │ Pass@123    │');
    console.log('│ ML Engineer (Rahul)     │ rahul@nexus.ai│ Pass@123    │');
    console.log('└─────────────────────────┴──────────────┴──────────────┘');

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
