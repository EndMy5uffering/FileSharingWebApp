window.addEventListener("load", () => {
    let templates = document.getElementsByTagName("template");


    httpGetJSON("/api/files").then(e => { 
        var fileList = document.getElementById("fileList");
        for(let file in e.data){
            const fileName = e.data[file];
            let element = getButton(fileName, fileName, fileName, "getFile(this)");
            let delbutton = getButton(fileName+"_del", "X", fileName+"_del", `delFile('${fileName}');`, "width:50px;");
            let infbutton = getButton(fileName+"_inf", "?", fileName+"_inf", `infFile('${fileName}');`, "width:100px;");
            fileList.innerHTML += `<div style="display: flex; flex-direction:row;">${element + infbutton + delbutton}</div>`;
        }
    });
});

window.addEventListener("load", () => {
    document.forms.fileForm.addEventListener("submit", (event) => {
        console.log("sub");
        event.preventDefault();
        fetch(event.target.action, {
            method: "POST",
            body: new FormData(event.target)
        }).then((resp) => {
            return resp.json();
        }).then((body) => {
            console.log(body);
        }).catch((error) => {
            console.log(error);
        });
        location.reload();
    });
});

function getButton(name, text, data_value, onclick, style){
    let bstyle = `style="${style}"`
    let button = `<div class="custom_button"${style ? " "+bstyle : ""}>
    <input type="button" name="${name}" data-value=${data_value} onclick="${onclick}">
    <span>${text}</span>
    </div>`
    return button
}

function delFile(file){
    fetch("/api/files/delete", {
        method:"POST",
        headers:{
            filename:file
        }
    }).then(e => {
        if(e.status === 200){
            location.reload();
        }else{
            openPrompt("Error", getLable("errL", "Something went wrong :/"));
        }
    }).catch(err => console.log(err));
}

function infFile(file){
    fetch("/api/files/stats", {
        method:"GET",
        headers:{
            filename:file
        }
    }).then(async e => {
        if(e.status === 200){
            const data = await e.json();
            openPrompt("File info", getLable("finf", `Size: ${data.size}<br>
            Created: ${data.birthtime}<br>
            Last changed: ${data.changed}<br>
            Last modified: ${data.modified}<br>
            Last accessed: ${data.accessed}`));
        }else{
            openPrompt("Error", getLable("errL", "Something went wrong :/"));
        }
    }).catch(err => console.log(err));
}