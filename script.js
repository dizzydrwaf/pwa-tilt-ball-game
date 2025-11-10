// service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}

let lastTime = performance.now();

// wake lock
let wakeLock = null;

async function requestWakeLock() {
  try {
    wakeLock = await navigator.wakeLock.request('screen');
    console.log('Screen Wake Lock active');

    wakeLock.addEventListener('release', () => {
      console.log('Wake Lock was released');
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
let ball = { x: 0, y: 0, radius: 20, vx: 0, vy: 0, color: 'red', shadow_color: '#ff1144', visible: true};
let beta = 0, gamma = 0; // tilt angles

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  ball.x = width / 2;
  ball.y = height / 2;
}
window.addEventListener('resize', resize);
resize();

// tilt reader
window.addEventListener('deviceorientation', (event) => {
  beta = event.beta;   // front/back tilt (-180 to 180)
  gamma = event.gamma; // left/right tilt (-90 to 90)
});

// only needed for iphone users
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

// key reader

const keys = {};

window.addEventListener('keydown', (event) => {
  keys[event.key] = true;
  // console.log(keys)
});

window.addEventListener('keyup', (event) => {
  keys[event.key] = false;
});


// coin

let coins = [];

let a_coin = 0;

let max_coins = 10;

// im bind so here is spawing coin here so stop looking for it ut looking at it

function spawncoin() {
  if (coins.length >= max_coins) {
    return
  }

  const coin = {
    cx: Math.random() * (canvas.width - 20),
    cy: Math.random() * (canvas.height - 20),
    c_size: 15,
    c_life_time: 0,
    color: 'gold',
    shadow_color: 'gold',
    c_dx: 0,
    c_dy: 0,
    //c_speed: Math.random() * (0.02 - 0.01) + 0.01,
    c_speed: Math.random() * 50 + 100,
    vel: { x: 0, y: 0 },
  };
  const min_d = 200;

	console.log(coin.c_speed);

  let distance = touching(ball, coin, "yes")
  if (distance > min_d) {
    coins.push(coin);
  }
}

// score multipliur

let score_multiplier = 1;

let score = 0;

// coin spawn timer and other timeers 
setInterval(spawncoin, 400);




// player is bad and can't stay alive LOL!

function player_goes_pouf() {
  for (let i = 0; i < 20; i++) {
    particles.push({
      x: ball.x,
      y: ball.y,
      dx: (Math.random() - 0.5) * 4,
      dy: (Math.random() - 0.5) * 4,
      radius: Math.random() * 5 + 2, 
      color: "red"
    });
    game_paused = true;
  }

  ball.visible = false;
  restartbtn.classList.add("visible");
}



// checking for stuff touching

function touching(player, coin, yes_or_no) {
  let dx = (player.x ) - (coin.cx);
  let dy = (player.y ) - (coin.cy);
  let distance = Math.sqrt(dx*dx + dy*dy);
  if (yes_or_no == "no") {
    return distance < player.radius + coin.c_size;
  } else if (yes_or_no == "yes") {
    return distance;
  }
}

// creating the particles array for the good looking pouf when player is bad, yes very bad.

let particles = [];

// restart btn here under this comment, yes under. YES UNDER. YEEEESSSS U N D E R.

function restartGame() {
  ball.x = width/2;
  ball.y = height/2;
  ball.vx = 0;
  ball.vy = 0;
  ball.visible = true;
  coins = [];
  particles = [];
  restartbtn.classList.remove("visible");
  game_paused = false;
  score = 0;
  score_multiplier = 0;
  // console.log("restarting game!")
}

const restartbtn = document.getElementById("restartbtn");
// console.log(restartbtn)

restartbtn.addEventListener("click", restartGame)
restartbtn.addEventListener("touchstart", restartGame)



// hides restart btn
restartbtn.classList.remove("visible");

// game paused code
let game_paused = false

// score declaration
const score_display = document.getElementById("scoreDisplay");





function update(dt) {
  if (game_paused == false ) {
    // simple physics
    ball.vx += gamma * 0.05;
    ball.vy += beta * 0.05;

    // friction
    ball.vx *= 0.98;
    ball.vy *= 0.98;


    ball.x += ball.vx * 6 * dt;
    ball.y += ball.vy * 6 * dt;

    // boundary collision
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > width) {
      ball.vx *= -0.7;
      ball.x = Math.max(ball.radius, Math.min(width - ball.radius, ball.x));
    }
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > height) {
      ball.vy *= -0.7;
      ball.y = Math.max(ball.radius, Math.min(height - ball.radius, ball.y));
    }

    // nqtural's stupid good idea
    for (let i = 0; i < coins.length; i++) {
      const c = coins[i];
    
      // Direction to ball
      c.c_dx = ball.x - c.cx;
      c.c_dy = ball.y - c.cy;
    
      const len = Math.hypot(c.c_dx, c.c_dy) || 1;
    
      // Constant-speed homing in px/s
      const ux = c.c_dx / len;
      const uy = c.c_dy / len;
    
      // Instant velocity toward the player
      c.vel.x = ux * c.c_speed;
      c.vel.y = uy * c.c_speed;
    
      // Integrate with dt
      c.cx += c.vel.x * dt;
      c.cy += c.vel.y * dt;
    }


    //pc support

    if (keys["ArrowLeft"])  ball.vx -= 1.75;
    if (keys["ArrowRight"]) ball.vx += 1.75;
    if (keys["ArrowUp"])    ball.vy -= 1.75;
    if (keys["ArrowDown"])  ball.vy += 1.75;
    if (keys["a"]) ball.vx -= 1.75
    if (keys["d"]) ball.vx += 1.75
    if (keys["w"]) ball.vy -= 1.75
    if (keys["s"]) ball.vy += 1.75
    if (keys[" "]) restartGame();


    const maxSpeed = 2000;
    ball.vx = Math.max(-maxSpeed, Math.min(maxSpeed, ball.vx));
    ball.vy = Math.max(-maxSpeed, Math.min(maxSpeed, ball.vy));



    // checking if player is bad at the game
    
    for (let i = 0; i < coins.length; i++) {
      if(touching(ball, coins[i], "no")) {
        player_goes_pouf();
        coins.splice(i, 1);
        break;
      }
    }

    // cheching for if coin is too old to live and need to be replaced

    for (let i = 0; i < coins.length; i++) {
      if (coins[i].c_life_time == 250) {
        coins.splice(i, 1);
      } else {
        coins[i].c_life_time++
      }
      if (coins[i].c_life_time >= 245) {
        coins[i].color = `lch(from gold l c h / ${100 - ((coins[i].c_life_time - 245) * 20)}%)`;
      }
      // console.log(coins[0].c_life_time)
    }
    score ++
    score_display.textContent = score;
  }
  if (keys[" "]) restartGame();
  // console.log(game_paused)
}

function draw() {

  ctx.clearRect(0, 0, width, height);

  if (ball.visible) {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.shadowColor = ball.shadow_color;
    ctx.shadowBlur = 20;
    ctx.fill();
  }
  
  ctx.shadowColor = 'rgb(0, 0, 0, 0)'

  a_coin = 0;

 for (let coin of coins) {
  
  ctx.fillStyle = coin.color;
  ctx.shadowColor = coin.shadow_color
  ctx.beginPath();
  ctx.arc(coin.cx, coin.cy, coin.c_size, 0, Math.PI * 2);
  ctx.fill();
  a_coin += 1;
  }

  ctx.shadowColor = 'rgb(0, 0, 0, 0)'

  // making the good looking poufing for the bad player

  for (let p of particles) {
    ctx.fillStyle = p.color;
    ctx.shadowColor = ball.shadow_color
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2);
    ctx.fill();

    p.x += p.dx;
    p.y += p.dy;

    p.dy += 0.01;

    particles = particles.filter(p => p.y < canvas.height + 10);
  }
  
}
// console.log(coins)



function loop(now = performance.now()) {
  const dt = Math.min(0.033, (now - lastTime) / 1000);
  lastTime = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}
loop();
