var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
let video = document.getElementById("video")
let image = document.getElementById("image")

let w = window.innerWidth
let h = window.innerHeight
let flipped = false
var snapshotData = null

document.body.onkeyup = function(e) {
    const key = e.key
    if (key == " " ||
        e.code == "Space" ||      
        e.keyCode == 32      
    ) {
        fullCanvas()
        image.src = canvas.toDataURL()
        restoreCanvas()
    }
}

window.electronAPI.setImagePath((_event, path) => {
    image.src = path
})

window.electronAPI.saveCanvas((_event, value) => {
    saveCanvas()
})

window.electronAPI.flipCanvas((_event, value) => {
    flipped = !flipped
})

function copyCanvas() {
    canvas.toBlob(
        blob => navigator.clipboard.write([new ClipboardItem({'image/png': blob})])
    )
}

window.addEventListener("click", (e) => {
    flipped = !flipped
})

window.addEventListener("cut", (e) => {
    fullCanvas()

    ctx.drawImage(image, 0, 0, w, h);
    copyCanvas()
    
    image.src = ""
    restoreCanvas()
})

window.addEventListener("copy", (e) => {
    fullCanvas()

    copyCanvas()

    restoreCanvas()
})

window.addEventListener("paste", (e) => {
    const files = e.clipboardData.files
    if(files.length) {
        image.src = files[0].path
    }
})

function fullCanvas() {
    w = 3264
    h = 2448
    drawImage()
}

function restoreCanvas() {
    w = window.innerWidth
    h = window.innerHeight
    drawImage()
}

function saveCanvas() {
    fullCanvas()

    let canvasUrl = canvas.toDataURL();
    // Create an anchor, and set the href value to our data URL
    const createEl = document.createElement('a');
    createEl.href = canvasUrl;

    // This is the name of our downloaded file
    createEl.download = "peeer";

    // Click the download button, causing a download, and then remove it
    createEl.click();
    createEl.remove();

    restoreCanvas()
}

document.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
});

document.addEventListener('drop', (event) => {
    event.preventDefault();
    event.stopPropagation();

    const path = event.dataTransfer.files[0].path
    image.src = path
});

window.addEventListener('resize', function() {
    w = window.innerWidth
    h = window.innerHeight
}, true);

if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(function (stream) {
            video.srcObject = stream;
            startCanvas()
    })
    .catch(function (err) {
        console.log("Something went wrong!");
    });
}

function startCanvas() {    
    const fps = 60

    canvasInterval = window.setInterval(() => {
        drawImage();
    }, 1000 / fps);
}

function drawImage() {
    canvas.width = w
    canvas.height = h
    
    if (flipped) {
        ctx.save()
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, w, h);
    var videoCtx = ctx.getImageData(0, 0, w, h);
    var videoData = videoCtx.data;
    
    if (flipped) {
        ctx.restore()
    }
    
    if (image.getAttribute('src')) {
        ctx.drawImage(image, 0, 0, w, h);
        var imageData = ctx.getImageData(0, 0, w, h).data

        let pixels = 4 * w * h
        while (pixels--) {
            videoData[pixels] = (videoData[pixels] * imageData[pixels])/255;
        }
    }

    videoCtx.data = videoData;
    ctx.putImageData(videoCtx, 0, 0);
}



