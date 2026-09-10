const startScreen = document.getElementById('start-screen');
const startBtn = document.getElementById('start-btn');

let score = 0;
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreElement = document.getElementById('final-score');
const finalLevelElement = document.getElementById('final-level');
const restartBtn = document.getElementById('restart-btn');
const homeBtn = document.getElementById('home-btn');

let bolts = [];
let obstacles = [];
let gameSpeed = 4;
let isGameOver = false;

let currentLane = 1;
const player = document.getElementById('player');
const lanes = [
    document.getElementById('lane-0'),
    document.getElementById('lane-1'),
    document.getElementById('lane-2')
];

// Cria raios de pontuação
function spawnBolt() {
    if (isGameOver) return;
    const randomLaneIndex = Math.floor(Math.random() * 3);
    const bolt = document.createElement('div');
    bolt.classList.add('bolt');
    bolt.style.top = '-50px';
    
    lanes[randomLaneIndex].appendChild(bolt);
    bolts.push({ element: bolt, y: -50 });
}

// Cria carros inimigos
function spawnObstacle() {
    if (isGameOver) return;
    const randomLaneIndex = Math.floor(Math.random() * 3);
    const obstacle = document.createElement('div');
    obstacle.classList.add('obstacle');
    obstacle.style.top = '-70px';
    
    lanes[randomLaneIndex].appendChild(obstacle);
    
    obstacles.push({
        element: obstacle,
        lane: randomLaneIndex,
        y: -70
    });
}

// Move o jogador entre as faixas
function movePlayer(direction) {
    if (isGameOver) return;
    if (direction === 'left' && currentLane > 0) {
        currentLane--;
    } else if (direction === 'right' && currentLane < 2) {
        currentLane++;
    }
    
    lanes[currentLane].appendChild(player);
}

// Controles por teclado
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'a') {
        movePlayer('left');
    } else if (event.key === 'ArrowRight' || event.key === 'd') {
        movePlayer('right');
    }
});

// Detecção de colisão via bounding box
function checkCollision(playerElement, obstacleElement) {
    const pRect = playerElement.getBoundingClientRect();
    const oRect = obstacleElement.getBoundingClientRect();

    return !(
        pRect.top > oRect.bottom ||
        pRect.bottom < oRect.top ||
        pRect.right < oRect.left ||
        pRect.left > oRect.right
    );
}

// Loop principal de atualização do jogo
function updateGame() {
    if (isGameOver) return;

    // Atualiza inimigos
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.y += gameSpeed;
        obs.element.style.top = `${obs.y}px`;

        if (checkCollision(player, obs.element)) {
            isGameOver = true;
            document.querySelectorAll('.lane').forEach(lane => lane.style.animationPlayState = 'paused');
            
            finalScoreElement.innerText = score;
            if (finalLevelElement && levelElement) {
                finalLevelElement.innerText = levelElement.innerText;
            }
            gameOverScreen.classList.remove('hidden');
            
            return;
        }

        if (obs.y > 600) {
            obs.element.remove();
            obstacles.splice(i, 1);
        }
    }

    // Atualiza raios colecionáveis
    for (let i = bolts.length - 1; i >= 0; i--) {
        const b = bolts[i];
        b.y += gameSpeed;
        b.element.style.top = `${b.y}px`;

        if (checkCollision(player, b.element)) {
            score += 100;
            scoreElement.innerText = score;
            
            if (levelElement) {
                levelElement.innerText = 1 + Math.floor(score / 500);
            }

            b.element.remove();
            bolts.splice(i, 1);
            continue;
        }

        if (b.y > 600) {
            b.element.remove();
            bolts.splice(i, 1);
        }
    }
    
    requestAnimationFrame(updateGame);
}

// Controle de dificuldade e spawn
let obstacleInterval = 1500; 

function scheduleNextObstacle() {
    if (isGameOver) return;
    
    spawnObstacle();
    
    const level = 1 + Math.floor(score / 500);

    if (level <= 3) {
        obstacleInterval = Math.max(700, 1400 - (level - 1) * 300);
        gameSpeed = 4.5 + (level - 1) * 1.2;
    } else {
        const extraLevels = level - 3;
        obstacleInterval = Math.max(350, 700 - extraLevels * 80);
        gameSpeed = 7.0 + extraLevels * 1.0;
    }

    setTimeout(scheduleNextObstacle, obstacleInterval);
}

// Inicia a partida
startBtn.addEventListener('click', () => {
    startScreen.style.display = 'none'; 
    document.querySelectorAll('.lane').forEach(lane => lane.style.animationPlayState = 'running');

    setTimeout(scheduleNextObstacle, obstacleInterval);
    setInterval(spawnBolt, 2500);
    requestAnimationFrame(updateGame);
});

// Reinicia o jogo
restartBtn.addEventListener('click', () => {
    obstacles.forEach(obs => obs.element.remove());
    obstacles = [];
    bolts.forEach(b => b.element.remove());
    bolts = [];

    score = 0;
    scoreElement.innerText = score;
    if (levelElement) {
        levelElement.innerText = 1;
    }
    gameSpeed = 4;
    obstacleInterval = 1500;
    isGameOver = false;

    currentLane = 1;
    lanes[currentLane].appendChild(player);
    gameOverScreen.classList.add('hidden');

    document.querySelectorAll('.lane').forEach(lane => lane.style.animationPlayState = 'running');
    setTimeout(scheduleNextObstacle, obstacleInterval);
    requestAnimationFrame(updateGame);
});

// Retorna ao menu principal
homeBtn.addEventListener('click', () => {
    obstacles.forEach(obs => obs.element.remove());
    obstacles = [];
    bolts.forEach(b => b.element.remove());
    bolts = [];

    score = 0;
    scoreElement.innerText = score;
    if (levelElement) {
        levelElement.innerText = 1;
    }
    gameSpeed = 4;
    obstacleInterval = 1500;
    isGameOver = false;

    currentLane = 1;
    lanes[currentLane].appendChild(player);

    gameOverScreen.classList.add('hidden');
    startScreen.style.display = 'flex';
});