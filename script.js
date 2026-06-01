const canvas = document.querySelector("#floatingBackground");
const ctx = canvas.getContext("2d");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let width = 0;
let height = 0;
let particles = [];
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
  const count = Math.min(68, Math.max(34, Math.floor(width / 22)));

  particles = Array.from({ length: count }, () => ({
    x: randomBetween(0, width),
    y: randomBetween(0, height),
    radius: randomBetween(1.2, 3.8),
    speedX: randomBetween(-0.24, 0.24),
    speedY: randomBetween(-0.18, 0.26),
    alpha: randomBetween(0.2, 0.72)
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

  gradient.addColorStop(0, `rgba(88, 240, 255, ${particle.alpha})`);
  gradient.addColorStop(0.44, `rgba(74, 179, 255, ${particle.alpha * 0.32})`);
  gradient.addColorStop(1, "rgba(74, 179, 255, 0)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(particle.x, particle.y, particle.radius * 7, 0, Math.PI * 2);
  ctx.fill();
}

function drawConnections() {
  for (let i = 0; i < particles.length; i += 1) {
    for (let j = i + 1; j < particles.length; j += 1) {
      const first = particles[i];
      const second = particles[j];
      const distance = Math.hypot(first.x - second.x, first.y - second.y);

      if (distance < 140) {
        const opacity = (1 - distance / 140) * 0.16;
        ctx.strokeStyle = `rgba(130, 219, 255, ${opacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(first.x, first.y);
        ctx.lineTo(second.x, second.y);
        ctx.stroke();
      }
    }
  }
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

  animationFrame = window.requestAnimationFrame(animate);
}

function startBackground() {
  resizeCanvas();
  createParticles();
  ctx.clearRect(0, 0, width, height);
  particles.forEach(drawParticle);

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
