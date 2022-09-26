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
export default class AddSong_Transaction extends jsTPS_Transaction {
    constructor(initApp, initTitle, initArtist, inityouTubeId, initIndex) {
        super();
        this.app = initApp;
        this.title = initTitle;
        this.artist = initArtist;
        this.youTubeId = inityouTubeId;
        this.index = initIndex; //THIS INDEX IS ESSENTIALLY THE LENGTH OF THE PLAYLIST SO TO GET INDEX WE DO - 1
    }

    doTransaction() {
        this.app.addSong(this.title, this.artist, this.youTubeId);
    }

    undoTransaction() {
        this.app.deleteSong(this.index);
    }
}
