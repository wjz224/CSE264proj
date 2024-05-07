class Tile {
  // Constructor for creating a tile object
  constructor(letterIndex) {
    // The square where the tile is placed
    this.square = null;
    // Index of the letter in the game's letter array
    this.index = letterIndex;
    // The letter represented by the tile
    this.letter = Game.letterText[letterIndex];
    // The value of the letter
    this.value = Game.letterValues[letterIndex];
    // The status of the tile (0: not played, 1: played, 2: in current move)
    this.status = 0;
  }

  // Method to generate HTML representation of the tile
  html() {
    let html = `<div id="${this.id}" class="tile" data-value="${this.value}"`;
    // Add draggable attribute if the tile is draggable
    if (this.isDraggable())
      html += ' draggable="true" ondragstart="Tile.drag(event)"';
    // Add inner HTML for the tile (either letter or blank)
    if (this.index == Letter.BLANK)
      html += `><span class="letterblank">${this.letter}</span></div>`;
    else
      html += `>${this.letter}</div>`;
    return html;
  }

  // Method to get the DOM element of the tile by its ID
  getElement() {
    return document.getElementById(this.id.toString());
  }

  // Method to check if the tile is draggable
  isDraggable() {
    return (this.status == 1 || this.status == 2);
  }

  // Static method to handle dragging of the tile
  static drag(ev) {
    // Set the data of the dragged item
    ev.dataTransfer.setData("text", ev.target.id);
  }
}
