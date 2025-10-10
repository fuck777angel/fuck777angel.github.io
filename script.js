const webhookUrl = "https://discordapp.com/api/webhooks/1426261584833024146/0gVQ2Xy7EmvOigtQniXWnS3JFdeqOE9m8f9E3HydqrBGVT4YUEQ-RcYsXIt_9cwRg4d5";
const discordInvite = "https://discord.gg/qBWN4mgN5z";
const gitHubUrl = "https://github.com/fuck777angel";

const overlay = document.getElementById('overlay');
const openBtn = document.getElementById('openBtn');
const loader = document.getElementById('loader');

function openSite() {
  if (!overlay) return;
  overlay.style.transition = 'opacity 600ms ease, backdrop-filter 600ms ease';
  overlay.style.opacity = '0';
  overlay.style.backdropFilter = 'blur(0px)';
  setTimeout(() => overlay.remove(), 600);
  setTimeout(() => initReveal(), 120);
}

openBtn.addEventListener('click', openSite);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') openSite();
});

const titleText = "FourClient.";
const typeTarget = document.getElementById('typeTitle');
const cursorEl = document.getElementById('titleCursor');
let tIndex = 0;

function typeTick() {
  if (tIndex <= titleText.length) {
    typeTarget.textContent = titleText.slice(0, tIndex);
    tIndex++;
    setTimeout(typeTick, 100);
  } else {
    cursorEl.style.display = 'inline-block';
  }
}

setTimeout(() => {
  if (!document.body.contains(overlay)) typeTick();
}, 300);

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    loader.style.opacity = '0';
    setTimeout(() => loader.remove(), 400);
    if (!document.body.contains(overlay)) typeTick();
  }, 1200);
});

const revealElements = () => document.querySelectorAll('.reveal');
function initReveal() {
  const els = revealElements();
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => obs.observe(el));
}

const toTopBtn = document.getElementById('toTop');
window.addEventListener('scroll', () => {
  if (window.scrollY > 300) toTopBtn.style.display = 'flex';
  else toTopBtn.style.display = 'none';
});

toTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

const progress = document.getElementById('progress');
function updateProgress() {
  const doc = document.documentElement;
  const pct = (window.scrollY / (doc.scrollHeight - doc.clientHeight)) * 100;
  progress.style.width = pct + "%";
}

updateProgress();
window.addEventListener('scroll', updateProgress);
window.addEventListener('resize', updateProgress);

document.getElementById('joinDiscord').addEventListener('click', async () => {
  if (webhookUrl && webhookUrl.trim().length > 10) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: `Someone clicked Join Community on FourClient (v0.1)` })
      });
      window.open(discordInvite, '_blank');
    } catch (err) {
      console.warn('Webhook failed', err);
      window.open(discordInvite, '_blank');
    }
  } else {
    window.open(discordInvite, '_blank');
  }
});

document.getElementById('viewGit').addEventListener('click', () => {
  window.open(gitHubUrl, '_blank');
});

// 3D Parallax Background
document.addEventListener('mousemove', (e) => {
  const bg = document.querySelector('.bg');
  const moveX = (e.clientX / window.innerWidth - 0.5) * 20;
  const moveY = (e.clientY / window.innerHeight - 0.5) * 20;
  bg.style.transform = `translate(${moveX}px, ${moveY}px) rotateX(${moveY / 2}deg) rotateY(${moveX / 2}deg)`;
});

// Ripple Effect on Click
document.querySelectorAll('.btn, #toTop, .theme-toggle').forEach(el => {
  el.addEventListener('click', (e) => {
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = e.clientX - rect.left - size / 2 + 'px';
    ripple.style.top = e.clientY - rect.top - size / 2 + 'px';
    el.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

// Particle Explosion on Click
document.addEventListener('click', (e) => {
  for (let i = 0; i < 10; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = e.clientX + 'px';
    particle.style.top = e.clientY + 'px';
    particle.style.animation = `explode ${Math.random() * 0.5 + 0.5}s ease-out`;
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 1000);
  }
});

// Minecraft Block Break Effect
document.querySelectorAll('.feature-card, .team-card, .faq-item, .log-entry, .commit-card').forEach(el => {
  el.addEventListener('click', (e) => {
    for (let i = 0; i < 8; i++) {
      const particle = document.createElement('div');
      particle.className = 'block-particle';
      particle.style.left = e.clientX + 'px';
      particle.style.top = e.clientY + 'px';
      particle.style.setProperty('--rx', Math.random() * 2 - 1);
      particle.style.setProperty('--ry', Math.random() * 2 - 1);
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 800);
    }
  });
});

// Pixel Dust Effect
document.querySelectorAll('.feature-card, .team-card, .faq-item, .log-entry, .commit-card').forEach(el => {
  el.addEventListener('mouseenter', (e) => {
    for (let i = 0; i < 5; i++) {
      const dust = document.createElement('div');
      dust.className = 'pixel-dust';
      dust.style.left = e.clientX + 'px';
      dust.style.top = e.clientY + 'px';
      dust.style.setProperty('--dx', Math.random() * 2 - 1);
      dust.style.setProperty('--dy', Math.random() * 2 - 1);
      document.body.appendChild(dust);
      setTimeout(() => dust.remove(), 600);
    }
  });
});

// Floating Tooltips
const tooltip = document.getElementById('tooltip');
document.querySelectorAll('.btn, .social-icon, .team-card a, #toTop, .theme-toggle').forEach(el => {
  el.addEventListener('mouseenter', (e) => {
    tooltip.textContent = el.dataset.tooltip || el.textContent || el.getAttribute('title') || 'Action';
    tooltip.style.opacity = '1';
    tooltip.style.left = e.clientX + 10 + 'px';
    tooltip.style.top = e.clientY + 10 + 'px';
  });
  el.addEventListener('mouseleave', () => {
    tooltip.style.opacity = '0';
  });
});

// Theme Toggle
const themeToggle = document.querySelector('.theme-toggle');
themeToggle.addEventListener('click', () => {
  const html = document.documentElement;
  html.dataset.theme = html.dataset.theme === 'dark' ? 'light' : 'dark';
  themeToggle.textContent = html.dataset.theme === 'dark' ? '🌙' : '☀';
});

// Particles Background (Pixel Rain)
const particles = document.getElementById('particles');
for (let i = 0; i < 50; i++) {
  const particle = document.createElement('div');
  particle.className = Math.random() > 0.5 ? 'pixel-rain' : 'particle';
  particle.style.left = Math.random() * 100 + 'vw';
  particle.style.animationDuration = Math.random() * 10 + 5 + 's';
  particle.style.animationDelay = Math.random() * 5 + 's';
  particles.appendChild(particle);
}

// GitHub Commits
async function fetchCommits() {
  try {
    const res = await fetch('https://api.github.com/repos/fuck777angel/fourclient/commits?per_page=3');
    const commits = await res.json();
    const commitsDiv = document.getElementById('githubCommits');
    commits.forEach(commit => {
      const div = document.createElement('div');
      div.className = 'commit-card';
      div.innerHTML = `<div class="meta">${new Date(commit.commit.author.date).toLocaleDateString()}</div>
                       <div>${commit.commit.message}</div>`;
      commitsDiv.appendChild(div);
    });
  } catch (err) {
    console.warn('GitHub API failed', err);
  }
}

fetchCommits();

// Discord User Count (Mock)
setTimeout(() => {
  document.getElementById('discordCount').textContent = '1.2K';
}, 1000);

// Konami Code Easter Egg
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
  if (e.key === konamiCode[konamiIndex]) {
    konamiIndex++;
    if (konamiIndex === konamiCode.length) {
      document.body.style.animation = 'sparkle 2s infinite';
      alert('Konami Code Activated! ✨ Sparkles everywhere!');
    }
  } else {
    konamiIndex = 0;
  }
});

// Title Animation
const title = document.querySelector('title');
let titleIndex = 0;
const titleStates = ['> FourClient', '>> FourClient', '>>> FourClient', ' FourClient'];
setInterval(() => {
  title.textContent = titleStates[titleIndex];
  titleIndex = (titleIndex + 1) % titleStates.length;
}, 1000);