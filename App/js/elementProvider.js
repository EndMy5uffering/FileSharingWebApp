function getButton(){
    return "";
}

function getSelectionButton(id, name, displayText, dataValues, onclickEvent){
    return `<div class="selection_button" id="${id}" ${dataValues &&dataValues !== "" ? " " + dataValues : ""}>
    <input type="radio" name="${name}" onclick="${onclickEvent}">
    <span>${displayText}</span>
</div>`;
}