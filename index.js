let request = require('request');
var fs = require('fs');
var DomParser = require('dom-parser');
var parser = new DomParser();
var rimraf  = require('rimraf');
const hummus = require('hummus');
const program = require('commander');

let url = process.argv[2]; 
console.log('You downloading in: ' + process.argv[2]);
var download = function(uri, filename, callback){
    request.head(uri, function(err, res, body){
	request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
}

function ImagesToPdf(paths, name){
    const pdfWriter = hummus.createWriter(name + '.pdf');
    let number = paths.length;

    for(var i = 0; i < number; i++){
	const {width, height} = pdfWriter.getImageDimensions(paths[i]);
	const page = pdfWriter.createPage(0, 0, width, height);
	pdfWriter.startPageContentContext(page).drawImage(0, 0, paths[i]);
	pdfWriter.writePage(page);
    }

    pdfWriter.end();
}

fs.mkdir('image', {recursive: true}, (err) => { if (err) throw err;});
if(url === '')
    console.log('You must give me a url slideshare');
else{
    request(url, function (err, res, body){
	if(err)
	    throw err;
	var dom = parser.parseFromString(body); 
	var name_file = dom.getElementsByTagName('title')[0].textContent;
	let number_slide = dom.getElementsByClassName('slide_image').length;
	let arr_slides = [];
	for (var i  = 0; i < number_slide; i++)
	    arr_slides.push(dom.getElementsByClassName('slide_image')[i].getAttribute('data-normal'));
    
	paths = [];
	var check = 0;
	for (var i = 0; i < number_slide; i++){
	    paths.push('image/' + i + '.jpg');
	    download(arr_slides[i], 'image/' + i + '.jpg', function(){ 
		check += 1;
		if (check === number_slide){
		    ImagesToPdf(paths, name_file);
		    console.log("Create pdf file success");
		    rimraf.sync('image');
		}
	    })
	}
    })
}
