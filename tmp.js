const image_module = require('./compare_image');
const origin = './sample.png'
const fs = require('fs');
main = async () => {
  let grid_result = {};

  setInterval(function () {
    console.log(`grid result: ${JSON.stringify(grid_result)}`);
  }, 1000 * 10)

  let origin = fs.readFileSync('./sample_image/example2/background.png');
  for (let i = 0; i < 5; i++) {
    let compare = fs.readFileSync(`./sample_image/example2/compare${i + 1}.png`);
    image_module.getImageInfo(origin, compare, 1000, 1000, 12, 12, function (result, back, thum) {
      if (result) {
        let red_grids = [];
        let else_grids = [];
        // console.log(result);
        for (key in back) {
          /// grid별 비교
          let diff = image_module.diffColor2(back[key], thum[key]);
          let result = -1;
          if (diff === 'red') {
            red_grids.push(key);
            result = image_module.getColorPower(diff, thum[key]);
          } else if (diff === 'else') {
            else_grids.push(key);
            result = image_module.getColorPower(diff, thum[key]);
          }
          if (diff !== '-1') {
            if (!grid_result[key]) {
              grid_result[key] = [];
              grid_result[key].push({ color: diff, power: result });
            } else {
              grid_result[key].push({ color: diff, power: result });
            }
          }
        }
        console.log(`compare${i + 1}.png result`);
        console.log(red_grids);
        console.log(else_grids);
        // for (let i = 0 ; i < red_grids.length; i ++) {
        //   image_module.drawImage(compare ,`./diff_result/result_red_${i}.png`, 1000, 1000, 12, 12, red_grids[i])
        // }
        // for (let i = 0 ; i < else_grids.length ; i ++) {
        //   image_module.drawImage(compare ,`./diff_result/result_else_${i}.png`, 1000, 1000, 12, 12, else_grids[i])

        // }

      } else {
        console.log('pro');
      }
    });
  }
  console.log('end');

}



main();