var login = function(){
    const elements = document.getElementById("login");
    const inputs = elements.getElementsByTagName("input");
    const name = inputs[0].value;
    const pass = inputs[1].value;
    window.api_key = hashCode(name+pass, 42);
}