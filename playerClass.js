class Player {
  constructor() {
    // Initialize player's letters array and score
    this.letters = [];
    this.score = 0;
  }

  // Method to add a tile to the player's letters array
  giveTile(tile) {
    this.letters.push(tile);
    // Set the status of the tile to 1
    tile.status = 1;
  }

  // Method to generate HTML representation of the player's letters
  displayLetters() {
    // Map each letter tile to its HTML representation and join them together
    let view = this.letters.map(letter => letter.html()).join('');
    // Return the HTML representation enclosed in a div with appropriate event listeners
    return `<div class="letterholder" ondrop="Player.drop(event)" ondragover="Player.allowDrop(event)">${view}</div>`;
  }

  // Static method to allow dropping letter tiles
  static allowDrop(ev) {
    ev.preventDefault();
  }

  // Method to get a letter tile by its ID
  getTileById(targetid) {
    return this.letters.find(letter => letter.id === targetid) || null;
  }

  // Static method to handle dropping letter tiles
  static drop(ev) {
    ev.preventDefault();
    // Get the data of the dropped item
    const data = ev.dataTransfer.getData("text");
    // Get the current player
    const currentPlayer = window.scrabble.getCurrentPlayer();
    // Parse the tile ID from the data
    const tileId = parseInt(data);
    // Get the letter tile from the current player by its ID
    const letter = currentPlayer.getTileById(tileId);
    // If the letter tile was previously on a square, reset its properties
    if (letter.square != null) {
      letter.square.tile = null;
      letter.status = 1;
      letter.square = null;
    }
    // Append the dropped letter tile to the appropriate container
    if (ev.target.className === 'letterholder') {
      ev.target.appendChild(document.getElementById(data));
    } else {
      ev.target.parentElement.appendChild(document.getElementById(data));
    }
  }

  // Method to remove a tile from the player's letters array by index
  removeTile(tileIndex) {
    this.letters.splice(tileIndex, 1);
  }
}
