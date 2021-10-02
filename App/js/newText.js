
function newText(){
    openPrompt("New text document", getinputBox("promptInputBox", "inputBox", "Document name:", 20) + getSubmitButton("PromptSubButton", "subButton", "createText()", "Submit"));
}

function createText(){
    const inputValue = document.getElementById("promptInputBox").value;
    fetch("/api/text/create", 
    {
        method:"POST",
        headers: {
            textname:inputValue
        }
    }).then(async e => {
        const res = await e.json();
        if(res.staus === 200){
            openPrompt("New document was created", getLable("allGood", "A new document was created on the server you can now add some text to it :D"));
            const sideBar = document.getElementById("side_bar");
            let dataValue = `data-name="${inputValue}"`;
            sideBar.innerHTML += getSelectionButton("selButton_" + inputValue, "side_bar_selection_button", inputValue, dataValue, `getDocText(this,'${inputValue}');`);
        }else{
            openPrompt("ERROR", getLable("errLabel", JSON.stringify(res)));
        }
    }).catch(err => openPrompt("ERROR", err));
}

function saveText(){
    const side_bar = document.getElementById("side_bar");
    const textArea = document.getElementById("center_text_area");
    if(!textArea.value || textArea.value === ""){
        openPrompt("ERROR", getLable("errL", "There is no text to save!"));
        return;
    }
    let selected = 0;
    Array.from(side_bar.children).forEach( e => {
        if(e.getElementsByTagName("input")[0] && e.getElementsByTagName("input")[0].checked){
            selected = e;
        }
    });
    if(selected !== 0){
        const textValue = textArea.value;
        const options = {
            method:"POST",
            headers:{
                "textname":selected.dataset.name,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                data: textValue
            })
        };
        fetch("/api/text/update", options).then(e => {
            if(e.status === 200){
                openPrompt("Saved!", getLable("okL", "Data was saved!"));
            }else{
                openPrompt("ERROR", getLable("errL", "Something went wrong!"));
            }
        }).catch(err => openPrompt("ERROR", getLable("errL", err)));
    }else{
        openPrompt("ERROR", getLable("errL", "No document was selected to save!"));
    }
}