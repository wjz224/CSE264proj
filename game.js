/**
 * class Game
 *
 * @param elementselector: DOM element query selector string
 * @description: Main game logic
 */
var Colour;
var startGame = 0;
var allPreviousWords = [];
var wasInvalid = false;
var previousInvalidSet = [];
var placedLetter = false;
(function (Colour) {
    Colour[Colour["Grey"] = 0] = "Grey";
})(Colour || (Colour = {}));
;
var Letter;
(function (Letter) {
    Letter[Letter["A"] = 0] = "A";
    Letter[Letter["B"] = 1] = "B";
    Letter[Letter["C"] = 2] = "C";
    Letter[Letter["D"] = 3] = "D";
    Letter[Letter["E"] = 4] = "E";
    Letter[Letter["F"] = 5] = "F";
    Letter[Letter["G"] = 6] = "G";
    Letter[Letter["H"] = 7] = "H";
    Letter[Letter["I"] = 8] = "I";
    Letter[Letter["J"] = 9] = "J";
    Letter[Letter["K"] = 10] = "K";
    Letter[Letter["L"] = 11] = "L";
    Letter[Letter["M"] = 12] = "M";
    Letter[Letter["N"] = 13] = "N";
    Letter[Letter["O"] = 14] = "O";
    Letter[Letter["P"] = 15] = "P";
    Letter[Letter["Q"] = 16] = "Q";
    Letter[Letter["R"] = 17] = "R";
    Letter[Letter["S"] = 18] = "S";
    Letter[Letter["T"] = 19] = "T";
    Letter[Letter["U"] = 20] = "U";
    Letter[Letter["V"] = 21] = "V";
    Letter[Letter["W"] = 22] = "W";
    Letter[Letter["X"] = 23] = "X";
    Letter[Letter["Y"] = 24] = "Y";
    Letter[Letter["Z"] = 25] = "Z";
    Letter[Letter["BLANK"] = 26] = "BLANK";
})(Letter || (Letter = {}));
;

var Game = (function () {
    function Game(elementselector) {
        this.numberOfPlayers = 2;
        this.skipValidation = false; // good for testing...
        this.players = [];
        this.gameElementSelector = elementselector;
        window.scrabble = this;
    }
    Game.prototype.setup = function () {
        this.start();
        this.draw();
    }; 
    /**
     * function start
     * Setup a new game
     */
    Game.prototype.start = function () {
        this.board = new Board();
        this.board.game = this;
        this.playerTurn = 0;
        this.populateBag();
        this.setupPlayers();
    };
    /**
     * function draw
     * Outputs the game to the screen
     */
    Game.prototype.draw = function () {
        var content = "";
        var p = 0;
        content += this.displayGameStatus();
        content += this.board.html();
        content += this.players[this.playerTurn].displayLetters();

        content += '<button onclick="window.scrabble.submitWord()">Play Word</button>';
        document.querySelector(this.gameElementSelector).innerHTML = content;
    };
    Game.prototype.displayGameStatus = function () {
        var content = "<div id='stats'>";
        content += '<p>Letters remaining: ' + this.letterBag.length + '</p>';
        for (var p = 0; p < this.players.length; p++) {
            content += '<p>Player ' + (p + 1) + ' score: ' + this.players[p].score + '</p>';
        }
        content += '<div id="messages"></div>';
        content += '</div>';
        return content;
    };

    Game.prototype.submitWord = function () {
        var player = this.getCurrentPlayer();
        var words = this.findPlayedWords();
        console.log("words", words)
        
    
        // check if we have created a word yet
        if(startGame == 0){
            startGame += 1;
        }
        else if (!placedLetter){
            document.getElementById('messages').innerHTML = '<span class="error">You need to place a letter</span>';
            return false;
        }   
        else if (words == null || words.length == 0) {
            // an invalid word played
            document.getElementById('messages').innerHTML = '<span class="error">Invalid Submission - Please correct and try again</span>';
            return false;
        }
        else if ((!this.areWordsAdjacent(allPreviousWords, words))&& (words.length != 0)) {
            // Word is not connected to the previous turn's tiles
            document.getElementById('messages').innerHTML = '<span class="error">Words must be connected to the previous turn\'s tiles</span>';
            return false;
        }
      
       
    

        // If the word is valid, add on the newly played tiles to the old played tiles
        allPreviousWords = allPreviousWords.concat(words);

        for (var w = 0; w < words.length; w++) {
            player.score += words[w].score;
        }
        // loop variables
        var tempLetter;
        var t = player.letters.length - 1;
        // Loop through each of the letters the player holds
        // if it's on the board then remove from players tiles and lock on board
        for (; t >= 0; t--) {
            tempLetter = player.letters[t];
            if (tempLetter.status == 2) {
                player.removeLetterTile(t);
                tempLetter.status = 3;
                this.playedLetters.push(tempLetter);
                // Give another letter
                if (this.letterBag.length > 0)
                    player.giveLetterTile(this.letterBag.shift());
            }
        }
        this.draw();
    };
    Game.prototype.areWordsAdjacent = function (set1, set2) {
        // Helper function to check if two squares are adjacent

        function areAdjacent(square1, square2) {
            return Math.abs(square1.row - square2.row) <= 1 && Math.abs(square1.column - square2.column) <= 1;
        }
    
        // Go through all the words from the previous submit to the currentwords and make sure they are all adjacent
        for(var i = 0; i < set1.length; i++){
            for(var j = 0; j < set2.length; j++){
                // go through each word array and check that the letterTiles are adjacent to atleast one other letterTile from the previous set
                set1word = set1[i].word;
                set2word = set2[j].word;
                for(var k = 0; k < set2word.length; k++){
                    // get the square value of the letter of the word (which contains the row and col values of the each tile) and check if they are adjacent)
                    square2 = set2word[k].square;
                    for(var m = 0; m < set1word.length; m++){
                        square1 = set1word[m].square;
                        if(areAdjacent(square1,square2)){
                            // if any tiles are adjacent, return true. Atleast one letter was adjacent to a previous word
                            return true;
                        }
                    }
                }
                
            }
        }
        
        return false; // return false if any letter is not adjacent to any previous word
    };

    /**
     * function findPlayedWords
     * @return Array of words made with tiles played in last turn along with a score for each
     */
    Game.prototype.findPlayedWords = function () {
        // Get all letters that the user has placed on the board this turn
        // in the correct order
        var orderedLetters = this.getOrderedPlayedLetters();
        if(orderedLetters.length == 0){
            placedLetter = false;
        }
        else{
            placedLetter = true;
        }
        // now check for what word(s) it's attached to
        var at;
        var dir = "";
        var score = 0;
        var skipEnd = false;
        var tempLetter;
        var currentword = [];
        var allwords = [];
        
        for (var ol = 0; ol < orderedLetters.length; ol++) {
            tempLetter = orderedLetters[ol];
            score = -1;
            if (ol == 0) {
                // first letter
                if (orderedLetters.length === 1) {
                    // Treat it as both the start and end of the word in both directions
                    // Horizontal word
                    let horizontalWord = this.checkHorizontalWord(orderedLetters[0]);
                    if (horizontalWord.length > 1) {
                        let horizontalScore = this.getWordScore(horizontalWord);
                        allwords.push({ word: horizontalWord, score: horizontalScore });
                    }
                    
                    // Vertical word
                    let verticalWord = this.checkVerticalWord(orderedLetters[0]);
                    if (verticalWord.length > 1) {
                        let verticalScore = this.getWordScore(verticalWord);
                        allwords.push({ word: verticalWord, score: verticalScore });
                    }
                }
                else {
                    // more than one letter placed
                    if (orderedLetters[ol + 1].square.row == tempLetter.square.row) {
                        dir = "across";
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
                    }
                    else if (orderedLetters[ol + 1].square.column == tempLetter.square.column) {
                        dir = "down";
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
                                console.log("currentword", currentword)
                                score = this.getWordScore(currentword);
                                allwords.push({ word: currentword, score: score });
                            }
                        }
                    }
                    else {
                        // Illegal move?
                    }
                }
            }
            else if (ol === (orderedLetters.length - 1)) {
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
            if (dir == "across" || dir == "both") {
                currentword = this.checkVerticalWord(tempLetter);
                if (currentword.length > 1) {
                    score = this.getWordScore(currentword);
                    allwords.push({ word: currentword, score: score });
                }
            }
            else if (dir == "down" || dir == "both") {
                currentword = this.checkHorizontalWord(tempLetter);
                if (currentword.length > 1) {
                    score = this.getWordScore(currentword);
                    allwords.push({ word: currentword, score: score });
                }
            }
            if (score == 0) {
                // invalid word
                return null;
            }
        }
        return allwords;
    };
    Game.prototype.getOrderedPlayedLetters = function () {
        var player = this.getCurrentPlayer();
        // Create an array of played letters, in the order that they are placed on the board
        var tempLetter;
        var orderedLetters = [];
        for (var pl = 0; pl < player.letters.length; pl++) {
            // 'pl = playerletter'
            tempLetter = player.letters[pl];
            if (tempLetter.status == 2) {
                // letter played this turn
                if (orderedLetters.length == 0) {
                    orderedLetters.push(tempLetter);
                    continue;
                }
                var tempLetter2 = void 0;
                var inserted = false;
                for (var ol = 0; ol < orderedLetters.length; ol++) {
                    tempLetter2 = orderedLetters[ol];
                    if (tempLetter2.square.row == tempLetter.square.row) {
                        if (tempLetter.square.column < tempLetter2.square.column) {
                            // insert at this position
                            orderedLetters.splice(ol, 0, tempLetter);
                            inserted = true;
                            break;
                        }
                    }
                    else if (tempLetter2.square.column == tempLetter.square.column) {
                        if (tempLetter.square.row < tempLetter2.square.row) {
                            // insert at this position
                            orderedLetters.splice(ol, 0, tempLetter);
                            inserted = true;
                            break;
                        }
                    }
                    else {
                        // Illegal move?
                        console.log('huh?');
                    }
                }
                if (!inserted) {
                    orderedLetters.push(tempLetter);
                }
            }
        }
        return orderedLetters;
    };
    // todo: think of a better name
    // basically if the player has added letters either side of a previously
    // placed letter we need to get all letters inbetween - played previously or on that turn
    // e.g. caMel where 'M' was already on the board and c,a,e and l were added in current turn
    Game.prototype.getAllLettersInWord = function (playerLetters, direction) {
        var word = [];
        var start = 0;
        var end = 0;
        var diff = 0;
        if (direction == 'across') {
            // use column number
            start = playerLetters[0].square.column;
            end = playerLetters[playerLetters.length - 1].square.column;
        }
        if (direction == 'down') {
            // use column number
            start = playerLetters[0].square.row;
            end = playerLetters[playerLetters.length - 1].square.row;
        }
        diff = end - start + 1;
        // All letters joined
        if (diff == playerLetters.length)
            return playerLetters.slice();
        var lt;
        var nt;
        var l = start;
        var i = 0;
        for (; l <= end; l++) {
            lt = playerLetters[i];
            if (direction == 'across') {
                if (lt.square.column !== l) {
                    nt = this.findPlayedTile(lt.square.row, l);
                    word.push(nt);
                }
                else {
                    i++;
                    word.push(lt);
                }
            }
            if (direction == 'down') {
                if (lt.square.row !== l) {
                    nt = this.findPlayedTile(l, lt.square.column);
                    word.push(nt);
                }
                else {
                    i++;
                    word.push(lt);
                }
            }
        }
        return word;
    };
    // Check for joins above and below a letter
    Game.prototype.checkVerticalWord = function (tempLetter) {
        // console.log('checking vertical word');
        var currentword = [tempLetter];
        var at;
        if (tempLetter.square.row > 0) {
            // check above
            at = this.findPlayedTile(tempLetter.square.row - 1, tempLetter.square.column);
            if (at !== null) {
                // console.log('found above');
                // connected!                                
                while (at !== null) {
                    currentword.unshift(at);
                    at = this.findPlayedTile(at.square.row - 1, at.square.column);
                }
            }
        }
        if (tempLetter.square.row < 15) {
            // check for letters below
            at = this.findPlayedTile(tempLetter.square.row + 1, tempLetter.square.column);
            if (at !== null) {
                // console.log('found below');
                while (at !== null) {
                    currentword.push(at);
                    at = this.findPlayedTile(at.square.row + 1, at.square.column);
                }
            }
        }
        return currentword;
    };
    // Check for joins left and right of a letter
    Game.prototype.checkHorizontalWord = function (tempLetter) {
        // console.log('checking vertical word');
        var currentword = [tempLetter];
        var at;
        if (tempLetter.square.column > 0) {
            // check left
            at = this.findPlayedTile(tempLetter.square.row, tempLetter.square.column - 1);
            if (at !== null) {
                // console.log('found above');
                // connected!                                
                while (at !== null) {
                    currentword.unshift(at);
                    at = this.findPlayedTile(at.square.row, at.square.column - 1);
                }
            }
        }
        if (tempLetter.square.column < 15) {
            // check right
            at = this.findPlayedTile(tempLetter.square.row, tempLetter.square.column + 1);
            if (at !== null) {
                // console.log('found below');
                while (at !== null) {
                    currentword.push(at);
                    at = this.findPlayedTile(at.square.row, at.square.column + 1);
                }
            }
        }
        return currentword;
    };
    Game.prototype.getWordScore = function (word) {
        var l = 0; // letter index
        var letter; // letter index
        var s = 0; // score
        var ts = 0; // temp score
        var wmp = 1; // word multiplyer
        var log = "";
        var wordstring = "";
        var validword = false;
        var dictionary = "";
        // Conver the array of letters to a string
        for (; l < word.length; l++) {
            if (word[l].index == Letter.BLANK && word[l].letter == '') {
                var blankletter = '';
                var lettervalid = false;
                while (!lettervalid) {
                    blankletter = prompt('What letter should be assigned to blank tile?');
                    blankletter = blankletter.toUpperCase();
                    if (blankletter.length == 1 && Game.letterText.indexOf(blankletter) != -1) {
                        lettervalid = true;
                    }
                }
                word[l].letter = blankletter;
            }
            wordstring += word[l].letter.toLowerCase();
        }

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
        
        if (!this.skipValidation) {
            var validword = false;
            loadWords();
            console.log(dictionary)
            if (dictionary.includes(wordstring.toUpperCase())) {
                console.log('Word found');
                validword = true;
            } else {
                console.log('Word not found - ' + wordstring);
            }
        
            if (!validword) {
                return 0;
            }
        }
        for (l = 0; l < word.length; l++) {
            letter = word[l];
            ts = letter.value;
            log += letter.letter + " -> " + ts;
            s += ts;
        }
        s *= wmp;
        log += "\n wmp = " + wmp;
        log += "\n score = " + s;
        console.log(log);
        return s;
    };
    Game.prototype.findPlayedTile = function (row, column) {
        var n = this.playedLetters.length;
        var l = 0;
        var tempLetter;
        for (; l < n; l++) {
            tempLetter = this.playedLetters[l];
            if (tempLetter.square.row == row && tempLetter.square.column == column) {
                return tempLetter;
            }
        }
        return null;
    };

    Game.prototype.getCurrentPlayer = function () {
        return this.players[this.playerTurn];
    };
    /**
     * function populateBag
     * Create all letters
     */
    Game.prototype.populateBag = function () {
        this.letterBag = [];
        this.playedLetters = [];
        this.numberOfPlayers = 1;

        var avialableLetters = [];
        var l;
        var c;
        for (l = 0; l < Game.letterCounts.length; l++) {
            for (c = 0; c < Game.letterCounts[l]; c++) {
                avialableLetters.push(l);
            }
        }

        var letterIndex;
        var newTile;
        var t;
        for (t = avialableLetters.length; t > 0; t--) {
            letterIndex = Math.floor(t * Math.random());
            newTile = new LetterTile(avialableLetters.splice(letterIndex, 1)[0]);
            newTile.id = t;
            this.letterBag.push(newTile);
        }
    };
    /**
     * function setupPlayers
     * Create players & assign starting letters
     */
    Game.prototype.setupPlayers = function () {
        var p;
        var tilecount;
        var player;
        player = new Player();
        for (tilecount = 0; tilecount < 7; tilecount++) {
            player.giveLetterTile(this.letterBag.shift());
        }
        this.players.push(player);
    };
    // Hex codes corressponding to the Colour enums
    Game.colours = [
        '#CCCCCC',
        '#FF0000',
        '#005CFF',
        '#00C3FF',
        '#FF00F8',
        '#FFBA00',
    ];
    // How many points each letter of the alphabet is worth (A-Z + blank)
    Game.letterValues = [
        1, 3, 3, 2, 1, 4, 2, 4, 1, 8, 5, 1, 3, 1, 1, 3, 10, 1, 1, 1, 1, 4, 4, 8, 4, 10, 0
    ];
    // How many of each letter exists in the game (A-Z + blank)
    Game.letterCounts = [
        9, 2, 2, 4, 12, 2, 3, 2, 9, 1, 1, 4, 2, 6, 8, 2, 1, 6, 4, 6, 4, 2, 2, 1, 2, 1, 2
    ];
    // Label for each letter (A-Z + blank)
    Game.letterText = [
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', ''
    ];
    return Game;
}());
