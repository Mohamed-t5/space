var WIDTH = document.getElementById("mycanvas").width;
var HEIGHT = document.getElementById("mycanvas").height;
var ctx = document.getElementById("mycanvas").getContext('2d');
var mycanvas = document.getElementById("mycanvas");

var score = 0, alive = true, lives = 3;
var gameStarted = false;
speed_game = 1000 / 30;
timer = 0;

var level = 1;
var enemiesPerLevel = 4;
var enemiesKilled = 0;
var levelStartTime = 0;
var bonusSpawned = false;
var totalEnemiesInLevel = 4;
var showLevelText = false;
var levelTextTimer = 0;

var ship = {
	x: 245,
	y: 525,
	w: 50,
	h: 50,
	speedBullet: 15,

	draw: function () {
		if (ship.x > 550) ship.x = 550;
		if (ship.y > 550) ship.y = 550;
		if (ship.x < 50) ship.x = 50;
		if (ship.y < 50) ship.y = 50;
		ctx.drawImage(shipImage, ship.x, ship.y, ship.w, ship.h);
	},
};

function clearCanvas() {
	ctx.clearRect(0, 0, WIDTH, HEIGHT);
}

function init() {
	enemyImage = new Image();
	shipImage = new Image();
	bulletImage = new Image();
	shipImage.src = "Images/spaceship.png";
	enemyImage.src = "Images/enemy2.png";
	bulletImage.src = "Images/bullet.png";

	mycanvas.addEventListener('click', gameStart, false);

	addEnemies();
	gameLoop();
}

function gameStart() {
	gameStarted = true;
	mycanvas.removeEventListener('click', gameStart, false);
}

var enemyList = [];
enemyTotal = 0;

function enemy(x, y, speed) {
	this.x = x;
	this.y = y;
	this.w = 50;
	this.h = 50;
	this.speed = speed;
	this.count = 0;

	this.draw = function () {
		ctx.drawImage(enemyImage, this.x, this.y, this.w, this.h);
	};
}

function addEnemies() {
	enemyList = [];
	enemiesKilled = 0;
	bonusSpawned = false;
	levelStartTime = timer;

	var speed = 3 + level;

	var startCount = (level === 1) ? 2 : enemiesPerLevel;
	totalEnemiesInLevel = enemiesPerLevel;

	var spacing = Math.floor(500 / (startCount + 1));
	var temp_x = spacing;
	var temp_y = -25;

	for (var i = 0; i < startCount; i++) {
		var e = new enemy(temp_x, temp_y, speed);
		enemyList.push(e);
		temp_x += spacing;
	}

	enemyTotal = enemyList.length;
}

function spawnBonusEnemies() {
	var currentCount = enemyList.length + enemiesKilled;
	var remaining = enemiesPerLevel - currentCount;
	var speed = 3 + level;

	for (var i = 0; i < remaining; i++) {
		var e = new enemy((Math.random() * 450) + 50, -25, speed);
		enemyList.push(e);
	}

	enemyTotal = enemyList.length;
	bonusSpawned = true;
}

function levelUp() {
	level++;
	enemiesPerLevel *= 2;
	showLevelText = true;
	levelTextTimer = 90;
	addEnemies();
}

function drawEnemies() {
	for (var i = 0; i < enemyList.length; i++) {
		enemyList[i].draw();
	}
}

function moveEnemies() {
	for (var i = 0; i < enemyList.length; i++) {
		if (enemyList[i].y < HEIGHT) {
			enemyList[i].y += Math.abs(enemyList[i].speed);
		} else if (enemyList[i].y > HEIGHT - 1) {
			enemyList[i].y = -40;
		}
	}
}

var bulletTotal = 5;
bulletList = [];

function bullet(x, y, speed) {
	this.x = x;
	this.y = y;
	this.w = 5;
	this.h = 10;
	this.state = "active";
	this.speed = speed;

	this.draw = function () {
		ctx.drawImage(bulletImage, this.x, this.y, this.w, this.h);
	};
}

function drawBullet() {
	for (var i = 0; i < bulletList.length; i++) {
		bulletList[i].draw();
	}
}

function moveBullet() {
	for (var i = 0; i < bulletList.length; i++) {
		if (bulletList[i].y > -11) {
			bulletList[i].y -= bulletList[i].speed;
		} else if (bulletList[i].y < -10) {
			bulletList.splice(i, 1);
		}
	}
}

function collisionBullet() {
	var check = false;
	for (var i = 0; i < bulletList.length; i++) {
		for (var j = 0; j < enemyList.length; j++) {
			if (
				bulletList[i].y <= (enemyList[j].y + enemyList[j].h) &&
				bulletList[i].x >= enemyList[j].x &&
				bulletList[i].x <= (enemyList[j].x + enemyList[j].w)
			) {
				check = true;
				enemyList.splice(j, 1);
				score += 10 * level;
				enemiesKilled++;
				enemyTotal = enemyList.length;

				if (enemiesKilled >= totalEnemiesInLevel) {
					bulletList.splice(i, 1);
					levelUp();
					return;
				}
				break;
			}
		}
		if (check == true) {
			bulletList.splice(i, 1);
			check = false;
		}
	}
}

function collisionShip() {
	var ship_xw = ship.x + ship.w, ship_yh = ship.y + ship.h;
	for (var i = 0; i < enemyList.length; i++) {
		if (ship.x > enemyList[i].x && ship.x < (enemyList[i].x + enemyList[i].w) && ship.y > enemyList[i].y && ship.y < (enemyList[i].y + enemyList[i].h)) {
			checkLives();
		}
		if (ship_xw < enemyList[i].x + enemyList[i].w && ship_xw > enemyList[i].x && ship.y > enemyList[i].y && ship.y < enemyList[i].y + enemyList[i].h) {
			checkLives();
		}
		if (ship_yh > enemyList[i].y && ship_yh < enemyList[i].y + enemyList[i].h && ship.x > enemyList[i].x && ship.x < enemyList[i].x + enemyList[i].w) {
			checkLives();
		}
		if (ship_yh > enemyList[i].y && ship_yh < enemyList[i].y + enemyList[i].h && ship_xw < enemyList[i].x + enemyList[i].w && ship_xw > enemyList[i].x) {
			checkLives();
		}
	}
}

function displayScore() {
	ctx.font = 'bold 15px Orbitron';
	ctx.fillStyle = '#fff';
	ctx.fillText("Score: ", 490, 30);
	ctx.fillText(score, 550, 30);
	ctx.fillText('Lives:', 10, 30);
	ctx.fillText(lives, 68, 30);
	ctx.fillText('Level: ' + level, WIDTH / 2 - 35, 30);

	if (!gameStarted) {
		ctx.font = 'bold 25px Orbitron';
		ctx.fillText('Generic Space Shooter', WIDTH / 2 - 150, HEIGHT / 2);
		ctx.font = 'bold 20px Orbitron';
		ctx.fillText('Click to Play', WIDTH / 2 - 56, HEIGHT / 2 + 30);
		ctx.fillText('Use arrow keys to move', WIDTH / 2 - 125, HEIGHT / 2 + 60);
		ctx.fillText('Use the spacebar key to shoot', WIDTH / 2 - 150, HEIGHT / 2 + 90);
	}

	if (!alive) {
		ctx.fillText('Game Over!', 245, HEIGHT / 2);
		ctx.fillText('Click anywhere to play again', WIDTH / 2 - 110, HEIGHT / 2 + 25);
		mycanvas.addEventListener('click', gameRestart, false);
	}

	if (showLevelText && levelTextTimer > 0) {
		ctx.globalAlpha = Math.min(1, levelTextTimer / 30);
		ctx.font = 'bold 35px Orbitron';
		ctx.fillStyle = '#FFD700';
		ctx.fillText('Level ' + level + '!', WIDTH / 2 - 70, HEIGHT / 2);
		ctx.globalAlpha = 1;
		levelTextTimer--;
		if (levelTextTimer <= 0) showLevelText = false;
	}
}

function checkLives() {
	lives -= 1;
	if (lives > 0) {
		reset();
	} else if (lives == 0) {
		alive = false;
	}
}

function reset() {
	ship.x = 245;
	ship.y = 525;
	enemyList = [];
	addEnemies();
}

function gameRestart() {
	ship.x = 245;
	ship.y = 525;
	score = 0;
	lives = 3;
	alive = true;
	level = 1;
	enemiesPerLevel = 4;
	enemiesKilled = 0;
	bonusSpawned = false;
	totalEnemiesInLevel = 4;
	showLevelText = false;
	levelTextTimer = 0;
	enemyList = [];
	addEnemies();
	mycanvas.removeEventListener('click', gameRestart, false);
}

document.onkeydown = function (event) {
	if (event.keyCode == 37) {
		ship.x = ship.x - 10;
	} else if (event.keyCode == 38) {
		ship.y = ship.y - 10;
	} else if (event.keyCode == 39) {
		ship.x = ship.x + 10;
	} else if (event.keyCode == 40) {
		ship.y = ship.y + 10;
	} else if (event.keyCode == 32 && bulletList.length <= bulletTotal) {
		var b = new bullet(ship.x + 25, ship.y - 10, ship.speedBullet);
		bulletList.push(b);
	}
};

window.addEventListener("keydown", function (e) {
	if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
		e.preventDefault();
	}
}, false);

function gameLoop() {
	clearCanvas();
	if (alive && lives > 0 && gameStarted) {
		if (level === 1 && !bonusSpawned && (timer - levelStartTime) >= 180) {
			spawnBonusEnemies();
		}

		collisionBullet();
		collisionShip();
		moveEnemies();
		moveBullet();
		drawEnemies();
		ship.draw();
		drawBullet();
		displayScore();
		timer = timer + 1;

		if (timer % 100 == 0) {
			speed_game = speed_game - 1 / 3;
		}
	}
	displayScore();
	game = setTimeout(gameLoop, speed_game);
}

window.onload = init;