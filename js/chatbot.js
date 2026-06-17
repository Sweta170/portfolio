/* ============================================================
   CHATBOT.JS — AI Chatbot Widget with knowledge base
   ============================================================ */

class AIChatbot {
  constructor() {
    this.toggleBtn = document.getElementById('chatbot-toggle');
    this.window = document.getElementById('chatbot-window');
    this.closeBtn = document.getElementById('chat-close');
    this.messagesContainer = document.getElementById('chat-messages');
    this.input = document.getElementById('chat-input');
    this.sendBtn = document.getElementById('chat-send');
    this.suggestionsContainer = document.getElementById('chat-suggestions');

    this.isOpen = false;
    this.isTyping = false;

    // Knowledge base about Sweta
    this.knowledge = {
      name: 'Sweta Kumari',
      role: 'Full Stack Developer (MERN)',
      email: 'sahanisweta17@gmail.com',
      github: 'https://github.com/Sweta170',
      linkedin: 'https://www.linkedin.com/in/sweta17/',
      skills: {
        frontend: ['React.js', 'Vite', 'Tailwind CSS', 'React Router', 'Recharts', 'Context API', 'Socket.io Client'],
        backend: ['Node.js', 'Express.js', 'FastAPI', 'REST APIs', 'JWT Authentication', 'OAuth 2.0', 'Cron Jobs'],
        databases: ['MongoDB', 'Mongoose', 'PostgreSQL', 'SQLite'],
        ai: ['Claude API', 'OCR (Tesseract.js)', 'Machine Learning', 'Deep Learning', 'Computer Vision'],
        devops: ['Docker', 'Git & GitHub', 'Railway', 'Render', 'Vercel'],
        integrations: ['Google Calendar API', 'Stripe', 'SMTP Services', 'Cloudinary', 'Socket.io']
      },
      projects: [
        {
          name: 'Pharma Desk',
          description: 'Intelligent Pharmacy Management Portal with OCR-powered medicine registration, multi-role system, automated stock monitoring, and sales analytics.',
          tech: 'MERN, Tesseract.js, PDFKit, Node-Cron, Nodemailer, Tailwind CSS'
        },
        {
          name: 'MeetAI',
          description: 'AI Smart Meeting Scheduler with Claude 3.5 Sonnet, Google Calendar sync, conflict detection, and automated reminders.',
          tech: 'MERN, Claude API, Google Calendar API, OAuth 2.0'
        },
        {
          name: 'Retail Store Intelligence Platform',
          description: 'Agent-driven retail analytics with visitor session reconstruction, conversion funnel analysis, and heatmap generation.',
          tech: 'FastAPI, PostgreSQL, Streamlit, Docker'
        },
        {
          name: 'JanSoochna',
          description: 'Hyperlocal civic engagement portal with real-time issue reporting, AI chatbot, and interactive maps.',
          tech: 'MERN, Socket.io, Leaflet Maps, Claude API'
        },
        {
          name: 'Urban Eats',
          description: 'Full-featured food delivery platform with Stripe payments, real-time order tracking, and restaurant dashboard.',
          tech: 'MERN, Socket.io, Stripe, JWT'
        },
        {
          name: 'Team Task Manager',
          description: 'Project management system with Kanban workflow, RBAC, dashboard analytics, and dark/light themes.',
          tech: 'MERN, React 19, Express 5, Recharts, Tailwind CSS'
        }
      ],
      research: {
        title: 'A Comprehensive Review Paper on Smart Attendance System Using Machine Learning',
        venue: 'IEEE Xplore — 2026 5th International Conference',
        topics: ['Machine Learning', 'Deep Learning', 'Computer Vision', 'Face Recognition']
      },
      about: 'Final year student and Full Stack MERN Developer with expertise in building production-ready web applications for businesses and clients. Published IEEE research author, experienced in full-stack integrations (Stripe, APIs, Real-time systems), and active freelance contractor.'
    };

    this.suggestions = [
      'Tell me about Sweta',
      'What projects has she built?',
      'What are her skills?',
      'Coding profiles?',
      'How to contact her?',
      'Research publications?'
    ];

    this.bindEvents();
    this.renderSuggestions();
  }

  bindEvents() {
    this.toggleBtn.addEventListener('click', () => this.toggle());
    this.closeBtn.addEventListener('click', () => this.close());
    this.sendBtn.addEventListener('click', () => this.sendMessage());
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    this.window.classList.add('open');
    this.toggleBtn.classList.add('hidden');

    // Send welcome message if no messages
    if (this.messagesContainer.children.length === 0) {
      setTimeout(() => {
        this.addBotMessage("Hi! 👋 I'm Sweta's AI assistant. Ask me anything about her projects, skills, research, or how to get in touch!");
      }, 400);
    }

    setTimeout(() => this.input.focus(), 500);
  }

  close() {
    this.isOpen = false;
    this.window.classList.remove('open');
    setTimeout(() => {
      this.toggleBtn.classList.remove('hidden');
    }, 300);
  }

  sendMessage() {
    const text = this.input.value.trim();
    if (!text || this.isTyping) return;

    this.addUserMessage(text);
    this.input.value = '';

    // Generate response
    setTimeout(() => {
      this.showTyping();
      const response = this.generateResponse(text);
      const typingDelay = Math.min(response.length * 15, 2000) + 500;

      setTimeout(() => {
        this.hideTyping();
        this.addBotMessage(response);
      }, typingDelay);
    }, 200);
  }

  addUserMessage(text) {
    const msg = document.createElement('div');
    msg.className = 'chat-message user';
    msg.textContent = text;
    this.messagesContainer.appendChild(msg);
    this.scrollToBottom();
  }

  addBotMessage(text) {
    const msg = document.createElement('div');
    msg.className = 'chat-message bot';
    msg.innerHTML = text;
    this.messagesContainer.appendChild(msg);
    this.scrollToBottom();
  }

  showTyping() {
    this.isTyping = true;
    const typing = document.createElement('div');
    typing.className = 'chat-typing';
    typing.id = 'typing-indicator';
    typing.innerHTML = '<span></span><span></span><span></span>';
    this.messagesContainer.appendChild(typing);
    this.scrollToBottom();
  }

  hideTyping() {
    this.isTyping = false;
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();
  }

  scrollToBottom() {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  renderSuggestions() {
    this.suggestionsContainer.innerHTML = '';
    this.suggestions.forEach(text => {
      const btn = document.createElement('button');
      btn.className = 'chat-suggestion';
      btn.textContent = text;
      btn.addEventListener('click', () => {
        this.input.value = text;
        this.sendMessage();
      });
      this.suggestionsContainer.appendChild(btn);
    });
  }

  generateResponse(input) {
    const q = input.toLowerCase();

    // About / Who is
    if (this.match(q, ['who', 'about', 'tell me about sweta', 'introduce', 'herself', 'background'])) {
      return `<strong>Sweta Kumari</strong> is a final-year student and <strong>Full Stack MERN Developer</strong> passionate about building production-ready applications. She's a published <strong>IEEE research author</strong> with expertise in AI integration, real-time systems, and healthcare technology. She's built 6+ impressive projects spanning pharmacy management, AI scheduling, retail analytics, and more! 🚀`;
    }    // Education / College / University
    if (this.match(q, ['education', 'college', 'university', 'study', 'degree', 'academics'])) {
      return `🎓 <strong>Educational Background</strong><br><br>
        🏫 <strong>Lovely Professional University (LPU)</strong><br>
        📜 <strong>Bachelor of Technology (B.Tech)</strong> in Computer Science & Engineering<br>
        📅 <strong>Timeline:</strong> 2022 – 2026 (Final Year Student)<br>
        📈 <strong>Academic Status:</strong> 8.5/10.0 CGPA<br><br>
        ✨ Specializing in Full Stack Web Development (MERN), Machine Learning, and Computer Vision. Co-authored a peer-reviewed ML research paper published in IEEE Xplore.`;
    }

    // Skills
    if (this.match(q, ['skills', 'technologies', 'tech stack', 'what can she do', 'expertise', 'know'])) {
      return `Sweta's tech stack includes:<br><br>
        🎨 <strong>Frontend:</strong> React.js, Vite, Tailwind CSS, Recharts<br>
        ⚙️ <strong>Backend:</strong> Node.js, Express.js, FastAPI, JWT, OAuth<br>
        🗄️ <strong>Databases:</strong> MongoDB, PostgreSQL, SQLite<br>
        🤖 <strong>AI/ML:</strong> Claude API, OCR, Machine Learning, Computer Vision<br>
        🐳 <strong>DevOps:</strong> Docker, Git, Railway, Render, Vercel<br>
        🔗 <strong>Integrations:</strong> Google Calendar API, Stripe, Socket.io, Cloudinary`;
    }

    // Projects overview
    if (this.match(q, ['projects', 'portfolio', 'work', 'what has she built', 'showcase'])) {
      return `Sweta has built <strong>6 impressive projects</strong>:<br><br>
        💊 <strong>Pharma Desk</strong> — Intelligent Pharmacy Management<br>
        🤖 <strong>MeetAI</strong> — AI Smart Meeting Scheduler<br>
        📊 <strong>Retail Store Intelligence</strong> — Analytics Platform<br>
        🏙️ <strong>JanSoochna</strong> — Civic Engagement Portal<br>
        🍔 <strong>Urban Eats</strong> — Food Delivery Platform<br>
        📋 <strong>Team Task Manager</strong> — Project Management<br><br>
        Ask about any specific project for details!`;
    }

    // Pharma Desk
    if (this.match(q, ['pharma', 'pharmacy', 'medicine', 'pharma desk'])) {
      return `💊 <strong>Pharma Desk</strong> — Intelligent Pharmacy Management Portal<br><br>
        Built with <em>MERN, Tesseract.js, PDFKit, Node-Cron, Nodemailer, Tailwind CSS</em><br><br>
        ✨ Multi-role system (Superadmin, Pharmacist, Customer)<br>
        ✨ OCR-powered medicine registration<br>
        ✨ Automated stock & expiry monitoring<br>
        ✨ PDF invoice generation<br>
        ✨ Sales analytics dashboard<br>
        ✨ Email & browser medication reminders<br><br>
        🌐 <strong>Live Demo:</strong> <a href="https://ai-based-medicine-quality.vercel.app/" target="_blank" style="color: #00d4ff;">ai-based-medicine-quality.vercel.app</a>`;
    }

    // MeetAI
    if (this.match(q, ['meetai', 'meet ai', 'meeting', 'scheduler', 'calendar'])) {
      return `🤖 <strong>MeetAI</strong> — AI Smart Meeting Scheduler<br><br>
        Built with <em>MERN, Claude 3.5 Sonnet, Google Calendar API</em><br><br>
        ✨ AI-powered meeting scheduling via natural language<br>
        ✨ Google Calendar synchronization<br>
        ✨ Conflict detection & availability analysis<br>
        ✨ Automated email reminders<br>
        ✨ Interactive AI chat interface<br>
        ✨ OAuth 2.0 authentication<br><br>
        🌐 <strong>Live Demo:</strong> <a href="https://ai-smart-scheduler.vercel.app/" target="_blank" style="color: #00d4ff;">ai-smart-scheduler.vercel.app</a>`;
    }

    // Retail
    if (this.match(q, ['retail', 'analytics', 'intelligence platform', 'store'])) {
      return `📊 <strong>Retail Store Intelligence Platform</strong><br><br>
        Built with <em>FastAPI, PostgreSQL, Streamlit, Docker</em><br><br>
        ✨ Agent-driven retail analytics engine<br>
        ✨ Visitor session reconstruction<br>
        ✨ Conversion funnel analysis<br>
        ✨ Heatmap generation<br>
        ✨ Operational anomaly detection<br>
        ✨ Dockerized deployment`;
    }

    // JanSoochna
    if (this.match(q, ['jansoochna', 'civic', 'engagement', 'government'])) {
      return `🏙️ <strong>JanSoochna</strong> — Hyperlocal Civic Engagement Portal<br><br>
        Built with <em>MERN, Socket.io, Leaflet Maps, Claude API</em><br><br>
        ✨ Civic issue reporting platform<br>
        ✨ Interactive issue maps<br>
        ✨ Real-time neighborhood boards<br>
        ✨ AI-powered government assistance chatbot<br>
        ✨ PWA with offline support<br>
        ✨ Civic gamification system<br><br>
        🌐 <strong>Live Demo:</strong> <a href="https://client-alpha-flame.vercel.app/" target="_blank" style="color: #00d4ff;">client-alpha-flame.vercel.app</a>`;
    }

    // Urban Eats
    if (this.match(q, ['urban eats', 'food', 'delivery', 'restaurant'])) {
      return `🍔 <strong>Urban Eats</strong> — Food Delivery Platform<br><br>
        Built with <em>MERN, Socket.io, Stripe, JWT</em><br><br>
        ✨ Food ordering & delivery system<br>
        ✨ Restaurant management dashboard<br>
        ✨ Stripe payment integration<br>
        ✨ Real-time order tracking<br>
        ✨ Coupon & promotion engine<br>
        ✨ Multi-role architecture<br><br>
        🌐 <strong>Live Demo:</strong> <a href="https://urban-eats-dusky.vercel.app/" target="_blank" style="color: #00d4ff;">urban-eats-dusky.vercel.app</a>`;
    }

    // Task Manager
    if (this.match(q, ['task manager', 'team task', 'kanban', 'project management'])) {
      return `📋 <strong>Team Task Manager</strong><br><br>
        Built with <em>MERN, React 19, Express 5, Recharts</em><br><br>
        ✨ Kanban task workflow<br>
        ✨ Role-based access control<br>
        ✨ Dashboard analytics<br>
        ✨ Search & filtering<br>
        ✨ Dark/light themes<br>
        ✨ Team collaboration tools<br><br>
        🌐 <strong>Live Demo:</strong> <a href="https://task-manager-yeyz.vercel.app/" target="_blank" style="color: #00d4ff;">task-manager-yeyz.vercel.app</a>`;
    }

    // Research
    if (this.match(q, ['research', 'ieee', 'publication', 'paper', 'academic'])) {
      return `🏆 <strong>IEEE Conference Publication</strong><br><br>
        📄 <em>"A Comprehensive Review Paper on Smart Attendance System Using Machine Learning"</em><br><br>
        Published in <strong>IEEE Xplore Digital Library</strong> — 2026 5th International Conference (Paper ID: ICCCES-1046)<br><br>
        Covers face recognition techniques (Haar Cascades, LBPH, VGG16, FaceNet, DenseNet, CNN) and their applications in attendance automation.<br><br>
        🌐 <strong>Acceptance Letter:</strong> <a href="https://github.com/Sweta170/certificates/blob/main/ICCCES-1046.pdf" target="_blank" style="color: #00d4ff;">View on GitHub</a>`;
    }

    // Certifications
    if (this.match(q, ['certifications', 'certification', 'certificates', 'credentials', 'certified'])) {
      return `🏆 <strong>Certifications &amp; Credentials</strong><br><br>
        📈 <strong>SAP Certified - Data Analyst</strong> (SAP Analytics Cloud)<br>
        🧠 <strong>Generative AI for Everyone</strong> (DeepLearning.AI)<br>
        🤖 <strong>Large Language Models (LLMs)</strong><br>
        💻 <strong>Full-Stack Web Development</strong> (MERN)<br>
        🏆 <strong>Problem Solving (Basic)</strong> (HackerRank)<br>
        🐳 <strong>DevOps &amp; Continuous Integration</strong> (Docker/CI-CD)<br>
        📊 <strong>Algorithmic Toolbox</strong> (UC San Diego • Coursera)<br><br>
        All credentials have direct verification links in the Certifications section of the page!`;
    }

    // Coding Profiles / LeetCode / GeeksforGeeks
    if (this.match(q, ['leetcode', 'geeksforgeeks', 'gfg', 'coding profile', 'dsa', 'competitive programming', 'problem solving', 'solved'])) {
      return `🏆 <strong>Coding Profiles &amp; Problem Solving</strong><br><br>
        💻 <strong>LeetCode Profile:</strong><br>
        ✨ Username: <a href="https://leetcode.com/u/Coder-tech/" target="_blank" style="color: #ffa116; font-weight: 600;">@Coder-tech ↗</a><br>
        ✨ Problems Solved: <strong>293+</strong> (Easy: 130, Medium: 137, Hard: 26)<br>
        ✨ Contest Rating: <strong>1,550</strong> (Top 32.16% global ranking)<br>
        ✨ Attended: 7 contests, Max streak: 12 days, 176 submissions in the past year.<br><br>
        💚 <strong>GeeksforGeeks Profile:</strong><br>
        ✨ Username: <a href="https://www.geeksforgeeks.org/profile/swetarfu1t?tab=activity" target="_blank" style="color: #00e676; font-weight: 600;">@swetarfu1t ↗</a><br>
        ✨ Problems Solved: <strong>136+</strong> (Basic: 28, Easy: 54, Medium: 51, Hard: 3)<br>
        ✨ Coding Score: <strong>355</strong> | Institute Rank: <strong>5892</strong><br><br>
        Sweta has solid problem-solving skills in Data Structures and Algorithms! You can find the fully interactive stats in the Coding Profiles section on this page!`;
    }

    // Contact
    if (this.match(q, ['contact', 'reach', 'hire', 'email', 'connect', 'linkedin', 'github'])) {
      return `📬 You can reach Sweta through:<br><br>
        🐙 <strong>GitHub:</strong> <a href="${this.knowledge.github}" target="_blank" style="color: #00d4ff;">github.com/Sweta170</a><br>
        💼 <strong>LinkedIn:</strong> <a href="${this.knowledge.linkedin}" target="_blank" style="color: #00d4ff;">linkedin.com/in/sweta17</a><br><br>
        She's open to full-time opportunities, freelance projects, and collaborations! 🤝`;
    }

    // Availability / Hiring
    if (this.match(q, ['available', 'freelance', 'job', 'opportunity', 'open to', 'hire'])) {
      return `✅ Sweta is <strong>actively accepting freelance contracts and project inquiries</strong>! She specializes in:<br><br>
        💻 <strong>Full Stack MERN Projects</strong> (e-commerce, dashboards, custom portals)<br>
        🔌 <strong>Third-Party Integrations</strong> (Stripe, Google Calendar, Socket.io, Cloudinary)<br>
        🤖 <strong>AI & OCR Automation</strong> (LLM APIs, PDF generation, Tesseract OCR)<br><br>
        She is also open to full-time Software Engineer positions. Let's discuss your project! Drop a line at <a href="mailto:${this.knowledge.email}" style="color: #00d4ff;">${this.knowledge.email}</a> or connect on <a href="${this.knowledge.linkedin}" target="_blank" style="color: #00d4ff;">LinkedIn</a>!`;
    }

    // Greeting
    if (this.match(q, ['hi', 'hello', 'hey', 'sup', 'good morning', 'good evening'])) {
      return `Hey there! 👋 Welcome to Sweta's portfolio. I can tell you about her <strong>projects</strong>, <strong>skills</strong>, <strong>research</strong>, or how to <strong>get in touch</strong>. What would you like to know?`;
    }

    // Thanks
    if (this.match(q, ['thanks', 'thank you', 'appreciate', 'helpful'])) {
      return `You're welcome! 😊 Feel free to explore the portfolio or ask me anything else. Have a great day!`;
    }

    // Default
    return `Interesting question! I can help you learn about:<br><br>
      👩‍💻 <strong>Sweta's background</strong> — "Tell me about Sweta"<br>
      🚀 <strong>Her projects</strong> — "What projects has she built?"<br>
      🛠️ <strong>Technical skills</strong> — "What are her skills?"<br>
      🏆 <strong>Research</strong> — "Tell me about her research"<br>
      📬 <strong>Contact info</strong> — "How can I contact her?"<br><br>
      Try one of these or ask something specific!`;
  }

  match(input, keywords) {
    return keywords.some(keyword => input.includes(keyword));
  }
}

window.AIChatbot = AIChatbot;
