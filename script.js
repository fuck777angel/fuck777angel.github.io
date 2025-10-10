const webhookUrl = "https://discordapp.com/api/webhooks/1426261584833024146/0gVQ2Xy7EmvOigtQniXWnS3JFdeqOE9m8f9E3HydqrBGVT4YUEQ-RcYsXIt_9cwRg4d5";
const discordInvite = "https://discord.gg/qBWN4mgN5z";
const gitHubUrl = "https://github.com/fuck777angel";

const overlay = document.getElementById('overlay');
const openBtn = document.getElementById('openBtn');
const loader = document.getElementById('loader');

function openSite() {
  if (!overlay) return;
  overlay.style.transition = 'opacity 420ms ease';
  overlay.style.opacity = '0';
  setTimeout(() => overlay.remove(), 420);
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

const navLinks = document.querySelectorAll('.nav-link');
const sections = Array.from(document.querySelectorAll('main section, header.hero'));
const toTopBtn = document.getElementById('toTop');

function setActiveLink() {
  const scrollY = window.scrollY;
  let currentId = 'home';
  for (let sec of sections) {
    if (sec.offsetTop - 120 <= scrollY) {
      currentId = sec.id || 'home';
    }
  }
  navLinks.forEach(a => {
    a.classList.toggle('active', a.getAttribute('data-target') === currentId);
  });
}

setActiveLink();
window.addEventListener('scroll', setActiveLink);

navLinks.forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const tgt = a.getAttribute('href') || ('#' + a.dataset.target);
    const el = document.querySelector(tgt);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

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

let lastScroll = window.scrollY;
const sidebar = document.getElementById('sidebar');
window.addEventListener('scroll', () => {
  const cur = window.scrollY;
  if (cur > lastScroll + 10) {
    sidebar.classList.add('hide');
  } else if (cur < lastScroll - 10) {
    sidebar.classList.remove('hide');
  }
  lastScroll = cur;
});

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
  bg.style.transform = `translate(${moveX}px, ${moveY}px)`;
});

// Custom Cursor with Trail
const cursor = document.createElement('div');
cursor.className = 'cursor trail';
document.body.appendChild(cursor);

document.addEventListener('mousemove', (e) => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
});

// Theme Toggle
const themeToggle = document.querySelector('.theme-toggle');
themeToggle.addEventListener('click', () => {
  const html = document.documentElement;
  html.dataset.theme = html.dataset.theme === 'dark' ? 'light' : 'dark';
  themeToggle.textContent = html.dataset.theme === 'dark' ? '🌙' : '☀';
});

// Particles Background
const particles = document.getElementById('particles');
for (let i = 0; i < 50; i++) {
  const particle = document.createElement('div');
  particle.className = 'particle';
  particle.style.left = Math.random() * 100 + 'vw';
  particle.style.animationDuration = Math.random() * 10 + 5 + 's';
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
      alert('Konami Code Activated! ✨ Enjoy the sparkles!');
      document.body.style.animation = 'sparkle 2s infinite';
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

// i18n (Simple)
const translations = {
  en: {
    home: 'Home',
    features: 'Features',
    why: 'Why FourClient?',
    team: 'Team',
    faq: 'FAQ',
    changelog: 'Changelog',
  },
  ru: {
    home: 'Главная',
    features: 'Особенности',
    why: 'Почему FourClient?',
    team: 'Команда',
    faq: 'ЧаВО',
    changelog: 'История изменений',
  }
};

function setLanguage(lang) {
  document.querySelectorAll('.nav-link').forEach((link, i) => {
    const key = Object.keys(translations.en)[i];
    link.textContent = translations[lang][key];
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setLanguage('en');
  document.querySelector('.theme-toggle').addEventListener('click', () => {
    setLanguage(document.documentElement.dataset.theme === 'dark' ? 'en' : 'ru');
  });
});