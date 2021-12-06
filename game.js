const maxAPI = require('max-api');

DIRECTIONS = Object.freeze({
    NONE: "NONE",
    LEFT: "LEFT",
    RIGHT: "RIGHT"
});

class BreakoutGame {
    initializeGame() {
        
    }
}

const game = new BreakoutGame();

maxAPI.addHandlers({
    getPixels: () => {},
    input: (d) => {
        if (!DIRECTIONS.hasOwnProperty(d)) {
            maxAPI.post(`Invalid input to snake game {d}`, maxAPI.POST_LEVELS.WARN);   
        } else {
            maxAPI.post(d);
        }
    },
    update: () => {
        maxAPI.post("doot");
    },
});

game.initializeGame();

maxAPI.outlet([3,4,4,4,5,4]);