const fs = require('fs');
const path = require('path');

const base64ToImageSign = (base64String) => {
    const timestamp = Date.now();
    const currName = Math.floor(Math.random() * 1000);
    let name = `${timestamp}-${currName}.png`;

    const outputDirectory = path.join(__dirname, '../assets/signature');
    const outputFilePath = path.join(outputDirectory, name);
    
    // Check if the directory exists, if not create it
    if (!fs.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory, { recursive: true });
    }

    const base64Data = base64String.split(',')[1];
    const buffer = Buffer.from(base64Data ? base64Data : base64String, 'base64');

    fs.writeFileSync(outputFilePath, buffer, 'binary');

    return name;
};


const base64ToImageFlow = (base64String) => {
    const timestamp = Date.now();
    const currName = Math.floor(Math.random() * 1000); 
    
    let name = timestamp+'-'+currName+'.png'

    const outputDirectory = path.join(__dirname,`../assets/flowmeter/${name}`)
    const base64Data = base64String.split(',')[1];

    const buffer = Buffer.from(base64Data?base64Data:base64String, 'base64');

    fs.writeFileSync(outputDirectory, buffer, 'binary');

    return name
};

const base64ToImageReq = (base64String) => {
    const timestamp = Date.now();
    const currName = Math.floor(Math.random() * 1000); 
    
    let name = timestamp+'-'+currName+'.png'

    const outputDirectory = path.join(__dirname,`../assets/request-kuota/${name}`)
    const base64Data = base64String.split(',')[1];

    const buffer = Buffer.from(base64Data?base64Data:base64String, 'base64');

    fs.writeFileSync(outputDirectory, buffer, 'binary');

    return name
};


module.exports = {
    base64ToImageSign,
    base64ToImageFlow,
    base64ToImageReq
}
