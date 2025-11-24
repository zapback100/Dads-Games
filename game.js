const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const TILE_SIZE = 24; // Increased from 20 (20% bigger)
const ROWS = 27; // Increased from 25 to 27 for footer
const COLS = 20;

// Set canvas size dynamically
canvas.width = COLS * TILE_SIZE;
canvas.height = ROWS * TILE_SIZE;

// 0=Empty, 1=Wall, 2=Pellet, 3=Power Pellet, 4=Ghost House, 5=Pacman Start
// We need a pristine copy of the map for resets
const initialMapLayout = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // HUD Space
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // HUD Space
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // HUD Space
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1],
    [1, 3, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 3, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1],
    [1, 2, 2, 2, 2, 1, 2, 2, 2, 1, 1, 2, 2, 2, 1, 2, 2, 2, 2, 1],
    [1, 1, 1, 1, 2, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 2, 1, 1, 1, 1],
    [0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0],
    [1, 1, 1, 1, 2, 1, 0, 1, 1, 4, 4, 1, 1, 0, 1, 2, 1, 1, 1, 1],
    [0, 0, 0, 0, 2, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 0, 0],
    [1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1],
    [0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0],
    [1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1],
    [1, 3, 2, 1, 2, 2, 2, 2, 2, 5, 5, 2, 2, 2, 2, 2, 1, 2, 3, 1],
    [1, 1, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 1, 1],
    [1, 2, 2, 2, 2, 1, 2, 2, 2, 1, 1, 2, 2, 2, 1, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5], // Footer (Invisible Wall)
    [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]  // Footer (Invisible Wall)
];

// Deep copy for runtime map
let map = JSON.parse(JSON.stringify(initialMapLayout));

function drawMap(flashColor = null) {
    const offset = 4; // Inset for the wall line
    const cornerRadius = 5;

    // Helper to check if a tile is a wall
    const isWall = (r, c) => {
        if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return false;
        return map[r][c] === 1;
    };

    // Render Walls Function
    const renderWalls = (color, width) => {
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.strokeStyle = color;

        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const tile = map[r][c];
                const x = c * TILE_SIZE;
                const y = r * TILE_SIZE;

                if (tile === 1) {
                    const drawUp = !isWall(r - 1, c);
                    const drawDown = !isWall(r + 1, c);
                    const drawLeft = !isWall(r, c - 1);
                    const drawRight = !isWall(r, c + 1);

                    ctx.beginPath();

                    // Top Edge
                    if (drawUp) {
                        let startX = x;
                        let endX = x + TILE_SIZE;
                        if (drawLeft) startX += offset + cornerRadius;
                        if (drawRight) endX -= offset + cornerRadius;
                        ctx.moveTo(startX, y + offset);
                        ctx.lineTo(endX, y + offset);
                    }

                    // Bottom Edge
                    if (drawDown) {
                        let startX = x;
                        let endX = x + TILE_SIZE;
                        if (drawLeft) startX += offset + cornerRadius;
                        if (drawRight) endX -= offset + cornerRadius;
                        ctx.moveTo(startX, y + TILE_SIZE - offset);
                        ctx.lineTo(endX, y + TILE_SIZE - offset);
                    }

                    // Left Edge
                    if (drawLeft) {
                        let startY = y;
                        let endY = y + TILE_SIZE;
                        if (drawUp) startY += offset + cornerRadius;
                        if (drawDown) endY -= offset + cornerRadius;
                        ctx.moveTo(x + offset, startY);
                        ctx.lineTo(x + offset, endY);
                    }

                    // Right Edge
                    if (drawRight) {
                        let startY = y;
                        let endY = y + TILE_SIZE;
                        if (drawUp) startY += offset + cornerRadius;
                        if (drawDown) endY -= offset + cornerRadius;
                        ctx.moveTo(x + TILE_SIZE - offset, startY);
                        ctx.lineTo(x + TILE_SIZE - offset, endY);
                    }

                    // Corners
                    if (drawUp && drawLeft) {
                        ctx.moveTo(x + offset, y + offset + cornerRadius);
                        ctx.arcTo(x + offset, y + offset, x + offset + cornerRadius, y + offset, cornerRadius);
                    }
                    if (drawUp && drawRight) {
                        ctx.moveTo(x + TILE_SIZE - offset - cornerRadius, y + offset);
                        ctx.arcTo(x + TILE_SIZE - offset, y + offset, x + TILE_SIZE - offset, y + offset + cornerRadius, cornerRadius);
                    }
                    if (drawDown && drawLeft) {
                        ctx.moveTo(x + offset, y + TILE_SIZE - offset - cornerRadius);
                        ctx.arcTo(x + offset, y + TILE_SIZE - offset, x + offset + cornerRadius, y + TILE_SIZE - offset, cornerRadius);
                    }
                    if (drawDown && drawRight) {
                        ctx.moveTo(x + TILE_SIZE - offset - cornerRadius, y + TILE_SIZE - offset);
                        ctx.arcTo(x + TILE_SIZE - offset, y + TILE_SIZE - offset, x + TILE_SIZE - offset, y + TILE_SIZE - offset - cornerRadius, cornerRadius);
                    }

                    ctx.stroke();
                }
            }
        }
    };

    // Draw Outer (Thick)
    renderWalls(flashColor || wallColor, 5);

    // Draw Inner (Thin - Hollow Effect)
    // Only if not flashing, or if flashing we want the hollow part to be black?
    // Classic flashing: The whole wall changes color.
    // If we want hollow walls, we should draw the inner line as black (background color).
    renderWalls('black', 2);


    // Draw Pellets and Other Static Items
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const tile = map[r][c];
            const x = c * TILE_SIZE;
            const y = r * TILE_SIZE;

            if (tile === 2) {
                // Pellet
                ctx.fillStyle = '#ffb8ae';
                ctx.fillRect(x + TILE_SIZE / 2 - 2, y + TILE_SIZE / 2 - 2, 4, 4);
            } else if (tile === 3) {
                // Power Pellet - Flash Logic
                // Flash every 15 frames (approx 4 times per second at 60fps)
                if (Math.floor(globalFlashTimer / 15) % 2 === 0) {
                    ctx.fillStyle = '#ffb8ae';
                    ctx.beginPath();
                    ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 7, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else if (tile === 4) {
                // Ghost House Gate
                ctx.fillStyle = 'pink';
                ctx.fillRect(x, y + TILE_SIZE / 2 - 2, TILE_SIZE, 4);
            }
        }
    }

    // Draw Bonus Item
    if (bonusItem.active) {
        const currentFruit = getFruitForLevel(level);
        drawFruit(currentFruit, bonusItem.x, bonusItem.y);
    }
}

function drawFruit(fruit, x, y) {
    const cx = x + TILE_SIZE / 2;
    const cy = y + TILE_SIZE / 2;

    ctx.fillStyle = fruit.color;

    if (fruit.symbol === 'cherry') {
        ctx.beginPath();
        ctx.arc(cx - 5, cy + 2, 4, 0, Math.PI * 2);
        ctx.arc(cx + 5, cy + 4, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#deb887';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 5, cy + 2);
        ctx.quadraticCurveTo(cx, cy - 8, cx + 8, cy - 10);
        ctx.moveTo(cx + 5, cy + 4);
        ctx.quadraticCurveTo(cx + 2, cy - 6, cx + 8, cy - 10);
        ctx.stroke();
    } else if (fruit.symbol === 'strawberry') {
        ctx.beginPath();
        ctx.moveTo(cx, cy + 6);
        ctx.lineTo(cx - 5, cy - 4);
        ctx.lineTo(cx + 5, cy - 4);
        ctx.fill();
        ctx.fillStyle = 'green';
        ctx.fillRect(cx - 2, cy - 6, 4, 2);
    } else if (fruit.symbol === 'orange') {
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'green';
        ctx.fillRect(cx - 1, cy - 7, 2, 3);
    } else if (fruit.symbol === 'apple') {
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'brown';
        ctx.fillRect(cx - 1, cy - 8, 2, 4);
    } else if (fruit.symbol === 'melon') {
        ctx.beginPath();
        ctx.ellipse(cx, cy, 5, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#90ee90';
        ctx.stroke();
    } else if (fruit.symbol === 'galaxian') {
        ctx.beginPath();
        ctx.moveTo(cx, cy - 6);
        ctx.lineTo(cx - 6, cy + 4);
        ctx.lineTo(cx, cy + 2);
        ctx.lineTo(cx + 6, cy + 4);
        ctx.fill();
    } else if (fruit.symbol === 'bell') {
        ctx.beginPath();
        ctx.moveTo(cx, cy - 6);
        ctx.quadraticCurveTo(cx + 6, cy + 6, cx + 6, cy + 6);
        ctx.lineTo(cx - 6, cy + 6);
        ctx.quadraticCurveTo(cx - 6, cy + 6, cx, cy - 6);
        ctx.fill();
    } else if (fruit.symbol === 'key') {
        ctx.beginPath();
        ctx.rect(cx - 2, cy - 6, 4, 6);
        ctx.rect(cx - 4, cy - 8, 8, 4);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx, cy + 6);
        ctx.stroke();
    }
}
class Pacman {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speed = 2; // Integer speed for perfect grid alignment
        this.dir = 4; // 0:Up, 1:Right, 2:Down, 3:Left, 4:Stop
        this.nextDir = 4;
        this.radius = 10; // Larger to match classic - nearly fills corridor
        this.mouthOpen = 0;
        this.mouthSpeed = 0.15; // Faster chomp
    }

    update() {
        if (gameState !== 'PLAY') return;

        // Try to change direction if aligned with grid
        if (this.x % TILE_SIZE === 0 && this.y % TILE_SIZE === 0) {
            if (this.canMove(this.nextDir)) {
                this.dir = this.nextDir;
            } else if (!this.canMove(this.dir)) {
                this.dir = 4; // Stop if hitting wall
            }
        }

        // Move based on direction
        if (this.dir === 0) this.y -= this.speed;
        if (this.dir === 1) this.x += this.speed;
        if (this.dir === 2) this.y += this.speed;
        if (this.dir === 3) this.x -= this.speed;

        // Animate mouth - continuously chomp when moving, open when stopped
        if (this.dir !== 4) {
            // Continuously animate while moving
            this.mouthOpen += this.mouthSpeed;
            if (this.mouthOpen > 0.8 || this.mouthOpen < 0) { // Wider mouth (approx 45 degrees)
                this.mouthSpeed = -this.mouthSpeed;
            }
        } else {
            // Stay open when stopped
            this.mouthOpen = 0.8;
        }

        // Screen wrapping
        if (this.x > canvas.width) this.x = -TILE_SIZE;
        if (this.x < -TILE_SIZE) this.x = canvas.width;
    }

    eatPellet() {
        // Optional: Can trigger sound or effects here
    }

    canMove(direction) {
        let nextX = this.x;
        let nextY = this.y;

        if (direction === 0) nextY -= TILE_SIZE;
        if (direction === 1) nextX += TILE_SIZE;
        if (direction === 2) nextY += TILE_SIZE;
        if (direction === 3) nextX -= TILE_SIZE;

        // Get tile coordinates
        const c = Math.floor(nextX / TILE_SIZE);
        const r = Math.floor(nextY / TILE_SIZE);

        // Check bounds
        if (r < 0 || r >= ROWS) return false;
        if (c < 0 || c >= COLS) {
            // In tunnel, only allow horizontal movement
            return direction === 1 || direction === 3;
        }

        return map[r][c] !== 1 && map[r][c] !== 4; // Not wall or ghost house
    }

    draw() {
        ctx.fillStyle = 'yellow';
        ctx.beginPath();

        const cx = this.x + TILE_SIZE / 2;
        const cy = this.y + TILE_SIZE / 2;

        let rotation = 0;
        if (this.dir === 0) rotation = -Math.PI / 2;
        if (this.dir === 1) rotation = 0;
        if (this.dir === 2) rotation = Math.PI / 2;
        if (this.dir === 3) rotation = Math.PI;

        if (this.dir === 4) rotation = 0;

        ctx.translate(cx, cy);
        ctx.rotate(rotation);

        // Draw Pacman with mouth
        ctx.arc(0, 0, this.radius, this.mouthOpen, 2 * Math.PI - this.mouthOpen);
        ctx.lineTo(0, 0);

        ctx.fill();

        // Reset transform
        ctx.rotate(-rotation);
        ctx.translate(-cx, -cy);
    }
}

class Ghost {
    constructor(x, y, color, personality) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.baseColor = color;
        this.personality = personality; // 'blinky', 'pinky', 'inky', 'clyde'
        this.scaredColor = '#0000ff';
        this.speed = 2; // Integer speed for perfect grid alignment
        this.dir = 1; // Start moving right
        this.radius = 10; // Larger to match classic - nearly fills corridor
        this.isScared = false;
        this.scaredTimer = 0;
        this.isEyes = false;
        this.targetX = 0;
        this.targetY = 0;
    }

    startScared(duration) {
        if (this.isEyes || this.inHouse) return; // Don't scare if eyes or in house
        this.isScared = true;
        this.scaredTimer = duration || 360; // Use passed duration or default

        // Reverse direction immediately (classic behavior)
        this.dir = (this.dir + 2) % 4;

        const lvlData = getLevelData(level);
        this.speed = lvlData.pacFrightSpeed; // Ghosts slow down? Actually they usually slow down.
        // Wait, pacFrightSpeed is for Pacman. Ghosts have their own frightened speed.
        // Usually ghosts move at ~50% speed.
        this.speed = 1; // Force 1 for now as per "integer" rule
    }

    becomeEyes() {
        this.isScared = false;
        this.isEyes = true;
        this.speed = 4; // Move very fast (2x base)
        // Snap to grid for easier pathfinding
        this.x = Math.round(this.x / TILE_SIZE) * TILE_SIZE;
        this.y = Math.round(this.y / TILE_SIZE) * TILE_SIZE;
    }

    update() {
        if (gameState !== 'PLAY') return;

        // Cruise Elroy Logic (Blinky Only)
        if (this.personality === 'blinky' && !this.isScared && !this.isEyes) {
            const lvlData = getLevelData(level);
            if (totalPellets <= lvlData.elroy2Dots) {
                this.speed = lvlData.elroy2Speed;
            } else if (totalPellets <= lvlData.elroy1Dots) {
                this.speed = lvlData.elroy1Speed;
            } else {
                this.speed = lvlData.ghostSpeed;
            }
        }

        if (this.isScared) {
            this.scaredTimer--;
            if (this.scaredTimer <= 0) {
                this.isScared = false;
                this.speed = 2; // Reset to base speed

                // CRITICAL: Clamp position when transitioning out of scared mode
                const minY = 3 * TILE_SIZE;
                const maxY = 24 * TILE_SIZE;
                this.y = Math.max(minY, Math.min(this.y, maxY));

                // Snap to grid to prevent positioning issues
                this.x = Math.round(this.x / TILE_SIZE) * TILE_SIZE;
                this.y = Math.round(this.y / TILE_SIZE) * TILE_SIZE;
            }
        }

        // Choose direction at intersections (when aligned with grid)
        if (this.x % TILE_SIZE === 0 && this.y % TILE_SIZE === 0) {
            let targetX, targetY;

            if (this.isEyes) {
                // Return to ghost house
                targetX = 9.5 * TILE_SIZE;
                targetY = 13 * TILE_SIZE;

                // Check if reached house
                if (Math.abs(this.x - targetX) < TILE_SIZE && Math.abs(this.y - targetY) < TILE_SIZE) {
                    this.isEyes = false;
                    this.inHouse = true; // Back in house
                    this.dir = 1; // Reset dir
                    // Reset to house position
                    if (this.personality === 'pinky') { this.x = 9.5 * TILE_SIZE; this.y = 13 * TILE_SIZE; }
                    else if (this.personality === 'inky') { this.x = 8 * TILE_SIZE; this.y = 13 * TILE_SIZE; }
                    else if (this.personality === 'clyde') { this.x = 11 * TILE_SIZE; this.y = 13 * TILE_SIZE; }
                    else { this.x = 9.5 * TILE_SIZE; this.y = 13 * TILE_SIZE; } // Blinky fallback

                    // Set a timer to re-exit? Or just rely on dot counters?
                    // Classic: Blinky exits immediately. Others rely on dot counters?
                    // Actually, returning eyes respawn immediately in most versions or have a short timer.
                    // For now, let's just release them immediately to keep flow, or set a small counter.
                    this.dotCounter = 0; // Reset counter
                    // Force release for flow? Or wait for dots?
                    // Let's wait for dots to be authentic, but maybe give them a head start?
                    // Actually, let's just release immediately for fun factor if they were eaten.
                    // But user wanted authentic.
                    // Authentic: They re-enter house, then exit based on global/local counters?
                    // Actually, there is a "Global Dot Limit" for respawned ghosts?
                    // Let's set a simple timer for re-exit to avoid them getting stuck if player is camping.
                    setTimeout(() => releaseGhost(this), 2000); // 2s penalty
                    return;
                }
            } else if (this.isScared) {
                // Random movement when scared
                const possibleDirs = [];
                for (let i = 0; i < 4; i++) {
                    if (i === (this.dir + 2) % 4) continue; // Don't reverse
                    if (this.canMove(i)) possibleDirs.push(i);
                }
                if (possibleDirs.length > 0) {
                    this.dir = possibleDirs[Math.floor(Math.random() * possibleDirs.length)];
                }
                this.move();
                return;
            } else {
                // Normal AI (Scatter or Chase)
                if (currentGhostMode === GHOST_MODE_SCATTER) {
                    const scatterTarget = this.getScatterTarget();
                    targetX = scatterTarget.x;
                    targetY = scatterTarget.y;
                } else {
                    const chaseTarget = this.getChaseTarget();
                    targetX = chaseTarget.x;
                    targetY = chaseTarget.y;
                }
            }

            this.chooseBestDir(targetX, targetY);
        }

        if (this.inHouse) {
            // Bob up and down?
            return;
        }

        this.move();
    }

    move() {
        if (this.dir === 0) this.y -= this.speed;
        if (this.dir === 1) this.x += this.speed;
        if (this.dir === 2) this.y += this.speed;
        if (this.dir === 3) this.x -= this.speed;

        // Screen wrapping (horizontal)
        if (this.x > canvas.width) this.x = -TILE_SIZE;
        if (this.x < -TILE_SIZE) this.x = canvas.width;

        // CRITICAL: Clamp vertical position to playable area (prevent escape)
        const minY = 3 * TILE_SIZE; // Top of maze (row 3)
        const maxY = 24 * TILE_SIZE; // Bottom of maze (row 24)
        this.y = Math.max(minY, Math.min(this.y, maxY)); // Force within bounds
    }

    getScatterTarget() {
        // Targets are outside the map corners
        if (this.personality === 'blinky') return { x: COLS * TILE_SIZE - TILE_SIZE * 2, y: -TILE_SIZE * 2 }; // Top Right
        if (this.personality === 'pinky') return { x: TILE_SIZE * 2, y: -TILE_SIZE * 2 }; // Top Left
        if (this.personality === 'inky') return { x: COLS * TILE_SIZE, y: ROWS * TILE_SIZE }; // Bottom Right
        if (this.personality === 'clyde') return { x: 0, y: ROWS * TILE_SIZE }; // Bottom Left
        return { x: 0, y: 0 };
    }

    getChaseTarget() {
        if (this.personality === 'blinky') {
            // Blinky: Direct chase
            return { x: pacman.x, y: pacman.y };
        } else if (this.personality === 'pinky') {
            // Pinky: 4 tiles ahead of Pacman
            let tx = pacman.x;
            let ty = pacman.y;
            if (pacman.dir === 0) ty -= 4 * TILE_SIZE;
            if (pacman.dir === 1) tx += 4 * TILE_SIZE;
            if (pacman.dir === 2) ty += 4 * TILE_SIZE;
            if (pacman.dir === 3) tx -= 4 * TILE_SIZE;
            return { x: tx, y: ty };
        } else if (this.personality === 'inky') {
            // Inky: Vector from Blinky to 2 tiles ahead of Pacman, doubled
            let px = pacman.x;
            let py = pacman.y;
            if (pacman.dir === 0) py -= 2 * TILE_SIZE;
            if (pacman.dir === 1) px += 2 * TILE_SIZE;
            if (pacman.dir === 2) py += 2 * TILE_SIZE;
            if (pacman.dir === 3) px -= 2 * TILE_SIZE;

            const blinky = ghosts.find(g => g.personality === 'blinky');
            if (!blinky) return { x: pacman.x, y: pacman.y }; // Fallback

            const vectorX = px - blinky.x;
            const vectorY = py - blinky.y;

            return { x: blinky.x + vectorX * 2, y: blinky.y + vectorY * 2 };
        } else if (this.personality === 'clyde') {
            // Clyde: Chase if > 8 tiles away, else Scatter (Bottom Left)
            const dist = Math.sqrt((this.x - pacman.x) ** 2 + (this.y - pacman.y) ** 2);
            if (dist > 8 * TILE_SIZE) {
                return { x: pacman.x, y: pacman.y };
            } else {
                return { x: 0, y: ROWS * TILE_SIZE };
            }
        }
        return { x: pacman.x, y: pacman.y };
    }

    chooseBestDir(targetX, targetY) {
        const possibleDirs = [];
        for (let i = 0; i < 4; i++) {
            if (i === (this.dir + 2) % 4) continue;
            if (this.canMove(i)) possibleDirs.push(i);
        }

        if (possibleDirs.length === 0) {
            this.dir = (this.dir + 2) % 4;
            return;
        }

        let bestDir = possibleDirs[0];
        let minDst = Infinity;

        possibleDirs.forEach(d => {
            let nx = this.x;
            let ny = this.y;
            if (d === 0) ny -= TILE_SIZE;
            if (d === 1) nx += TILE_SIZE;
            if (d === 2) ny += TILE_SIZE;
            if (d === 3) nx -= TILE_SIZE;

            const dst = (nx - targetX) ** 2 + (ny - targetY) ** 2;
            if (dst < minDst) {
                minDst = dst;
                bestDir = d;
            }
        });
        this.dir = bestDir;
    }

    canMove(direction) {
        let nextX = this.x;
        let nextY = this.y;

        if (direction === 0) nextY -= TILE_SIZE;
        if (direction === 1) nextX += TILE_SIZE;
        if (direction === 2) nextY += TILE_SIZE;
        if (direction === 3) nextX -= TILE_SIZE;

        const c = Math.floor(nextX / TILE_SIZE);
        const r = Math.floor(nextY / TILE_SIZE);

        // Check bounds
        if (r < 0 || r >= ROWS) return false;
        if (c < 0 || c >= COLS) {
            // In tunnel, only allow horizontal movement
            return direction === 1 || direction === 3;
        }

        // Eyes can pass through ghost house gate
        if (this.isEyes) {
            return map[r][c] !== 1; // Not wall
        }

        // Normal ghosts cannot enter ghost house from outside
        return map[r][c] !== 1 && map[r][c] !== 4; // Not wall or ghost house
    }

    draw() {
        if (this.isEyes) {
            const x = this.x + TILE_SIZE / 2;
            const y = this.y + TILE_SIZE / 2;

            // Just Eyes
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(x - 3, y - 1, 2.5, 0, Math.PI * 2);
            ctx.arc(x + 3, y - 1, 2.5, 0, Math.PI * 2);
            ctx.fill();

            // Pupils
            ctx.fillStyle = 'blue';
            ctx.beginPath();
            let px = 0, py = 0;
            if (this.dir === 0) py = -1;
            if (this.dir === 1) px = 1;
            if (this.dir === 2) py = 1;
            if (this.dir === 3) px = -1;

            ctx.arc(x - 3 + px, y - 1 + py, 1.2, 0, Math.PI * 2);
            ctx.arc(x + 3 + px, y - 1 + py, 1.2, 0, Math.PI * 2);
            ctx.fill();
            return;
        }

        let color = this.isScared ? this.scaredColor : this.baseColor;

        // Flash white in last 3 seconds (180 frames)
        if (this.isScared && this.scaredTimer < 180) {
            if (Math.floor(this.scaredTimer / 10) % 2 === 0) {
                color = 'white';
            }
        }

        ctx.fillStyle = color;

        // Classic Ghost Shape
        const x = this.x + TILE_SIZE / 2;
        const y = this.y + TILE_SIZE / 2;
        const r = this.radius;

        ctx.beginPath();
        ctx.arc(x, y - 2, r, Math.PI, 0); // Top semicircle
        ctx.lineTo(x + r, y + r); // Right side

        // Wavy bottom (3 feet)
        ctx.lineTo(x + r * 0.33, y + r * 0.7);
        ctx.lineTo(x - r * 0.33, y + r);
        ctx.lineTo(x - r, y + r * 0.7);

        ctx.lineTo(x - r, y - 2); // Left side
        ctx.fill();

        // Eyes
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(x - 3, y - 4, 2.5, 0, Math.PI * 2);
        ctx.arc(x + 3, y - 4, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'blue';
        ctx.beginPath();

        if (this.isScared) {
            // Scared mouth (zig zag or just line)
            ctx.strokeStyle = '#ffb8ae'; // Pale color
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x - 4, y + 2);
            ctx.lineTo(x - 2, y + 4);
            ctx.lineTo(x, y + 2);
            ctx.lineTo(x + 2, y + 4);
            ctx.lineTo(x + 4, y + 2);
            ctx.stroke();
        } else {
            // Pupils follow direction
            let px = 0, py = 0;
            if (this.dir === 0) py = -1;
            if (this.dir === 1) px = 1;
            if (this.dir === 2) py = 1;
            if (this.dir === 3) px = -1;

            ctx.arc(x - 3 + px, y - 4 + py, 1.2, 0, Math.PI * 2);
            ctx.arc(x + 3 + px, y - 4 + py, 1.2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// Sound Manager
class SoundManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.3; // Lower volume
        this.masterGain.connect(this.ctx.destination);

        this.osc = null;
        this.lfo = null;
        this.currentSound = null; // 'siren_low', 'siren_mid', 'siren_high', 'scared', 'eyes'
        this.lastWaka = 0;
    }

    playTone(freq, type, duration, vol = 0.1) {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playWaka() {
        const now = Date.now();
        if (now - this.lastWaka < 150) return; // Cooldown
        this.lastWaka = now;

        if (this.ctx.state === 'suspended') this.ctx.resume();

        // Tone 1: Low to High
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc1.frequency.linearRampToValueAtTime(350, this.ctx.currentTime + 0.1);
        gain1.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain1.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.1);
        osc1.connect(gain1);
        gain1.connect(this.masterGain);
        osc1.start();
        osc1.stop(this.ctx.currentTime + 0.1);

        // Tone 2: High to Low (delayed)
        setTimeout(() => {
            const osc2 = this.ctx.createOscillator();
            const gain2 = this.ctx.createGain();
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(350, this.ctx.currentTime);
            osc2.frequency.linearRampToValueAtTime(150, this.ctx.currentTime + 0.1);
            gain2.gain.setValueAtTime(0.1, this.ctx.currentTime);
            gain2.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.1);
            osc2.connect(gain2);
            gain2.connect(this.masterGain);
            osc2.start();
            osc2.stop(this.ctx.currentTime + 0.1);
        }, 150);
    }

    playEatPower() {
        this.playTone(600, 'sine', 0.3, 0.2);
    }

    playEatGhost(count) {
        // Pitch shift based on count (1st=800, 2nd=1000, 3rd=1200, 4th=1400)
        const baseFreq = 800 + (count - 1) * 200;
        this.playTone(baseFreq, 'square', 0.1, 0.2);
        setTimeout(() => this.playTone(baseFreq * 1.5, 'square', 0.1, 0.2), 100);
    }

    playFruit() {
        // Bright chime
        this.playTone(1000, 'sine', 0.1, 0.2);
        setTimeout(() => this.playTone(1500, 'sine', 0.2, 0.2), 100);
    }

    playExtraLife() {
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C E G C
        notes.forEach((note, i) => {
            setTimeout(() => this.playTone(note, 'sine', 0.2, 0.2), i * 150);
        });
    }

    playDie() {
        this.stopLoop();
        for (let i = 0; i < 12; i++) {
            setTimeout(() => this.playTone(500 - i * 40, 'sawtooth', 0.1, 0.2), i * 100);
        }
    }

    playLevelComplete() {
        this.stopLoop();
        const notes = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50];
        notes.forEach((note, i) => {
            setTimeout(() => this.playTone(note, 'square', 0.2, 0.2), i * 200);
        });
    }

    playIntro() {
        const notes = [
            493.88, 987.77, 739.99, 622.25, 987.77, 739.99, 622.25,
            493.88, 987.77, 739.99, 622.25, 987.77, 739.99, 622.25,
            493.88
        ];
        notes.forEach((note, i) => {
            setTimeout(() => this.playTone(note, 'square', 0.15, 0.15), i * 150);
        });
    }

    startLoop(type, urgency = 0) {
        if (this.currentSound === type && this.currentUrgency === urgency) return;
        this.stopLoop();
        this.currentSound = type;
        this.currentUrgency = urgency;

        if (this.ctx.state === 'suspended') this.ctx.resume();

        this.osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        this.lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();

        if (type.startsWith('siren')) {
            this.osc.type = 'triangle';
            // Base freq: Low=300, Mid=350, High=400
            let baseFreq = 300;
            if (type === 'siren_mid') baseFreq = 350;
            if (type === 'siren_high') baseFreq = 400;

            this.osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);

            // LFO for siren warble
            this.lfo.type = 'sine';
            this.lfo.frequency.value = 2 + (urgency * 0.5); // Faster warble with urgency
            lfoGain.gain.value = 30;

            this.lfo.connect(lfoGain);
            lfoGain.connect(this.osc.frequency);
            this.lfo.start();
            gain.gain.value = 0.1;

        } else if (type === 'scared') {
            this.osc.type = 'square'; // More buzzy for scared
            this.osc.frequency.value = 400;

            this.lfo.type = 'sawtooth';
            this.lfo.frequency.value = 4 + (urgency * 2); // Speed up when close to ending
            lfoGain.gain.value = 50;

            this.lfo.connect(lfoGain);
            lfoGain.connect(this.osc.frequency);
            this.lfo.start();
            gain.gain.value = 0.08;

        } else if (type === 'eyes') {
            this.osc.type = 'triangle';
            this.osc.frequency.value = 800;

            this.lfo.type = 'sawtooth';
            this.lfo.frequency.value = 10;
            lfoGain.gain.value = 100;

            this.lfo.connect(lfoGain);
            lfoGain.connect(this.osc.frequency);
            this.lfo.start();
            gain.gain.value = 0.1;
        }

        this.osc.connect(gain);
        gain.connect(this.masterGain);
        this.osc.start();
    }

    stopLoop() {
        if (this.osc) {
            this.osc.stop();
            this.osc.disconnect();
            this.osc = null;
        }
        if (this.lfo) {
            this.lfo.stop();
            this.lfo.disconnect();
            this.lfo = null;
        }
        this.currentSound = null;
        this.currentUrgency = 0;
    }
}

const soundManager = new SoundManager();

const startX = 10 * TILE_SIZE;
const startY = 19 * TILE_SIZE; // +3 rows (Row 19)

const pacman = new Pacman(startX, startY);

const ghosts = [
    new Ghost(9.5 * TILE_SIZE, 11 * TILE_SIZE, 'red', 'blinky'), // Blinky
    new Ghost(9.5 * TILE_SIZE, 13 * TILE_SIZE, 'pink', 'pinky'), // Pinky
    new Ghost(8 * TILE_SIZE, 13 * TILE_SIZE, 'cyan', 'inky'), // Inky
    new Ghost(11 * TILE_SIZE, 13 * TILE_SIZE, 'orange', 'clyde') // Clyde
];

// Fruit / Bonus Item Configuration
const FRUIT_TABLE = [
    { type: 'cherry', score: 100, color: '#ff0000', symbol: 'cherry' },      // Level 1
    { type: 'strawberry', score: 300, color: '#ff0000', symbol: 'strawberry' }, // Level 2
    { type: 'orange', score: 500, color: '#ffa500', symbol: 'orange' },      // Level 3-4
    { type: 'orange', score: 500, color: '#ffa500', symbol: 'orange' },
    { type: 'apple', score: 700, color: '#ff0000', symbol: 'apple' },        // Level 5-6
    { type: 'apple', score: 700, color: '#ff0000', symbol: 'apple' },
    { type: 'melon', score: 1000, color: '#00ff00', symbol: 'melon' },       // Level 7-8
    { type: 'melon', score: 1000, color: '#00ff00', symbol: 'melon' },
    { type: 'galaxian', score: 2000, color: '#ffff00', symbol: 'galaxian' }, // Level 9-10
    { type: 'galaxian', score: 2000, color: '#ffff00', symbol: 'galaxian' },
    { type: 'bell', score: 3000, color: '#ffff00', symbol: 'bell' },         // Level 11-12
    { type: 'bell', score: 3000, color: '#ffff00', symbol: 'bell' },
    { type: 'key', score: 5000, color: '#00ffff', symbol: 'key' }            // Level 13+
];

function getFruitForLevel(lvl) {
    if (lvl <= 0) return FRUIT_TABLE[0];
    if (lvl > FRUIT_TABLE.length) return FRUIT_TABLE[FRUIT_TABLE.length - 1];
    return FRUIT_TABLE[lvl - 1];
}

const bonusItem = { x: 9.5 * TILE_SIZE, y: 15 * TILE_SIZE, active: false, timer: 0 };
// Replaces 'cherry' object

let gameScore = 0;
let highScore = localStorage.getItem('pacman_highscore') || 0;
let lives = 3;
let level = 1;
let totalPellets = 0;
let fruitCollected = false;
let extraLifeAwarded = false;

// Count pellets
function countPellets() {
    totalPellets = 0;
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (map[r][c] === 2 || map[r][c] === 3) totalPellets++;
        }
    }
}
countPellets();

let gameState = 'START'; // START, READY, PLAY, GAMEOVER, LEVEL_TRANSITION, INTERMISSION
let readyTimer = 0;
let transitionTimer = 0;
let intermissionTimer = 0;
let intermissionX = -50; // Animation position
let globalFlashTimer = 0;


// Ghost AI Globals
const GHOST_MODE_SCATTER = 0;
const GHOST_MODE_CHASE = 1;
let currentGhostMode = GHOST_MODE_SCATTER;
let ghostModeTimer = 0;
let modeIndex = 0;
// Classic Level 1 Schedule: Scatter 7s, Chase 20s, Scatter 7s, Chase 20s, Scatter 5s, Chase 20s, Scatter 5s, Chase Forever
const level1Schedule = [
    { mode: GHOST_MODE_SCATTER, duration: 420 }, // 7s * 60fps
    { mode: GHOST_MODE_CHASE, duration: 1200 }, // 20s
    { mode: GHOST_MODE_SCATTER, duration: 420 },
    { mode: GHOST_MODE_CHASE, duration: 1200 },
    { mode: GHOST_MODE_SCATTER, duration: 300 }, // 5s
    { mode: GHOST_MODE_CHASE, duration: 1200 },
    { mode: GHOST_MODE_SCATTER, duration: 300 },
    { mode: GHOST_MODE_CHASE, duration: Infinity }
];

const level5Schedule = [
    { mode: GHOST_MODE_SCATTER, duration: 300 },
    { mode: GHOST_MODE_CHASE, duration: 1200 },
    { mode: GHOST_MODE_SCATTER, duration: 300 },
    { mode: GHOST_MODE_CHASE, duration: 1200 },
    { mode: GHOST_MODE_SCATTER, duration: 300 },
    { mode: GHOST_MODE_CHASE, duration: 61980 }, // Approx 17 min (effectively forever)
    { mode: GHOST_MODE_SCATTER, duration: 1 }, // Short blip
    { mode: GHOST_MODE_CHASE, duration: Infinity }
];

// Level Configuration
// Note: Speeds must be divisors of TILE_SIZE (24) to ensure grid alignment: 1, 2, 3, 4, 6, 8.
const LEVEL_CONFIG = [
    { level: 1, ghostSpeed: 2, pacSpeed: 2, ghostTunnelSpeed: 1, pacFrightSpeed: 2, frightTime: 360, elroy1Dots: 20, elroy2Dots: 10, elroy1Speed: 2, elroy2Speed: 3 },
    { level: 2, ghostSpeed: 3, pacSpeed: 3, ghostTunnelSpeed: 1, pacFrightSpeed: 3, frightTime: 300, elroy1Dots: 30, elroy2Dots: 15, elroy1Speed: 3, elroy2Speed: 4 },
    { level: 5, ghostSpeed: 3, pacSpeed: 3, ghostTunnelSpeed: 2, pacFrightSpeed: 3, frightTime: 120, elroy1Dots: 40, elroy2Dots: 20, elroy1Speed: 4, elroy2Speed: 4 },
    { level: 21, ghostSpeed: 4, pacSpeed: 3, ghostTunnelSpeed: 2, pacFrightSpeed: 3, frightTime: 0, elroy1Dots: 120, elroy2Dots: 60, elroy1Speed: 4, elroy2Speed: 4 }
];

function getLevelData(lvl) {
    for (let i = LEVEL_CONFIG.length - 1; i >= 0; i--) {
        if (lvl >= LEVEL_CONFIG[i].level) return LEVEL_CONFIG[i];
    }
    return LEVEL_CONFIG[0];
}

// Ghost House Logic
let globalDotCounter = 0;
let globalDotLimit = 0; // 0=Inactive, 7=Pinky, 17=Inky, 32=Clyde (Classic values after life loss)
let useGlobalCounter = false;

// Individual limits for Level 1: Pinky=0, Inky=30, Clyde=60
// Limits change per level, but we'll stick to a simplified classic model for now
const ghostDotLimits = {
    'pinky': 0,
    'inky': 30,
    'clyde': 60
};


let wallColor = '#1919A6'; // Classic Blue
let wallStrokeColor = '#1919A6'; // Classic Blue

document.addEventListener('keydown', (e) => {
    if (e.key === 'c' || e.key === 'C') {
        if (wallColor === '#1919A6') {
            wallColor = '#FF69B4'; // Hot Pink
            wallStrokeColor = '#FF69B4';
        } else {
            wallColor = '#1919A6';
            wallStrokeColor = '#1919A6';
        }
        // Sync CSS border
        canvas.style.borderColor = wallColor;
        canvas.style.boxShadow = `0 0 15px ${wallColor}`;
        return;
    }

    if (gameState === 'START' || gameState === 'GAMEOVER') {
        if (gameState === 'GAMEOVER') {
            resetGame();
            gameState = 'READY';
            readyTimer = 60;
            soundManager.playIntro();
            cancelAnimationFrame(gameLoopId); // Stop old loop
            gameLoop(); // Restart the loop!
            return;
        }
        gameState = 'READY';
        readyTimer = 60;
        soundManager.playIntro();
        return;
    }

    if (gameState === 'PLAY' || gameState === 'READY') {
        if (e.key === 'ArrowUp') pacman.nextDir = 0;
        if (e.key === 'ArrowRight') pacman.nextDir = 1;
        if (e.key === 'ArrowDown') pacman.nextDir = 2;
        if (e.key === 'ArrowLeft') pacman.nextDir = 3;
    }
});

function resetLevel() {
    map = JSON.parse(JSON.stringify(initialMapLayout));
    countPellets();
    pacman.x = startX;
    pacman.y = startY;
    pacman.dir = 4;
    pacman.nextDir = 4;

    ghosts[0].x = 9.5 * TILE_SIZE; ghosts[0].y = 11 * TILE_SIZE;
    ghosts[1].x = 9.5 * TILE_SIZE; ghosts[1].y = 13 * TILE_SIZE;
    ghosts[2].x = 8 * TILE_SIZE; ghosts[2].y = 13 * TILE_SIZE;
    ghosts[3].x = 11 * TILE_SIZE; ghosts[3].y = 13 * TILE_SIZE;

    ghosts.forEach(g => {
        g.dir = 1;
        g.speed = 1;
        g.isScared = false;
        g.isEyes = false;
    });

    readyTimer = 60;
    bonusItem.active = false;
    fruitCollected = false;

    // Reset Ghost AI
    currentGhostMode = GHOST_MODE_SCATTER;
    ghostModeTimer = 0;
    modeIndex = 0;

    // Reset Dot Counters
    globalDotCounter = 0;
    useGlobalCounter = true; // Enable global counter after death/level start until a ghost exits? 
    // Actually classic rules: Global counter is used after a life is lost.
    // At level start, we use individual counters.
    if (gameState === 'LEVEL_TRANSITION' || totalPellets === 244) {
        useGlobalCounter = false;
    } else {
        useGlobalCounter = true;
    }

    // Reset Ghost House State
    ghosts.forEach(g => {
        g.dotCounter = 0;
        g.inHouse = true;
        // Blinky starts outside
        if (g.personality === 'blinky') g.inHouse = false;
    });

    // Apply Level Config
    const lvlData = getLevelData(level);
    pacman.speed = lvlData.pacSpeed;
    ghosts.forEach(g => {
        g.baseSpeed = lvlData.ghostSpeed;
        g.speed = g.baseSpeed;
    });
}

function checkGhostRelease() {
    const lvlData = getLevelData(level);

    // Global Counter Logic (After Death)
    if (useGlobalCounter) {
        if (globalDotCounter >= 7 && ghosts[1].inHouse) { // Pinky
            releaseGhost(ghosts[1]);
        }
        if (globalDotCounter >= 17 && ghosts[2].inHouse) { // Inky
            releaseGhost(ghosts[2]);
        }
        if (globalDotCounter >= 32 && ghosts[3].inHouse) { // Clyde
            releaseGhost(ghosts[3]);
            useGlobalCounter = false; // Disable after Clyde
        }
        return;
    }

    // Individual Counter Logic
    // Only the first ghost in the house gets dots
    let preferredGhost = null;
    if (ghosts[1].inHouse) preferredGhost = ghosts[1];
    else if (ghosts[2].inHouse) preferredGhost = ghosts[2];
    else if (ghosts[3].inHouse) preferredGhost = ghosts[3];

    if (preferredGhost) {
        let limit = ghostDotLimits[preferredGhost.personality];
        // Level scaling for limits could go here (e.g. Inky/Clyde limits change)
        if (preferredGhost.dotCounter >= limit) {
            releaseGhost(preferredGhost);
        }
    }
}

function releaseGhost(ghost) {
    if (!ghost.inHouse) return;
    ghost.inHouse = false;
    ghost.x = 9.5 * TILE_SIZE; // Center X
    ghost.y = 11 * TILE_SIZE;  // Outside Y
    ghost.dir = 3; // Left (standard exit dir)
    // Reset speed just in case
    const lvlData = getLevelData(level);
    ghost.speed = lvlData.ghostSpeed;
}

function resetGame() {
    gameScore = 0;
    lives = 3;
    level = 1;
    extraLifeAwarded = false;
    resetLevel();
}

function drawUI() {
    // Lives (Bottom Left)
    for (let i = 0; i < lives; i++) {
        const x = 20 + i * 25;
        const y = ROWS * TILE_SIZE - 10; // In footer

        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(x, y, 8, 0.2 * Math.PI, 1.8 * Math.PI);
        ctx.lineTo(x, y);
        ctx.fill();
    }

    // Level (Fruits) at bottom right - Show completed levels only
    const completedLevels = level - 1; // Current level not yet complete
    const startLvl = Math.max(1, completedLevels - 6);
    for (let i = 0; i < 7; i++) {
        const lvl = startLvl + i;
        if (lvl > completedLevels) break; // Only show completed levels

        const fruit = getFruitForLevel(lvl);
        const x = canvas.width - 20 - (completedLevels - lvl) * 25;
        const y = ROWS * TILE_SIZE - 10; // In footer

        drawFruit(fruit, x - TILE_SIZE / 2, y - TILE_SIZE / 2);
    }
}

let gameLoopId;

function gameLoop() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw HUD
    ctx.fillStyle = 'white';
    ctx.font = '12px "Press Start 2P"'; // Classic Font

    // High Score (Centered)
    ctx.textAlign = 'center';
    ctx.fillText('HIGH SCORE', canvas.width / 2, 20);
    ctx.fillText(highScore, canvas.width / 2, 35);

    // Current Score (Left)
    ctx.textAlign = 'left';
    ctx.fillText('SCORE', 10, 20); // Label
    ctx.fillText(gameScore, 10, 35); // Value

    if (gameScore > highScore) {
        highScore = gameScore;
        localStorage.setItem('pacman_highscore', highScore);
    }

    // Extra Life at 10000
    if (gameScore >= 10000 && !extraLifeAwarded) {
        lives++;
        extraLifeAwarded = true;
        soundManager.playExtraLife();
    }

    // Sound Loop Logic
    if (gameState === 'PLAY') {
        // Ghost Mode Logic
        ghostModeTimer++;
        const currentSchedule = level1Schedule[modeIndex];
        if (currentSchedule && ghostModeTimer >= currentSchedule.duration) {
            modeIndex++;
            if (modeIndex < level1Schedule.length) {
                currentGhostMode = level1Schedule[modeIndex].mode;
                ghostModeTimer = 0;
                // Reverse all ghosts on mode switch (classic behavior)
                ghosts.forEach(g => {
                    if (!g.isScared && !g.isEyes) {
                        g.dir = (g.dir + 2) % 4;
                    }
                });
                console.log('Switched Ghost Mode to:', currentGhostMode === GHOST_MODE_SCATTER ? 'SCATTER' : 'CHASE');
            }
        }

        let anyEyes = ghosts.some(g => g.isEyes);
        let anyScared = ghosts.some(g => g.isScared);

        if (anyEyes) {
            soundManager.startLoop('eyes');
        } else if (anyScared) {
            // Calculate urgency based on remaining time of the first scared ghost found
            const scaredGhost = ghosts.find(g => g.isScared);
            const urgency = (scaredGhost && scaredGhost.scaredTimer < 180) ? 1 : 0; // < 3 seconds
            soundManager.startLoop('scared', urgency);
        } else {
            // Siren based on pellets remaining
            const pelletRatio = totalPellets / 244; // Approx max pellets
            let sirenType = 'siren_low';
            if (pelletRatio < 0.2) sirenType = 'siren_high';
            else if (pelletRatio < 0.5) sirenType = 'siren_mid';

            soundManager.startLoop(sirenType);
        }
    } else {
        soundManager.stopLoop();
    }

    if (gameState === 'START') {
        drawMap();
        ctx.fillStyle = 'rgba(0,0,0,0.3)'; // Lighter overlay
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'yellow';
        ctx.font = '20px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('PAC-MAN', canvas.width / 2, canvas.height / 2 - 40);

        ctx.fillStyle = 'white';
        ctx.font = '10px "Press Start 2P"';
        ctx.fillText('PRESS ANY KEY', canvas.width / 2, canvas.height / 2 + 30);
        ctx.fillText('PRESS C TO TOGGLE COLOR', canvas.width / 2, canvas.height / 2 + 60);

        gameLoopId = requestAnimationFrame(gameLoop);
        return;
    }

    if (gameState === 'READY') {
        drawMap();
        pacman.draw();
        ghosts.forEach(g => g.draw());
        drawUI();

        ctx.fillStyle = 'yellow';
        ctx.font = '15px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('READY!', canvas.width / 2, canvas.height / 2 + 25);

        readyTimer--;
        if (readyTimer <= 0) {
            gameState = 'PLAY';
        }

        gameLoopId = requestAnimationFrame(gameLoop);
        return;
    }

    if (gameState === 'GAMEOVER') {
        drawMap();
        drawUI();
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'red';
        ctx.font = '20px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);

        ctx.fillStyle = 'white';
        ctx.font = '10px "Press Start 2P"';
        ctx.fillText('PRESS KEY TO RETRY', canvas.width / 2, canvas.height / 2 + 40);
        return;
    }

    if (gameState === 'LEVEL_TRANSITION') {
        // Flash map
        transitionTimer--;
        let flash = null;
        if (Math.floor(transitionTimer / 10) % 2 === 0) {
            flash = 'white';
        } else {
            flash = 'blue';
        }
        drawMap(flash);
        drawUI();

        if (transitionTimer <= 0) {
            level++;

            // Check if we should show intermission (after levels 2, 5, 9, 13, etc.)
            if (level === 3 || level === 6 || level === 10 || level === 14) {
                gameState = 'INTERMISSION';
                intermissionTimer = 180; // 3 seconds
                intermissionX = -50;
            } else {
                resetLevel();
                gameState = 'READY'; // Return to ready state for next level
            }
        }
        gameLoopId = requestAnimationFrame(gameLoop);
        return;
    }

    if (gameState === 'INTERMISSION') {
        // Black background
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Animate Pac-Man chasing ghost from left to right
        intermissionTimer--;
        intermissionX += 3; // Move speed

        // Draw ghost being chased (Blinky)
        const ghostX = intermissionX + 60;
        const ghostY = canvas.height / 2;

        // Draw frightened ghost
        ctx.fillStyle = '#0000ff'; // Blue frightened ghost
        ctx.beginPath();
        ctx.arc(ghostX, ghostY - 2, 8, Math.PI, 0);
        ctx.lineTo(ghostX + 8, ghostY + 6);
        ctx.lineTo(ghostX + 4, ghostY + 4);
        ctx.lineTo(ghostX, ghostY + 6);
        ctx.lineTo(ghostX - 4, ghostY + 4);
        ctx.lineTo(ghostX - 8, ghostY + 6);
        ctx.lineTo(ghostX - 8, ghostY - 2);
        ctx.fill();

        // Draw Pac-Man chasing
        const pacX = intermissionX;
        const pacY = canvas.height / 2;

        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        const mouthAnim = Math.sin(intermissionX / 5) * 0.3; // Chomping animation
        ctx.arc(pacX, pacY, 10, mouthAnim, 2 * Math.PI - mouthAnim);
        ctx.lineTo(pacX, pacY);
        ctx.fill();

        // End intermission when animation completes
        if (intermissionTimer <= 0 || intermissionX > canvas.width + 100) {
            resetLevel();
            gameState = 'READY';
        }

        gameLoopId = requestAnimationFrame(gameLoop);
        return;
    }

    drawMap();

    pacman.update();
    pacman.draw();

    // Check Pellet Collision
    const c = Math.floor((pacman.x + TILE_SIZE / 2) / TILE_SIZE);
    const r = Math.floor((pacman.y + TILE_SIZE / 2) / TILE_SIZE);

    if (map[r][c] === 2) {
        map[r][c] = 0;
        gameScore += 10;
        totalPellets--;
        pacman.eatPellet(); // Trigger mouth close
        soundManager.playWaka();

        // Update Dot Counters
        if (useGlobalCounter) {
            globalDotCounter++;
        } else {
            // Increment for the preferred ghost in house
            if (ghosts[1].inHouse) ghosts[1].dotCounter++;
            else if (ghosts[2].inHouse) ghosts[2].dotCounter++;
            else if (ghosts[3].inHouse) ghosts[3].dotCounter++;
        }
        checkGhostRelease();

    } else if (map[r][c] === 3) {
        map[r][c] = 0;
        gameScore += 50;
        totalPellets--;
        pacman.eatPellet(); // Trigger mouth close
        soundManager.playEatPower();

        // Update Dot Counters (Power pellets count as dots too)
        if (useGlobalCounter) {
            globalDotCounter++;
        } else {
            if (ghosts[1].inHouse) ghosts[1].dotCounter++;
            else if (ghosts[2].inHouse) ghosts[2].dotCounter++;
            else if (ghosts[3].inHouse) ghosts[3].dotCounter++;
        }
        checkGhostRelease();

        // Activate Power Mode
        const lvlData = getLevelData(level);
        ghosts.forEach(g => g.startScared(lvlData.frightTime));
    }

    // Update Timers
    globalFlashTimer++;

    // Bonus Item Logic
    if (!bonusItem.active && totalPellets < 174 && totalPellets > 74 && !fruitCollected) {
        // Spawn 1st fruit (70 pellets eaten approx)
        bonusItem.active = true;
        bonusItem.timer = 600; // 10 seconds
    } else if (!bonusItem.active && totalPellets < 74 && fruitCollected) {
        // Spawn 2nd fruit (170 pellets eaten approx)
        if (Math.random() < 0.001) {
            bonusItem.active = true;
            bonusItem.timer = 600;
        }
    }

    if (bonusItem.active) {
        bonusItem.timer--;
        if (bonusItem.timer <= 0) {
            bonusItem.active = false;
        }

        const dx = pacman.x - bonusItem.x;
        const dy = pacman.y - bonusItem.y;
        if (Math.sqrt(dx * dx + dy * dy) < TILE_SIZE) {
            bonusItem.active = false;
            fruitCollected = true;
            const currentFruit = getFruitForLevel(level);
            gameScore += currentFruit.score;
            soundManager.playFruit();
        }
    }

    if (totalPellets === 0 && gameState === 'PLAY') {
        gameState = 'LEVEL_TRANSITION';
        transitionTimer = 120; // 2 seconds
        soundManager.playLevelComplete();
    }

    // Track ghosts eaten in this power mode
    let ghostsEatenCount = 0;

    ghosts.forEach(ghost => {
        ghost.update();
        ghost.draw();

        // Check Ghost Collision
        const dx = pacman.x - ghost.x;
        const dy = pacman.y - ghost.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < TILE_SIZE - 5) {
            if (ghost.isScared) {
                // Eat Ghost
                ghostsEatenCount++;
                // Calculate score multiplier logic if needed, for now just simple
                // Ideally we track how many ghosts eaten since last power pellet
                gameScore += 200;
                soundManager.playEatGhost(ghostsEatenCount); // Pass count for pitch shift
                // Become Eyes
                ghost.becomeEyes();
            } else if (!ghost.isEyes) {
                // Die
                lives--;
                soundManager.playDie();
                if (lives <= 0) {
                    gameState = 'GAMEOVER';
                } else {
                    // Reset positions
                    pacman.x = startX;
                    pacman.y = startY;
                    pacman.dir = 4;
                    pacman.nextDir = 4;

                    // Reset ghosts with FULL state reset
                    ghosts[0].x = 9.5 * TILE_SIZE;
                    ghosts[0].y = 11 * TILE_SIZE;
                    ghosts[0].dir = 1; // Right
                    ghosts[0].isScared = false;
                    ghosts[0].isEyes = false;
                    ghosts[0].speed = 1;

                    ghosts[1].x = 9.5 * TILE_SIZE;
                    ghosts[1].y = 13 * TILE_SIZE;
                    ghosts[1].dir = 1;
                    ghosts[1].isScared = false;
                    ghosts[1].isEyes = false;
                    ghosts[1].speed = 1;

                    ghosts[2].x = 8 * TILE_SIZE;
                    ghosts[2].y = 13 * TILE_SIZE;
                    ghosts[2].dir = 1;
                    ghosts[2].isScared = false;
                    ghosts[2].isEyes = false;
                    ghosts[2].speed = 1;

                    ghosts[3].x = 11 * TILE_SIZE;
                    ghosts[3].y = 13 * TILE_SIZE;
                    ghosts[3].dir = 1;
                    ghosts[3].isScared = false;
                    ghosts[3].isEyes = false;
                    ghosts[3].speed = 1;
                }
            }
        }
    });

    drawUI();

    gameLoopId = requestAnimationFrame(gameLoop);
}

// Start Screen Logic
const startScreen = document.getElementById('startScreen');
startScreen.addEventListener('click', () => {
    startScreen.classList.add('hidden');

    // Resume Audio Context if suspended (browser policy)
    if (soundManager.ctx.state === 'suspended') {
        soundManager.ctx.resume();
    }

    // Start Game Loop if not already running
    if (!gameLoopId) {
        gameLoop();
    }
});

// Input Handling
document.addEventListener('keydown', (e) => {
    if (gameState === 'START' || gameState === 'GAMEOVER') {
        if (gameState === 'GAMEOVER') {
            resetGame();
        }
        gameState = 'READY';
        readyTimer = 120; // 2 seconds
        soundManager.playIntro();
        return;
    }

    if (gameState === 'PLAY') {
        switch (e.key) {
            case 'ArrowUp':
                pacman.nextDir = 0;
                break;
            case 'ArrowDown':
                pacman.nextDir = 2;
                break;
            case 'ArrowLeft':
                pacman.nextDir = 3;
                break;
            case 'ArrowRight':
                pacman.nextDir = 1;
                break;
        }
    }
});

// Initial Draw (Static)
drawMap();
drawUI();
