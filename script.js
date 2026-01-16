const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

/* 🌌 STAR BACKGROUND */
const stars = Array.from({ length: 120 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  r: Math.random() * 1.5 + 0.5,
  s: Math.random() * 0.6 + 0.2
}));

function drawStars() {
  ctx.fillStyle = "#020617";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";

  stars.forEach(star => {
    star.x -= star.s;
    if (star.x < 0) star.x = canvas.width;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fill();
  });
}

/* 🎮 GAME STATE */
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

/* 🔥 LEVELS */
const levels = [
  { name: "LEVEL 1", speed: 4, length: 2000, obstacles: genObs(6) },
  { name: "LEVEL 2", speed: 5, length: 2400, obstacles: genObs(8) },
  { name: "LEVEL 3", speed: 6, length: 2800, obstacles: genObs(10) },
];

for (let i = 4; i <= 12; i++) {
  levels.push({
    name: `LEVEL ${i}`,
    speed: 3 + i,
    length: 1800 + i * 400,
    obstacles: genObs(i * 2)
  });
}

function genObs(count) {
  return Array.from({ length: count }, (_, i) => ({
    x: 400 + i * 300,
    type: i % 3 === 0 ? "spike" : "block"
  }));
}

/* 📂 PROGRESS */
const levelSelect = document.getElementById("levelSelect");
let progressData = JSON.parse(localStorage.getItem("gdProgress")) || {};

function updateLevelMenu() {
  levelSelect.innerHTML = "";
  levels.forEach((lvl, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = `${lvl.name} ${progressData[i] ? "✔" : ""}`;
    levelSelect.appendChild(opt);
  });
}
updateLevelMenu();

levelSelect.onchange = e => levelIndex = Number(e.target.value);

/* ▶ GAME CONTROL */
let obstacles = [];

function startGame() {
  distance = 0;
  running = true;
  resetPlayer();
  loadLevel();
}

function resetPlayer() {
  player.y = 200;
  player.velY = 0;
  player.rot = 0;
}

function loadLevel() {
  obstacles = levels[levelIndex].obstacles.map(o => ({ ...o }));
  document.getElementById("levelText").innerText = levels[levelIndex].name;
}

function showMessage(text) {
  const m = document.getElementById("message");
  m.innerText = text;
  setTimeout(() => m.innerText = "", 1500);
}

/* 🕹 INPUT */
function jump() {
  if (model === "ship") player.velY = jumpPower / 2;
  else if (model === "wave") player.velY = -player.velY || -6;
  else if (player.grounded) {
    player.velY = jumpPower;
    player.grounded = false;
    player.scale = 0.8;
  }
}

document.addEventListener("keydown", e => e.code === "Space" && jump());
canvas.addEventListener("mousedown", jump);

/* 🔄 UPDATE */
function update() {
  if (!running) return;
  const level = levels[levelIndex];
  distance += level.speed;

  document.getElementById("progress").style.width =
    (distance / level.length * 100) + "%";

  if (model !== "wave") player.velY += gravity;
  player.y += player.velY;
  player.rot += 0.15;

  if (player.y + player.size >= canvas.height - 20) {
    player.y = canvas.height - 20 - player.size;
    player.velY = 0;
    player.grounded = true;
    player.scale = 1.1;
  }

  obstacles.forEach(o => {
    o.x -= level.speed;
    if (checkCollision(o)) crash();
  });

  if (distance >= level.length) {
    running = false;
    progressData[levelIndex] = true;
    localStorage.setItem("gdProgress", JSON.stringify(progressData));
    updateLevelMenu();
    showMessage("LEVEL COMPLETE ✔");
  }
}

/* 💥 COLLISION */
function checkCollision(o) {
  if (o.type === "platform") return false;
  return (
    player.x < o.x + 30 &&
    player.x + player.size > o.x &&
    player.y + player.size > canvas.height - 50
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

  const grad = ctx.createLinearGradient(-15, -15, 15, 15);
  grad.addColorStop(0, color);
  grad.addColorStop(1, "#fff");
  ctx.fillStyle = grad;

  if (model === "cube") ctx.fillRect(-15, -15, 30, 30);
  if (model === "ball") ctx.beginPath(), ctx.arc(0,0,15,0,Math.PI*2), ctx.fill();
  if (model === "ship") ctx.fillRect(-15,-6,30,12);
  if (model === "wave") ctx.fillRect(-10,-10,20,20);

  ctx.restore();
}

function draw() {
  drawStars();

  ctx.fillStyle = "#1f2937";
  ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

  drawPlayer();

  obstacles.forEach(o => {
    if (o.type === "spike") {
      ctx.fillStyle = "#ff0033";
      ctx.beginPath();
      ctx.moveTo(o.x, canvas.height - 20);
      ctx.lineTo(o.x + 15, canvas.height - 60);
      ctx.lineTo(o.x + 30, canvas.height - 20);
      ctx.fill();
    }
    if (o.type === "block") {
      ctx.fillStyle = "#7c3aed";
      ctx.fillRect(o.x, canvas.height - 50, 30, 30);
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
