/**
 * ============================================================================
 * SAKIR AHAMAD — FUTURISTIC WEB DEVELOPER & AI PORTFOLIO
 * Main Interactive Neural Engine & Logic
 * ============================================================================
 */

(function () {
  'use strict';

  // State Management
  const AppState = {
    audioEnabled: false,
    audioCtx: null,
    matrixActive: false,
    cmdHistory: [],
    cmdHistoryIndex: -1,
    mouse: { x: window.innerWidth / 2, y: window.innerHeight / 2, targetX: window.innerWidth / 2, targetY: window.innerHeight / 2 },
  };

  /* ==========================================================================
     1. PROCEDURAL AUDIO SYNTHESIZER (Web Audio API)
     ========================================================================== */
  function initAudioContext() {
    if (!AppState.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        AppState.audioCtx = new AudioContext();
      }
    }
    if (AppState.audioCtx && AppState.audioCtx.state === 'suspended') {
      AppState.audioCtx.resume();
    }
  }

  function playSynthTone(freq, type = 'sine', duration = 0.08, gainVal = 0.05) {
    if (!AppState.audioEnabled) return;
    try {
      initAudioContext();
      if (!AppState.audioCtx) return;

      const osc = AppState.audioCtx.createOscillator();
      const gain = AppState.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, AppState.audioCtx.currentTime);

      gain.gain.setValueAtTime(gainVal, AppState.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, AppState.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(AppState.audioCtx.destination);

      osc.start();
      osc.stop(AppState.audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  }

  const SoundFX = {
    hover: () => playSynthTone(880, 'sine', 0.04, 0.02),
    click: () => {
      playSynthTone(1200, 'triangle', 0.06, 0.04);
      setTimeout(() => playSynthTone(1800, 'sine', 0.05, 0.03), 40);
    },
    success: () => {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        setTimeout(() => playSynthTone(freq, 'sine', 0.12, 0.04), idx * 75);
      });
    },
    error: () => {
      playSynthTone(220, 'sawtooth', 0.15, 0.05);
    },
    matrix: () => {
      [300, 450, 600, 750, 900].forEach((freq, idx) => {
        setTimeout(() => playSynthTone(freq, 'sine', 0.08, 0.02), idx * 50);
      });
    }
  };

  /* ==========================================================================
     2. CUSTOM SCI-FI CURSOR
     ========================================================================== */
  function initCustomCursor() {
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (!dot || !ring) return;

    let ringX = window.innerWidth / 2;
    let ringY = window.innerHeight / 2;

    window.addEventListener('mousemove', (e) => {
      AppState.mouse.targetX = e.clientX;
      AppState.mouse.targetY = e.clientY;

      dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    });

    function renderCursor() {
      // Smooth lerp
      ringX += (AppState.mouse.targetX - ringX) * 0.18;
      ringY += (AppState.mouse.targetY - ringY) * 0.18;

      ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
      requestAnimationFrame(renderCursor);
    }
    renderCursor();

    // Hover effect over interactive targets
    const interactives = document.querySelectorAll('a, button, input, textarea, .skill-card, .project-card, .hud-stat-card, .cmd-chip');
    interactives.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-hover');
        SoundFX.hover();
      });
      el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hover');
      });
      el.addEventListener('click', () => {
        SoundFX.click();
      });
    });
  }

  /* ==========================================================================
     3. INTERACTIVE NEURAL MATRIX CANVAS
     ========================================================================== */
  function initNeuralCanvas() {
    const canvas = document.getElementById('neuralCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      createNodes();
    });

    const nodeCount = Math.min(Math.floor((width * height) / 18000), 75);
    let nodes = [];

    class NeuralNode {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = (Math.random() - 0.5) * 0.6;
        this.radius = Math.random() * 2 + 1;
        this.color = Math.random() > 0.4 ? 'rgba(0, 240, 255,' : 'rgba(176, 38, 255,';
        this.alpha = Math.random() * 0.5 + 0.3;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce from walls
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Gentle reaction to cursor
        const dx = AppState.mouse.targetX - this.x;
        const dy = AppState.mouse.targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 140) {
          const force = (140 - dist) / 140;
          this.x -= (dx / dist) * force * 1.5;
          this.y -= (dy / dist) * force * 1.5;
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${this.color}${this.alpha})`;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    function createNodes() {
      nodes = [];
      for (let i = 0; i < nodeCount; i++) {
        nodes.push(new NeuralNode());
      }
    }
    createNodes();

    function renderNeuralMesh() {
      ctx.clearRect(0, 0, width, height);

      // Connect nodes within threshold
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.22;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Connect closest nodes to cursor
      for (let i = 0; i < nodes.length; i++) {
        const dx = AppState.mouse.targetX - nodes[i].x;
        const dy = AppState.mouse.targetY - nodes[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 160) {
          const alpha = (1 - dist / 160) * 0.35;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(AppState.mouse.targetX, AppState.mouse.targetY);
          ctx.strokeStyle = `rgba(0, 255, 157, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        nodes[i].update();
        nodes[i].draw();
      }

      requestAnimationFrame(renderNeuralMesh);
    }
    renderNeuralMesh();
  }

  /* ==========================================================================
     4. MATRIX DIGITAL RAIN EFFECT (Toggleable via CLI)
     ========================================================================== */
  function initMatrixRain() {
    const canvas = document.getElementById('matrixCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      if (AppState.matrixActive) {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }
    });

    const characters = '0123456789ABCDEF01010101XYZアイウエオカキクケコサシスセソタチツテトナニヌネノ';
    const fontSize = 16;
    let columns = Math.floor(width / fontSize);
    let drops = Array(columns).fill(1);
    let animId = null;

    function drawMatrix() {
      ctx.fillStyle = 'rgba(3, 6, 12, 0.08)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#00ff9d';
      ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillText(text, x, y);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      if (AppState.matrixActive) {
        animId = requestAnimationFrame(drawMatrix);
      }
    }

    window.toggleMatrixRain = function (forceState) {
      if (typeof forceState === 'boolean') {
        AppState.matrixActive = forceState;
      } else {
        AppState.matrixActive = !AppState.matrixActive;
      }

      if (AppState.matrixActive) {
        canvas.style.display = 'block';
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        columns = Math.floor(width / fontSize);
        drops = Array(columns).fill(1);
        SoundFX.matrix();
        drawMatrix();
      } else {
        canvas.style.display = 'none';
        if (animId) cancelAnimationFrame(animId);
      }
      return AppState.matrixActive;
    };

    // Escape key exits matrix
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && AppState.matrixActive) {
        window.toggleMatrixRain(false);
      }
    });
  }

  /* ==========================================================================
     5. DYNAMIC TYPEWRITER (HERO)
     ========================================================================== */
  function initTypewriter() {
    const target = document.getElementById('typingText');
    if (!target) return;

    const roles = [
      'WEB DEVELOPER',
      'AI INTERFACE ARCHITECT',
      'FULL-STACK ENGINEER',
      'CREATIVE TECHNOLOGIST',
      'NEXT-GEN UI SPECIALIST'
    ];

    let roleIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let speed = 90;

    function tick() {
      const currentRole = roles[roleIdx];

      if (isDeleting) {
        target.textContent = currentRole.substring(0, charIdx - 1);
        charIdx--;
        speed = 45;
      } else {
        target.textContent = currentRole.substring(0, charIdx + 1);
        charIdx++;
        speed = 90;
      }

      if (!isDeleting && charIdx === currentRole.length) {
        isDeleting = true;
        speed = 1800; // Hold full text
      } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        roleIdx = (roleIdx + 1) % roles.length;
        speed = 350;
      }

      setTimeout(tick, speed);
    }
    tick();
  }

  /* ==========================================================================
     6. 3D TILT EFFECT FOR HOLOGRAM & CARDS
     ========================================================================== */
  function init3DTilt() {
    const holo = document.getElementById('holoCard');
    if (holo) {
      holo.addEventListener('mousemove', (e) => {
        const rect = holo.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        const rotX = (-y / rect.height) * 22;
        const rotY = (x / rect.width) * 22;

        holo.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.03, 1.03, 1.03)`;
      });

      holo.addEventListener('mouseleave', () => {
        holo.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      });
    }

    // Tilt for project cards
    const cards = document.querySelectorAll('.project-card');
    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        const rotX = (-y / rect.height) * 8;
        const rotY = (x / rect.width) * 8;

        card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
      });
    });
  }

  /* ==========================================================================
     7. SKILLS & PROJECTS FILTERING
     ========================================================================== */
  function initFilters() {
    // Skills Filter
    const skillChips = document.querySelectorAll('#skillsFilter .filter-chip');
    const skillCards = document.querySelectorAll('.skill-card');

    skillChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        skillChips.forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        const filter = chip.getAttribute('data-filter');

        skillCards.forEach((card) => {
          const category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            card.classList.remove('hidden');
          } else {
            card.classList.add('hidden');
          }
        });
      });
    });

    // Projects Filter
    const projChips = document.querySelectorAll('#projectsFilter .filter-chip');
    const projCards = document.querySelectorAll('.project-card');

    projChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        projChips.forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        const pfilter = chip.getAttribute('data-pfilter');

        projCards.forEach((card) => {
          const category = card.getAttribute('data-category');
          if (pfilter === 'all' || category === pfilter) {
            card.classList.remove('hidden');
          } else {
            card.classList.add('hidden');
          }
        });
      });
    });

    // Intersection Observer for Skills Bar Animation
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
        }
      });
    }, { threshold: 0.25 });

    skillCards.forEach((card) => observer.observe(card));
  }

  /* ==========================================================================
     8. INTERACTIVE NEURAL TERMINAL (CLI ENGINE)
     ========================================================================== */
  function initTerminal() {
    const input = document.getElementById('terminalInput');
    const body = document.getElementById('terminalBody');
    const chips = document.querySelectorAll('.cmd-chip');
    if (!input || !body) return;

    const commands = {
      help: () => `
<span class="text-cyan font-bold">AVAILABLE PROTOCOLS:</span>
  • <span class="text-green">bio</span>       - Retrieve Sakir Ahamad's dossier & credentials
  • <span class="text-green">skills</span>    - Output verified technical capabilities
  • <span class="text-green">projects</span>  - Inspect deployed expeditions & architectures
  • <span class="text-green">contact</span>   - Direct comms uplink and frequencies
  • <span class="text-green">matrix</span>    - Toggle live Matrix digital code rain stream
  • <span class="text-green">social</span>    - Network coordinates (GitHub, LinkedIn, X)
  • <span class="text-green">date</span>      - Display current localized chronometer
  • <span class="text-green">clear</span>     - Purge terminal buffer
  • <span class="text-green">sudo</span>      - Execute root authorization test`,

      bio: () => `
<span class="text-cyan font-bold">&gt;&gt; IDENTITY DOSSIER:</span>
  Name: <span class="text-white">Sakir Ahamad</span>
  Profession: <span class="text-green">Web Developer &amp; AI Interface Engineer</span>
  Specialization: High-Speed Web Applications, Reactive Frontends, LLM API Workflows
  Location: Remote // Earth
  Mission: Bridging hyper-creative aesthetics with clean computational architecture.`,

      skills: () => `
<span class="text-cyan font-bold">&gt;&gt; CAPABILITY MATRIX:</span>
  Frontend  : [React, Next.js, TypeScript, Modern ESNext, Vanilla CSS3, WebGL]
  Backend   : [Node.js, Express, REST APIs, GraphQL, Python FastAPI]
  Data      : [PostgreSQL, MongoDB, Redis, Prisma ORM]
  AI &amp; Auto : [OpenAI APIs, Gemini SDK, Prompt Eng, Tool Calling, Vector Flows]
  DevOps    : [Git, CI/CD, Vercel, Netlify, Docker, Cloudflare]`,

      projects: () => `
<span class="text-cyan font-bold">&gt;&gt; MISSION ARCHIVES:</span>
  1. <span class="text-white font-bold">NexusAI</span>: AI-driven developer productivity ecosystem with streaming telemetry.
  2. <span class="text-white font-bold">CyberPulse</span>: Real-time high-throughput telemetry dashboard with WebGL graphs.
  3. <span class="text-white font-bold">Aetheria</span>: 3D spatial commerce experience with real-time model lighting.
  4. <span class="text-white font-bold">Chronos</span>: Visual node orchestrator for AI agents and scheduled pipelines.
  <span class="text-muted">(Type 'contact' or click project cards to request access/demo)</span>`,

      contact: () => `
<span class="text-cyan font-bold">&gt;&gt; COMM PROTOCOLS:</span>
  Email     : <span class="text-green">sakir.ahamad.dev@gmail.com</span>
  Status    : READY FOR CONTRACT &amp; FULL-TIME ROLES
  Latency   : &lt; 24h response standard
  Encryption: 4096-bit verified`,

      social: () => `
<span class="text-cyan font-bold">&gt;&gt; NETWORK NODES:</span>
  GitHub    : github.com
  LinkedIn  : linkedin.com
  Twitter/X : x.com
  Discord   : discord.com`,

      date: () => `
<span class="text-cyan font-bold">&gt;&gt; SYSTEM TIME:</span> ${new Date().toUTCString()} // LATENCY: 12ms`,

      matrix: () => {
        const state = window.toggleMatrixRain();
        return `<span class="text-green">&gt;&gt; MATRIX RAIN STREAM: ${state ? 'INITIALIZED (Press ESC or rerun matrix to exit)' : 'TERMINATED'}</span>`;
      },

      sudo: () => `
<span class="text-magenta">&gt;&gt; ACCESS DENIED:</span> Operative is not in the sudoers file. This incident will be reported to Sakir Ahamad.`,

      clear: () => {
        body.innerHTML = '';
        return null;
      }
    };

    function appendOutput(cmd, outputHtml) {
      const line = document.createElement('div');
      line.className = 'term-line';
      line.innerHTML = `<span class="term-prompt"><span class="text-green">guest@sakir-dev</span>:<span class="text-cyan">~</span>$</span> <span class="text-white">${escapeHtml(cmd)}</span>`;
      body.appendChild(line);

      if (outputHtml) {
        const resLine = document.createElement('div');
        resLine.className = 'term-line';
        resLine.innerHTML = outputHtml;
        body.appendChild(resLine);
      }

      body.scrollTop = body.scrollHeight;
    }

    function escapeHtml(str) {
      return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
      );
    }

    function executeCommand(rawCmd) {
      const cmd = rawCmd.trim().toLowerCase();
      if (!cmd) return;

      AppState.cmdHistory.push(rawCmd);
      AppState.cmdHistoryIndex = AppState.cmdHistory.length;

      if (commands[cmd]) {
        SoundFX.click();
        const result = commands[cmd]();
        if (result !== null) {
          appendOutput(rawCmd, result);
        }
      } else {
        SoundFX.error();
        appendOutput(
          rawCmd,
          `<span class="text-magenta">&gt;&gt; Command not recognized: '${escapeHtml(cmd)}'.</span> Type <span class="text-cyan">help</span> for operational commands.`
        );
      }
    }

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = input.value;
        input.value = '';
        executeCommand(val);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (AppState.cmdHistoryIndex > 0) {
          AppState.cmdHistoryIndex--;
          input.value = AppState.cmdHistory[AppState.cmdHistoryIndex] || '';
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (AppState.cmdHistoryIndex < AppState.cmdHistory.length - 1) {
          AppState.cmdHistoryIndex++;
          input.value = AppState.cmdHistory[AppState.cmdHistoryIndex] || '';
        } else {
          AppState.cmdHistoryIndex = AppState.cmdHistory.length;
          input.value = '';
        }
      }
    });

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const cmd = chip.getAttribute('data-cmd');
        if (cmd) {
          executeCommand(cmd);
          input.focus();
        }
      });
    });
  }

  /* ==========================================================================
     9. PROJECT SPEC MODAL
     ========================================================================== */
  function initProjectModal() {
    const modal = document.getElementById('projectModal');
    const closeBtn = document.getElementById('modalCloseBtn');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    const projectData = {
      'nexus-ai': {
        title: 'NexusAI — Cognitive Development Workspace',
        category: 'AI WORKSPACE PLATFORM',
        specs: {
          'Core Engine': 'Next.js 14 (App Router) + TypeScript',
          'AI Model Uplink': 'OpenAI GPT-4o & Claude 3.5 Sonnet Streaming APIs',
          'Real-time Comms': 'WebSockets & Server-Sent Events (SSE)',
          'Styling Architecture': 'Tailwind CSS + Custom Glassmorphic Shaders',
          'Database': 'PostgreSQL with pgvector for Semantic Search',
          'Deployment Target': 'Vercel Edge Network + AWS S3'
        },
        overview: 'NexusAI is an AI-orchestrated developer environment designed for high-context programming. It features dynamic AST inspection, instant live preview sandboxing, automated documentation synthesis, and token optimization filters yielding a 40% reduction in API cost.',
        metrics: ['142 tokens/sec throughput', '18ms edge latency', '99.98% uptime']
      },
      'cyber-pulse': {
        title: 'CyberPulse — Quantum Cluster Visualizer',
        category: 'REAL-TIME TELEMETRY SYSTEM',
        specs: {
          'Frontend System': 'React 18 + Canvas 2D / WebGL High-Speed Rendering',
          'Backend Engine': 'Node.js Cluster + Redis Pub/Sub',
          'Data Stream': 'Sub-millisecond WebSocket binary feeds',
          'State Orchestration': 'Zustand + Web Workers for off-thread processing',
          'Data Storage': 'TimescaleDB for high-cadence time-series events',
          'Security Protocol': 'End-to-end TLS 1.3 with AES-256 telemetry tokens'
        },
        overview: 'Engineered to handle over 100,000 live metric events per second across multi-region server clusters. CyberPulse provides interactive 3D cluster node heatmaps, sub-second anomaly recognition, and instant automated failover triggers.',
        metrics: ['48.2 GB/s data processed', '1,024 active nodes monitored', '< 5ms render frame time']
      },
      'aetheria': {
        title: 'Aetheria — Spatial 3D Commerce Engine',
        category: 'IMMERSIVE 3D WEB PORTAL',
        specs: {
          '3D Core': 'Three.js + Custom WebGL GLSL Shaders',
          'Framework': 'Modern Vanilla JavaScript (Zero bloated frameworks)',
          'Audio Synthesizer': 'Web Audio API spatial soundscapes',
          'Payment Pipeline': 'Stripe Elements & Custom Webhooks',
          'Asset Pipeline': 'Draco compression for 80% smaller 3D models',
          'Performance': 'Solid 60fps on both mobile and desktop GPUs'
        },
        overview: 'A futuristic spatial web storefront that allows users to interact with high-fidelity 3D models, alter physical material properties in real time, and experience dynamic spatial lighting and audio responses upon item interaction.',
        metrics: ['1.2MB total initial bundle', '60 FPS render benchmark', '3.4x higher user engagement']
      },
      'chronos': {
        title: 'Chronos — Autonomous Agent Pipeline',
        category: 'AUTOMATION & AGENT ENGINE',
        specs: {
          'Client UI': 'React + React Flow node canvas',
          'Backend Core': 'Python FastAPI + Node.js microservice bridge',
          'Agent Core': 'Autonomous ReAct reasoning loops with tool call verification',
          'Task Queue': 'Celery + Redis distributed execution engine',
          'Containerization': 'Docker Compose + Kubernetes pod scaling',
          'Observability': 'OpenTelemetry & Prometheus metrics'
        },
        overview: 'A zero-code visual workflow orchestrator enabling engineers to assemble multi-stage AI agent chains, connect database webhooks, and trigger production deployments automatically with continuous verification.',
        metrics: ['0.8s average task dispatch', '50+ pre-built integrations', '99.9% pipeline reliability']
      }
    };

    function openModal(projId) {
      const data = projectData[projId];
      if (!data) return;

      modalTitle.textContent = data.title;

      let specsListHtml = '';
      for (const [key, val] of Object.entries(data.specs)) {
        specsListHtml += `<li><strong>${key}:</strong> ${val}</li>`;
      }

      let metricsHtml = data.metrics.map(m => `<span class="badge-mini text-cyan">${m}</span>`).join(' ');

      modalBody.innerHTML = `
        <div class="modal-grid">
          <div class="modal-block">
            <h4 class="modal-block-title">// ARCHITECTURE_SPECIFICATIONS</h4>
            <ul class="modal-spec-list">
              ${specsListHtml}
            </ul>
          </div>
          <div class="modal-block">
            <h4 class="modal-block-title">// SYSTEM_TELEMETRY</h4>
            <p style="color: var(--text-secondary); font-size: 0.85rem; line-height: 1.6; margin-bottom: 1rem;">
              ${data.overview}
            </p>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              ${metricsHtml}
            </div>
          </div>
        </div>
        <div class="modal-actions-bar">
          <a href="#contact" class="cyber-btn cyber-btn-primary cyber-btn-sm" onclick="document.getElementById('projectModal').classList.remove('active');">
            <span class="btn-text"><i class="fa-solid fa-satellite-dish"></i> INQUIRE SYSTEM ACCESS</span>
          </a>
          <button class="cyber-btn cyber-btn-ghost cyber-btn-sm" onclick="document.getElementById('projectModal').classList.remove('active');">
            <span class="btn-text">CLOSE SPEC SHEET</span>
          </button>
        </div>
      `;

      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      SoundFX.click();
    }

    function closeModal() {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    }

    document.querySelectorAll('.open-modal-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const pid = btn.getAttribute('data-modal');
        openModal(pid);
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });
  }

  /* ==========================================================================
     10. CONTACT FORM TRANSMISSION & CLIPBOARD
     ========================================================================== */
  function initContactAndToast() {
    const form = document.getElementById('contactForm');
    const progress = document.getElementById('transmissionProgress');
    const fill = document.getElementById('progressFill');
    const percentText = document.getElementById('transPercentText');
    const statusText = document.getElementById('transStatusText');
    const submitBtn = document.getElementById('sendTransmissionBtn');
    const toast = document.getElementById('cyberToast');
    const toastMsg = document.getElementById('toastMessage');

    function showToast(message, isSuccess = true) {
      if (!toast) return;
      toastMsg.textContent = message;
      toast.style.borderColor = isSuccess ? 'var(--neon-green)' : 'var(--neon-magenta)';
      toast.classList.add('show');
      SoundFX.success();

      setTimeout(() => {
        toast.classList.remove('show');
      }, 4000);
    }

    // Form Submission Simulator
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('senderName').value.trim();
        const email = document.getElementById('senderEmail').value.trim();
        const subject = document.getElementById('missionSubject').value.trim();
        const msg = document.getElementById('payloadMessage').value.trim();

        if (!name || !email || !subject || !msg) {
          SoundFX.error();
          showToast('ERROR: Mandatory transmission fields missing', false);
          return;
        }

        submitBtn.disabled = true;
        progress.style.display = 'block';
        fill.style.width = '0%';
        percentText.textContent = '0%';
        statusText.textContent = 'ENCRYPTING PACKET...';

        let percent = 0;
        const interval = setInterval(() => {
          percent += 4;
          if (percent > 100) percent = 100;

          fill.style.width = `${percent}%`;
          percentText.textContent = `${percent}%`;

          if (percent === 40) statusText.textContent = 'QUANTUM ROUTING...';
          if (percent === 80) statusText.textContent = 'FINALIZING DISPATCH...';

          if (percent >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              progress.style.display = 'none';
              submitBtn.disabled = false;
              form.reset();
              showToast(`TRANSMISSION RECEIVED: Thank you, ${name}. Direct uplink confirmed!`);
            }, 400);
          }
        }, 40);
      });
    }

    // Copy Email to Clipboard
    const copyBtn = document.getElementById('copyEmailBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const email = copyBtn.getAttribute('data-email') || 'sakir.ahamad.dev@gmail.com';
        navigator.clipboard.writeText(email).then(() => {
          showToast(`COPIED TO CLIPBOARD: ${email}`);
        }).catch(() => {
          showToast(`COPIED: ${email}`);
        });
      });
    }
  }

  /* ==========================================================================
     11. AUDIO SFX TOGGLE
     ========================================================================== */
  function initAudioToggle() {
    const btn = document.getElementById('audioToggle');
    const label = document.getElementById('audioLabel');
    if (!btn || !label) return;

    btn.addEventListener('click', () => {
      AppState.audioEnabled = !AppState.audioEnabled;

      if (AppState.audioEnabled) {
        initAudioContext();
        btn.classList.add('sound-on');
        label.textContent = 'SFX: ON';
        SoundFX.success();
      } else {
        btn.classList.remove('sound-on');
        label.textContent = 'SFX: OFF';
      }
    });
  }

  /* ==========================================================================
     12. NAVBAR & NAVIGATION SCROLL SPY
     ========================================================================== */
  function initNavigation() {
    const navbar = document.getElementById('navbar');
    const mobileToggle = document.getElementById('mobileToggle');
    const cyberNav = document.getElementById('cyberNav');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    // Scrolled class on navbar
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }

      // Scroll Spy
      let currentSectionId = '';
      sections.forEach((sec) => {
        const top = sec.offsetTop - 120;
        const height = sec.offsetHeight;
        if (window.scrollY >= top && window.scrollY < top + height) {
          currentSectionId = sec.getAttribute('id');
        }
      });

      if (currentSectionId) {
        navLinks.forEach((link) => {
          if (link.getAttribute('data-nav') === currentSectionId) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });

    // Mobile Menu
    if (mobileToggle && cyberNav) {
      mobileToggle.addEventListener('click', () => {
        cyberNav.classList.toggle('open');
      });

      navLinks.forEach((link) => {
        link.addEventListener('click', () => {
          cyberNav.classList.remove('open');
        });
      });
    }

    // Set current year in footer
    const yearEl = document.getElementById('currentYear');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }

  /* ==========================================================================
     INITIALIZATION DISPATCH
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    initCustomCursor();
    initNeuralCanvas();
    initMatrixRain();
    initTypewriter();
    init3DTilt();
    initFilters();
    initTerminal();
    initProjectModal();
    initContactAndToast();
    initAudioToggle();
    initNavigation();
  });
})();
