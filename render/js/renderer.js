const img = document.getElementById('img');
const previewImg = document.getElementById('previewImg');
const form = document.getElementById('img-form');
const filename = document.getElementById('filename');
const outputPath = document.getElementById('output-path');
const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');
const logo = document.getElementById('logo');
const txt = document.getElementById('txt');

// File select listener
img.addEventListener('change', (e) => {
    const file = e.target.files[0];

    if (!isFileImage(file)) {
        alertError('Please select an image.');
        return;
    }
    previewImg.src = file.path;
    // previewImg.style.width = '50px';
    logo.style.display = 'none';
    txt.style.display = 'none';

    const image = new Image();
    image.src = URL.createObjectURL(file);
    image.onload = () => {
        widthInput.value = image.width;
        heightInput.value = image.height;
    }

    // Show form, image name and output path
    form.style.display = 'block';
    filename.innerText = img.files[0].name;
    outputPath.innerText = path.join(os.homedir(), 'Downloads/ImageResizer')
})

// Make sure file is an image
function isFileImage(file) {
    const acceptedImageTypes = ['image/gif', 'image/jpeg', 'image/jpg', 'image/png'];

    return file && acceptedImageTypes.includes(file['type'])
}

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const width = widthInput.value;
    const height = heightInput.value;
    const imgpath = img.files[0].path;

    if (!img.files[0]) {
        alertError('Please select an image.');
        return;
    }

    if (width === '' || height === '') {
        alertError('Please provide the dimensions.');
        return;
    }

    ipcRenderer.send('img:resize', { width, height, imgpath });
})

ipcRenderer.on('image:done', () => {
    alertSuccess(`Image resize to ${widthInput.value} X ${heightInput.value}`);
})

function alertError(message) {
    Tostify.toast({
        text: message,
        duration: 5000,
        style: {
            background: 'red',
            color: 'white',
            height: '35px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }
    })
}

function alertSuccess(message) {
    Tostify.toast({
        text: message,
        duration: 3000,
        close: true,
        style: {
            background: 'green',
            color: 'white',
            height: '35px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }
    })
}