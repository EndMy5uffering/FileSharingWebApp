window.addEventListener('DOMContentLoaded', () => {

    var buttons = document.getElementsByClassName('fileSelector');
    
    for(let i = 0; i < buttons.length; i++){
        buttons[i].children[0].onchange = () => {
            buttons[i].children[1].innerHTML = buttons[i].children[0].files[0].name;
        };
    }

});