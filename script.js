const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const gravity = 0.6;
const jumpPower = -12;
let running = false;
let levelIndex = 0;
let distance = 0;

let playerColor = "#00ffff";
let model = "cube";

document.getElementById("colorPicker").oninput = e => playerColor = e.target.value;
document.getElementById("modelSelect").onchange = e => model = e.target.value;

const player = {
  x: 100,
  y: 200,
  size: 30,
  velY: 0,
  grounded: false,
  rotation: 0,
  scaleY: 1
};

const level = {
  speed: 5,
  length: 2200,
  obstacles: [{ x: 500 }, { x: 800 }, { x: 1200 }]
};

function startGame() {
  distance = 0;
  player.y = 200;
  player.velY = 0;
  running = true;
  showMessage("READY");
}

function showMessage(text) {
  const m = document.getElementById("message");
  m.innerText = text;
  setTimeout(() => m.innerText = "", 1200);
}

function jump() {
  if (player.grounded) {
    player.velY = jumpPower;
    player.grounded = false;
    player.scaleY = 0.8; // squash
  }
}

document.addEventListener("keydown", e => e.code === "Space" && jump());
canvas.addEventListener("mousedown", jump);

function update() {
  if (!running) return;

  distance += level.speed;
  document.getElementById("progress").style.width =
    (distance / level.length * 100) + "%";

  player.velY += gravity;
  player.y += player.velY;

  // rotation while jumping
  if (!player.grounded) player.rotation += 0.15;

  // landing
  if (player.y + player.size >= canvas.height - 20) {
    player.y = canvas.height - 20 - player.size;
    player.velY = 0;
    player.grounded = true;
    player.scaleY = 1.2; // stretch
  }

  player.scaleY += (1 - player.scaleY) * 0.2;
}

function drawPlayer() {
  ctx.save();
  ctx.translate(player.x + player.size / 2, player.y + player.size / 2);
  ctx.rotate(player.rotation);
  ctx.scale(1, player.scaleY);
  ctx.fillStyle = playerColor;

  if (model === "cube") {
    ctx.fillRect(-15, -15, 30, 30);
  }

  if (model === "ball") {
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ground
  ctx.fillStyle = "#1f2937";
  ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

  drawPlayer();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
