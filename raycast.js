const TILE_SIZE = 32;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;

const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;

const FOV_ANGLE = 60 * (Math.PI / 180);

const WALL_STRIP_WIDTH = 30;
const NUM_RAYS = WINDOW_WIDTH / WALL_STRIP_WIDTH;

class Map {
    constructor() {
        this.grid = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ];
    }
    hasWallAt(x, y) {
        if (x < 0 || x > WINDOW_WIDTH || y < 0 || y > WINDOW_HEIGHT) {
            return true;
        }

        let mapGridIndexX = Math.floor(x / TILE_SIZE);
        let mapGridIndexY = Math.floor(y / TILE_SIZE);

        return this.grid[mapGridIndexY][mapGridIndexX];
    }
    render() {
        for (let i = 0; i < MAP_NUM_ROWS; i++) {
            for (let j = 0; j < MAP_NUM_COLS; j++) {
                let tileX = j * TILE_SIZE;
                let tileY = i * TILE_SIZE;
                let tileColor = this.grid[i][j] == 1 ? "#222" : "#fff";

                stroke("#222");
                fill(tileColor);
                rect(tileX, tileY, TILE_SIZE, TILE_SIZE);
            }
        }
    }
}

class Player {
    constructor() {
        this.x = WINDOW_WIDTH / 2;
        this.y = WINDOW_HEIGHT / 2;
        this.radius = 3;
        this.turnDirection = 0; // -1 if left, +1 if right
        this.walkDirection = 0; // -1 if back, +1 if front
        this.rotationAngle = Math.PI / 2;
        this.moveSpeed = 2.0;
        this.rotationSpeed = 2 * (Math.PI / 180);
    }
    update() {
        // TODO: update player position based on turnDirection and walkDirection
        // console.log(this.turnDirection);
        this.rotationAngle += this.turnDirection * this.rotationSpeed;

        let moveStep = this.walkDirection * this.moveSpeed;

        let newPlayerX = this.x + Math.cos(this.rotationAngle) * moveStep;
        let newPlayerY = this.y + Math.sin(this.rotationAngle) * moveStep;

        if (!grid.hasWallAt(newPlayerX, newPlayerY)) {
            this.x = newPlayerX;
            this.y = newPlayerY;
        }
    }
    render() {
        noStroke();
        fill("red");
        circle(this.x, this.y, this.radius);
        // stroke("red");
        // line(
        //     this.x, 
        //     this.y,
        //     this.x + Math.cos(this.rotationAngle) * 20,
        //     this.y + Math.sin(this.rotationAngle) * 20
        //     );
    }
}

class Ray {
    constructor(rayAngle) {
        this.rayAngle = normalizeAngle(rayAngle);
        this.wallHitX = 0;
        this.wallHitY = 0;
        this.distance = 0;

        this.isRayFacingDown = this.rayAngle > 0 && this.rayAngle < Math.PI;
        this.isRayFacingUp = !this.isRayFacingDown;

        this.isRayFacingRight = this.rayAngle < 0.5 * Math.PI || this.rayAngle > 1.5 * Math.PI;
        this.isRayFacingLeft = !this.isRayFacingRight;
    }
    cast(columnId) {
        let xintercept, yintercept;
        let xstep, ystep;

        let foundHorzWallHit = false;
        let wallHitX = 0;
        let wallHitY = 0;

        console.log("isRayFacingRight?", this.isRayFacingRight);

        yintercept = Math.floor(player.y / TILE_SIZE) * TILE_SIZE;
        yintercept += this.isRayFacingDown ? TILE_SIZE : 0;

        xintercept = player.x + (yintercept - player.y) / Math.tan(this.rayAngle);

        ystep = TILE_SIZE;
        ystep *= this.isRayFacingUp ? -1 : 1;

        xstep = TILE_SIZE / Math.tan(this.rayAngle);
        xstep *= (this.isRayFacingLeft && xstep > 0) ? -1 : 1;
        xstep *= (this.isRayFacingRight && xstep <0) ? -1 : 1;

        let nextHorzTouchX = xintercept;
        let nextHorzTouchY = yintercept;

        if (this.isRayFacingUp) {
            nextHorzTouchY--;
        }

        while(nextHorzTouchY >= 0 && nextHorzTouchX <= WINDOW_WIDTH && 
            nextHorzTouchY >= 0 && nextHorzTouchY <= WINDOW_HEIGHT) {
            if (grid.hasWallAt(nextHorzTouchX, nextHorzTouchY)) {
                // WE FOUND A WALL HIT
                foundHorzWallHit = true;
                wallHitX = nextHorzTouchX;
                wallHitY = nextHorzTouchY;

                stroke("red");
                line(player.x, player.y, wallHitX, wallHitY);
                break;
            } else {
                nextHorzTouchY += xstep;
                nextHorzTouchY += ystep;
            }
        }
    }
    render() {
        stroke("rgba(255, 0, 0, 0.3)");
        line(
            player.x, 
            player.y,
            player.x + Math.cos(this.rayAngle) *  30,
            player.y + Math.sin(this.rayAngle) * 30
            );
    }
}

let grid = new Map();
let player = new Player();
let rays = [];

function keyPressed() {
    if (keyCode == UP_ARROW) {
        player.walkDirection = +1;
    } else if (keyCode == DOWN_ARROW) {
        player.walkDirection = -1;
    } else if (keyCode == RIGHT_ARROW) {
        player.turnDirection = +1;
    } else if (keyCode == LEFT_ARROW) {
        player.turnDirection = -1;
    } 
}

function keyReleased() {
    if (keyCode == UP_ARROW) {
        player.walkDirection = 0;
    } else if (keyCode == DOWN_ARROW) {
        player.walkDirection = 0;
    } else if (keyCode == RIGHT_ARROW) {
        player.turnDirection = 0;
    } else if (keyCode == LEFT_ARROW) {
        player.turnDirection = 0;
    } 
}

function castAllRays() {
    let columnId = 0;
    let rayAngle = player.rotationAngle - (FOV_ANGLE / 2);

    rays = [];
    // for (let i = 0; i < NUM_RAYS; i++) {
    for (let i = 0; i < 1; i++) {
        let ray = new Ray(rayAngle);
        ray.cast(columnId);

        rays.push(ray);

        rayAngle += FOV_ANGLE / NUM_RAYS;

        columnId++;
    }
}

function normalizeAngle(angle) {
    angle = angle % (2 * Math.PI);

    if (angle < 0) {
        angle = (2 * Math.PI) + angle;
    }

    return angle;
}

function setup() {
    // TODO: initialize all objects

    createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
}

function update() {
    // TODO: upadate all game objects before we render the next frame
    player.update();
}

function draw() {
    update();
    // TODO: render all objects frame by frame
    grid.render();

    for (ray of rays) {
        ray.render();
    }
    player.render();
    castAllRays();
}