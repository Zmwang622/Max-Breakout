const maxAPI = require('max-api');

const DIMS = {x: 25, y: 25}; // Game board dimensions
const BALL_RADIUS = 1; // For wall bounce calculations
const PADDLE_WIDTH = 10;
const INITIAL_PLAT_POSITION = {x: 8, y: 24};
const INITIAL_BALL_POSITION = {x: 12, y: 12};

// Brick Shit
const BRICK_NUM_ROW = 3;
const BRICK_NUM_COL = 4;
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
    }

    getPixels() {
        const pixels = ["pixels"];
        this.segments.forEach(segment => segment.draw(pixels));
        this.ball.draw(pixels);
        this.bricks.forEach(row => row.forEach(brick => brick.segments.forEach(segment => segment.draw(pixels))));
        return pixels;
    }

    addBall() {
        this.ball = new BallSegment(INITIAL_BALL_POSITION.x, INITIAL_BALL_POSITION.y);
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

        if (this.ball.position.y + this.ball.dy > this.dims.y - BALL_RADIUS) {
            const paddleX = segments[0].position.x;
            if (this.ball.position.x > paddleX && this.ball.position.x < paddleX + PADDLE_WIDTH ) {
                this.ball.dy = -this.ball.dy;
            } else {
                this.state = STATES.GAME_OVER;
                this.ball.dy = 0;
                this.ball.dx = 0;
            }
        }
    }

    _updateGameOver() {
        this.blinkTimer = (this.blinkTimer + 1) % 8;
        // this.segments.forEach(segment => {
            // segment.hidden = this.blinkTimer >= 4;
        // });
        this.ball.hidden = this.blinkTimer >= 4;
    }
}

class Brick {
    constructor (x, y) {
        this.segments = [];
        for (let i = 0; i < BRICK_NUM_WID; i++) {
            this.segments.push(new DrawablePixel(x+i,y));
        }
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
        this.dy = -2;
    }

    update(dims) {
        if ((this.position.x + this.dx) < 0 || 
                this.position.x + this.dx > dims.x - BALL_RADIUS) {
            this.dx = -this.dx;
        }

        if (this.position.y + this.dy < 0) {
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