window.addEventListener('load', () => {
    let templates = document.getElementsByTagName('template');


    httpGetJSON('/api/files').then(e => { 
        var fileList = document.getElementById('fileList');
        for(let file in e.data){
            let element = getButton(e.data[file], e.data[file], e.data[file], 'getFile(this)');
            let delbutton = getButton(e.data[file]+"_del", "X", e.data[file]+"_del", 'alert(this.dataset.value);', "width:50px;");
            fileList.innerHTML += `<div style="display: flex; flex-direction:row;">${element + delbutton}</div>`;
        }
    });
});

window.addEventListener('load', () => {
    document.forms.fileForm.addEventListener('submit', (event) => {
        console.log("sub");
        event.preventDefault();
        fetch(event.target.action, {
            method: 'POST',
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
    let bstyle = `style='${style}'`
    let button = `<div class='custom_button'${style ? " "+bstyle : ""}>
    <input type='button' name='${name}' data-value=${data_value} onclick='${onclick}'>
    <span>${text}</span>
    </div>`
    return button
}