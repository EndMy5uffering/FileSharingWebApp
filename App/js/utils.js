function toPage(url){
    window.location.href = url;
}

var hashCode = function(str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
    h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1>>>0);
};

async function httpGetJSON(apiCall)
{
    var options = {
            method: "GET",
            mode: 'cors', // no-cors, *cors, same-origin
        };

    const result = await fetch(apiCall, options)
    .catch(rejected => {
        console.log(rejected);
    });
    return result.json();
}

async function httpGetText(apiCall)
{
    var options = {
            method: "GET",
            mode: 'cors', // no-cors, *cors, same-origin
        };

    const result = await fetch(apiCall, options)
    .catch(rejected => {
        console.log(rejected);
    });
    return result.text();
}

function postData(url, data){
    let options = {
        method: 'POST', 
        mode: 'cors', 
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data) 
      }
    console.log(options);
    return fetch(url, options);
}

function getFile(element){
    fetch('/download/' + element.dataset.value, {
        method: "GET",
        headers:{ "api_key":"none" }
    }).then( res => {
        if(res.status != 200) {
            element.parentElement.style.color = "red";
            throw res.statusText;
        }
        return res.blob();
    })
    .then( blob => {
        const DataURL = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = DataURL;
        anchor.download = element.dataset.value;

        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);

        URL.revokeObjectURL(DataURL);
    }).catch(err => console.log(err));
}