// ============================================
// YEAR
// ============================================
document.getElementById('year').textContent = new Date().getFullYear();

// ============================================
// THEME TOGGLE
// ============================================
const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

const sunPath = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>';
const moonPath = '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/>';

function setIcon(theme) {
  themeIcon.innerHTML = theme === 'light' ? moonPath : sunPath;
}

function applyTheme(theme) {
  root.setAttribute('data-theme', theme);
  setIcon(theme);
  localStorage.setItem('portfolio-theme', theme);
}

const savedTheme = localStorage.getItem('portfolio-theme') ||
  (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
applyTheme(savedTheme);

themeToggle.addEventListener('click', () => {
  const current = root.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

// ============================================
// NAV: scroll shadow + mobile menu + scroll progress
// ============================================
const navbar = document.getElementById('navbar');
const scrollProgress = document.getElementById('scrollProgress');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 12);
  const doc = document.documentElement;
  const pct = (doc.scrollTop / (doc.scrollHeight - doc.clientHeight)) * 100;
  scrollProgress.style.width = pct + '%';
});

// ============================================
// PAGE-WIDE CURSOR SPOTLIGHT (responds to the visitor, not auto-playing)
// ============================================
window.addEventListener('mousemove', (e) => {
  const mx = (e.clientX / window.innerWidth) * 100;
  const my = (e.clientY / window.innerHeight) * 100;
  root.style.setProperty('--mx', mx + '%');
  root.style.setProperty('--my', my + '%');
});

const navToggle = document.getElementById('navToggle');
navToggle.addEventListener('click', () => navbar.classList.toggle('menu-open'));
document.querySelectorAll('.nav-links a').forEach(a =>
  a.addEventListener('click', () => navbar.classList.remove('menu-open'))
);

// ============================================
// SCROLL REVEAL (single subtle pass, not per-card)
// ============================================
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => revealObserver.observe(el));

// ============================================
// HERO KNOWLEDGE GRAPH
// ============================================
const svg = document.getElementById('graph-svg');
const W = 480, H = 480, CX = 240, CY = 240, R = 175;

const skillNodes = [
  'Deep Learning', 'NLP', 'Computer Vision', 'Robotics & Autonomy',
  'Data Engineering', 'Research', 'Python', 'PyTorch', 'MLOps'
];

const nodes = [{ id: 'core', label: 'AI / ML', x: CX, y: CY, core: true }];

skillNodes.forEach((label, i) => {
  const angle = (i / skillNodes.length) * Math.PI * 2 - Math.PI / 2;
  nodes.push({
    id: 'n' + i,
    label,
    x: CX + Math.cos(angle) * R,
    y: CY + Math.sin(angle) * R,
    core: false
  });
});

// a few cross-links between adjacent skill nodes for a richer graph
const edges = [];
nodes.slice(1).forEach(n => edges.push({ from: 'core', to: n.id }));
edges.push({ from: 'n0', to: 'n1' }); // Deep Learning -> NLP
edges.push({ from: 'n1', to: 'n2' }); // NLP -> Computer Vision
edges.push({ from: 'n2', to: 'n3' }); // Computer Vision -> Robotics & Autonomy
edges.push({ from: 'n5', to: 'n6' }); // Research -> Python
edges.push({ from: 'n6', to: 'n7' }); // Python -> PyTorch
edges.push({ from: 'n7', to: 'n8' }); // PyTorch -> MLOps

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function nodeById(id) { return nodes.find(n => n.id === id); }

const svgNS = 'http://www.w3.org/2000/svg';
const edgeEls = {};

edges.forEach(edge => {
  const a = nodeById(edge.from), b = nodeById(edge.to);
  const line = document.createElementNS(svgNS, 'line');
  line.setAttribute('x1', a.x); line.setAttribute('y1', a.y);
  line.setAttribute('x2', b.x); line.setAttribute('y2', b.y);
  line.setAttribute('class', 'graph-edge');
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  line.style.strokeDasharray = len;
  line.style.strokeDashoffset = len;
  svg.appendChild(line);
  edgeEls[edge.from + '-' + edge.to] = line;
  if (!edgeEls[edge.from]) edgeEls[edge.from] = [];
  if (!edgeEls[edge.to]) edgeEls[edge.to] = [];
  edgeEls[edge.from].push(line);
  edgeEls[edge.to].push(line);
});

if (!reducedMotion) {
  [0, 1.05, 2.1].forEach(delay => {
    const ring = document.createElementNS(svgNS, 'circle');
    ring.setAttribute('cx', CX);
    ring.setAttribute('cy', CY);
    ring.setAttribute('r', 34);
    ring.setAttribute('class', 'ping-ring');
    ring.style.animationDelay = delay + 's';
    svg.appendChild(ring);
  });
}

nodes.forEach(n => {
  const g = document.createElementNS(svgNS, 'g');
  g.setAttribute('class', 'graph-node' + (n.core ? ' core' : ''));
  g.style.opacity = 0;
  g.style.transformOrigin = `${n.x}px ${n.y}px`;
  g.style.transform = 'scale(0.4)';
  g.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.22,1,0.36,1)';

  const circle = document.createElementNS(svgNS, 'circle');
  circle.setAttribute('cx', n.x);
  circle.setAttribute('cy', n.y);
  circle.setAttribute('r', n.core ? 34 : 22);
  g.appendChild(circle);

  const text = document.createElementNS(svgNS, 'text');
  text.setAttribute('x', n.x);
  text.setAttribute('y', n.core ? n.y + 4 : n.y + (n.y > CY ? 38 : -32));
  text.setAttribute('text-anchor', 'middle');
  text.textContent = n.label;
  g.appendChild(text);

  g.addEventListener('mouseenter', () => highlightNode(n.id, true));
  g.addEventListener('mouseleave', () => highlightNode(n.id, false));

  svg.appendChild(g);
  n.el = g;
});

function highlightNode(id, on) {
  const related = edgeEls[id] || [];
  related.forEach(line => {
    line.style.opacity = on ? '0.85' : '0.35';
    line.style.strokeWidth = on ? '1.6' : '1';
  });
}

// Orchestrated load sequence: edges draw in, nodes pop in, then the graph
// settles into continuous, restrained motion — floating nodes, radar pings
// (added above), and small particles that keep traveling the edges forever.
function animateGraph() {
  const edgeList = Object.values(edgeEls).filter(v => v.tagName === 'line');
  edgeList.forEach((line, i) => {
    setTimeout(() => {
      line.style.transition = 'stroke-dashoffset 0.7s cubic-bezier(0.22,1,0.36,1)';
      line.style.strokeDashoffset = '0';
    }, i * 45);
  });

  const settleDelay = 250 + nodes.length * 70;

  nodes.forEach((n, i) => {
    setTimeout(() => {
      n.el.style.opacity = '1';
      n.el.style.transform = 'scale(1)';

      if (!n.core && !reducedMotion) {
        setTimeout(() => {
          n.el.style.transform = ''; // hand control to the CSS animation below
          n.el.style.setProperty('--float-dur', (3.4 + Math.random() * 2.2).toFixed(2) + 's');
          n.el.style.setProperty('--float-delay', (Math.random() * 2.5).toFixed(2) + 's');
          n.el.classList.add('idle');
        }, 500);
      }
    }, 250 + i * 70);
  });

  if (!reducedMotion) {
    setTimeout(startParticles, settleDelay + 500);
  }
}

// Small dots that continuously travel each edge, fading in/out near the
// endpoints so the graph reads as "live data flow" rather than a static chart.
function startParticles() {
  const particles = edges.map(edge => ({
    el: (() => {
      const p = document.createElementNS(svgNS, 'circle');
      p.setAttribute('r', 2.6);
      p.setAttribute('class', 'graph-pulse');
      svg.appendChild(p);
      return p;
    })(),
    a: nodeById(edge.from),
    b: nodeById(edge.to),
    phase: Math.random(),
    speed: 0.09 + Math.random() * 0.07
  }));

  function tick(time) {
    particles.forEach(p => {
      const t = ((time / 1000) * p.speed + p.phase) % 1;
      p.el.setAttribute('cx', p.a.x + (p.b.x - p.a.x) * t);
      p.el.setAttribute('cy', p.a.y + (p.b.y - p.a.y) * t);
      const fade = Math.sin(t * Math.PI); // 0 at endpoints, peak mid-edge
      p.el.style.opacity = (0.12 + fade * 0.75).toFixed(2);
    });
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// Trigger once the hero is in view (also handles reduced-motion gracefully via CSS override)
const heroObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateGraph();
      heroObserver.disconnect();
    }
  });
}, { threshold: 0.2 });
heroObserver.observe(document.querySelector('.hero'));
