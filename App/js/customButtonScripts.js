window.addEventListener('DOMContentLoaded', () => {

    var buttons = document.getElementsByClassName('fileSelector');
    
    for(let i = 0; i < buttons.length; i++){
        buttons[i].children[0].onchange = () => {
            if(buttons[i].children[0].files.length > 0){
                buttons[i].children[1].innerHTML = "";
                for(let j = 0; j < buttons[i].children[0].files.length; ++j){
                    buttons[i].children[1].innerHTML += buttons[i].children[0].files[j].name + " ";
                }
            }else{
                buttons[i].children[1].innerHTML = "Select a file";
            }
        };
    }

});