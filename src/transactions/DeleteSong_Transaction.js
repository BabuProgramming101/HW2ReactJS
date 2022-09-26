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
export default class DeleteSong_Transaction extends jsTPS_Transaction {
    constructor(initApp, initTitle, initArtist, initID, initIndex) {
        super();
        this.app = initApp;
        this.title = initTitle;
        this.artist = initArtist;
        this.youTubeId = initID;
        this.index = initIndex; //THIS INDEX IS ESSENTIALLY THE LENGTH OF THE PLAYLIST SO TO GET INDEX WE DO - 1
    }

    doTransaction() {
        this.app.deleteSong(this.index);
    }

    undoTransaction() {
        this.app.addSongSpecific(this.title, this.artist, this.youTubeId, this.index);
    }
}
