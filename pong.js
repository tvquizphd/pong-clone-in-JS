var canvas;
var canvasContext;
var ballX = 50;
var ballY = 50;
var ballSpeedX = 10;
var ballSpeedY = 4;

var player1Score = 0;
var player2Score = 0;
const WINNING_SCORE = 3;

var showingWinScreen = false;
//var game-over = false;
//var needToContinue = false;

var paddle1Y = 250;
var paddle2Y = 250;
const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 10;
const BALL_SIZE = 10;

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
    hideElement("you-won");
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

  canvas.addEventListener("mousedown", handleMouseClick);

  canvas.addEventListener("mousemove", function(evt) {
    var mousePos = calculateMousePos(evt);
    // Determines which paddle is controlled by mouse
    paddle1Y = mousePos.y - PADDLE_HEIGHT / 2;
  });

  canvas.addEventListener("keydown", function(evt) {
    const minY = (PADDLE_HEIGHT / 2)
    const maxY = canvas.height - minY
    // up 
    if (evt.keyCode == '38') {
      paddle2Y = Math.max(minY, paddle2Y - ballSpeedY);
      return;
    }
    // down
    if (evt.keyCode == '40') {
      paddle2Y = Math.min(maxY, paddle2Y + ballSpeedY);
      return;
    }
};

function ballReset() {
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  ballSpeedX = -ballSpeedX;
  if (player1Score >= WINNING_SCORE || player2Score >= WINNING_SCORE) {
    showingWinScreen = true;
  }
}

function computerMovement() {
  var paddle2YCenter = paddle2Y + PADDLE_HEIGHT / 2;
  if (paddle2YCenter < ballY - 35) {
    paddle2Y += 6;
  } else if (paddle2YCenter > ballY + 35) {
    paddle2Y -= 6;
  }
}

function moveEverything() {
  if (showingWinScreen) {
    return;
  }

  // So the right paddle plays with you
  //computerMovement();

  ballX += ballSpeedX;
  ballY += ballSpeedY;

  // When ball hits left side of screen
  if (ballX < 0 + PADDLE_WIDTH + BALL_SIZE) {
    // If the ball hits the left paddle then it should bounce back
    if (ballY > paddle1Y && ballY < paddle1Y + PADDLE_HEIGHT) {
      ballSpeedX = -ballSpeedX;
      // Adjust angle of ball based on where it hits the paddle
      var deltaY = ballY - (paddle1Y + PADDLE_HEIGHT / 2);
      ballSpeedY = deltaY * 0.35;
    } else {
      // Else the paddle missed and the other player scores a point
      player2Score++;
      ballReset();
    }
  }
  // When ball hits right side of screen
  if (ballX > canvas.width - PADDLE_WIDTH - BALL_SIZE) {
    // If the ball hits the right paddle then it should bounce back
    if (ballY > paddle2Y && ballY < paddle2Y + PADDLE_HEIGHT) {
      ballSpeedX = -ballSpeedX;
      // Adjust angle of ball based on where it hits the paddle
      var deltaY = ballY - (paddle2Y + PADDLE_HEIGHT / 2);
      ballSpeedY = deltaY * 0.35;
    } else {
      // Else the paddle missed and the other player scores a point
      player1Score++;
      ballReset();
    }
  }

  // Keeps the ball bouncing off the top and bottom of the screen
  if (ballY < 0) {
    ballSpeedY = -ballSpeedY;
  }
  if (ballY > canvas.height) {
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
      showElement("you-won");
    } else if (player2Score >= WINNING_SCORE) {
      // canvasContext.fillText("Game Over", 350, 300);
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
  canvasContext.fillStyle = drawColor;
  canvasContext.beginPath();
  canvasContext.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
  canvasContext.fill();
}
