import React, {Component} from 'react';

export default class EditSongModal extends Component {
     render() {
        const {editSongCallback, hideEditSongCallback} = this.props
        return (
            <div 
                className="modal" 
                id="edit-song-modal" 
                data-animation="slideInOutLeft">
                    <div className="modal-root" id='verify-edit-song-root'>
                        <div className="modal-north">
                            Edit Song
                        </div>
                        <div className="modal-center-edit">
                        <div id="title-prompt" className="modal-prompt">Title:</div><input id="edit-song-modal-title-textfield" className='modal-textfield' type="text" defaultValue="?"/>
                        <div id="artist-prompt" className="modal-prompt">Artist:</div><input id="edit-song-modal-artist-textfield" className='modal-textfield' type="text" defaultValue="?"/>
                        <div id="you-tube-id-prompt" className="modal-prompt">You Tube Id:</div><input id="edit-song-modal-youTubeId-textfield" className='modal-textfield' type="text" defaultValue="?"/>
                        </div>
                        <div className="modal-south">
                            <input type="button" 
                                id="edit-song-confirm-button" 
                                className="modal-button" 
                                onClick={editSongCallback}
                                value='Confirm'/>
                            <input type="button" 
                                id="edit-song-cancel-button" 
                                className="modal-button" 
                                onClick={hideEditSongCallback}
                                value='Cancel'/>
                        </div>
                    </div>
            </div>
            );
        }
    }