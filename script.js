const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let model = "cube";
let color = "#00ffff";
let running = false;
let distance = 0;
let shake = 0;

document.getElementById("modelSelect").onchange = e => model = e.target.value;
document.getElementById("colorPicker").oninput = e => color = e.target.value;

const gravity = 0.6;
const speed = 5;
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

const particles = [];

function startGame() {
  running = true;
  distance = 0;
  player.y = 200;
  player.velY = 0;
  showMessage("READY");
}

function forceUpdate() {
  location.href = location.pathname + "?update=" + Date.now();
}

function showMessage(text) {
  const m = document.getElementById("message");
  m.innerText = text;
  setTimeout(() => m.innerText = "", 1200);
}

function jump() {
  if (model === "ship") {
    player.velY = jumpPower / 2;
    spawnParticles();
  } else if (model === "wave") {
    player.velY = -player.velY || -6;
  } else if (player.grounded) {
    player.velY = jumpPower;
    player.grounded = false;
    player.scale = 0.8;
    spawnParticles();
  }
}

document.addEventListener("keydown", e => e.code === "Space" && jump());
canvas.addEventListener("mousedown", jump);

function spawnParticles() {
  for (let i = 0; i < 8; i++) {
    particles.push({
      x: player.x,
      y: player.y,
      vx: Math.random() * -3,
      vy: Math.random() * -3,
      life: 20
    });
  }
}

function update() {
  if (!running) return;

  distance += speed;
  document.getElementById("progress").style.width = (distance / 2000 * 100) + "%";

  if (model !== "wave") {
    player.velY += gravity;
  }

  player.y += player.velY;
  player.rot += 0.15;

  if (player.y + player.size >= canvas.height - 20) {
    player.y = canvas.height - 20 - player.size;
    player.velY = 0;
    player.grounded = true;
    player.scale = 1.2;
  }

  player.scale += (1 - player.scale) * 0.2;

  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
  });
}

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
  ctx.save();
  if (shake) {
    ctx.translate(Math.random() * shake, Math.random() * shake);
    shake *= 0.9;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#1f2937";
  ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

  drawPlayer();

  ctx.fillStyle = color;
  particles.forEach(p => ctx.fillRect(p.x, p.y, 3, 3));

  ctx.restore();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
