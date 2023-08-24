var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
let video = document.getElementById("video")
let image = document.getElementById("image")

let w = window.innerWidth
let h = window.innerHeight

// window.electronAPI.setImagePath((_event, path) => {
//     image.src = path
// })

// window.electronAPI.saveCanvas((_event, value) => {
//     saveCanvas()
// })

window.addEventListener("cut", (e) => {
    image.src = ""
})

window.addEventListener("copy", (e) => {
    canvas.toBlob(
        blob => navigator.clipboard.write([new ClipboardItem({'image/png': blob})])
    )
})

window.addEventListener("paste", (e) => {
    const files = e.clipboardData.files
    if(files.length) {
        image.src = files[0].path
    }
})

function saveCanvas() {
    w = 3264
    h = 2448
    drawImage()

    let canvasUrl = canvas.toDataURL();
    // Create an anchor, and set the href value to our data URL
    const createEl = document.createElement('a');
    createEl.href = canvasUrl;

    // This is the name of our downloaded file
    createEl.download = "download-this-canvas";

    // Click the download button, causing a download, and then remove it
    createEl.click();
    createEl.remove();

    w = window.innerWidth
    h = window.innerHeight
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
    
    ctx.drawImage(video, 0, 0, w, h);
    var videoCtx = ctx.getImageData(0, 0, w, h);
    var videoData = videoCtx.data;
    
    if (image.getAttribute('src')) {
        ctx.drawImage(image, 0, 0, w, h);
        var imageCtx = ctx.getImageData(0, 0, w, h);
        var imageData = imageCtx.data;

        let pixels = 4 * w * h
        while (pixels--) {
            videoData[pixels] = (videoData[pixels] * imageData[pixels])/255;
        }
    }

    videoCtx.data = videoData;
    ctx.putImageData(videoCtx, 0, 0);
}



