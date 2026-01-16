const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let playerColor = "#00ffff";
document.getElementById("colorPicker").oninput = e => playerColor = e.target.value;

const gravity = 0.6;
const jumpPower = -11;
let levelIndex = 0;
let running = false;
let distance = 0;

const player = {
  x: 80,
  y: 200,
  size: 30,
  velY: 0,
  grounded: false
};

const levels = [
  {
    speed: 4,
    length: 2000,
    obstacles: [
      { x: 400, type: "spike" },
      { x: 600, type: "block" },
      { x: 800, type: "spike" },
      { x: 1100, type: "platform", y: 160 }
    ]
  },
  {
    speed: 6,
    length: 2600,
    obstacles: [
      { x: 350, type: "spike" },
      { x: 550, type: "block" },
      { x: 700, type: "platform", y: 140 },
      { x: 900, type: "spike" },
      { x: 1200, type: "block" }
    ]
  }
];

let obstacles = [];

function loadLevel() {
  distance = 0;
  obstacles = JSON.parse(JSON.stringify(levels[levelIndex].obstacles));
  document.getElementById("levelText").innerText = "LEVEL " + (levelIndex + 1);
  showMessage("GET READY ⚡");
}

function startGame() {
  player.y = 200;
  player.velY = 0;
  running = true;
  loadLevel();
}

function restart() {
  running = false;
  startGame();
}

function showMessage(text) {
  const msg = document.getElementById("message");
  msg.innerText = text;
  setTimeout(() => msg.innerText = "", 1500);
}

function jump() {
  if (player.grounded) {
    player.velY = jumpPower;
    player.grounded = false;
  }
}

document.addEventListener("keydown", e => e.code === "Space" && jump());
canvas.addEventListener("mousedown", jump);

function update() {
  if (!running) return;

  distance += levels[levelIndex].speed;
  document.getElementById("progress").style.width =
    (distance / levels[levelIndex].length * 100) + "%";

  // physics
  player.velY += gravity;
  player.y += player.velY;

  if (player.y + player.size >= canvas.height - 20) {
    player.y = canvas.height - 20 - player.size;
    player.velY = 0;
    player.grounded = true;
  }

  obstacles.forEach(o => {
    o.x -= levels[levelIndex].speed;

    if (o.type !== "platform") {
      if (
        player.x < o.x + 30 &&
        player.x + player.size > o.x &&
        player.y + player.size > canvas.height - 40
      ) {
        crash();
      }
    }
  });

  if (distance >= levels[levelIndex].length) {
    running = false;
    levelIndex = (levelIndex + 1) % levels.length;
    showMessage("LEVEL COMPLETE 🏆");
  }
}

function crash() {
  running = false;
  showMessage("💥 CRASHED!");
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ground
  ctx.fillStyle = "#0ff";
  ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

  // player glow
  ctx.shadowBlur = 20;
  ctx.shadowColor = playerColor;
  ctx.fillStyle = playerColor;
  ctx.fillRect(player.x, player.y, player.size, player.size);
  ctx.shadowBlur = 0;

  obstacles.forEach(o => {
    if (o.type === "spike") {
      ctx.fillStyle = "red";
      ctx.beginPath();
      ctx.moveTo(o.x, canvas.height - 20);
      ctx.lineTo(o.x + 15, canvas.height - 60);
      ctx.lineTo(o.x + 30, canvas.height - 20);
      ctx.fill();
    }

    if (o.type === "block") {
      ctx.fillStyle = "purple";
      ctx.fillRect(o.x, canvas.height - 50, 30, 30);
    }

    if (o.type === "platform") {
      ctx.fillStyle = "lime";
      ctx.fillRect(o.x, o.y, 60, 10);
    }
  });
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();

