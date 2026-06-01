const canvas = document.querySelector("#floatingBackground");
const ctx = canvas.getContext("2d");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let width = 0;
let height = 0;
let particles = [];
let sprites = [];
let animationFrame = null;

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function resizeCanvas() {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * pixelRatio);
  canvas.height = Math.floor(height * pixelRatio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
}

function createParticles() {
  const count = Math.min(54, Math.max(28, Math.floor(width / 28)));

  particles = Array.from({ length: count }, () => ({
    x: randomBetween(0, width),
    y: randomBetween(0, height),
    radius: randomBetween(1.2, 3.8),
    speedX: randomBetween(-0.24, 0.24),
    speedY: randomBetween(-0.18, 0.26),
    alpha: randomBetween(0.2, 0.72)
  }));
}

function createSprites() {
  const count = Math.min(20, Math.max(9, Math.floor(width / 76)));
  const palettes = [
    { main: "#ff72d8", shade: "#bd3fb2", light: "#ffd1f2" },
    { main: "#72f4ff", shade: "#338be8", light: "#f4fbff" },
    { main: "#b58cff", shade: "#6b54d8", light: "#f6efff" }
  ];

  sprites = Array.from({ length: count }, (_, index) => ({
    x: randomBetween(-80, width + 80),
    y: randomBetween(40, height - 40),
    size: randomBetween(4, 7),
    speedX: randomBetween(0.24, 0.72),
    speedY: randomBetween(-0.16, 0.16),
    rotation: randomBetween(-0.28, 0.28),
    spin: randomBetween(-0.002, 0.002),
    alpha: randomBetween(0.28, 0.58),
    palette: palettes[index % palettes.length]
  }));
}

function drawParticle(particle) {
  const gradient = ctx.createRadialGradient(
    particle.x,
    particle.y,
    0,
    particle.x,
    particle.y,
    particle.radius * 7
  );

  gradient.addColorStop(0, `rgba(255, 114, 216, ${particle.alpha})`);
  gradient.addColorStop(0.5, `rgba(114, 244, 255, ${particle.alpha * 0.34})`);
  gradient.addColorStop(1, "rgba(114, 244, 255, 0)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(particle.x, particle.y, particle.radius * 7, 0, Math.PI * 2);
  ctx.fill();
}

function drawPixelSprite(sprite) {
  const pixelMap = [
    "0011100",
    "011L110",
    "11LL111",
    "11LL111",
    "0111110",
    "0011100",
    "000S000",
    "00SSS00"
  ];

  ctx.save();
  ctx.translate(sprite.x, sprite.y);
  ctx.rotate(sprite.rotation);
  ctx.globalAlpha = sprite.alpha;
  ctx.shadowColor = sprite.palette.main;
  ctx.shadowBlur = sprite.size * 3;

  const rows = pixelMap.length;
  const columns = pixelMap[0].length;
  const offsetX = (-columns * sprite.size) / 2;
  const offsetY = (-rows * sprite.size) / 2;

  pixelMap.forEach((row, rowIndex) => {
    [...row].forEach((cell, columnIndex) => {
      if (cell === "0") return;

      if (cell === "L") {
        ctx.fillStyle = sprite.palette.light;
      } else if (cell === "S") {
        ctx.fillStyle = sprite.palette.shade;
      } else {
        ctx.fillStyle = sprite.palette.main;
      }

      ctx.fillRect(
        offsetX + columnIndex * sprite.size,
        offsetY + rowIndex * sprite.size,
        sprite.size,
        sprite.size
      );
    });
  });

  ctx.restore();
}

function drawConnections() {
  for (let i = 0; i < particles.length; i += 1) {
    for (let j = i + 1; j < particles.length; j += 1) {
      const first = particles[i];
      const second = particles[j];
      const distance = Math.hypot(first.x - second.x, first.y - second.y);

      if (distance < 140) {
        const opacity = (1 - distance / 140) * 0.16;
        ctx.strokeStyle = `rgba(255, 177, 236, ${opacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(first.x, first.y);
        ctx.lineTo(second.x, second.y);
        ctx.stroke();
      }
    }
  }
}

function moveSprite(sprite) {
  sprite.x += sprite.speedX;
  sprite.y += sprite.speedY;
  sprite.rotation += sprite.spin;

  if (sprite.x > width + 90) sprite.x = -90;
  if (sprite.y < -70) sprite.y = height + 70;
  if (sprite.y > height + 70) sprite.y = -70;
}

function moveParticle(particle) {
  particle.x += particle.speedX;
  particle.y += particle.speedY;

  if (particle.x < -40) particle.x = width + 40;
  if (particle.x > width + 40) particle.x = -40;
  if (particle.y < -40) particle.y = height + 40;
  if (particle.y > height + 40) particle.y = -40;
}

function animate() {
  ctx.clearRect(0, 0, width, height);
  drawConnections();

  particles.forEach((particle) => {
    moveParticle(particle);
    drawParticle(particle);
  });

  sprites.forEach((sprite) => {
    moveSprite(sprite);
    drawPixelSprite(sprite);
  });

  animationFrame = window.requestAnimationFrame(animate);
}

function startBackground() {
  resizeCanvas();
  createParticles();
  createSprites();
  ctx.clearRect(0, 0, width, height);
  particles.forEach(drawParticle);
  sprites.forEach(drawPixelSprite);

  if (!prefersReducedMotion.matches) {
    animate();
  }
}

window.addEventListener("resize", () => {
  window.cancelAnimationFrame(animationFrame);
  startBackground();
});

prefersReducedMotion.addEventListener("change", () => {
  window.cancelAnimationFrame(animationFrame);
  startBackground();
});

startBackground();
