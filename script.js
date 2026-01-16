const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let model = "cube";
let color = "#00ffff";
let running = false;
let levelIndex = 0;
let distance = 0;

document.getElementById("modelSelect").onchange = e => model = e.target.value;
document.getElementById("colorPicker").oninput = e => color = e.target.value;

const gravity = 0.6;
const jumpPower = -12;

const player = {
  x: 100,
  y: 200,
  size: 30,
  velY: 0,
  grounded: false,
  rot: 0,
  scale: 1
};

/* 🔥 LEVEL DATA (THIS MAKES IT A REAL GAME) */
const levels = [
  {
    name: "LEVEL 1",
    speed: 4,
    length: 2000,
    obstacles: [
      { x: 400, type: "spike" },
      { x: 650, type: "block" },
      { x: 900, type: "spike" },
      { x: 1200, type: "platform", y: 160 }
    ]
  },
  {
    name: "LEVEL 2",
    speed: 6,
    length: 2600,
    obstacles: [
      { x: 350, type: "spike" },
      { x: 500, type: "block" },
      { x: 700, type: "spike" },
      { x: 950, type: "platform", y: 140 },
      { x: 1200, type: "block" },
      { x: 1500, type: "spike" }
    ]
  },
  {
    name: "LEVEL 3",
    speed: 8,
    length: 3200,
    obstacles: [
      { x: 300, type: "spike" },
      { x: 450, type: "block" },
      { x: 600, type: "spike" },
      { x: 800, type: "platform", y: 130 },
      { x: 1000, type: "block" },
      { x: 1200, type: "spike" },
      { x: 1500, type: "spike" }
    ]
  }
];

let obstacles = [];

/* 🔄 GAME CONTROL */

function startGame() {
  distance = 0;
  running = true;
  resetPlayer();
  loadLevel();
  showMessage(levels[levelIndex].name);
}

function resetPlayer() {
  player.y = 200;
  player.velY = 0;
  player.rot = 0;
}

function loadLevel() {
  obstacles = levels[levelIndex].obstacles.map(o => ({ ...o }));
  document.getElementById("levelText").innerText =
    levels[levelIndex].name;
}

function forceUpdate() {
  location.href = location.pathname + "?update=" + Date.now();
}

function showMessage(text) {
  const m = document.getElementById("message");
  m.innerText = text;
  setTimeout(() => m.innerText = "", 1500);
}

/* 🎮 INPUT */

function jump() {
  if (model === "ship") {
    player.velY = jumpPower / 2;
  } else if (model === "wave") {
    player.velY = -player.velY || -6;
  } else if (player.grounded) {
    player.velY = jumpPower;
    player.grounded = false;
    player.scale = 0.8;
  }
}

document.addEventListener("keydown", e => e.code === "Space" && jump());
canvas.addEventListener("mousedown", jump);

/* ⚙️ UPDATE */

function update() {
  if (!running) return;

  const level = levels[levelIndex];
  distance += level.speed;

  document.getElementById("progress").style.width =
    (distance / level.length * 100) + "%";

  // gravity
  if (model !== "wave") player.velY += gravity;
  player.y += player.velY;
  player.rot += 0.15;

  // ground
  if (player.y + player.size >= canvas.height - 20) {
    player.y = canvas.height - 20 - player.size;
    player.velY = 0;
    player.grounded = true;
    player.scale = 1.2;
  }

  player.scale += (1 - player.scale) * 0.2;

  // obstacles move & collide
  obstacles.forEach(o => {
    o.x -= level.speed;

    if (checkCollision(o)) crash();
  });

  // LEVEL COMPLETE
  if (distance >= level.length) {
    running = false;
    levelIndex++;
    if (levelIndex >= levels.length) {
      showMessage("YOU BEAT THE GAME 🏆");
      levelIndex = 0;
    } else {
      showMessage("LEVEL COMPLETE ✔");
    }
  }
}

/* 💥 COLLISION */

function checkCollision(o) {
  if (o.type === "platform") return false;

  const px = player.x;
  const py = player.y;
  const ps = player.size;

  const ox = o.x;
  const oy = canvas.height - 50;
  const os = 30;

  return (
    px < ox + os &&
    px + ps > ox &&
    py + ps > oy
  );
}

function crash() {
  running = false;
  showMessage("CRASH 💥");
}

/* 🎨 DRAW */

function drawPlayer() {
  ctx.save();
  ctx.translate(player.x + 15, player.y + 15);
  ctx.rotate(player.rot);
  ctx.scale(1, player.scale);
  ctx.fillStyle = color;

  if (model === "cube") ctx.fillRect(-15, -15, 30, 30);
  if (model === "ball") ctx.beginPath(), ctx.arc(0, 0, 15, 0, Math.PI * 2), ctx.fill();
  if (model === "ship") ctx.fillRect(-15, -8, 30, 16);
  if (model === "wave") ctx.fillRect(-10, -10, 20, 20);

  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ground
  ctx.fillStyle = "#1f2937";
  ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

  drawPlayer();

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

/* 🔁 LOOP */

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
