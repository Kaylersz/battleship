var missedSound = new Audio("missed_1sec.mp3")
var hitSound = new Audio("hit_2sec.wav")
var alertSound = new Audio("classic-alarm.wav")
var clapSound = new Audio("applause.wav")

// the model of the game, location of the ships 
var model = {
    boardSize: 7,
    numShips: 3,
    shipLength: 3,
    shipSunks: 0,

    ships: [{ locations: [0, 0, 0], hits: ["", "", ""] },
    { locations: [0, 0, 0], hits: ["", "", ""] },
    { locations: [0, 0, 0], hits: ["", "", ""] }],

    fire: function (guess) {
        for (var i = 0; i < this.numShips; i++) {
            var ship = this.ships[i]
            // search the guesses
            var index = ship.locations.indexOf(guess);

            if (ship.hits[index] === "hit") {
                view.displayMessage("Oops, sorry po baby you already hit that location na po");
                missedSound.play();

                return true
            }
            else if (index >= 0) {
                // We have a hit
                ship.hits[index] = "hit";
                view.displayHit(guess);
                view.displayMessage("HIT! galing bebe koo");
                hitSound.play();


                if (this.isSunk(ship)) {
                    view.displayMessage("You sank my Battleship babyy galiingg!")
                    this.shipSunks++
                }
                return true
            }
        }
        view.displayMiss(guess);
        view.displayMessage("You missed me po hehe labyu <3");
        missedSound.play();
        return false
    },

    isSunk: function (ship) {
        for (var i = 0; i < this.shipLength; i++) {
            if (ship.hits[i] !== "hit") {
                return false
            }
        }
        return true
    },

    generateShipLocation: function () {
        var locations;
        // generate each ships location
        for (var i = 0; i < this.numShips; i++) {
            do {
                // generate a new set of location
                locations = this.generateShip();
            }
            // check if the location overlap and if it is, it will continue to generate until there is no collision
            while (this.collision(locations));
            // it will assign the locations to the ship's location property in the model.ships array
            this.ships[i].locations = locations;
        }
    },

    generateShip: function () {
        var direction = Math.floor(Math.random() * 2);
        var row, col;

        if (direction === 1) { // Generate a location for a horizontal ship
            row = Math.floor(Math.random() * this.boardSize);
            // subtract by 3 to start always between 0 and 4, so the it must leave room for the other two locations of the ship
            col = Math.floor(Math.random() * (this.boardSize - this.shipLength + 1));
        } else { // Generate a location for a vertical ship
            row = Math.floor(Math.random() * (this.boardSize - this.shipLength + 1));
            col = Math.floor(Math.random() * this.boardSize);
        }

        var newShipLocations = [];
        for (var i = 0; i < this.shipLength; i++) {
            if (direction === 1) {
                // add location to array "newShipLocations" for a new horizontal ship
                newShipLocations.push(`${row}${col + i}`)
            } else {
                // add location  to array "newShipLocations" for a new vertical ship
                newShipLocations.push(`${row + i}${col}`)

            }
        }

        return newShipLocations
    },
    // array of location for a new ship we'd like to place on the board
    collision: function (locations) {
        // for each ship already on the board
        for (var i = 0; i < this.numShips; i++) {
            var ship = model.ships[i];
            // check if any of the locations in the new ships array are in an existing ships location array
            for (var j = 0; j < locations.length; j++) {
                // check if the location already exists in the ship, when is >= 0 it match an existing location
                if (ship.locations.indexOf(locations[j]) >= 0) {
                    // if collision found return true, stops the iteration of both loop
                    return true
                }
            }
        }
        // there is no collision
        return false
    }
};
/*
model.fire("53") // miss

model.fire("06") // hit
model.fire("16") // hit
model.fire("26") // hit

model.fire("34") // hit
model.fire("24") // hit
model.fire("44") // hit

model.fire("12") // hit
model.fire("10") // hit
model.fire("11") // hit
*/

// this object holds the displays in board like msgs, miss pic and hit pic(ships)
var view = {
    // this method takes a string message and displays it in the message display area
    displayMessage: function (msg) {
        // get the id of messageArea 
        var messageArea = document.getElementById("messageArea");
        messageArea.innerHTML = msg // later change the font size & boldness
    },

    displayMiss: function (location) {
        // display the miss image when missed
        var cell = document.getElementById(location)
        cell.setAttribute("class", "miss")
    },

    displayHit: function (location) {
        // display the ship image when hit
        var cell = document.getElementById(location)
        cell.setAttribute("class", "hit")
    }


}



// Implimenting parses & for convertion when entering guesses in input
function parseGuess(guess) {
    var alphabet = ["A", "B", "C", "D", "E", "F", "G"]

    if (guess === null || guess.length !== 2) {
        view.displayMessage("Oops, please enter a letter and number on the board");
        alertSound.play();

    } else {
        // convertion from letter string to number
        var firstChar = guess.charAt(0);
        var row = alphabet.indexOf(firstChar);
        var column = guess.charAt(1);

        if (isNaN(row) || isNaN(column)) {
            view.displayMessage("Oops, that isnt on the board.");
           alertSound.play();

        } else if (row < 0 || row >= model.boardSize || column < 0 || column >= model.boardSize) {
            view.displayMessage("Oops, thats off board.");
            alertSound.play();

        } else {
            // converting from number to string
            return row + column
        }
    }
    return null
}
/*
console.log(parseGuess("A0"))
console.log(parseGuess("B6"))
console.log(parseGuess("G3"))
console.log(parseGuess("H0"))
console.log(parseGuess("A7"))
*/

// count the guesses and know when the game is over
var controller = {
    guesses: 0,

    processGuess: function (guess) {
        var location = parseGuess(guess)
        if (location) {
            this.guesses++;
            var hit = model.fire(location);
            if (hit && model.shipSunks === model.numShips) {
                view.displayMessage(`You sank all battleships my palanggingging, in ${this.guesses} guesses`);
                clapSound.play();
            }
        }
    }
}
/*
controller.processGuess("A0");

controller.processGuess("A6");
controller.processGuess("B6");
controller.processGuess("C6");

controller.processGuess("C4");
controller.processGuess("D4");
controller.processGuess("E4");

controller.processGuess("B0");
controller.processGuess("B1");
controller.processGuess("B2");

// console.log(model.shipSunks)
// console.log(model.shipLength)
// console.log(model.numShips)
console.log(controller.guesses)
*/


// intiator for the button id
function init() {
    var fireButton = document.getElementById("fireButton");
    fireButton.onclick = handleFireButton
    // when pressing enter key
    var guessInput = document.getElementById("guessInput")
    guessInput.onkeypress = handleKeyPress

    model.generateShipLocation()
}

// for fire button using an event handler
function handleFireButton() {
    var guessInput = document.getElementById("guessInput");
    var guess = guessInput.value.toUpperCase();
    // pass the players guess to the controller
    controller.processGuess(guess);

    guessInput.value = "";

}

window.onload = init;

// when pressing enter key
function handleKeyPress(e) {
    var fireButton = document.getElementById("fireButton");
    if (e.keyCode === 13) {
        fireButton.click();
        return false;
    }
}





// ship magnets pg.399
// var ships = [
//     {locations: ["06", "16", "26"], hits: ["hit", "hit", "hit"]},
//     {locations: ["24", "34", "44"], hits: ["hit", "hit", "hit"]},
//     {locations: ["10", "11", "12"], hits: ["hit", "hit", "hit"]},
// ]

/*
view.displayHit("06")
view.displayHit("16")
view.displayMiss("13")
view.displayHit("24")
view.displayMiss("31")
view.displayHit("10")
view.displayHit("34")
view.displayMiss("50")
view.displayMiss("01")
view.displayHit("11")
view.displayHit("12")
view.displayHit("44")
view.displayHit("26")
*/

