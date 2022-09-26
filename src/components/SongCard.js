import { toHaveAccessibleDescription, toHaveFocus } from "@testing-library/jest-dom/dist/matchers";
import React, { useState } from "react";

//EVENT HANDLING FOR THE SONG CARDS ARE ALL DONE HERE

/*

Events we need to handle:
- Song Editing
- Song Deleting
- Song Adding
*/

export default class SongCard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isEdit: false,
            isDragging: false,
            draggedTo: false,
        }
    }

    handleDragStart = (event) => {
        event.dataTransfer.setData("song", event.target.id);
        this.setState(prevState => ({
            isDragging: true,
            draggedTo: prevState.draggedTo
        }));
    }
    handleDragOver = (event) => {
        event.preventDefault();
        this.setState(prevState => ({
            isDragging: prevState.isDragging, 
            draggedTo: true
        }));
    }
    handleDragEnter = (event) => {
        event.preventDefault();
        this.setState(prevState => ({
            isDragging: prevState.isDragging,
            draggedTo: true
        }));
    }
    handleDragLeave = (event) => {
        event.preventDefault();
        this.setState(prevState => ({
            isDragging: prevState.isDragging,
            draggedTo: false
        }));
    }
    handleDrop = (event) => {
        event.preventDefault();
        let target = event.target;
        let targetId = target.id;
        targetId = targetId.substring(target.id.indexOf("-") + 1);
        console.log(targetId);
        let sourceId = event.dataTransfer.getData("song");
        sourceId = sourceId.substring(sourceId.indexOf("-") + 1);
        console.log(sourceId);
        
        this.setState(prevState => ({
            isDragging: false,
            draggedTo: false
        }));

        // ASK THE MODEL TO MOVE THE DATA
        this.props.moveCallback(sourceId, targetId);
    }

    handleSongDelete = (event) => {
        event.stopPropagation();
        this.props.deleteSongCallback(this.props.song, this.getItemNum()) //TO DELETE THE SONG SONG FROM THE ARRAY, WE NEED TO DELETE THE INDEX - 1
    }

    handleOriginalContent = (event) => { //THIS IS ALSO RESPONSIBLE FOR OPENING THE EDIT SONG MODAL AND PUTTING THE ITEMS INTO THE FIELD
        event.stopPropagation(); //PUTTING THIS HERE JUST IN CASE EVENTS PROPOGATE TO OTHER ITEMS 
        let originalSong = this.props.song;
        let songIndex = this.getItemNum();
        this.props.editSongCallback(originalSong, songIndex);
    }

    getItemNum = () => {
        return this.props.id.substring("playlist-song-".length); //GIVES US THE "POSITION" OF EACH SONG CARD
    }

    render() {
        let num = this.getItemNum();
        let itemClass = "playlister-song";
        if (this.state.draggedTo) {
            itemClass = "playlister-song-dragged-to";
        }
        else if(this.state.isEdit) {
            itemClass = "playlister-song-edit-to";
        }
        return (
            <div
                id={'song-' + num}
                className={itemClass}

                //EDITING AND DELETING MUST BOTH BE IN THIS IF STATEMENT SINCE WE ARE DEALING WITH "TOUCHING" THE CARDS 
                //FOR MOVING THE SONG
                onDragStart={this.handleDragStart}
                onDragOver={this.handleDragOver}
                onDragEnter={this.handleDragEnter}
                onDragLeave={this.handleDragLeave}
                onDrop={this.handleDrop} 
                draggable="true"

                //FOR EDITING A SONG WE NEED A MULTITUDE OF THINGS:
                //1) THE ORIGINAL TITLE, THE ORIGINAL ARTIST, AND THE ORIGINAL YOUTUBEID
                //2) THE INDEX OF WHERE THE SONG IS LOCATED
                //3) THE NEW TITLE, THE NEW ARTIST, AND THE NEW YOUTUBEID 

                //DOUBLE CLICKING WILL OPEN UP THE SONG TO EDIT THE MODAL
                onDoubleClick={this.handleOriginalContent}   
            > 
            <span>        
                {this.getItemNum() + ') '}
                <a href = {"https://www.youtube.com/watch?v=" + this.props.song.youTubeId}>{this.props.song.title + " by " + this.props.song.artist}</a>
            </span>
            <input
                type="button"
                className="delete-song-button"
                onClick={this.handleSongDelete}
                value={"X"}
            />
            </div>
         )
      }
   }
