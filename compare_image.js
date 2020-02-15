const fs = require('fs');
const sharp = require('sharp');
const average = require('image-average-color');
exports.drawImage =  function(back, newImage, imgHeight, imgWidth, grid_x_cnt, grid_y_cnt, grid_id) {
  let sizeX = Math.floor(imgWidth/grid_x_cnt);
  let sizeY = Math.floor(imgHeight/grid_y_cnt);
  let gd = grid_id.split('-');
  
  sharp(back).resize(imgWidth, imgHeight).extract({ width: sizeX * 3, height:sizeY * 3, left: (parseInt(gd[0], 10) -1) * sizeX, top: (parseInt(gd[1], 10) - 1) * sizeY })
    .toFile(newImage)
    

}
exports.getImageInfo = function(back, thum, imgHeight, imgWidth, grid_x_cnt, grid_y_cnt, callback) {

  let sizeX = Math.floor(imgWidth/grid_x_cnt);
  let sizeY = Math.floor(imgHeight/grid_y_cnt);
  console.log(`width: ${sizeX}, height: ${sizeY}`);
  let background_result = {}
  let thumnail_result = {};
  // 이미지 buffer 
  let cnt = 0 ;
  let maxCnt = grid_y_cnt * grid_x_cnt * 2;
  for (let i = 0 ; i < grid_x_cnt ; i ++) {
    for (let j = 0 ; j < grid_y_cnt ; j ++) {
      let grid_x = '';
      let grid_y = '';
      if (i < 10 ) {
        grid_x = `0${i}`;
      } else {
        grid_x = `${i}`;
      }
      if (j < 10) {
        grid_y = `0${j}`;
      } else {
        grid_y = `${j}`;
      }
      let grid_id = `${grid_x}-${grid_y}`;
      // console.log(grid_id);

      sharp(back).resize(imgWidth, imgHeight).extract({ width: sizeX, height:sizeY, left: i * sizeX, top: j * sizeY }).toBuffer().then(function(data) {
        if (!data) {
          return
        } else {
          average(data, (err, color) => {
            if (err) throw err;
            cnt ++;
            background_result[grid_id] = color
            var [red, green, blue, alpha] = color;
            if (cnt === maxCnt) {
              callback(true, background_result, thumnail_result);
            }
  
          })
        }
      });
      
      sharp(thum).resize(imgWidth, imgHeight).extract({ width: sizeX, height:sizeY, left: i * sizeX, top: j * sizeY }).toBuffer().then(function(data) {
        if (!data) {
          return
        } else {
          average(data, (err, color) => {
            if (err) throw err;
            cnt ++;

            var [red, green, blue, alpha] = color;
            thumnail_result[grid_id] = color

            if (cnt === maxCnt) {
              callback(true, background_result, thumnail_result);
            }
  
          })
        }
      })

    }
  }

}

const getColor = (r, g, b) => {
  if (r > g * 1.1 && r > b * 1.1) {
    return 'red'
  } else {
    return 'else'
  }
}
exports.diffColor2 = (color1, color2) => {
  // 둘의 차이가 있을 경우 
  const [r1, g1, b1] = color1;
  const [r2, g2, b2] = color2;

  let result = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
  //
  if (result > 30) {
    // 스냅샷의 색상
    let color = getColor(r2,g2,b2);
    return color
  } else {
    return '-1'
  }
}
exports.getColorPower = (name, color) => {
  const [r,g,b] = color
  if (name === 'red') {
    return r;
  } else {
    return (r+g+b)/3;
  }
}
// exports.getColor = function(imgData, outputData, imgWidth, imgHeight, width, height, left, top, callback) {
//   sharp(imgData).resize(imgWidth, imgHeight).extract({ width, height, left, top }).toBuffer()
//   .then(function(new_file_info) {
//     // console.log(new_file_info)
//     if (!new_file_info) {
//       return;
//     }
//     sharp(new_file_info).resize(imgWidth/2, imgHeight/2).extract({ width: width/2, height: height/2, left, top }).toBuffer()
//     .then(function(data){
//       console.log(data);
//       average(data, (err, color) => {
//         if (err) throw err;
//         var [red, green, blue, alpha] = color;
//         callback(`2 : ${color}`)
  
//       })
//     })
//     average(new_file_info, (err, color) => {
//       if (err) throw err;
//       var [red, green, blue, alpha] = color;
//       callback(`1: ${color}`);

//     })
//     // console.log("Image cropped and saved");
//   })
//   .catch(function(err) {
//       console.log("An error occured");
//   });

// }


