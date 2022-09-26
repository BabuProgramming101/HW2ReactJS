import React from "react";

export default class ListCard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            text: this.props.keyNamePair.name, //GETS THE NAME OF THE LIST 
            editActive: false,
        }
    }
    handleClick = (event) => {
        if (event.detail === 1) {
            this.handleLoadList(event);
        }
        else if (event.detail === 2) {
            this.handleToggleEdit(event);
        }
    }
    handleLoadList = (event) => {
        let listKey = event.target.id;
        if (listKey.startsWith("list-card-text-")) {
            listKey = listKey.substring("list-card-text-".length);
        }
        this.props.loadListCallback(listKey);
    }
    handleDeleteList = (event) => {
        event.stopPropagation();
        this.props.deleteListCallback(this.props.keyNamePair);
    }
    handleToggleEdit = (event) => {
        let addListButton = document.getElementById("add-list-button");
        addListButton.className = "toolbar-button-";
        this.setState({
            editActive: !this.state.editActive //THIS SETS THE EDITSTATE TO TRUE 
        });
    }
    handleUpdate = (event) => {
        this.setState({text: event.target.value }); //THIS UPDATES THE VALUE
    } 
    handleKeyPress = (event) => {
        if (event.code === "Enter") {
            this.handleBlur();
        } 
    }
    handleBlur = () => {
        let key = this.props.keyNamePair.key; //THIS GIVES THE INDEX OF THE LIST (THE KEY GIVES INDEX REMEMBER THAT FOR LIST)
        let textValue = this.state.text; //THE NEW NAME OF THE LIST 
        console.log("ListCard handleBlur: " + textValue);
        this.props.renameListCallback(key, textValue); //THIS PERFORMS THE OPERATION VIA A CALLBACK TO THE APP AND UPDATES THE LIST 
        this.handleToggleEdit();

        //PROCESS: 
        //CALLBACK --> APP --> PROCESS OF DELETION (I MIGHT BE MISSING ONE MORE STEP SOMEWHERE BUT THIS IS THE JIST FOR NOW)
    }

    render() {
        const { keyNamePair, selected } = this.props;
        if (this.state.editActive) {
            let addListButton = document.getElementById("add-list-button");
            addListButton.className = "toolbar-button-disabled";
            return (
                <input
                    id={"list-" + keyNamePair.name}
                    className='list-card'
                    type='text' 
                    onKeyPress={this.handleKeyPress} //ONCE "ENTER IS PRESSED" THE CHANGES ARE ALL MADE 
                    onBlur={this.handleBlur}
                    onChange={this.handleUpdate} //CONFUSED ABOUT THIS BUT WE WILL FIGURE THIS OUT AFTER THE PREVIOUS STEPS ARE COMPLETE
                    defaultValue={keyNamePair.name} //THE ORIGINAL NAME OF THE LIST 
                />)
        }
        else {
            let selectClass = "unselected-list-card";
            if (selected) {
                selectClass = "selected-list-card";
            }
            return (
                <div
                    id={keyNamePair.key}
                    key={keyNamePair.key}
                    onClick={this.handleClick}
                    className={'list-card ' + selectClass}>
                    <span
                        id={"list-card-text-" + keyNamePair.key}
                        key={keyNamePair.key}
                        className="list-card-text">
                        {keyNamePair.name}
                    </span>
                    <input
                        type="button"
                        id={"delete-list-" + keyNamePair.key}
                        className="list-card-button"
                        onClick={this.handleDeleteList}
                        value={"🗑"} />
                </div>
            );
        }
    }
}