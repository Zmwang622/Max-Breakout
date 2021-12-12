const maxAPI = require('max-api');

const DIMS = {x: 25, y: 25}; // Game board dimensions
const BALL_RADIUS = 1; // For wall bounce calculations
const PADDLE_WIDTH = 10;
const INITIAL_PLAT_POSITION = {x: 8, y: 24};
const INITIAL_BALL_POSITION = {x: 11, y: 12};

// Brick Shit
const BRICK_NUM_ROW = 4;
const BRICK_NUM_COL = 3;
const TOTAL_BLOCKS = BRICK_NUM_COL * BRICK_NUM_ROW
const BRICK_NUM_WID = 4;
const BRICK_NUM_HEIGHT = 1;
const BRICK_PADDING = 1;
const BRICK_OFFSET_TOP = 3;
const BRICK_OFFSET_LEFT = 3;

const DIRECTIONS = Object.freeze({
    NONE: "NONE",
    LEFT: "LEFT",
    RIGHT: "RIGHT"
});

const STATES = Object.freeze({
    PLAYING: "PLAYING",
    GAME_OVER: "GAME_OVER"
});

class BreakoutGame {
    constructor() {
        this.dims = Object.assign({}, DIMS);
        this.initializeGame();
    }

    initializeGame() {
        this.state = STATES.PLAYING;
        this.segments = [];
        this.blinkTimer = 0;

        for (let i = 0; i < PADDLE_WIDTH; i++) {
            this.segments.push(new PlatformSegment(INITIAL_PLAT_POSITION.x + i, INITIAL_PLAT_POSITION.y));
        }

        this.addBall();
        this.addBricks();
        maxAPI.outlet("breakoutTheme");
    }

    getPixels() {
        const pixels = ["pixels"];
        this.segments.forEach(segment => segment.draw(pixels));
        this.ball.draw(pixels);
        this.bricks.forEach(row => row.forEach(brick => brick.segments.forEach(segment => segment.draw(pixels))));
        return pixels;
    }

    addBall() {
        let x = Math.floor(24 * Math.random(24));
        this.ball = new BallSegment(x, INITIAL_BALL_POSITION.y);
    }

    addBricks(){
        this.bricks = [];
        
        for (let c = 0; c < BRICK_NUM_COL; c++) {
            let brick_row = []
            for (let r = 0; r < BRICK_NUM_ROW; r++) {
                brick_row.push(new Brick(c*(BRICK_NUM_WID + BRICK_PADDING) + BRICK_OFFSET_LEFT, r*(BRICK_NUM_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP));
            }
            this.bricks.push(brick_row);
        }
    }

    update() {
        if (this.state === STATES.PLAYING) {
            this._updatePlaying();
        } else if (this.state === STATES.GAME_OVER) {
            this._updateGameOver();
        }
    }

    _updatePlaying() {
        const segments = this.segments;
        segments.forEach(segment => segment.update(this.dims))
        this.ball.update(this.dims);
        this.collisionDetection();

        // if (this.ball.position.y + this.ball.dy > this.dims.y - BALL_RADIUS) {
        if (this.ball.position.y > 23) {
            const paddleX = segments[0].position.x;
            const paddleCenter = Math.floor((paddleX + PADDLE_WIDTH) / 2);
            if (this.ball.position.x >= paddleX && (this.ball.position.x <= paddleX + PADDLE_WIDTH || this.ball.position.x <= (paddleX + PADDLE_WIDTH) % DIMS.X)) {
                this.ball.dy = -this.ball.dy;
                if (paddleCenter <= this.ball.position.x) {
                    this.ball.dx = -this.ball.dx;
                }
                maxAPI.outlet("paddleHit");
            } else if (this.ball.position.x + this.ball.dx >= paddleX && this.ball.position.x + this.ball.dx <= paddleX + PADDLE_WIDTH) {
                this.ball.dy = -this.ball.dy;
                if (paddleCenter <= this.ball.position.x) {
                    this.ball.dx = -this.ball.dx;
                }
                maxAPI.outlet("paddleHit");
            } else {
                // maxAPI.post(`${this.ball.position.x} ${this.ball.position.y} ${paddleX} ${paddleX + PADDLE_WIDTH}`);
                this.state = STATES.GAME_OVER;
                this.ball.dy = 0;
                this.ball.dx = 0;
                maxAPI.outlet("gameOver");
            }
        }

        let numBricksHit = 0;
        this.bricks.forEach(row => row.forEach(brick => {
            if(brick.hit) {
                numBricksHit++;
            } 
        }));
        if (numBricksHit === TOTAL_BLOCKS) {
            this.state = STATES.GAME_OVER;
            maxAPI.outlet("gameWon");
        }
    }

    collisionDetection() {
        for (let c = 0; c < BRICK_NUM_COL; c++) {
            for (let r = 0; r < BRICK_NUM_ROW; r++) {
                let b = this.bricks[c][r];
                if(!b.hit) {
                    let ball_x = this.ball.position.x;
                    let ball_y = this.ball.position.y;
                    let brick_x = b.segments[0].position.x;
                    let brick_y = b.segments[0].position.y;
                    if (ball_x > brick_x && ball_x < brick_x + BRICK_NUM_WID && ball_y == brick_y) {
                        this.ball.dy = -this.ball.dy;
                        maxAPI.outlet("brickHit");
                        b.hide();
                    } else if (ball_x + this.ball.dx > brick_x && ball_x < brick_x + this.ball.dx + BRICK_NUM_WID && ball_y + this.ball.dy == brick_y) {
                        this.ball.dy = -this.ball.dy;
                        maxAPI.outlet("brickHit");
                        b.hide();
                    }
                }
            }
        }
    }
    _updateGameOver() {
        this.blinkTimer = (this.blinkTimer + 1) % 8;
        this.ball.hidden = this.blinkTimer >= 4;
    }
}

class Brick {
    constructor (x, y) {
        this.hit = false;
        this.segments = [];
        for (let i = 0; i < BRICK_NUM_WID; i++) {
            this.segments.push(new DrawablePixel(x+i,y));
        }
    }

    hide() {
        this.hit = true;
        this.segments.forEach(segment => segment._hidden = true);
    }
}

class DrawablePixel {
    constructor(x, y) {
        this.position = { x, y };
        this._hidden = false;
    }

    get hidden() {
        return this._hidden;
    }

    set hidden(bool){
        this._hidden = bool;
    }

    draw(pixelList) {
       if (!this._hidden) {
           pixelList.push(this.position.x);
           pixelList.push(this.position.y);
       } 
    }
}

class PlatformSegment extends DrawablePixel {
    constructor(x, y) {
        super(x, y)
        this._direction = DIRECTIONS.NONE;
    }

    get direction() {
        return this._direction;
    }

    set direction(d) {
        this._direction = d;
    }

    update(dims) {
        if (this._direction === DIRECTIONS.LEFT) {
            this.position.x -= 1;
        } else if (this._direction === DIRECTIONS.RIGHT) {
            this.position.x += 1;
        }

        this.position.x = (this.position.x + dims.x) % dims.x;
        this.position.y = (this.position.y + dims.y) % dims.y;
    }
}

class BallSegment extends DrawablePixel {
    constructor (x, y) {
        super(x, y);
        this.dx = 1;
        this.dy = 1;
    }

    update(dims) {
        if ((this.position.x + this.dx) < 0 || 
                this.position.x + this.dx > dims.x - BALL_RADIUS) {
            maxAPI.outlet("wallHit");
            this.dx = -this.dx;
        }

        if (this.position.y + this.dy < 0) {
            maxAPI.outlet("wallHit");
            this.dy = -this.dy;
        } 
        
        this.position.x += this.dx
        this.position.y += this.dy
    }
}

const game = new BreakoutGame();

maxAPI.addHandlers({
    getPixels: () => {
        const pixels = game.getPixels();
        maxAPI.outlet(pixels)
    },
    input: (d) => {
        if (!DIRECTIONS.hasOwnProperty(d)) {
            maxAPI.post(`Invalid input to snake game ${d}`, maxAPI.POST_LEVELS.WARN); 
        } else {
            if (game.state === STATES.GAME_OVER) {
                game.initializeGame();
            } else {
                game.segments.forEach(segment => segment.direction = d);
            }
        }
    },
    update: () => {
        game.update();
        maxAPI.outlet("didUpdate");
    }
});

game.initializeGame();