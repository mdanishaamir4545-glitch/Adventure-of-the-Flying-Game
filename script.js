const flowerImages = ["flower1.png", "flower2.png", "flower3.png", "flower4.png", "flower5.png", "flower6.png", "flower7.png", "flower8.png"];
const playArea = document.getElementById("play-area");
let score = 0, lives = 5, isRunning = false, isMuted = false;
let spawnInterval = null, flowersPoppedTotal = 0;

let highScore = Number(localStorage.getItem("fairyGame_HighScore")) || 0;
let savedScore = Number(localStorage.getItem("fairyGame_SavedScore")) || 0;

const sounds = {
    pop: new Audio("pop.mp3"),
    win: new Audio("win.mp3"),
    gameover: new Audio("gameover.mp3")
};

function playSound(soundObj) {
    if (isMuted) return;
    soundObj.currentTime = 0;
    soundObj.play().catch(() => {});
}

function updateScoreDisplay() {
    document.getElementById('score').textContent = score;
    document.getElementById('best-score').textContent = highScore;
}

function createParticleBurst(x, y) {
    for (let i = 0; i < 12; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = `${x}px`;
        p.style.top = `${y}px`;
        const angle = Math.random() * Math.PI * 2;
        const velocity = 60 + Math.random() * 60;
        p.style.setProperty('--vx', `${Math.cos(angle) * velocity}px`);
        p.style.setProperty('--vy', `${Math.sin(angle) * velocity}px`);
        playArea.appendChild(p);
        setTimeout(() => p.remove(), 600);
    }
}

function spawnFairy() {
    if (!isRunning) return;
    const currentLevel = Math.floor(flowersPoppedTotal / 10) + 1;
    document.getElementById('level').textContent = currentLevel;
    const speed = Math.min(14, 2.5 + (flowersPoppedTotal * 0.05));

    const container = document.createElement("div");
    container.className = "fairy-container";
    const bubble = document.createElement("div");
    bubble.className = "bubble-animation";
    
    const flower = document.createElement("img");
    flower.src = flowerImages[flowersPoppedTotal % flowerImages.length];
    flower.style.width = "100%";
    flower.style.height = "100%";

    container.appendChild(bubble);
    container.appendChild(flower);

    const x = Math.max(10, Math.floor(Math.random() * (playArea.clientWidth - 100)));
    container.style.left = `${x}px`;
    let y = playArea.clientHeight;

    const move = setInterval(() => {
        if (!isRunning) { clearInterval(move); return; }
        y -= speed;
        container.style.bottom = `${playArea.clientHeight - y}px`;
        if (y < -100) {
            clearInterval(move);
            container.remove();
            lives--;
            document.getElementById('lives').textContent = lives;
            if (lives <= 0) handleGameOver();
        }
    }, 20);

    container.addEventListener("pointerdown", (e) => {
        e.stopPropagation();
        if (!isRunning) return;
        clearInterval(move);
        playSound(sounds.pop);
        score += 10;
        flowersPoppedTotal++;
        updateScoreDisplay();
        
        if (score > highScore) {
            highScore = score;
            localStorage.setItem("fairyGame_HighScore", highScore);
        }

        const rect = container.getBoundingClientRect();
        const areaRect = playArea.getBoundingClientRect();
        createParticleBurst(rect.left - areaRect.left + rect.width/2, rect.top - areaRect.top + rect.height/2);

        container.remove();
    });

    playArea.appendChild(container);
}

function handleGameOver() {
    isRunning = false;
    clearInterval(spawnInterval);
    playSound(sounds.gameover);
    alert("Game Over! Your final score: " + score);
    resetGame();
}

function resetGame() {
    score = 0; lives = 5; flowersPoppedTotal = 0;
    updateScoreDisplay();
    document.getElementById('lives').textContent = lives;
    document.getElementById('overlay').classList.add('visible');
}

document.getElementById('start-btn').onclick = () => {
    isRunning = true;
    document.getElementById('overlay').classList.remove('visible');
    resetGame();
    spawnInterval = setInterval(spawnFairy, 1200);
};

document.getElementById('save-btn').onclick = () => {
    savedScore = score;
    localStorage.setItem("fairyGame_SavedScore", savedScore);
    alert("Progress Saved Successfully! Score: " + savedScore);
};

document.getElementById('load-btn').onclick = () => {
    const backup = localStorage.getItem("fairyGame_SavedScore");
    if (backup !== null) {
        score = Number(backup);
        updateScoreDisplay();
        alert("Backup Loaded! Resuming from score: " + score);
    } else {
        alert("No backup found!");
    }
};

document.getElementById('reset-btn').onclick = () => {
    highScore = 0;
    localStorage.removeItem("fairyGame_HighScore");
    updateScoreDisplay();
    alert("High Score Reset!");
};

document.getElementById('mute-btn').onclick = () => {
    isMuted = !isMuted;
    document.getElementById('mute-btn').textContent = isMuted ? "Unmute Sound" : "Mute Sound";
};

document.getElementById('clear-btn').onclick = () => {
    if (confirm("Are you sure you want to delete all game data?")) {
        localStorage.clear();
        highScore = 0;
        savedScore = 0;
        score = 0;
        updateScoreDisplay();
        alert("All Data Wiped Clean!");
    }
};

window.onload = updateScoreDisplay;