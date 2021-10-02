const getPage = function(disableDownload, disableUpload) {
    const download = `<div class="container-item download">
    <h1>Download</h1>
    <lu id="fileList" class="customList">
    </lu>
</div>`;
    const upload = `<div class="container-item upload">
    <h1>Upload</h1>
    <form action="/upload" method="post" enctype="multipart/form-data" name="fileForm" class="customForm">
        <div class='custom_button fileSelector'>
            <input type='file' name='data' multiple>
            <span>Select a file</span>
        </div>
        <div class='custom_button'>
            <input type='submit' name='submit'>
            <span>Upload</span>
        </div>
        </input>
    </form>
</div>`;

    return`<!DOCTYPE html>
    <html lang="en">
    <head>
        <title>File exchange</title>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="css/index.css">
        <link rel="stylesheet" href="css/customButton.css">
        <link rel="stylesheet" href="css/customFonts.css">
        <link rel="stylesheet" href="css/customScroll.css">
        <link rel="stylesheet" href="css/selectionButton.css">
    
        <script src="js/utils.js"></script>
        <script src="js/populate.js"></script>
        <script src="js/cookieManager.js"></script>
        <script src="js/customButtonScripts.js"></script>
    </head>
    <body>
        <div class="container">
    
            <div class="top-selection">
                <div class='selection_button'>
                    <input type='radio' name='filesharing' onclick="window.location.href = '/files'" checked>
                    <span>FileSharing</span>
                </div>
                <div class='custom_button'>
                    <input type='button' name='textsharing' onclick="window.location.href = '/text'">
                    <span>TextSharing</span>
                </div>
            </div>
    
            ${ disableDownload ? "" : download}
    
            ${ disableUpload ? "" : upload}
    
        </div>
    </body>
    </html>`;
}

module.exports = {
    getPage:getPage
}