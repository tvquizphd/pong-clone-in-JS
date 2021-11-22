var canvas;
var canvasContext;
var ballX = 50;
var ballY = 50;
var ballSpeedX = 10;
var ballSpeedY = 4;

var player1Score = 0;
var player2Score = 0;
const WINNING_SCORE = 8;
const DIFFICULTY = 3;
const paddle2State = {
   up: 0,
   down: 0,
   speed: 30
};
var mousePlayerDetected = false;
var keyboardPlayerDetected = false;

var clampPaddle = function (v) {
  const minY = - PADDLE_HEIGHT / 4
  if (!canvas) {
    return Math.max(minY, v)
  }
  const maxY = canvas.height - PADDLE_HEIGHT - minY
  return Math.min(maxY, Math.max(minY, v))
}

const overlap = function (a, b) {
  return b[0] < a[1] && a[0] < b[1];
};

const quadRoots = function (a, b, c) {
  var rootPart = Math.sqrt( (b * b) - (4 * a * c) );
  var denom = 2 * a;
  
  return [
    (-b - rootPart)/denom,
    (-b + rootPart)/denom
  ]
};

const atX = function (r, cx, cy, x, yLimits) {
  var b = - 2 * cy
  var c1 = (x - cx) ** 2
  var c = c1 + (-cy) ** 2 - r ** 2
  var roots = quadRoots(1, b, c)
  return overlap(roots, yLimits)
}

var showingWinScreen = false;
//var game-over = false;
//var needToContinue = false;

var paddle1Y = 250;
var paddle2Y = 250;
const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 10;
const BALL_SIZE = 44;

function calculateMousePos(evt) {
  var rect = canvas.getBoundingClientRect();
  var root = document.documentElement;
  var mouseX = evt.clientX - rect.left - root.scrollLeft;
  var mouseY = evt.clientY - rect.top - root.scrollTop;
  return {
    x: mouseX,
    y: mouseY
  };
}

function handleMouseClick(evt) {
  if (showingWinScreen) {
    player1Score = 0;
    player2Score = 0;
    hideElement("p1-won");
    hideElement("p2-won");
    hideElement("game-over");
    hideElement("continue");
    showingWinScreen = false;
  }
}

window.onload = function() {
  canvas = document.getElementById("game-canvas");
  canvasContext = canvas.getContext("2d");

  var framesPerSecond = 30;
  setInterval(function() {
    moveEverything();
    drawEverything();
  }, 1000 / framesPerSecond);

  document.addEventListener("mousedown", handleMouseClick);

  document.addEventListener("mousemove", function(evt) {
    mousePlayerDetected = true;
    var mousePos = calculateMousePos(evt);
    paddle1Y = clampPaddle(mousePos.y - PADDLE_HEIGHT / 2);
  });

  // Detect paddle 2 press
  document.onkeydown = function(evt) {
    if (evt.keyCode == '40') {
      keyboardPlayerDetected = true;
      paddle2State.down = 1;
    }
    if (evt.keyCode == '38') {
      keyboardPlayerDetected = true;
      paddle2State.up = 1;
    }
  };
  // Detect paddle 2 release
  document.onkeyup = function(evt) {
    if (evt.keyCode == '40') {
      keyboardPlayerDetected = true;
      paddle2State.down = 0;
    }
    if (evt.keyCode == '38') {
      keyboardPlayerDetected = true;
      paddle2State.up = 0;
    }
  };
};

function ballReset() {
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  ballSpeedX = -ballSpeedX;
  if (player1Score >= WINNING_SCORE || player2Score >= WINNING_SCORE) {
    showingWinScreen = true;
  }
}

function paddleSimulation(y, speed) {
  var yCenter = y + PADDLE_HEIGHT / 2;
  if (yCenter < ballY - 35) {
    return paddleMovement(y, {
      up: 0, down: 1, speed: speed
    });
  } else if (yCenter > ballY + 35) {
    return paddleMovement(y, {
      up: 1, down: 0, speed: speed
    });
  }
  return y;
}

function assumeAFK() {
  if (!paddle2State.up && !paddle2State.down) {
    keyboardPlayerDetected = false;
  }
  mousePlayerDetected = false;
}

function paddleMovement(y, state) {
   const sign = [
      [0, +1],
      [-1, 0]
   ][state.up][state.down]
   return clampPaddle(y + sign * state.speed);
}

function moveEverything() {
  if (showingWinScreen) {
    return;
  }

  // So the right paddle plays with you
  if (keyboardPlayerDetected) {
    paddle2Y = paddleMovement(paddle2Y, paddle2State);
  }
  else {
    paddle2Y = paddleSimulation(paddle2Y, 2 ** DIFFICULTY);
  }
  // So the left paddle plays with you
  if (!mousePlayerDetected) {
    paddle1Y = paddleSimulation(paddle1Y, 2 ** DIFFICULTY);
  }

  ballX += ballSpeedX;
  ballY += ballSpeedY;

  const paddle1Limit = [paddle1Y, paddle1Y + PADDLE_HEIGHT];
  const midPaddle1Y = paddle1Y + PADDLE_HEIGHT / 2;
  const paddle2Limit = [paddle2Y, paddle2Y + PADDLE_HEIGHT];
  const midPaddle2Y = paddle2Y + PADDLE_HEIGHT / 2;

  const paddle1X = 0 + PADDLE_WIDTH;
  const paddle2X = canvas.width - PADDLE_WIDTH;
 
  const ballTop = ballY- BALL_SIZE;
  const ballBottom = ballY + BALL_SIZE;
  const ballLeft = ballX - BALL_SIZE;
  const ballRight = ballX + BALL_SIZE;

  // When ball past left side of screen
  if (ballX < 0) {
    assumeAFK();
    player2Score++;
    ballReset();
  }
  // When ball past right side of screen
  else if (ballX > canvas.width) {
    assumeAFK();
    player1Score++;
    ballReset();
  }
  // If the ball hits the left paddle then it should bounce back
  else if (ballLeft < 0 && atX(BALL_SIZE, ballX, ballY, paddle1X, paddle1Limit)) {
    ballSpeedX = -ballSpeedX;
    // Adjust angle of ball based on where it hits the paddle
    var deltaY = ballY - midPaddle1Y;
    ballSpeedY = deltaY * 0.35;
  }
  // If the ball hits the right paddle then it should bounce back
  else if (ballRight > canvas.width && atX(BALL_SIZE, ballX, ballY, paddle2X, paddle2Limit)) {
    ballSpeedX = -ballSpeedX;
    // Adjust angle of ball based on where it hits the paddle
    var deltaY = ballY - midPaddle2Y;
    ballSpeedY = deltaY * 0.35;
  }

  // Keeps the ball bouncing off the top and bottom of the screen
  if (ballTop < 0) {
    ballSpeedY = -ballSpeedY;
  }
  if (ballBottom > canvas.height) {
    ballSpeedY = -ballSpeedY;
  }
}

function drawNet() {
  for (i = 0; i < canvas.height; i += 40) {
    colorRect(canvas.width / 2 - 1, i, 2, 20, "white");
  }
}

function showElement(id) {
  var x = document.getElementById(id);
  x.style.display = "block";
}

function hideElement(id) {
  var x = document.getElementById(id);
  x.style.display = "none";
}

function drawEverything() {
  if (showingWinScreen) {
    if (player1Score >= WINNING_SCORE) {
      // canvasContext.fillText("You Won!", 400, 300);
      showElement("p1-won");
    } else if (player2Score >= WINNING_SCORE) {
      // canvasContext.fillText("Game Over", 350, 300);
      showElement("p2-won");
    }
    else {
      showElement("game-over");
    }
    // canvasContext.fillText("Click to continue", 350, 500);
    showElement("continue");
    return;
  }
  // Draws black backgroud
  colorRect(0, 0, canvas.width, canvas.height, "black");

  drawNet();

  // Draws left player paddle
  colorRect(1, paddle1Y, PADDLE_WIDTH, PADDLE_HEIGHT, "white");

  // Draws right computer paddle
  colorRect(
    canvas.width - PADDLE_WIDTH - 1,
    paddle2Y,
    PADDLE_WIDTH,
    PADDLE_HEIGHT,
    "white"
  );

  // Draws the ball
  colorCircle(ballX, ballY, BALL_SIZE, "white");

  // Updates score in the HTML
  document.getElementById("player1Score").innerHTML = player1Score;
  document.getElementById("player2Score").innerHTML = player2Score;
  //canvasContext.fillText(player1Score, 100, 100);
  //canvasContext.fillText(player2Score, canvas.width - 100, 100);
}

function colorRect(leftX, topY, width, height, drawColor) {
  canvasContext.fillStyle = drawColor;
  canvasContext.fillRect(leftX, topY, width, height);
}

function colorCircle(centerX, centerY, radius, drawColor) {
  const ballSprite = 'ping88';
  const image = document.getElementById(ballSprite);
  canvasContext.drawImage(image, centerX-radius, centerY-radius, 2*radius, 2*radius);
}
