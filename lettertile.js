var LetterTile = (function () {
    function LetterTile(letterIndex) {
        this.square = null;
        this.index = letterIndex;
        this.letter = Game.letterText[letterIndex];
        this.value = Game.letterValues[letterIndex];
        this.status = 0;
        // console.log("Created " + this.letter + " value = " + this.value);
    }
    LetterTile.prototype.html = function () {
        var html = '<div id="' + this.id + '" class="tile" data-value="' + this.value + '"';
        if (this.isDraggable())
            html += ' draggable="true" ondragstart="LetterTile.drag(event)"';
        if (this.index == Letter.BLANK)
            html += '><span class="letterblank">' + this.letter + '</span></div>';
        else
            html += '>' + this.letter + '</div>';
        return html;
    };
    LetterTile.prototype.getElement = function () {
        return document.getElementById(this.id.toString());
    };
    LetterTile.prototype.isDraggable = function () {
        return (this.status == 1 || this.status == 2);
    };
    LetterTile.drag = function (ev) {
        ev.dataTransfer.setData("text", ev.target.id);
    };
    return LetterTile;
}());
