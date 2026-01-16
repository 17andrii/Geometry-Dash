const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let playerColor = "#00ffff";

document.getElementById("colorPicker").addEventListener("input", e => {
  playerColor = e.target.value;
});

const gravity = 0.6;
const jumpPower = -10;
let gameRunning = false;
let levelIndex = 0;

const player = {
  x: 80,
  y: 220,
  size: 30,
  velY: 0,
  grounded: false
};

const levels = [
  {
    speed: 4,
    obstacles: [300, 450, 600, 800]
  },
  {
    speed: 6,
    obstacles: [250, 350, 500, 650, 820]
  },
  {
    speed: 8,
    obstacles: [200, 300, 400, 520, 640, 760]
  }
];

let obstacles = [];

function loadLevel() {
  obstacles = levels[levelIndex].obstacles.map(x => ({
    x: x,
    width: 30,
    height: 40
  }));
}

function startGame() {
  player.y = 220;
  player.velY = 0;
  gameRunning = true;
  loadLevel();
}

function nextLevel() {
  levelIndex = (levelIndex + 1) % levels.length;
  startGame();
}

function jump() {
  if (player.grounded) {
    player.velY = jumpPower;
    player.grounded = false;
  }
}

document.addEventListener("keydown", e => {
  if (e.code === "Space") jump();
});

canvas.addEventListener("mousedown", jump);

function update() {
  if (!gameRunning) return;

  player.velY += gravity;
  player.y += player.velY;

  if (player.y + player.size >= canvas.height - 20) {
    player.y = canvas.height - 20 - player.size;
    player.velY = 0;
    player.grounded = true;
  }

  obstacles.forEach(o => {
    o.x -= levels[levelIndex].speed;

    // collision
    if (
      player.x < o.x + o.width &&
      player.x + player.size > o.x &&
      player.y < canvas.height - o.height &&
      player.y + player.size > canvas.height - o.height
    ) {
      gameRunning = false;
      alert("💥 You crashed!");
    }
  });

  // win
  if (obstacles[obstacles.length - 1].x < 0) {
    gameRunning = false;
    alert("🏆 Level Complete!");
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ground
  ctx.fillStyle = "#0ff";
  ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

  // player
  ctx.shadowBlur = 20;
  ctx.shadowColor = playerColor;
  ctx.fillStyle = playerColor;
  ctx.fillRect(player.x, player.y, player.size, player.size);
  ctx.shadowBlur = 0;

  // obstacles (spikes)
  ctx.fillStyle = "#f00";
  obstacles.forEach(o => {
    ctx.beginPath();
    ctx.moveTo(o.x, canvas.height - 20);
    ctx.lineTo(o.x + o.width / 2, canvas.height - 20 - o.height);
    ctx.lineTo(o.x + o.width, canvas.height - 20);
    ctx.closePath();
    ctx.fill();
  });
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
