const fs = require('fs');
const sharp = require('sharp');
const average = require('image-average-color');
// let originalImage = './sample.png';
// const imgs = require('img')
// file name for cropped image
let outputImage = './output.png';
let imageHeight = 1000;
let imageWidth = 1000;

// areas 
exports.getColor2 = function(imgData, outputData, imgWidth, imgHeight, width, height, area_id, callback) {
  // exports.getColor = function() {
    // buffer or image path

    // grid 일수도 있고 area일수도 있음
    let x_start = Math.ceil(area_id / 100);
    let y_start = area_id % 100;
    sharp(imgData).resize(imgWidth, imgHeight).extract({ width, height, x_start, y_start }).toFile(outputData)
    .then(function(new_file_info) {
      // console.log(new_file_info)
      if (!new_file_info) {
        return;
      }
      average(outputData, (err, color) => {
        if (err) throw err;
        var [red, green, blue, alpha] = color;
        callback(color)
  
      })
      // console.log("Image cropped and saved");
    })
    .catch(function(err) {
        console.log("An error occured");
    });
  
  }
  
exports.getColor = function(imgData, outputData, imgWidth, imgHeight, width, height, left, top, callback) {
// exports.getColor = function() {
  // buffer or image path
  sharp(imgData).resize(imgWidth, imgHeight).extract({ width, height, left, top }).toFile(outputData)
  .then(function(new_file_info) {
    // console.log(new_file_info)
    if (!new_file_info) {
      return;
    }
    average(outputData, (err, color) => {
      if (err) throw err;
      var [red, green, blue, alpha] = color;
      callback(color)

    })
    // console.log("Image cropped and saved");
  })
  .catch(function(err) {
      console.log("An error occured");
  });

}
