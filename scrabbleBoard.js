class Board{
  constructor(){
    this.game = null;
    this.squares = [];
    this.createSquares();
  }
  
  // Method to create 15x15 grid of squares
  createSquares(){
    for (let row = 0; row < 15; row++){
      let rowData = [];
      for (let column = 0; column < 15; column++){
        let newSquare = new Square(row, column);
        newSquare.board = this;
        rowData.push(newSquare);
      }
      this.squares.push(rowData);
    }
  }

  // Method to generate HTML representation of the board
  html(){
    let boardView = "";
    for (let row = 0; row < 15; row++){
      for (let column = 0; column < 15; column++){
        let currentSquare = this.squares[row][column];
        boardView += currentSquare.htmlSquare();
      }
    }
    return `<div class="board">${boardView}</div>`;
  }
}

class Square{
  constructor(row, column){
    this.board = null;
    this.tile = null;
    this.id = `sq-${row}-${column}`;
    this.row = row;
    this.column = column;
  }

  // Static method to allow dropping tiles onto squares
  static allowDrop(ev){
    let currentPlayer = window.scrabble.getCurrentPlayer();
    let board = window.scrabble.board.squares;
    let hasPlayed = currentPlayer.letters.some(letter => letter.status === 2);
    if (!hasPlayed){
      ev.preventDefault();
      return;
    }
    if (ev.target.childNodes.length == 0){
      let squareIndex = ev.target.id.split("-");
      let row = parseInt(squareIndex[1]);
      let column = parseInt(squareIndex[2]);
      let validSquare = false;
      for (let r = row - 1; r <= row + 1; r++){
        for (let c = column - 1; c <= column + 1; c++){
          if (r >= 0 && r < 15 && c >= 0 && c < 15 && board[r][c].tile !== null){
            validSquare = true;
            break;
          }
        }
      }
      if (validSquare){
        ev.preventDefault();
      }
    }
  }

  // Static method to handle dropping tiles onto squares
  static drop(ev){
    ev.preventDefault();
    let data = ev.dataTransfer.getData("text");
    ev.target.appendChild(document.getElementById(data));
    let squareIndex = ev.target.id.split("-");
    let targetSquare = window.scrabble.board.squares[squareIndex[1]][squareIndex[2]];
    let currentPlayer = window.scrabble.getCurrentPlayer();
    for (let tileIndex = 0; tileIndex < currentPlayer.letters.length; tileIndex++){
      if (currentPlayer.letters[tileIndex].id == parseInt(data)){
        let droppedTile = currentPlayer.letters[tileIndex];
        if (droppedTile.square != null){
          droppedTile.square.tile = null;
        }
        targetSquare.tile = droppedTile;
        droppedTile.square = targetSquare;
        droppedTile.status = 2;
        break;
      }
    }
  }

  // Method to generate HTML representation of the square
  htmlSquare(){
    let bgcolour = Colour.Grey;
    let output = `<div id="${this.id}" class="square" ondrop="Square.drop(event)" ondragover="Square.allowDrop(event)" style="background-color:${Game.colours[bgcolour]}">`;
    if (this.tile != null)
      output += this.tile.html();
    output += '</div>';
    return output;
  }
}
