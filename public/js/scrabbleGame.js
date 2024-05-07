// Enum for Colors
const Colour = {
    Grey: 0
};

// Enum for Letters
const Letter = {
    A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, G: 6, H: 7, I: 8, J: 9, K: 10, L: 11, M: 12, N: 13,
    O: 14, P: 15, Q: 16, R: 17, S: 18, T: 19, U: 20, V: 21, W: 22, X: 23, Y: 24, Z: 25, BLANK: 26
};

// Global Variables
var startGame = 0;
var allPreviousWords = [];
var wasInvalid = false;
var previousInvalidSet = [];
var placedLetter = false;
// Game Class
class Game {
    constructor(elementselector) {
        this.numberOfPlayers = 2;
        this.skipValidation = false; // testing
        this.players = [];
        this.gameElementSelector = elementselector;
        this.stage = 1; // Initialize the stage
        this.stagePoints = [3, 6, 8, 9, 10]; // Point thresholds for each stage
        this.turnsPerStage = [1, 2, 3, 4, 7]; // Number of turns allowed per stage
        this.currentTurn = 0; // Current turn count
        window.scrabble = this; // Expose the instance for debugging
    }

    // Setup the game
    setup() {
        this.start();
        this.draw();
    }

    // Start the game by initializing the board, players, and letter bag
    start() {
        this.board = new Board();
        this.board.game = this;
        this.playerTurn = 0;
        this.populateBag();
        this.setupPlayers();
    }

    draw() {
        var content = "";
        content += this.displayGameStatus();
        content += `<div>Stage: ${this.stage}</div>`;
        content += `<div>Points to pass this stage: ${this.stagePoints[this.stage - 1]}</div>`;
        content += `<div>Turns Left: ${this.turnsPerStage[this.stage - 1] - this.currentTurn}</div>`; // Display turns left
        content += this.board.html();
        content += this.players[this.playerTurn].displayLetters();
        content += '<button onclick="window.scrabble.submitWord()">Play Word</button>';
        document.querySelector(this.gameElementSelector).innerHTML = content;
    }
    


    // Display the number of remaining letters and player's score
    displayGameStatus() {
        // Display remaining letters
        const lettersRemainingElement = document.getElementById('letters-remaining');
        if (lettersRemainingElement) {
            lettersRemainingElement.textContent = this.letterBag.length;
        }

        // Display player's score
        for (var p = 0; p < this.players.length; p++) {
            const playerScoreElement = document.getElementById('player-score-value');
            if (playerScoreElement) {
                playerScoreElement.textContent = this.players[p].score;
            }
        }

        // Display error messages
        var content = '<div id="messages"></div>';
        return content;
    }

    // Submit a word played by the current player
    submitWord() {
        const player = this.getCurrentPlayer();
        const words = this.findPlayedWords();

        var invalidWord = false;
        // Check if any of the words are invalid
        if(words){
            invalidWord = words.find(word => word.score === 0);
        }
     
        if (invalidWord) {
            document.getElementById('messages').innerHTML = '<span class="error">Invalid Word Submission- Please correct and try again</span>';
            return false;
        }
        // Check various conditions for valid word submission
        if (!placedLetter) {
            document.getElementById('messages').innerHTML = '<span class="error">You need to place a letter</span>';
            return false;
        } else if (words == null || words.length == 0) {
            document.getElementById('messages').innerHTML = '<span class="error">Invalid Word Submission- Please correct and try again</span>';
            return false;
        } else if ((!this.areWordsAdjacent(allPreviousWords, words)) && (words.length != 0) && startGame != 0) {
            document.getElementById('messages').innerHTML = '<span class="error">Words must be connected to the previous turn\'s tiles</span>';
            return false;
        }else if (startGame == 0) {
            startGame += 1;
            this.currentTurn++;
        } else{
            this.currentTurn++;
        }
        
    
        console.log("CurrentTurn:", this.currentTurn)
        console.log("Stage turns", this.turnsPerStage[this.stage-1]);
        // Add played words to the list of all previous words
        allPreviousWords = allPreviousWords.concat(words);

        // Calculate scores and update player's score
        for (var w = 0; w < words.length; w++) {
            player.score += words[w].score;
        }

        // Remove tiles from the player's rack
        var tempLetter;
        var t = player.letters.length - 1;
        for (; t >= 0; t--) {
            tempLetter = player.letters[t];
            if (tempLetter.status == 2) {
                player.removeTile(t);
                tempLetter.status = 3;
                this.playedLetters.push(tempLetter);
                if (this.letterBag.length > 0) {
                    player.giveTile(this.letterBag.shift());
                }
            }
        }

        // Check if the player has reached the required points for the current stage
        if (player.score >= this.stagePoints[this.stage - 1]) {
            // Move to the next stage if the player has reached the threshold
            this.stage++;
            // reset the number of turns to 0 when moving on to next stage
            this.currentTurn = 0;
            // Check if the player has completed all stages
            if (this.stage > 5) {
                this.endGame(true); // Player wins
                return;
            }
            // Display stage information
            this.draw();
            document.getElementById('messages').innerHTML = `<span>You've reached Stage ${this.stage}. You need to score ${this.stagePoints[this.stage - 1]} points to pass this stage.</span>`;
        } else if(this.currentTurn >= this.turnsPerStage[this.stage - 1]){
            // End the game if the player fails to reach the required points for the current stage
            this.endGame(false); // Player loses
        }

        // Redraw the game interface
        this.draw();
    }
    // Function to end the game
    endGame(playerWins) {
        if (playerWins) {
            // Player wins
            alert("Congratulations! You've reached the final stage and won the game!");
        } else {
            // Player loses
            alert("Game Over! You failed to reach the required points by stage " + this.tage + ".");
        }
        // Reset the page after the player clicks OK
        window.location.reload();
    }

    // Check if two sets of words are adjacent (checking to see if new word is adjacent/connected with any word from the old set)
    areWordsAdjacent(set1, set2) {
        // Function to check if two squares are adjacent
        const areAdjacent = (square1, square2) => {
            return Math.abs(square1.row - square2.row) <= 1 && Math.abs(square1.column - square2.column) <= 1;
        }

        // Iterate through each word in both sets and check adjacency
        for (var i = 0; i < set1.length; i++) {
            for (var j = 0; j < set2.length; j++) {
                var set1word = set1[i].word;
                var set2word = set2[j].word;
                for (var k = 0; k < set2word.length; k++) {
                    var square2 = set2word[k].square;
                    for (var m = 0; m < set1word.length; m++) {
                        var square1 = set1word[m].square;
                        if (areAdjacent(square1, square2)) {
                            return true;
                        }
                    }
                }
            }
        }

        return false;
    }

    // Find words played by the current player
    findPlayedWords() {
        // Get all letters that the user has placed on the board this turn
        const orderedLetters = this.getOrderedPlayedLetters();
        // Check if any letters were placed
        if (orderedLetters.length == 0) {
            placedLetter = false;
        } else {
            placedLetter = true;
        }

        // Initialize variables
        var at;
        var dir = "";
        var score = 0;
        var skipEnd = false;
        var tempLetter;
        var currentword = [];
        var allwords = [];

        // Iterate through each placed letter
        for (var ol = 0; ol < orderedLetters.length; ol++) {
            tempLetter = orderedLetters[ol];
            score = -1;

            // Determine direction of word placement
            if (ol == 0) {
                // first letter
                if (orderedLetters.length === 1) {
                    // Treat it as both the start and end of the word in both directions
                    // Horizontal word
                    var horizontalWord = this.findHorizontalWord(orderedLetters[0]);
                    if (horizontalWord.length > 1) {
                        var horizontalScore = this.getWordScore(horizontalWord);
                        allwords.push({ word: horizontalWord, score: horizontalScore });
                    }

                    // Vertical word
                    var verticalWord = this.findVerticalWord(orderedLetters[0]);
                    if (verticalWord.length > 1) {
                        var verticalScore = this.getWordScore(verticalWord);
                        allwords.push({ word: verticalWord, score: verticalScore });
                    }
                } else {
                    // more than one letter placed
                    if (orderedLetters[ol + 1].square.row == tempLetter.square.row) {
                        dir = "across";
                        // Check if there is a letter to the left
                        if (tempLetter.square.column > 0) {
                            // check left
                            at = this.findPlayedTile(tempLetter.square.row, tempLetter.square.column - 1);
                            if (at !== null) {
                                skipEnd = true;
                                // connected!
                                while (at !== null) {
                                    currentword.unshift(at);
                                    at = this.findPlayedTile(at.square.row, at.square.column - 1);
                                }
                                currentword = currentword.concat(this.getAllLettersInWord(orderedLetters, dir));
                                // check for letters after
                                at = this.findPlayedTile(tempLetter.square.row, orderedLetters[orderedLetters.length - 1].square.column + 1);
                                if (at !== null) {
                                    while (at !== null) {
                                        currentword.push(at);
                                        at = this.findPlayedTile(at.square.row, at.square.column + 1);
                                    }
                                }
                                score = this.getWordScore(currentword);
                                allwords.push({ word: currentword, score: score });
                            }
                        }
                    } else if (orderedLetters[ol + 1].square.column == tempLetter.square.column) {
                        dir = "down";
                        // Check if there is a letter above
                        if (tempLetter.square.row > 0) {
                            // check above
                            at = this.findPlayedTile(tempLetter.square.row - 1, tempLetter.square.column);
                            if (at !== null) {
                                skipEnd = true;
                                // connected!
                                while (at !== null) {
                                    currentword.unshift(at);
                                    at = this.findPlayedTile(at.square.row - 1, at.square.column);
                                }
                                currentword = currentword.concat(this.getAllLettersInWord(orderedLetters, dir));
                                // check for letters after
                                at = this.findPlayedTile(orderedLetters[orderedLetters.length - 1].square.row + 1, tempLetter.square.column);
                                if (at !== null) {
                                    while (at !== null) {
                                        currentword.push(at);
                                        at = this.findPlayedTile(at.square.row + 1, at.square.column);
                                    }
                                }
                                score = this.getWordScore(currentword);
                                allwords.push({ word: currentword, score: score });
                            }
                        }
                    } else {
                        // Illegal move?
                    }
                }
            } else if (ol === (orderedLetters.length - 1)) {
                // Last letter
                if (dir == "across") {
                    if (!skipEnd) {
                        currentword = this.getAllLettersInWord(orderedLetters, dir);
                        // haven't already checked end
                        // check for letters after
                        at = this.findPlayedTile(tempLetter.square.row, tempLetter.square.column + 1);
                        if (at !== null) {
                            while (at !== null) {
                                currentword.push(at);
                                at = this.findPlayedTile(at.square.row, at.square.column + 1);
                            }
                        }
                        score = this.getWordScore(currentword);
                        allwords.push({ word: currentword, score: score });
                    }
                }
                if (dir == "down") {
                    if (!skipEnd) {
                        currentword = this.getAllLettersInWord(orderedLetters, dir);
                        // haven't already checked end
                        // check for letters after
                        at = this.findPlayedTile(tempLetter.square.row + 1, tempLetter.square.column);
                        if (at !== null) {
                            while (at !== null) {
                                currentword.push(at);
                                at = this.findPlayedTile(at.square.row + 1, at.square.column);
                            }
                        }
                        score = this.getWordScore(currentword);
                        allwords.push({ word: currentword, score: score });
                    }
                }
            }
            // Check for vertical word if applicable
            if (dir == "across" || dir == "both") {
                currentword = this.findVerticalWord(tempLetter);
                if (currentword.length > 1) {
                    score = this.getWordScore(currentword);
                    allwords.push({ word: currentword, score: score });
                }
            } else if (dir == "down" || dir == "both") {
                currentword = this.findHorizontalWord(tempLetter);
                if (currentword.length > 1) {
                    score = this.getWordScore(currentword);
                    allwords.push({ word: currentword, score: score });
                }
            }
            // Check if the word is invalid
            if (score == 0) {
                return null;
            }
        }
      
        return allwords;
    }

    // Get ordered letters played by the current player
    getOrderedPlayedLetters() {
        const player = this.getCurrentPlayer();
        const orderedLetters = player.letters.filter(letter => letter.status === 2);

        // Sort letters based on their position on the board
        orderedLetters.sort((a, b) => {
            if (a.square.row === b.square.row) {
                return a.square.column - b.square.column;
            } else {
                return a.square.row - b.square.row;
            }
        });

        return orderedLetters;
    }

    // Get all letters in a word played by the current player
    getAllLettersInWord(playerLetters, direction) {
        // Initialize variables
        const word = [];
        var start = 0;
        var end = 0;
        var diff = 0;

        // Determine start and end points based on direction
        if (direction === 'across') {
            start = playerLetters[0].square.column;
            end = playerLetters[playerLetters.length - 1].square.column;
        }

        if (direction === 'down') {
            start = playerLetters[0].square.row;
            end = playerLetters[playerLetters.length - 1].square.row;
        }

        diff = end - start + 1;

        // If the difference matches the number of letters, return all letters
        if (diff === playerLetters.length) return playerLetters.slice();

        // Iterate through the row or column to find missing letters
        var lt;
        var nt;
        var l = start;
        var i = 0;

        for (; l <= end; l++) {
            lt = playerLetters[i];

            if (direction === 'across') {
                if (lt.square.column !== l) {
                    nt = this.findPlayedTile(lt.square.row, l);
                    word.push(nt);
                } else {
                    i++;
                    word.push(lt);
                }
            }

            if (direction === 'down') {
                if (lt.square.row !== l) {
                    nt = this.findPlayedTile(l, lt.square.column);
                    word.push(nt);
                } else {
                    i++;
                    word.push(lt);
                }
            }
        }

        return word;
    }

    // Find the vertical word formed by the vertical row starting with the first letter tempLetter
    findVerticalWord(tempLetter) {
        // Initialize an array to store the vertical word
        const currentWord = [tempLetter];
        
        // Check above the current tile
        var aboveTile = this.findPlayedTile(tempLetter.square.row - 1, tempLetter.square.column);
        while (aboveTile !== null) {
            currentWord.unshift(aboveTile); // Add the above tile to the beginning of the word
            aboveTile = this.findPlayedTile(aboveTile.square.row - 1, aboveTile.square.column); // Move to the tile above
        }
        
        // Check below the current tile
        var belowTile = this.findPlayedTile(tempLetter.square.row + 1, tempLetter.square.column);
        while (belowTile !== null) {
            currentWord.push(belowTile); // Add the below tile to the end of the word
            belowTile = this.findPlayedTile(belowTile.square.row + 1, belowTile.square.column); // Move to the tile below
        }
        
        return currentWord;
    }
    
    // Find the horizontal word formed by the horizontal row starting with the first letter tempLetter
    findHorizontalWord(tempLetter) {
        // Initialize an array to store the horizontal word
        const currentWord = [tempLetter];
        var at;
        
        // Check left of the current tile
        if (tempLetter.square.column > 0) {
            at = this.findPlayedTile(tempLetter.square.row, tempLetter.square.column - 1);
            if (at !== null) {
                while (at !== null) {
                    currentWord.unshift(at);
                    at = this.findPlayedTile(at.square.row, at.square.column - 1);
                }
            }
        }
        // Check right of the current tile
        if (tempLetter.square.column < 15) {
            at = this.findPlayedTile(tempLetter.square.row, tempLetter.square.column + 1);
            if (at !== null) {
                while (at !== null) {
                    currentWord.push(at);
                    at = this.findPlayedTile(at.square.row, at.square.column + 1);
                }
            }
        }

        return currentWord;
    }
    
    // Get the score of the word
    getWordScore(word) {
        var s = 0; // Total score
        var ts = 0; // Temporary score
        var wmp = 1; // Word multiplier
        var log = ""; // Log string
        var wordstring = ""; // String representation of the word
        var dictionary = ""; // Word dictionary
        var invalid = false; // Flag for invalid word
        
        console.log(word)
        // Convert the array of letters to a string
        word.forEach(letter => {
            // Check for blank letters
            if (!letter) {
                invalid = true;
            } else if (letter.index == Letter.BLANK && letter.letter == '') {
                // Prompt user for the letter assigned to blank tiles
                var blankletter = '';
                var lettervalid = false;
                while (!lettervalid) {
                    blankletter = prompt('What letter should be assigned to blank tile?');
                    blankletter = blankletter.toUpperCase();
                    // Check if the input is a valid letter
                    if (blankletter.length == 1 && Game.letterText.indexOf(blankletter) != -1) {
                        lettervalid = true;
                    }
                }
                letter.letter = blankletter;
            }
            // Add the letter to the word string
            if (letter) {
                wordstring += letter.letter.toLowerCase();
            }
            // Set invalid flag if there are any missing letters
            if (invalid) {
                wordstring = null;
            }
        });

        // Load dictionary file
        function loadWords() {
            var request = new XMLHttpRequest();
            request.open("GET", "words/words.txt", false);
            request.onreadystatechange = function () {
                if (request.readyState === 4) {
                    dictionary = request.responseText.split("\r\n");
                }
            };
            request.send(null);
        }
        
        // Validate word against dictionary
        if (!this.skipValidation) {
            var validword = false;
            loadWords();
            if(!wordstring){
                validword = false;
            }
            else if (dictionary.includes(wordstring.toUpperCase())) {
                console.log('Word found');
                validword = true;
            } else {
                console.log('Word not found - ' + wordstring);
                validword = false;
            }
        
            if (!validword) {
                return 0;
            }
        }
        
        // Calculate word score
        word.forEach(letter => {
            ts = letter.value;
            log += letter.letter + " -> " + ts;
            s += ts;
        });
        
        s *= wmp; // Apply word multiplier
        log += "\n wmp = " + wmp;
        log += "\n score = " + s;
        console.log(log);
        return s;
    }
    
    // Find a played tile (letter) at the specified row and column coordinates
    findPlayedTile(row, column) {
        for (var tempLetter of this.playedLetters) {
            if (tempLetter.square.row == row && tempLetter.square.column == column) {
                return tempLetter;
            }
        }
        return null;
    }
    
    // Get information about the current player
    getCurrentPlayer() {
        return this.players[this.playerTurn];
    }
    
    // Populate the letter bag with random letters
    populateBag() {
        this.letterBag = [];
        this.playedLetters = [];
        this.numberOfPlayers = 1;
    
        var avialableLetters = [];
        // Generate list of available letters based on letter counts
        for (var l = 0; l < Game.letterCounts.length; l++) {
            for (var c = 0; c < Game.letterCounts[l]; c++) {
                avialableLetters.push(l);
            }
        }
    
        var letterIndex;
        var newTile;
        // Randomly assign letters to the letter bag
        for (var t = avialableLetters.length; t > 0; t--) {
            letterIndex = Math.floor(t * Math.random());
            newTile = new Tile(avialableLetters.splice(letterIndex, 1)[0]);
            newTile.id = t;
            this.letterBag.push(newTile);
        }
    }
    
    // Set up players for the game
    setupPlayers() {
        var player = new Player();
        // Give each player 7 random letters from the letter bag
        for (var tilecount = 0; tilecount < 7; tilecount++) {
            player.giveTile(this.letterBag.shift());
        }
        this.players.push(player);
    }

    // Static Variables
    static get colours() {
        return [
            '#CCCCCC','#FF0000','#005CFF', '#00C3FF', '#FF00F8','#FFBA00',
        ];
    }
    static get letterValues() {
        return [
            1, 3, 3, 2, 1, 4, 2, 4, 1, 8, 5, 1, 3, 1, 1, 3, 10, 1, 1, 1, 1, 4, 4, 8, 4, 10
        ];
    }
    static get letterCounts() {
        return [
            9, 2, 2, 4, 12, 2, 3, 2, 9, 1, 1, 4, 2, 6, 8, 2, 1, 6, 4, 6, 4, 2, 2, 1, 2, 1
        ];
    }
    static get letterText() {
        return [
            "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
            "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
        ];
    }
}
