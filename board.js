/**
 * board.ts
 *
 * class Board
 * class Square
 */
var Board = (function () {
    function Board() {
        this.game = null;
        this.squares = [];
        this.createSquares();
    }
    Board.prototype.createSquares = function () {
        var row;
        var column;
        var rowData;
        var newSquare;
        for (row = 0; row < 15; row++) {
            rowData = [];
            for (column = 0; column < 15; column++) {
                newSquare = new Square(row, column);
                newSquare.board = this;
                rowData.push(newSquare);
            }
            this.squares.push(rowData);
        }
    };
    Board.prototype.html = function () {
        var boardView = "";
        var row;
        var column;
        var currentSquare;
        for (row = 0; row < 15; row++) {
            for (column = 0; column < 15; column++) {
                currentSquare = this.squares[row][column];
                boardView += currentSquare.html();
            }
        }
        return '<div class="board">' + boardView + '</div>';
    };
    return Board;
}());
var Square = (function () {
    function Square(row, column) {
        this.board = null;
        this.tile = null;
        this.id = 'sq-' + row + '-' + column;
        this.row = row;
        this.column = column;
    }
    Square.allowDrop = function (ev) {
        var currentPlayer = window.scrabble.getCurrentPlayer();
        var board = window.scrabble.board.squares;
        var hasPlayed = currentPlayer.letters.some(function (letter) {
            return letter.status === 2;
        });
        if (!hasPlayed) {
            // Allow dropping anywhere for the first word
            ev.preventDefault();
            return;
        }
        if (ev.target.childNodes.length == 0) {
            var squareIndex = ev.target.id.split("-");
            var row = parseInt(squareIndex[1]);
            var column = parseInt(squareIndex[2]);
            var validSquare = false;
            // Check if the square is adjacent to existing tiles
            for (var r = row - 1; r <= row + 1; r++) {
                for (var c = column - 1; c <= column + 1; c++) {
                    if (r >= 0 && r < 15 && c >= 0 && c < 15 && board[r][c].tile !== null) {
                        validSquare = true;
                        break;
                    }
                }
            }
            if (validSquare) {
                ev.preventDefault();
            }
        }
    };
    
    Square.drop = function (ev) {
        ev.preventDefault();
        var data = ev.dataTransfer.getData("text");
        ev.target.appendChild(document.getElementById(data));
        var squareIndex = ev.target.id.split("-");
        var targetSquare = window.scrabble.board.squares[squareIndex[1]][squareIndex[2]];
        var currentPlayer = window.scrabble.getCurrentPlayer();
        for (var tileIndex = 0; tileIndex < currentPlayer.letters.length; tileIndex++) {
            if (currentPlayer.letters[tileIndex].id == parseInt(data)) {
                var droppedTile = currentPlayer.letters[tileIndex];
                if (droppedTile.square != null) {
                    droppedTile.square.tile = null; // clear old square
                }
                targetSquare.tile = droppedTile;
                droppedTile.square = targetSquare;
                droppedTile.status = 2; // Mark as being played but not locked
                break;
            }
        }
    };
    Square.prototype.html = function () {
        var bgcolour;
        var output;
        bgcolour = Colour.Grey;
        output = '<div id="' + this.id + '" class="square" ondrop="Square.drop(event)" ondragover="Square.allowDrop(event)" style="background-color:' + Game.colours[bgcolour] + '">';
        if (this.tile != null)
            output += this.tile.html();
        output += '</div>';
        return output;
    };
    return Square;
}());
