var Player = (function () {
    function Player() {
        this.letters = [];
        this.score = 0;
    }
    Player.prototype.giveLetterTile = function (tile) {
        this.letters.push(tile);
        tile.status = 1;
    };
    Player.prototype.displayLetters = function () {
        var l = 0;
        var view = "";
        for (; l < this.letters.length; l++) {
            view += this.letters[l].html();
        }
        return '<div class="letterholder" ondrop="Player.drop(event)" ondragover="Player.allowDrop(event)">' + view + '</div>';
    };
    Player.allowDrop = function (ev) {
        ev.preventDefault();
    };
    Player.prototype.getTileById = function (targetid) {
        var t = 0;
        var lt = null;
        for (; t < this.letters.length; t++) {
            lt = this.letters[t];
            if (lt.id == targetid)
                return lt;
        }
        return null;
    };
    Player.drop = function (ev) {
        ev.preventDefault();
        var data = ev.dataTransfer.getData("text");
        var currentPlayer = window.scrabble.getCurrentPlayer();
        var tileId = parseInt(data);
        // get letter from ID
        var letter = currentPlayer.getTileById(tileId);
        if (letter.square != null) {
            letter.square.tile = null;
            letter.status = 1;
            letter.square = null;
        }
        if (ev.target.className == 'letterholder') {
            ev.target.appendChild(document.getElementById(data));
        }
        else {
            ev.target.parentElement.appendChild(document.getElementById(data));
        }
    };
    Player.prototype.removeLetterTile = function (tileIndex) {
        this.letters.splice(tileIndex, 1);
    };
    return Player;
}());
