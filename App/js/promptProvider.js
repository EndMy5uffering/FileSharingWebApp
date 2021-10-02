
function closePrompt(){
    const e = document.getElementById("inputPrompt");
    if(e)
        e.remove();
}

function openPrompt(title, body){
    closePrompt();
    document.body.innerHTML += getPrompt(title, body);
}

function getPrompt(title, body){
    return `<div class="input-prompt" id="inputPrompt">
    <div class="input-prompt-title">
        <h1>${title}</h1>
        <div class="prompt-close">
            <div class="custom_button" style="min-width: 0px !important;">
                <input type="button" name="prompt-close-butto" onclick="closePrompt()">
                <span>X</span>
            </div>
        </div>
    </div>
    
    <div class="prompt-body">
        ${body}
    </div>
</div>`;
}

function getinputBox(id, name, labelText, maxchars){
    return `<div class="prompt-item">
    <label for="input" style="font-size: 25px; text-align: center;">${labelText}</label>
    <input type="text" name="${name}" class="input_feeld center_allign" id="${id}"${maxchars ? "maxlength=" + maxchars : ""}>
</div>`;
}

function getLable(id, text){
    return `<div class="prompt-item">
    <p id="${id}">${text}</p>
</div>`;
}

function getSubmitButton(id, name, clickEvent, text){
    return `<div class="prompt-item">
    <div class="custom_button">
        <input type="button" name="${name}" onclick="${clickEvent}" id="${id}">
        <span>${text}</span>
    </div>
</div>`;
}