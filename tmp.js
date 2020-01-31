const profile = require('./extract_color');
const origin = './sample.png'
const fs = require('fs');
main = async () => {

  let start = new Date().getTime();
  let cnt = 0;
  let frame_cnt = 1000;
  for (let i = 0; i < frame_cnt; i++) {
    profile.getColor(origin, `./output/${i}.png`, 1000, 1000, 500, 500, 0, 0, function (result) {
      if (result) {
        cnt ++;
        // if (cnt === 29) {
        //   console.log(`cnt 30 : ${i}`);
        // }
        console.log(`${cnt}, ${i}, ${result}`);
        if (cnt === frame_cnt) {
          let end = new Date().getTime();
          console.log(`result : ${end - start}`);

        }
      }
    });
  }
  // let end = new Date().getTime();
  // console.log(`result : ${end - start}`);
}
main();