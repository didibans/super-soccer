const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');


// SCOOOOOOOOOOOOOOOOOOOOOOOORE

let team1Score = 0;
let team2Score = 0;

// TODO LO NUEVO
const gameTime = 120; // Time in seconds
let timeRemaining = gameTime;

function drawTimer() {
  ctx.font = '20px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText(`Time Remaining: ${timeRemaining}`, canvas.width - 200, 30);
}

let lastTimeUpdated = Date.now();


// TODO LO NUEVO




function drawScore() {
  ctx.font = '40px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText(`${team1Score} - ${team2Score}`, canvas.width / 2 - 40, 30);
}

// SCOOOOOOOOOOOOOOOOOOOOOOOORE



// PLAYERRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR

class Player {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 56;
    this.speed = 12;
    this.color = color;
    this.holdingBall = false;
    this.shootDirection = 0; // Add shootDirection
  }

  holdBall(ball) {
    if (this.checkCollisionWithBall(ball)) {
      this.holdingBall = true;
      ball.setPosition(this.x + this.width / 2, this.y + this.height / 2);
    }
  }


  shootBall(ball, angle) {
    if (this.holdingBall) {
      this.holdingBall = false;
      ball.setVelocity(angle, 8); // Set direction and speed based on the given angle
    }
  }


  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  move(directions, ball) {
    const previousX = this.x;
    const previousY = this.y;

    let dx = 0;
    let dy = 0;

    if (directions.left) dx -= this.speed;
    if (directions.right) dx += this.speed;
    if (directions.up) dy -= this.speed;
    if (directions.down) dy += this.speed;

    const newX = this.x + dx;
    const newY = this.y + dy;

    // Check for collision with touchlines (top and bottom)
    if (newY >= 0 && newY + this.height <= canvas.height) {
      this.y = newY;
    }

    // Check for collision with goal lines (left and right)
    if (newX >= 0 && newX + this.width <= canvas.width) {
      this.x = newX;
    }

    if (this.checkCollisionWithBall(ball)) {
      this.x = previousX;
      this.y = previousY;
    }


  }

  checkCollisionWithBall(ball) {
    const dx = (this.x + this.width / 2) - ball.x;
    const dy = (this.y + this.height / 2) - ball.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const combinedRadius = Math.sqrt(this.width * this.width + this.height * this.height) / 2 + ball.radius;

    if (distance < combinedRadius) {
      const overlap = combinedRadius - distance;
      const angle = Math.atan2(dy, dx);
      ball.x += Math.cos(angle) * overlap;
      ball.y += Math.sin(angle) * overlap;
      return true;
    }

    return false;
  }
}

const player1Keys = { left: false, right: false, up: false, down: false };
const player2Keys = { left: false, right: false, up: false, down: false };

// PLAYERRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR



// BAAAAAAAAAAAAAAALL LOGIC

class Ball {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 24;
    this.speed = 1;
    this.direction = Math.random() * Math.PI * 2;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'black';
    ctx.fill();
    ctx.closePath();
  }

  // move() {
  //   this.x += Math.cos(this.direction) * this.speed;
  //   this.y += Math.sin(this.direction) * this.speed;
  // }

  move(player1, player2) {
    const newX = this.x + Math.cos(this.direction) * this.speed;
    const newY = this.y + Math.sin(this.direction) * this.speed;

    // Check for collision with touchlines (top and bottom)
    if (newY - this.radius < 0 || newY + this.radius > canvas.height) {
      this.direction = -this.direction;
    } else {
      this.y = newY;
    }

    // Check for collision with goal lines (left and right)
    if (newX - this.radius < 0 || newX + this.radius > canvas.width) {
      this.direction = Math.PI - this.direction;
    } else {
      this.x = newX;
    }

    this.checkCollision(player1);
    this.checkCollision(player2);
  }

  checkCollision(player) {
    const dx = this.x - (player.x + player.width / 2);
    const dy = this.y - (player.y + player.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < this.radius + Math.sqrt(player.width * player.width + player.height * player.height) / 2) {
      let angle = Math.atan2(dy, dx);

      // Make sure the ball always moves away from the player
      if (Math.abs(angle - this.direction) > Math.PI / 2) {
        angle += Math.PI;
      }

      this.direction = angle;
      this.speed = 4; // Increase the ball speed after collision
    }
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  setVelocity(direction, speed) {
    this.direction = direction;
    this.speed = speed;
  }

  reset() {
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.speed = 2;
    this.direction = Math.random() * Math.PI * 2;
  }
}

// BAAAAAAAAAAAAAAALL LOGIC




// CREATE PLAYERS
const player1 = new Player(300, canvas.height / 2 - 10, 'blue');
const player2 = new Player(canvas.width - 300, canvas.height / 2 - 10, 'red');
// CREATE PLAYERS




// CREATE BALL
const ball = new Ball(canvas.width / 2, canvas.height / 2);
// CREATE BALL




// FIEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEELD

function drawField() {
  // Draw field background
  ctx.fillStyle = 'green';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw touchlines and goal lines
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  // Draw halfway line
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();

  // Draw center circle
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, 40, 0, Math.PI * 2);
  ctx.stroke();

  // Draw penalty areas
  const penaltyWidth = 100;
  const penaltyHeight = 250;
  ctx.strokeRect(penaltyWidth, (canvas.height - penaltyHeight) / 2, penaltyWidth, penaltyHeight);
  ctx.strokeRect(canvas.width - penaltyWidth * 2, (canvas.height - penaltyHeight) / 2, penaltyWidth, penaltyHeight);

  // Draw goal areas
  const goalWidth = 40;
  const goalHeight = 120;
  ctx.strokeRect(goalWidth, (canvas.height - goalHeight) / 2, goalWidth, goalHeight);
  ctx.strokeRect(canvas.width - goalWidth * 2, (canvas.height - goalHeight) / 2, goalWidth, goalHeight);

  // Draw goals
  // ctx.fillStyle = 'gray';
  // ctx.fillRect(goalWidth * 2 - 10, (canvas.height - goalHeight) / 2 + goalHeight / 4, 10, goalHeight / 2);
  // ctx.fillRect(canvas.width - goalWidth * 2, (canvas.height - goalHeight) / 2 + goalHeight / 4, 10, goalHeight / 2);

  // Draw penalty marks
  ctx.beginPath();
  ctx.arc(penaltyWidth * 2, canvas.height / 2, 2, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(canvas.width - penaltyWidth * 2, canvas.height / 2, 2, 0, Math.PI * 2);
  ctx.fill();
}

// FIEEEEEEEEEEEEEEEEEEEELD



// GOOOOOOOOOOOOOOOOOOOOOOOAL?????

function checkForGoal() {
  const goalWidth = 40; // same as in drawField()
  const goalHeight = 120;
  const ballHorizontalDirection = Math.cos(ball.direction);

  // Team 1 scores
  if (
    ball.x >= canvas.width - goalWidth * 2 &&
    ball.y >= (canvas.height - goalHeight) / 2 &&
    ball.y <= (canvas.height + goalHeight) / 2 &&
    ballHorizontalDirection < 0
  ) {
    team1Score++;
    ball.reset();
  }

  // Team 2 scores
  if (
    ball.x <= goalWidth * 2 &&
    ball.y >= (canvas.height - goalHeight) / 2 &&
    ball.y <= (canvas.height + goalHeight) / 2 &&
    ballHorizontalDirection > 0
  ) {
    team2Score++;
    ball.reset();
  }
}

// GOOOOOOOOOOOOOOOOOOOOOOOAL?????



function startNewGame() {
  // ...
  timeRemaining = gameTime;
}


function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawField();
  player1.draw();
  player2.draw();
  ball.draw();

  checkForGoal();
  drawScore();

  player1.move(player1Keys, ball);
  player2.move(player2Keys, ball);

  if (player1Keys.space) {
    player1.shootBall(ball);
  } else {
    player1.holdBall(ball);
  }

  if (player2Keys.space) {
    player2.shootBall(ball);
  } else {
    player2.holdBall(ball);
  }

  if (!player1.holdingBall && !player2.holdingBall) {
    ball.move(player1, player2);
  }

  drawTimer();

  const currentTime = Date.now();
  if (currentTime - lastTimeUpdated >= 1000) {
    timeRemaining--;
    lastTimeUpdated = currentTime;
  }

  if (timeRemaining <= 0) {
    // End the game and show the final score
  }

  requestAnimationFrame(gameLoop);
}




gameLoop();



document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') player1Keys.left = true;
  if (e.key === 'ArrowRight') player1Keys.right = true;
  if (e.key === 'ArrowUp') player1Keys.up = true;
  if (e.key === 'ArrowDown') player1Keys.down = true;

  if (e.key === 'a' || e.key === 'A') player2Keys.left = true;
  if (e.key === 'd' || e.key === 'D') player2Keys.right = true;
  if (e.key === 'w' || e.key === 'W') player2Keys.up = true;
  if (e.key === 's' || e.key === 'S') player2Keys.down = true;

  if (e.key === '0') player1Keys.space = true;
  if (e.key === 'c') player2Keys.space = true;

  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'a', 'A', 'd', 'D', 'w', 'W', 's', 'S'].includes(e.key)) {
    player1.shootDirection = 0;
    player2.shootDirection = 0;
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft') player1Keys.left = false;
  if (e.key === 'ArrowRight') player1Keys.right = false;
  if (e.key === 'ArrowUp') player1Keys.up = false;
  if (e.key === 'ArrowDown') player1Keys.down = false;

  if (e.key === 'a' || e.key === 'A') player2Keys.left = false;
  if (e.key === 'd' || e.key === 'D') player2Keys.right = false;
  if (e.key === 'w' || e.key === 'W') player2Keys.up = false;
  if (e.key === 's' || e.key === 'S') player2Keys.down = false;

  if (e.key === '0') player1Keys.space = false;
  if (e.key === 'c') player2Keys.space = false;

});
