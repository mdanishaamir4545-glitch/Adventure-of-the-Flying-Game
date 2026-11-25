const flowerImages = [
  "AdventureoftheFlyingGameImageFolderFile/flower1.png",
  "AdventureoftheFlyingGameImageFolderFile/flower2.png",
  "AdventureoftheFlyingGameImageFolderFile/flower3.png",
  "AdventureoftheFlyingGameImageFolderFile/flower4.png",
  "AdventureoftheFlyingGameImageFolderFile/flower5.png",
  "AdventureoftheFlyingGameImageFolderFile/flower6.png",
  "AdventureoftheFlyingGameImageFolderFile/flower7.png",
  "AdventureoftheFlyingGameImageFolderFile/flower8.png"
];

const translations = {
  en: { level: "Level", score: "Score", lives: "Lives", title: "Adventure of the Fairy", msg: "Pop bubbles to free fairies!", start: "Start Game", over: "Game Over!" },
  ur: { level: "لیول", score: "اسکور", lives: "زندگیاں", title: "فلائنگ فیری", msg: "فیری آزاد کرنے کے لیے بلبلے پھوڑیں!", start: "کھیل شروع کریں", win: "آپ جیت گئے!", over: "گیم اوور!" },
  hi: { level: "स्तर", score: "स्कोर", lives: "जान", title: "एडवेंचर ऑफ द फेयरी", msg: "बुलबुले फोड़ें!", start: "खेल शुरू करें", over: "खेल खत्म!" }
};

let currentLang = 'en';
const langToggle = document.getElementById('lang-toggle');

langToggle.addEventListener('click', () => {
  const langs = ['en', 'ur', 'hi'];
  let nextIndex = (langs.indexOf(currentLang) + 1) % langs.length;
  currentLang = langs[nextIndex];
  document.documentElement.dir = currentLang === 'ur' ? 'rtl' : 'ltr';
  updateLanguage();
});

function updateLanguage() {
  const t = translations[currentLang];
  document.querySelectorAll('[data-key]').forEach(el => {
    el.textContent = t[el.getAttribute('data-key')];
  });
  document.getElementById('modal-title').textContent = t.title;
  document.getElementById('modal-message').textContent = t.msg;
  document.getElementById('start-btn').textContent = t.start;
}

const sounds = {
  pop: new Audio("AdventureoftheFlyingGameSoundFolderFile/pop.mp3"),
  win: new Audio("AdventureoftheFlyingGameSoundFolderFile/win.mp3"),
  gameover: new Audio("AdventureoftheFlyingGameSoundFolderFile/gameover.mp3"),
  music: new Audio("AdventureoftheFlyingGameSoundFolderFile/speak.mp3"),
  music2: new Audio("AdventureoftheFlyingGameSoundFolderFile/speak2.mp3")
};

sounds.music.loop = true;
sounds.music2.loop = true;

function playSound(soundObj) {
  soundObj.currentTime = 0;
  soundObj.play().catch(() => {});
}

function stopSound(soundObj) {
  soundObj.pause();
  soundObj.currentTime = 0;
}

function stopBackgroundMusic() {
  stopSound(sounds.music);
  stopSound(sounds.music2);
}

function playContinuousMusic(level) {
  stopBackgroundMusic();
  if (Math.floor((level - 1) / 10) % 2 === 0) {
    playSound(sounds.music);
  } else {
    playSound(sounds.music2);
  }
}

const playArea = document.getElementById("play-area");
let score = 0, lives = 5, isRunning = false;
let spawnInterval = null;
let flowersPoppedTotal = 0;
let gameTimer = null;
let secondsElapsed = 0;

function createParticleBurst(x, y) {
  for (let i = 0; i < 8; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    const angle = Math.random() * Math.PI * 2;
    const velocity = 50 + Math.random() * 50;
    p.style.setProperty('--vx', `${Math.cos(angle) * velocity}px`);
    p.style.setProperty('--vy', `${Math.sin(angle) * velocity}px`);
    playArea.appendChild(p);
    setTimeout(() => p.remove(), 500);
  }
}

function clearFairies() {
  const fairies = document.querySelectorAll('.fairy-container, .particle');
  fairies.forEach(fairy => fairy.remove());
}

function spawnFairy() {
  if (!isRunning) return;

  const currentLevel = Math.floor(flowersPoppedTotal / 10) + 1;
  document.getElementById('level').textContent = currentLevel;

  const speed = Math.min(12, 2 + (flowersPoppedTotal * 0.05));
  const pointsEarned = 10 + Math.floor(flowersPoppedTotal * 2);

  const container = document.createElement("div");
  container.className = "fairy-container";

  const bubble = document.createElement("div");
  bubble.className = "bubble-animation";

  const imgName = flowerImages[flowersPoppedTotal % flowerImages.length];
  const flower = document.createElement("img");
  flower.src = imgName;
  flower.style.width = "100%";
  flower.style.height = "100%";
  flower.style.objectFit = "contain";

  const randomHue = Math.floor(Math.random() * 360);
  flower.style.filter = `hue-rotate(${randomHue}deg)`;

  container.appendChild(bubble);
  container.appendChild(flower);

  const x = Math.max(10, Math.floor(Math.random() * (playArea.clientWidth - 100)));
  container.style.left = `${x}px`;
  let y = playArea.clientHeight;
  let isPopped = false;

  container.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
    if (!isRunning || isPopped) return;
    isPopped = true;
    playSound(sounds.pop);

    score += pointsEarned;
    flowersPoppedTotal++;
    document.getElementById('score').textContent = score;

    const newLevel = Math.floor(flowersPoppedTotal / 10) + 1;
    if (newLevel !== currentLevel) {
      playContinuousMusic(newLevel);
    }

    const rect = container.getBoundingClientRect();
    const areaRect = playArea.getBoundingClientRect();
    createParticleBurst(rect.left - areaRect.left + rect.width / 2, rect.top - areaRect.top + rect.height / 2);

    container.remove();
  });

  playArea.appendChild(container);

  const move = setInterval(() => {
    if (!isRunning || isPopped) {
      clearInterval(move);
      return;
    }
    y -= speed;
    container.style.bottom = `${playArea.clientHeight - y}px`;
    if (y < -100) {
      clearInterval(move);
      if (!isPopped) {
        container.remove();
        lives--;
        document.getElementById('lives').textContent = lives;
        if (lives <= 0) handleGameOver();
      }
    }
  }, 20);
}

function handleGameOver() {
  isRunning = false;
  clearInterval(spawnInterval);
  clearInterval(gameTimer);
  clearFairies();
  stopBackgroundMusic();
  playSound(sounds.gameover);
  alert(translations[currentLang].over + " Time survived: " + secondsElapsed + "s");
  resetGame();
}

function resetGame() {
  score = 0;
  lives = 5;
  flowersPoppedTotal = 0;
  secondsElapsed = 0;
  document.getElementById('score').textContent = score;
  document.getElementById('lives').textContent = lives;
  document.getElementById('level').textContent = "1";
  document.getElementById('overlay').classList.add('visible');
}

document.getElementById('start-btn').onclick = () => {
  clearFairies();
  isRunning = true;
  document.getElementById('overlay').classList.remove('visible');
  score = 0;
  lives = 5;
  flowersPoppedTotal = 0;
  secondsElapsed = 0;
  document.getElementById('score').textContent = score;
  document.getElementById('lives').textContent = lives;
  document.getElementById('level').textContent = "1";

  playContinuousMusic(1);

  if (spawnInterval) clearInterval(spawnInterval);
  if (gameTimer) clearInterval(gameTimer);

  spawnInterval = setInterval(() => {
    if (isRunning) {
      spawnFairy();
    }
  }, 1200);

  gameTimer = setInterval(() => {
    if (isRunning) {
      secondsElapsed++;
    }
  }, 1000);
};