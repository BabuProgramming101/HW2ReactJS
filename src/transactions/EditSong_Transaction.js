import jsTPS_Transaction from "../common/jsTPS.js"
/**
 * AddSong_Transaction
 * 
 * This class represents a transaction that works with adding
 * a song to the playlist.
 * 
 * 
 * THE TRANSACTION SHOULD BE ASSOCIATED WITH THE BUTTON
 * @author McKilla Gorilla
 * @author ?
 */
export default class EditSong_Transaction extends jsTPS_Transaction {
    constructor(initApp, oldTitle, oldArtist, oldID, newTitle, newArtist, newID, initIndex) {
        super();
        this.app = initApp;
        this.oldTitle = oldTitle;
        this.oldArtist = oldArtist;
        this.oldID = oldID;
        this.newTitle = newTitle;
        this.newArtist = newArtist;
        this.newID = newID;
        this.index = initIndex; //THIS INDEX IS ESSENTIALLY THE LENGTH OF THE PLAYLIST SO TO GET INDEX WE DO - 1
    }

    doTransaction() {
        //WHEN WE DO, WE SET BACK TO THE NEWTITLE, NEWARTIST, AND NEWID
        this.app.editSong(this.newTitle, this.newArtist, this.newID, this.index);
    }

    undoTransaction() {
        //WHEN WE UNDO, WE SET BACK TO THE ORIGINALTITLE, ORIGINALARTIST, AND ORIGINALID
        this.app.editSongRetrieval(this.oldTitle, this.oldArtist, this.oldID, this.index);
    }
}
