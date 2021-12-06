const maxAPI = require('max-api');

const DEFAULT_DIMS = {x: 25, y: 25}; // Game board dimensions
const INITIAL_SEGMENTS = 4;
const INITIAL_POSITION = {x: 21, y: 22};

const DIRECTIONS = Object.freeze({
    NONE: "NONE",
    LEFT: "LEFT",
    RIGHT: "RIGHT"
});

class BreakoutGame {
    constructor() {
        this.dims = Object.assign({}, DEFAULT_DIMS);
        this.initializeGame();
    }

    initializeGame() {
        this.segments = [];

        for (let i = 0; i < INITIAL_SEGMENTS; i++) {
            this.segments.push(new PlatformSegment(INITIAL_POSITION.x + i, INITIAL_POSITION.y));
        }
        // this.addTargets();
    }

    getPixels() {
        const pixels = ["pixels"];
        this.segments.forEach(segment => segment.draw(pixels))
        return pixels
    }

    // addTargets(){}

    update() {
        const segments = this.segments;
        segments.forEach(segment => segment.update(this.dims))

        // for (let i = segments.length - 1; i > 0; i--) {
        //     const this_segment = segments[i];
        //     const next_segment = segments[i-1];
        //     this_segment.direction = next_segment.direction;
            
        //     // check if game over here
        // }
        
        // if (this.state === STATES.PLAYING) {
		// 	this._updatePlaying();
		// } else if (this.state === STATES.GAME_OVER) {
		// 	this._updateGameOver();
		// }
    }
}

class PlatformSegment {
    constructor(x, y) {
        this.position = { x, y };
        this._hidden = false;
        this._direction = DIRECTIONS.NONE;
    }

    get direction() {
        return this._direction;
    }

    set direction(d) {
        this._direction = d;
    }

    draw(pixelList) {
       if (!this._hidden) {
           pixelList.push(this.position.x);
           pixelList.push(this.position.y);
       } 
    }

    update(dims) {
        if (this._direction == DIRECTIONS.LEFT) {
            this.position.x -= 1;
        } else if (this._direction == DIRECTIONS.RIGHT) {
            this.position.x += 1;
        }

        this.position.x = (this.position.x + dims.x) % dims.x;
        this.position.y = (this.position.y + dims.y) % dims.y;
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
            maxAPI.post(`Invalid input to snake game {d}`, maxAPI.POST_LEVELS.WARN); 
        } else {
            maxAPI.post(d);
            game.segments.forEach(segment => segment.direction = d)
        }
    },
    update: () => {
        game.update();
        maxAPI.outlet("didUpdate");
    }
});

game.initializeGame();