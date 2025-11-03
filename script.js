// service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}

// wake lock
let wakeLock = null;

async function requestWakeLock() {
  try {
    wakeLock = await navigator.wakeLock.request('screen');
    console.log('✅ Screen Wake Lock active');

    wakeLock.addEventListener('release', () => {
      console.log('❌ Wake Lock was released');
    });
  } catch (err) {
    console.error(`${err.name}, ${err.message}`);
  }
}

// Re-acquire lock if it’s lost when the page becomes visible again
document.addEventListener('visibilitychange', () => {
  if (wakeLock !== null && document.visibilityState === 'visible') {
    requestWakeLock();
  }
});

// Call when game starts or permission is granted
requestWakeLock();


// game code
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let ball = { x: 0, y: 0, radius: 20, vx: 0, vy: 0 };
let beta = 0, gamma = 0; // tilt angles

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  ball.x = width / 2;
  ball.y = height / 2;
}
window.addEventListener('resize', resize);
resize();

// Handle device tilt
window.addEventListener('deviceorientation', (event) => {
  beta = event.beta;   // front/back tilt (-180 to 180)
  gamma = event.gamma; // left/right tilt (-90 to 90)
});

// Optional: ask permission for iOS
function requestPermission() {
  if (typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission()
      .then(response => {
        if (response === 'granted') {
          window.addEventListener('deviceorientation', () => {});
        }
      })
      .catch(console.error);
  }
}

document.body.addEventListener('click', requestPermission, { once: true });

function update() {
  // simple physics
  ball.vx += gamma * 0.05;
  ball.vy += beta * 0.05;

  // friction
  ball.vx *= 0.98;
  ball.vy *= 0.98;

  ball.x += ball.vx * 0.1;
  ball.y += ball.vy * 0.1;

  // boundary collision
  if (ball.x - ball.radius < 0 || ball.x + ball.radius > width) {
    ball.vx *= -0.7;
    ball.x = Math.max(ball.radius, Math.min(width - ball.radius, ball.x));
  }
  if (ball.y - ball.radius < 0 || ball.y + ball.radius > height) {
    ball.vy *= -0.7;
    ball.y = Math.max(ball.radius, Math.min(height - ball.radius, ball.y));
  }
}

function draw() {
  ctx.clearRect(0, 0, width, height);
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = 'red';
  ctx.shadowColor = '#00ff88';
  ctx.shadowBlur = 20;
  ctx.fill();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();

