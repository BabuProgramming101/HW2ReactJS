import React from 'react';
import './App.css';

// IMPORT DATA MANAGEMENT AND TRANSACTION STUFF
import DBManager from './db/DBManager';
import jsTPS from './common/jsTPS.js';

// OUR TRANSACTIONS
import MoveSong_Transaction from './transactions/MoveSong_Transaction.js';
import AddSong_Transaction from './transactions/AddSong_Transaction';
import DeleteSong_Transaction from './transactions/DeleteSong_Transaction';
import EditSong_Transaction from './transactions/EditSong_Transaction';

// THESE REACT COMPONENTS ARE MODALS
import DeleteListModal from './components/DeleteListModal.js';
import EditSongModal from './components/EditSongModal.js';
import DeleteSongModal from './components/DeleteSongModal';

// THESE REACT COMPONENTS ARE IN OUR UI
import Banner from './components/Banner.js';
import EditToolbar from './components/EditToolbar.js';
import PlaylistCards from './components/PlaylistCards.js';
import SidebarHeading from './components/SidebarHeading.js';
import SidebarList from './components/SidebarList.js';
import Statusbar from './components/Statusbar.js';

class App extends React.Component {
    constructor(props) {
        super(props);

        // THIS IS OUR TRANSACTION PROCESSING SYSTEM
        this.tps = new jsTPS();

        // THIS WILL TALK TO LOCAL STORAGE
        this.db = new DBManager();

        // GET THE SESSION DATA FROM OUR DATA MANAGER
        let loadedSessionData = this.db.queryGetSessionData();

        // SETUP THE INITIAL STATE
        this.state = {
            listKeyPairMarkedForDeletion : null,
            listSongMarkedForEditing: {title: '', artist: '', youTubeId: ''},
            listSongMarkedForDeleting : {title: '', artist: '', youTubeId: ''},
            listSongIndex: 0,
            songKey: null,
            currentList : null,
            sessionData : loadedSessionData
        }
    }
    sortKeyNamePairsByName = (keyNamePairs) => {
        keyNamePairs.sort((keyPair1, keyPair2) => {
            // GET THE LISTS
            return keyPair1.name.localeCompare(keyPair2.name);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CREATING A NEW LIST
    createNewList = () => {
        // FIRST FIGURE OUT WHAT THE NEW LIST'S KEY AND NAME WILL BE
        let newKey = this.state.sessionData.nextKey;
        let newName = "Untitled" + newKey;

        // MAKE THE NEW LIST
        let newList = {
            key: newKey,
            name: newName,
            songs: []
        };

        // MAKE THE KEY,NAME OBJECT SO WE CAN KEEP IT IN OUR
        // SESSION DATA SO IT WILL BE IN OUR LIST OF LISTS
        let newKeyNamePair = { "key": newKey, "name": newName };
        let updatedPairs = [...this.state.sessionData.keyNamePairs, newKeyNamePair];
        this.sortKeyNamePairsByName(updatedPairs);

        // CHANGE THE APP STATE SO THAT THE CURRENT LIST IS
        // THIS NEW LIST AND UPDATE THE SESSION DATA SO THAT THE
        // NEXT LIST CAN BE MADE AS WELL. NOTE, THIS setState WILL
        // FORCE A CALL TO render, BUT THIS UPDATE IS ASYNCHRONOUS,
        // SO ANY AFTER EFFECTS THAT NEED TO USE THIS UPDATED STATE
        // SHOULD BE DONE VIA ITS CALLBACK
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: newList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey + 1,
                counter: prevState.sessionData.counter + 1,
                keyNamePairs: updatedPairs
            }
        }), () => {
            // PUTTING THIS NEW LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationCreateList(newList);

            // SO IS STORING OUR SESSION DATA
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF DELETING A LIST.
    deleteList = (key) => {
        // IF IT IS THE CURRENT LIST, CHANGE THAT

        let newCurrentList = null;
        if (this.state.currentList) {
            if (this.state.currentList.key !== key) {
                // THIS JUST MEANS IT'S NOT THE CURRENT LIST BEING
                // DELETED SO WE'LL KEEP THE CURRENT LIST AS IT IS
                newCurrentList = this.state.currentList;
            }
        }

        let keyIndex = this.state.sessionData.keyNamePairs.findIndex((keyNamePair) => {
            return (keyNamePair.key === key);
        });
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        if (keyIndex >= 0)
            newKeyNamePairs.splice(keyIndex, 1);

        // AND FROM OUR APP STATE
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : null,
            currentList: newCurrentList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter - 1,
                keyNamePairs: newKeyNamePairs
            }
        }), () => {
            let addButton = document.getElementById("add-song-button");
            let closeListButton = document.getElementById("close-button");
            let undoButton = document.getElementById("undo-button");
            let redoButton = document.getElementById("redo-button");
            undoButton.className = "toolbar-button-disabled";
            redoButton.className = "toolbar-button-disabled";
            addButton.className = "toolbar-button-disabled";
            closeListButton.className = "toolbar-button-disabled";
            // DELETING THE LIST FROM PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationDeleteList(key);

            // SO IS STORING OUR SESSION DATA
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    deleteMarkedList = () => {
        this.deleteList(this.state.listKeyPairMarkedForDeletion.key);
        this.hideDeleteListModal();
    }
    // THIS FUNCTION SPECIFICALLY DELETES THE CURRENT LIST
    deleteCurrentList = () => {
        if (this.state.currentList) {
            this.deleteList(this.state.currentList.key);
        }
    }
    renameList = (key, newName) => {
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs]; //THE '...' MEANS IT LETS YOU MAKE A NEW ARRAY WITH VALUES OF THE OLD ARRAY
        // NOW GO THROUGH THE ARRAY AND FIND THE ONE TO RENAME
        for (let i = 0; i < newKeyNamePairs.length; i++) {
            let pair = newKeyNamePairs[i];
            if (pair.key === key) {
                pair.name = newName;
            }
        }
        this.sortKeyNamePairsByName(newKeyNamePairs);

        // WE MAY HAVE TO RENAME THE currentList
        let currentList = this.state.currentList;
        if (currentList.key === key) {
            currentList.name = newName;
        }

        this.setState(prevState => ({ //NOTHING IS CHANGED HERE BECAUSE THE RENDERING DOES NOT INVOLVE RENAMING??
            listKeyPairMarkedForDeletion : null,
            currentList : prevState.currentList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter,
                keyNamePairs: newKeyNamePairs
            }
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            let list = this.db.queryGetList(key);
            list.name = newName;
            this.db.mutationUpdateList(list);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF LOADING A LIST FOR EDITING
    loadList = (key) => {

        let newCurrentList = this.db.queryGetList(key);
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: newCurrentList,
            sessionData: this.state.sessionData
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            this.tps.clearAllTransactions();
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CLOSING THE CURRENT LIST
    closeCurrentList = () => {

        let undoButton = document.getElementById("undo-button");
        let redoButton = document.getElementById("redo-button");
        undoButton.className = "toolbar-button-disabled";
        redoButton.className = "toolbar-button-disabled"; 

        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: null,
            sessionData: this.state.sessionData
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            this.tps.clearAllTransactions();
        });
    }
    setStateWithUpdatedList(list) {
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion, //SETTING TO ITSELF WHERE PREVSTATE == CURRENTSTATE
            currentList : list,
            sessionData : this.state.sessionData
        }), () => {
            // UPDATING THE LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationUpdateList(this.state.currentList);
        });
    }

    //WILL BE USED FOR ADDING A SONG TO THE LIST LATER 

    getPlaylistSize = () => {
        return this.state.currentList.songs.length;
    }
    // THIS FUNCTION MOVES A SONG IN THE CURRENT LIST FROM
    // start TO end AND ADJUSTS ALL OTHER ITEMS ACCORDINGLY
    moveSong(start, end) {
        let list = this.state.currentList;

        // WE NEED TO UPDATE THE STATE FOR THE APP
        start -= 1;
        end -= 1;
        if (start < end) {
            let temp = list.songs[start];
            for (let i = start; i < end; i++) {
                list.songs[i] = list.songs[i + 1];
            }
            list.songs[end] = temp;
        }
        else if (start > end) {
            let temp = list.songs[start];
            for (let i = start; i > end; i--) {
                list.songs[i] = list.songs[i - 1];
            }
            list.songs[end] = temp;
        }
        this.setStateWithUpdatedList(list); //WE PROBABLY NEED TO INCLUDE THIS IN OUR OTHER METHODS 
    }

    addSong = (initTitle, initArtist, initID) => {
        let list = this.state.currentList;
        let song = {initTitle, initArtist, initID};
        song.title = initTitle;
        song.artist = initArtist;
        song.youTubeId = initID;
        this.state.currentList.songs[this.getPlaylistSize()] = song;
        document.getElementById("undo-button").className = "toolbar-button-"; //FORCE THE UNDO BUTTON TO ACTIVATE  
        this.setStateWithUpdatedList(list); //THIS ACTS LIKE THE UPDATE VIEW IN OUR HOMEWORK 1 (ALSO SAVES TO MEMORY IN LOCAL STORAGE)
    }

    addSongSpecific = (initTitle, initArtist, initID, initIndex) => {
        let list = this.state.currentList;
        let song = {initTitle, initArtist, initID};
        song.title = initTitle;
        song.artist = initArtist;
        song.youTubeId = initID;
        this.state.currentList.songs.splice(initIndex, 0, song);
        this.setStateWithUpdatedList(list);
    }

    // THIS FUNCTION ADDS A MoveSong_Transaction TO THE TRANSACTION STACK
    addMoveSongTransaction = (start, end) => {
        let transaction = new MoveSong_Transaction(this, start, end);
        this.tps.addTransaction(transaction);
    }

    //PARAMETERS SHOULD BE HERE 
    //WHEN WE UNDO THE TRANSACTION, WE ARE SIMPLY JUST REMOVING FROM THE END OF THE ARRAY 
    addAddSongTransaction = () => {
        let transaction = new AddSong_Transaction(this, "Untitled", "Unknown", "dQw4w9WgXcQ", this.getPlaylistSize());
        this.tps.addTransaction(transaction);
    }  

    addDeleteSongTransaction = () => {
        let songTitle = this.state.listSongMarkedForDeleting.title;
        let songArtist = this.state.listSongMarkedForDeleting.artist;
        let songID = this.state.listSongMarkedForDeleting.youTubeId;
        let songIndex = this.state.listSongIndex;
        let transaction = new DeleteSong_Transaction(this, songTitle, songArtist, songID, songIndex);
        this.tps.addTransaction(transaction);
        this.hideDeleteSongModal();
    }

    addEditSongTransaction = () => {

        //WE NEED TO STORE THE NEW INFORMATION BY USING THE OLD INFORMATION AS PARAMETERS AND THEN 
        //SETTING THE INFO
        let songIndex = this.state.listSongIndex;
        let song = this.state.currentList.songs[songIndex - 1]

        let oldsongTitle = song.title; //OLD SONG INFORMATION
        let oldsongArtist = song.artist; //OLD SONG INFORMATION
        let oldsongID = song.youTubeId; //OLD SONG INFORMATION

        let newsongTitle = document.getElementById("edit-song-modal-title-textfield").value;
        let newsongArtist = document.getElementById("edit-song-modal-artist-textfield").value;
        let newsongID = document.getElementById("edit-song-modal-youTubeId-textfield").value;

        let transaction = new EditSong_Transaction(this, oldsongTitle, oldsongArtist, oldsongID, newsongTitle, newsongArtist, newsongID, songIndex);
        this.tps.addTransaction(transaction);
        this.hideEditSongModal();
    }

    // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING AN UNDO
    undo = () => {
        if (this.tps.hasTransactionToUndo()) {
            this.tps.undoTransaction();

            // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
            this.db.mutationUpdateList(this.state.currentList);
        }

        if(!this.tps.hasTransactionToUndo()) {

        }
    }
    // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING A REDO
    redo = () => {
        if (this.tps.hasTransactionToRedo()) {
            this.tps.doTransaction();

            // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
            this.db.mutationUpdateList(this.state.currentList);
        }
    }
    markListForDeletion = (keyPair) => {
        this.setState(prevState => ({ //this.setState forces a rerender 
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion : keyPair,
            sessionData: prevState.sessionData
        }), () => {
            // PROMPT THE USER
            this.showDeleteListModal();
        });
    }

    //USED TO OPEN UP THE MODAL FOR EDITING

    markSongForDeleting = (song, index) => {
        this.setState(prevState => ({ //this.setState forces a rerender 
            currentList : prevState.currentList,
            listSongMarkedForDeleting : {title: song.title, artist: song.artist, youTubeId: song.youTubeId},
            listSongIndex : index - 1,
            sessionData : prevState.sessionData
        }), () => {
            this.showDeleteSongModal();
        });
    }

    deleteSong = (index) => {
        let list = this.state.currentList;
        this.state.currentList.songs.splice(index, 1);
        this.setStateWithUpdatedList(list);
    }

    //WE WILL GET TO THIS LATER, BUT WE ARE ALMOST TOWARDS THE SOLUTION 

    retrieveOriginalSongInformation = (song, index) => {
     
        this.setState(prevState => ({ //this.setState forces a rerender 
            currentList : prevState.currentList,
            listSongMarkedForEditing : {title: song.title, artist: song.artist, youTubeId: song.youTubeId}, //WILL STORE ORIGINAL VALUE OF THE SONG
            listSongIndex : index, //WILL CONTAIN THE INDEX + 1, SO WE SUBTRACT BY 1 LATER
            sessionData : prevState.sessionData
        }), () => {
            document.getElementById("edit-song-modal-title-textfield").value = this.state.listSongMarkedForEditing.title;
            document.getElementById("edit-song-modal-artist-textfield").value = this.state.listSongMarkedForEditing.artist;
            document.getElementById("edit-song-modal-youTubeId-textfield").value = this.state.listSongMarkedForEditing.youTubeId;
            this.showEditSongModal();
        });
    }

    editSong = (newTitle, newArtist, newID, index) => {

        let list = this.state.currentList;
        let song = this.state.currentList.songs[index - 1];

        if(newTitle === "") {
            newTitle = song.title;
        }
        if(newArtist === "") {
            newArtist = song.artist;
        }
        if(newID === "") {
            newID = song.youTubeId;
        }

        song.title = newTitle;
        song.artist = newArtist;
        song.youTubeId = newID;

        this.setStateWithUpdatedList(list); 
    }

    editSongRetrieval = (oldTitle, oldArtist, oldID, songIndex) => {

        let list = this.state.currentList;
        let song = this.state.currentList.songs[songIndex - 1];
        
        song.title = oldTitle;
        song.artist = oldArtist;
        song.oldID = oldID;

        this.setStateWithUpdatedList(list);
    }


    // THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER
    // TO SEE IF THEY REALLY WANT TO DELETE THE LIST
    showDeleteListModal() {
        document.getElementById("add-song-button").className = "toolbar-button-disabled";
        document.getElementById("close-button").className = "toolbar-button-disabled";
        document.getElementById("undo-button").className = "toolbar-button-disabled";
        document.getElementById("redo-button").className = "toolbar-button-disabled";
        let modal = document.getElementById("delete-list-modal");
        modal.classList.add("is-visible");
    }
    // THIS FUNCTION IS FOR HIDING THE MODAL
    hideDeleteListModal = () => {
        document.getElementById("add-song-button").className = "toolbar-button-";
        document.getElementById("close-button").className = "toolbar-button-";
        if(this.tps.hasTransactionToUndo()) { 
            document.getElementById("undo-button").className = "toolbar-button-";
        } else {
            document.getElementById("undo-button").className = "toolbar-button-disabled";
        }
        if(this.tps.hasTransactionToRedo()) {
            document.getElementById("redo-button").className = "toolbar-button-";
        }
        else {
            document.getElementById("redo-button").className = "toolbar-button-disabled";
        }
        let modal = document.getElementById("delete-list-modal");
        modal.classList.remove("is-visible");
    }

    //FUNCTION FOR SHOWING THE MODAL FOR PROMPTING THE USER TO SEE IF THEY WANNA EDIT THE SONG
    showEditSongModal() {
        document.getElementById("add-song-button").className = "toolbar-button-disabled";
        document.getElementById("close-button").className = "toolbar-button-disabled";
        document.getElementById("undo-button").className = "toolbar-button-disabled";
        document.getElementById("redo-button").className = "toolbar-button-disabled";
        let modal = document.getElementById("edit-song-modal");
        modal.classList.add("is-visible");
    }

    //FUNCTION FOR HIDING THE MODAL
    hideEditSongModal = () => {
        document.getElementById("add-song-button").className = "toolbar-button-";
        document.getElementById("close-button").className = "toolbar-button-";
        if(this.tps.hasTransactionToUndo()) { 
            document.getElementById("undo-button").className = "toolbar-button-";
        } else {
            document.getElementById("undo-button").className = "toolbar-button-disabled";
        }
        if(this.tps.hasTransactionToRedo()) {
            document.getElementById("redo-button").className = "toolbar-button-";
        }
        else {
            document.getElementById("redo-button").className = "toolbar-button-disabled";
        }
        let modal = document.getElementById("edit-song-modal");
        modal.classList.remove("is-visible");
    }

    showDeleteSongModal() {
        document.getElementById("add-song-button").className = "toolbar-button-disabled";
        document.getElementById("close-button").className = "toolbar-button-disabled";
        document.getElementById("undo-button").className = "toolbar-button-disabled";
        document.getElementById("redo-button").className = "toolbar-button-disabled";
        let modal = document.getElementById("delete-song-modal");
        modal.classList.add("is-visible");
    }

    hideDeleteSongModal = () => {
        document.getElementById("add-song-button").className = "toolbar-button-";
        document.getElementById("close-button").className = "toolbar-button-";
        if(this.tps.hasTransactionToUndo()) { 
            document.getElementById("undo-button").className = "toolbar-button-";
        } else {
            document.getElementById("undo-button").className = "toolbar-button-disabled";
        }
        if(this.tps.hasTransactionToRedo()) {
            document.getElementById("redo-button").className = "toolbar-button-";
        }
        else {
            document.getElementById("redo-button").className = "toolbar-button-disabled";
        }
        let modal = document.getElementById("delete-song-modal");
        modal.classList.remove("is-visible");
    }

    handleUndoRedo = (event) => {

        let modalDeleteSong = document.getElementById("delete-song-modal");
        let modalEditSong = document.getElementById("edit-song-modal");
        let modalDeleteList = document.getElementById("delete-list-modal");
        if(event.ctrlKey && !modalDeleteSong.classList.contains("is-visible") && !modalEditSong.classList.contains("is-visible") && !modalDeleteList.classList.contains("is-visible")) {
            if(event.keyCode === 90) {
                this.undo();
            }
            else if (event.keyCode === 89) {
                this.redo();
            }
        }
    }
    
    //UPON LAUNCH THE BUTTONS MUST BE PURELY DISABLED 

    render() {
        let canAddSong = this.state.currentList !== null;
        let canUndo = this.tps.hasTransactionToUndo();
        let canRedo = this.tps.hasTransactionToRedo();
        let canClose = this.state.currentList !== null;
        return (
            <div id="root" onKeyDown={this.handleUndoRedo} tabIndex="1">
                <Banner />
                <SidebarHeading
                    createNewListCallback={this.createNewList}
                />
                <SidebarList
                    currentList={this.state.currentList} //GIVES THE CURRENT LIST
                    keyNamePairs={this.state.sessionData.keyNamePairs} //GIVES KEYNAMEPAIR OF THE LIST
                    deleteListCallback={this.markListForDeletion} //MARKS A LIST FOR DELETION AND ALSO OPEN THE MODAL
                    loadListCallback={this.loadList}
                    renameListCallback={this.renameList}
                />
                <EditToolbar
                    canAddSong={canAddSong}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    canClose={canClose} 
                    undoCallback={this.undo}
                    redoCallback={this.redo}
                    closeCallback={this.closeCurrentList}
                    addSongCallback={this.addAddSongTransaction} //WE ADD TRANSACTION HERE
                />
                <PlaylistCards
                    currentList={this.state.currentList}
                    moveSongCallback={this.addMoveSongTransaction} //ADDS SONG TO THE TRANSACTION AND THEN ALSO DOES THE MOVE OPERATION 
                    editSongCallback={this.retrieveOriginalSongInformation} //**WORK IN PROGRESS */
                    deleteSongCallback={this.markSongForDeleting} 
                    //THIS OPENS UP THE SONG FOR EDITING, BUT SHOULD WE ALSO INCLUDE THE SONG PARAMETERS?
                    //IT IS ALSO IMPORTANT TO NOTE IF WE WANT TO EDIT THE SONG AND MOVE TO TRANSACTION 
                /> 
                <Statusbar 
                    currentList={this.state.currentList} />
                <DeleteListModal
                    listKeyPair={this.state.listKeyPairMarkedForDeletion}
                    hideDeleteListModalCallback={this.hideDeleteListModal}
                    deleteListCallback={this.deleteMarkedList}
                />
                <EditSongModal //WE NEED: 1) THE OLD SONG CONTENT AND 2) THE INDEX OF THE SONG (MAYBE)
                   editSongCallback = {this.addEditSongTransaction} 
                   hideEditSongCallback={this.hideEditSongModal}
                />
                <DeleteSongModal // WE NEED: 1) THE SONG AND 2) THE INDEX OF THE SONG
                   song = {this.state.listSongMarkedForDeleting}
                   hideDeleteSongModalCallback={this.hideDeleteSongModal}
                   deleteSongCallback = {this.addDeleteSongTransaction}
                />
            </div>
        );
    }
}

export default App;
