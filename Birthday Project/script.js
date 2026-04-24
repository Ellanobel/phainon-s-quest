const dialog = document.getElementById("dialog"); 
const choices = document.getElementById("choices"); 
const body = document.body;
const replayBtn = document.getElementById("replayBtn");
const crashScreen = document.getElementById("crashScreen");

// AUDIO CONTEXT
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, type, duration, vol = 0.1) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  gain.gain.setValueAtTime(vol, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function playClick() { 
  playTone(800, 'sine', 0.1, 0.08);
} 

function playUnlock() { 
  playTone(523.25, 'sine', 0.1, 0.1);
  setTimeout(() => playTone(659.25, 'sine', 0.1, 0.1), 100);
  setTimeout(() => playTone(783.99, 'sine', 0.2, 0.1), 200);
}

function playWrong() {
  playTone(150, 'sawtooth', 0.3, 0.12);
}

function shakeScreen() {
  body.classList.add('shake');
  setTimeout(() => body.classList.remove('shake'), 500);
}

function typeText(text, speed = 40, callback = null) { 
  dialog.innerHTML = '<span class="typing-content"></span><span class="cursor">|</span>'; 
  const content = dialog.querySelector('.typing-content');
  let i = 0; 
  function typing() { 
    if (i < text.length) { 
      content.innerHTML += text.charAt(i); 
      i++; 
      setTimeout(typing, speed); 
    } else {
      const cursor = dialog.querySelector('.cursor');
      if (cursor) cursor.remove();
      if (callback) callback(); 
    } 
  } 
  typing(); 
} 

function showChoices(options) { 
  choices.innerHTML = ""; 
  options.forEach(opt => { 
    let btn = document.createElement("button"); 
    btn.innerText = opt.text; 
    btn.onclick = () => { 
      playClick(); 
      opt.action(); 
    }; 
    choices.appendChild(btn); 
  }); 
} 

////////////////////////////////////////////////// 
// CONFETTI SYSTEM
//////////////////////////////////////////////////

const canvas = document.getElementById("confettiCanvas");
const ctx = canvas.getContext("2d");
let confettiParticles = [];
let confettiAnimationId = null;
let celebrationInterval = null;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function createConfettiPiece(x, y, burst = false) {
  const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#1dd1a1', '#ffd700', '#ff6348'];
  return {
    x: x || Math.random() * canvas.width,
    y: y || (burst ? canvas.height / 2 : -10),
    size: Math.random() * 8 + 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    speedX: burst ? (Math.random() - 0.5) * 20 : (Math.random() - 0.5) * 2,
    speedY: burst ? (Math.random() - 1) * 20 : Math.random() * 3 + 2,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 10,
    gravity: burst ? 0.5 : 0.05,
    opacity: 1,
    decay: burst ? 0.008 : 0.002
  };
}

function updateConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  for (let i = confettiParticles.length - 1; i >= 0; i--) {
    const p = confettiParticles[i];
    p.x += p.speedX;
    p.y += p.speedY;
    p.speedY += p.gravity;
    p.rotation += p.rotationSpeed;
    p.opacity -= p.decay;
    
    if (p.opacity <= 0 || p.y > canvas.height + 20) {
      confettiParticles.splice(i, 1);
      continue;
    }
    
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rotation * Math.PI) / 180);
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
    ctx.restore();
  }
  
  if (confettiParticles.length > 0) {
    confettiAnimationId = requestAnimationFrame(updateConfetti);
  } else {
    confettiAnimationId = null;
  }
}

function spawnConfetti(count = 50, burst = false, x, y) {
  for (let i = 0; i < count; i++) {
    confettiParticles.push(createConfettiPiece(x, y, burst));
  }
  if (!confettiAnimationId) {
    updateConfetti();
  }
}

function startCelebration() {
  if (celebrationInterval) clearInterval(celebrationInterval);
  celebrationInterval = setInterval(() => {
    spawnConfetti(5, false);
  }, 300);
}

function stopCelebration() {
  if (celebrationInterval) {
    clearInterval(celebrationInterval);
    celebrationInterval = null;
  }
}

////////////////////////////////////////////////// 
// FLOATING PARTICLES
//////////////////////////////////////////////////

function createFloatingParticles() {
  // Remove old particles first
  document.querySelectorAll('.particle').forEach(p => p.remove());
  
  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    const size = Math.random() * 4 + 2;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.left = Math.random() * 100 + 'vw';
    particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
    particle.style.animationDelay = (Math.random() * 10) + 's';
    body.appendChild(particle);
  }
}

////////////////////////////////////////////////// 
// START 
////////////////////////////////////////////////// 

function startGame() { 
  replayBtn.style.display = 'none';
  crashScreen.style.display = 'none';
  crashScreen.innerHTML = "SYSTEM ERROR...";
  crashScreen.classList.remove('glitch');
  body.className = "stage1";
  choices.innerHTML = "";
  stopCelebration();
  
  typeText("Ah... kamu datang juga.", 40, () => { 
    showChoices([ 
      { text: "Mulai", action: stage1 } 
    ]); 
  }); 
} 

////////////////////////////////////////////////// 
// STAGE 1 
////////////////////////////////////////////////// 

function stage1() { 
  body.className = "stage2"; 
  typeText("Jawab ini dulu. Apakah kamu seorang mahasiswa? A. Bukan B. Ya! C. Aku nganggur!", 40, () => { 
    showChoices([ 
      { text: "A", action: wrong1 }, 
      { text: "B", action: correct1 }, 
      { text: "C", action: wrong1 } 
    ]); 
  }); 
} 

function correct1() { 
  playUnlock(); 
  spawnConfetti(20, true, window.innerWidth / 2, window.innerHeight / 2);
  typeText("Benar.", 40, stage2); 
} 

function wrong1() { 
  playWrong();
  shakeScreen();
  typeText("Salah.", 40, stage1); 
} 

////////////////////////////////////////////////// 
// STAGE 2 - WARNA FAVORIT
////////////////////////////////////////////////// 

function stage2() { 
  body.className = "stage3"; 
  typeText("Pertanyaan kedua. Apa Zaky punya Crush?", 40, () => { 
    showChoices([ 
      { text: "Nggak ada", action: wrong2 }, 
      { text: "Punya", action: correct2 }, 
      { text: "Rahasia", action: wrong2 } 
    ]); 
  }); 
} 

function correct2() { 
  playUnlock(); 
  spawnConfetti(20, true, window.innerWidth / 2, window.innerHeight / 2);
  typeText("Tepat sekali!", 40, stage3); 
} 

function wrong2() { 
  playWrong();
  shakeScreen();
  typeText("Bukan itu. Coba lagi!", 40, stage2); 
} 

////////////////////////////////////////////////// 
// STAGE 3 - HOBBY
////////////////////////////////////////////////// 

function stage3() { 
  body.className = "stage4"; 
  typeText("Pertanyaan ketiga. Apa hobby yang paling disukai Zaki?", 40, () => { 
    showChoices([ 
      { text: "Gaming", action: correct3 }, 
      { text: "Ga punya hobby", action: wrong3 }, 
      { text: "Sports", action: wrong3 } 
    ]); 
  }); 
} 

function correct3() { 
  playUnlock(); 
  spawnConfetti(20, true, window.innerWidth / 2, window.innerHeight / 2);
  typeText("Kamu tahu banget!", 40, stage4); 
} 

function wrong3() { 
  playWrong();
  shakeScreen();
  typeText("Hmm... bukan itu.", 40, stage3); 
} 

////////////////////////////////////////////////// 
// STAGE 4 - KARAKTER HSR FAVORIT
////////////////////////////////////////////////// 

function stage4() { 
  body.className = "stage5"; 
  typeText("Pertanyaan keempat. Siapa karakter Honkai: Star Rail favoritnya?", 40, () => { 
    showChoices([ 
      { text: "Phainon", action: correct4 }, 
      { text: "Trailblazer", action: wrong4 }, 
      { text: "Dan Heng", action: wrong4 } 
    ]); 
  }); 
} 

function correct4() { 
  playUnlock(); 
  spawnConfetti(20, true, window.innerWidth / 2, window.innerHeight / 2);
  typeText("Tentu saja Phainon!", 40, stage5); 
} 

function wrong4() { 
  playWrong();
  shakeScreen();
  typeText("Salah! Coba lagi.", 40, stage4); 
} 

////////////////////////////////////////////////// 
// STAGE 5 - RASA MAKANAN (old stage2)
////////////////////////////////////////////////// 

function stage5() { 
  body.className = "stage6"; 
  typeText("Oke, sekarang yang lebih serius. Apa rasa makanan yang kakakmu suka?", 40, () => { 
    showChoices([ 
      { text: "Manis", action: () => memory(false) }, 
      { text: "Pedas", action: () => memory(true) }, 
      { text: "Pahit", action: () => memory(false) } 
    ]); 
  }); 
} 

function memory(correct) { 
  if (correct) { 
    playUnlock(); 
    spawnConfetti(20, true, window.innerWidth / 2, window.innerHeight / 2);
    typeText("Kamu ingat.", 40, stage6); 
  } else { 
    playWrong();
    shakeScreen();
    typeText("Bukan itu.", 40, stage5); 
  } 
} 

////////////////////////////////////////////////// 
// STAGE 6 - ANGKA SPESIAL (old stage3)
////////////////////////////////////////////////// 

function stage6() { 
  body.className = "stage7"; 
  let answer = prompt("Masukkan angka spesial:");  
  if (answer == 25) { 
    playUnlock(); 
    spawnConfetti(20, true, window.innerWidth / 2, window.innerHeight / 2);
    typeText("Menarik...", 40, stage7); 
  } else { 
    playWrong();
    shakeScreen();
    typeText("Tidak tepat.", 40, stage6); 
  } 
} 

////////////////////////////////////////////////// 
// STAGE 7 - CLICK GAME (old stage4)
////////////////////////////////////////////////// 

function stage7() { 
  body.className = "stage7"; 
  let score = 0; 
  choices.innerHTML = "<button id='clickBtn'>CLICK!</button>"; 
  let btn = document.getElementById("clickBtn"); 
 
  btn.onclick = () => { 
    playClick(); 
    score++; 
    btn.innerText = "Score: " + score; 
    spawnConfetti(3, true);
 
    if (score >= 25) { 
      fakeCrash(); 
    } 
  }; 
 
  typeText("Klik 25 kali. Semangat!", 40); 
} 

////////////////////////////////////////////////// 
// FAKE CRASH 
////////////////////////////////////////////////// 

function fakeCrash() { 
  choices.innerHTML = ""; 
  crashScreen.style.display = "flex"; 
  crashScreen.classList.add('glitch');
 
  setTimeout(() => { 
    crashScreen.innerHTML = "DATA CORRUPTED..."; 
  }, 1500); 
 
  setTimeout(() => { 
    crashScreen.classList.remove('glitch');
    finalStage(); 
  }, 3000); 
}  

////////////////////////////////////////////////// 
// FINAL 
////////////////////////////////////////////////// 

function finalStage() { 
  crashScreen.style.display = "none"; 
  body.className = "final"; 
  
  startCelebration();
 
  typeText("Zaki...", 60, () => { 
    setTimeout(() => { 
      typeText("Semua ini cuma cara aneh untuk bilang sesuatu.", 40, () => { 
        setTimeout(() => { 
          dialog.innerHTML = ">.< Selamat Ulang Tahun, Zaki >.< Semoga panjang umur, sehat selalu, diperlancar rezekinya dan semua yang diharapkan tercapai! I wish you all the best."; 
          replayBtn.style.display = 'inline-block';
        }, 2000); 
      }); 
    }, 1000); 
  }); 
} 

replayBtn.onclick = () => {
  stopCelebration();
  if (confettiAnimationId) {
    cancelAnimationFrame(confettiAnimationId);
    confettiAnimationId = null;
  }
  confettiParticles = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  createFloatingParticles();
  startGame();
};

// INIT
createFloatingParticles();
startGame();

