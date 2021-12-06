const maxAPI = require('max-api');

const INITIAL_SEGMENTS = 4;
const INITIAL_POSITION = {x: 21, y: 22};

const DIRECTIONS = Object.freeze({
    NONE: "NONE",
    LEFT: "LEFT",
    RIGHT: "RIGHT"
});

class BreakoutGame {
    constructor() {
        this.initializeGame();
    }

    initializeGame() {
        this.segments = [];

        for (let i = 0; i < INITIAL_SEGMENTS; i++) {
            this.segments.push(new SnakeSegment(INITIAL_POSITION.x + i, INITIAL_POSITION.y));
        }
        this.addTargets();
    }

    getPixels() {
        const pixels = ["pixels"];
        this.segments.forEach(segment => segment.draw(pixels))
        return pixels
    }

    addTargets(){}

    update() {
        // const segments = this.segments;
        // const segments = this.segments;
        // segments.forEach(segment => segment.update(this.dims))
        
        // if (this.state === STATES.PLAYING) {
		// 	this._updatePlaying();
		// } else if (this.state === STATES.GAME_OVER) {
		// 	this._updateGameOver();
		// }
    }
}

class SnakeSegment {
    constructor(x, y) {
        this.position = { x, y };
        this._hidden = false;
    }

    draw(pixelList) {
       if (!this._hidden) {
           pixelList.push(this.position.x);
           pixelList.push(this.position.y);
       } 
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
        }
    },
    update: () => {
        game.update();
        maxAPI.outlet("didUpdate");
    }
});

game.initializeGame();

// maxAPI.outlet([3,4,4,4,5,4]);