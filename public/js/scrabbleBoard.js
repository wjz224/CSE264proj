// Define a class to represent the game board
class Board {
  constructor() {
    // Initialize properties
    this.game = null; // Reference to the game instance
    this.squares = []; // Array to store the squares of the board
    // Call the method to create the squares
    this.createSquares();
  }

  // Method to create the squares of the board
  createSquares() {
    // Iterate over each row
    for (let row = 0; row < 15; row++) {
      let rowData = [];
      // Iterate over each column
      for (let column = 0; column < 15; column++) {
        // Create a new square object
        let newSquare = new Square(row, column);
        // Set the board reference for the square
        newSquare.board = this;
        // Push the square to the row array
        rowData.push(newSquare);
      }
      // Push the row array to the squares array
      this.squares.push(rowData);
    }
  }

  // Method to generate HTML representation of the board
  html() {
    let boardView = "";
    // Iterate over each row
    for (let row = 0; row < 15; row++) {
      // Iterate over each column
      for (let column = 0; column < 15; column++) {
        // Get the current square
        let currentSquare = this.squares[row][column];
        // Generate HTML for the square and append to boardView
        boardView += currentSquare.htmlSquare();
      }
    }
    // Wrap the boardView in a div with 'board' class and return
    return `<div class="board">${boardView}</div>`;
  }
}

// Define a class to represent a square on the board
class Square {
  constructor(row, column) {
    // Initialize properties
    this.board = null;
    this.tile = null;
    this.id = `sq-${row}-${column}`;
    this.row = row;
    this.column = column;
  }

  // Static method to handle dragover event for allowing dropping
  static allowDrop(ev) {
    // Get the current player and board squares
    let currentPlayer = window.scrabble.getCurrentPlayer();
    let board = window.scrabble.board.squares;
    // Check if any tile has been played by the current player
    let hasPlayed = currentPlayer.letters.some(letter => letter.status === 2);
    // If no tile has been played, allow drop
    if (!hasPlayed) {
      ev.preventDefault();
      return;
    }
    // Get the square index from the event target
    let squareIndex = ev.target.id.split("-");
    let row = parseInt(squareIndex[1]);
    let column = parseInt(squareIndex[2]);
    let validSquare = false;
    // Check neighboring squares for a played tile
    for (let r = row - 1; r <= row + 1; r++) {
      for (let c = column - 1; c <= column + 1; c++) {
        if (r >= 0 && r < 15 && c >= 0 && c < 15 && board[r][c].tile !== null) {
          validSquare = true;
          break;
        }
      }
    }
    // If a neighboring square has a played tile, allow drop
    if (validSquare) {
      ev.preventDefault();
    }
  }

  // Static method to handle drop event for placing a tile on the square
  static drop(ev) {
    // Prevent default behavior
    ev.preventDefault();
    // Get the data transferred with the drag
    let data = ev.dataTransfer.getData("text");
    // Append the transferred data to the event target (square)
    ev.target.appendChild(document.getElementById(data));
    // Get the square index from the event target
    let squareIndex = ev.target.id.split("-");
    let targetSquare = window.scrabble.board.squares[squareIndex[1]][squareIndex[2]];
    // Get the current player
    let currentPlayer = window.scrabble.getCurrentPlayer();
    // Iterate over the player's tiles
    for (let tileIndex = 0; tileIndex < currentPlayer.letters.length; tileIndex++) {
      // Find the dropped tile in the player's tiles
      if (currentPlayer.letters[tileIndex].id == parseInt(data)) {
        let droppedTile = currentPlayer.letters[tileIndex];
        // If the tile was previously placed on a square, remove it
        if (droppedTile.square != null) {
          droppedTile.square.tile = null;
        }
        // Set the square's tile to the dropped tile
        targetSquare.tile = droppedTile;
        // Set the dropped tile's square to the target square
        droppedTile.square = targetSquare;
        // Set the status of the dropped tile to 'played' (2)
        droppedTile.status = 2;
        break;
      }
    }
  }

  // Method to generate HTML representation of the square
  htmlSquare() {
    // Get the background color of the square
    let bgcolour = Colour.Grey;
    // Generate HTML for the square with drag-and-drop event handlers
    let output = `<div id="${this.id}" class="square" ondrop="Square.drop(event)" ondragover="Square.allowDrop(event)" style="background-color:${Game.colours[bgcolour]}">`;
    // If a tile is placed on the square, append its HTML representation
    if (this.tile != null)
      output += this.tile.html();
    output += '</div>';
    return output;
  }
}
