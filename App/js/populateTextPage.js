window.addEventListener("load", () => {
    fetch("/api/text/names", {method:"GET"}).then( async e => {
        const data = await e.json();
        const sideBar = document.getElementById("side_bar");
        for(let i = 0; i < data.length; ++i){
            let dataValue = `data-name="${data[i].textname}"`;
            sideBar.innerHTML += getSelectionButton("sel_" + data[i].textname, "side_bar_selection_button", data[i].textname, dataValue, `getDocText(this,'${data[i].textname}');`);
        }
    });

});

function getDocText(element, docName){
    const textArea = document.getElementById("center_text_area");
    
    fetch("/api/text/content", {
        method:"GET",
        headers:{
            "textname":docName
        }
    }).then(async e => {
        const data = await e.json();
        textArea.value = data.textdata;
    }).catch(err => {
        textArea.value = "ERROR";
    });

}