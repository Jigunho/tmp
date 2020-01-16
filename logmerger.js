const _ = require('lodash');
const fs = require('fs');
const mathjs = require('mathjs');
const config = require('config')
// obs  -> send_objs -> grid_objs 
let objs = {}; // object 를 모아두는
let send_objs = {}; // 이벤트가 종료되어 전송할 이벤트
let time_user_objs = {}; // 단위 시간별 그리드에 모아둔 데이터들 
let camera_width_height = {}; // 카메라별 width height
var net = require('net')
let recv_count = 0;
send_by_log = () => {

  // if file mode -> write
  let keys = Object.keys(send_objs);
  for (let i = 0; i < keys.length; i++) {


    let list = send_objs[keys[i]];
    const red_mean = mathjs.mean(list['red']);
    const red_std = mathjs.std(list['red']);
    const blue_mean = mathjs.mean(list['blue']);
    const blue_std = mathjs.std(list['blue']);
    const green_mean = mathjs.mean(list['green']);
    const green_std = mathjs.std(list['green']);
    const size_mean = mathjs.mean(list['size']);
    const size_std = mathjs.std(list['size']);

    let x_s = list['x'];
    let y_s = list['y'];

    let directions = [];
    let velocities = [];
    for (let j = 1; j < x_s.length; j++) {
      let direction = Math.atan2(y_s[j], y_s[j - 1], x_s[j], x_s[j - 1]);
      let velocity = Math.sqrt(Math.pow((y_s[j] - y_s[j - 1]), 2) + Math.pow((x_s[j] - x_s[j - 1]), 2));
      velocities.push(velocity);
      directions.push(direction);
    }
    directions.push(directions[directions.length - 1]); // 다른 로그 리스트와 수를 맞춰주기 위해 + 1
    velocities.push(velocities[velocities.length - 1]);
    // 유저별 움직인 그리드 숫자
    const log_count = list['grid'].length;
    const grid_count = list['grid'].filter((v, i, a) => a.indexOf(v) === i).length;
    // before file mean
    let writeStr = `---${keys[i]}---\nred mean: ${red_mean}, red_std: ${red_std}\ngreen mean: ${green_mean}, green std: ${green_std}\nblue mean: ${blue_mean}, blue std: ${blue_std}\n`
    writeStr += `size mean: ${size_mean}, size std: ${size_std}\ndirection mean:${mathjs.mean(directions)}, direction std: ${mathjs.std(directions)}\nvelocity mean: ${mathjs.mean(velocities)}, velocity std: ${mathjs.std(velocities)}\n`
    writeStr += `grid_count: ${grid_count}, grid_list: ${list['grid']}\n`

    fs.appendFile(`camera_id_before.txt`, writeStr);
    time_user_objs[keys[i]] = list;

    delete send_objs[keys[i]];
  }
}
main = () => {
  // if file mode
  // const con = config.get('PORT');
  // console.log(con);
  const OUTPUT_TYPE = config.get('OUTPUT_TYPE'); // 0: 파일, 1: 소켓모드
  const PORT = config.get('PORT');
  const TIME_GRID_INTERVAL = config.get('TIME_GRID_INTERVAL'); // output 으로 보내는 주기
  const GRID_X_NUM = config.get('GRID_X_NUM');
  const GRID_Y_NUM = config.get('GRID_Y_NUM');
  const LIST_DELIMITER = config.get('LIST_DELIMITER');
  const GRID_NUM = 12;

  net.createServer(async function (sock) {
    sock.on("error", function (err) { })
    console.log("connected");

    setInterval(function () {
      // console.log(JSON.stringify(time_user_objs));
      let users = Object.keys(time_user_objs);
      for (let i = 0; i < users.length; i++) {
        fs.appendFileSync(`camera_id_after.txt`, `${users[i]} finished\n`);
      }
      time_user_objs = {};
    }, TIME_GRID_INTERVAL);

    sock.on('data', async function (data) {

      let data_str = data.toString('utf8');
      let datas = data_str.split('\n');
      for (let i = 0; i < datas.length; i++) {
        

        let cols = datas[i].split('\t');
        if (cols.length < 5) {
          continue;
        }
        for (let m = 0 ; m < cols.length ; m ++) {
          console.log(`${m}: ${cols[m]}`);
        }

        const camera_id = cols[5];
        if (!camera_width_height[camera_width_height]) {
          camera_width_height[camera_id] = { width: parseInt(cols[11], 10), height: parseInt(cols[12], 10) };
        }
        const event_type = parseInt(cols[0], 10);
        const object_result = parseInt(cols[1], 10); // START | END | PRO
        // console.log(object_result)
        const event_timestamp = parseInt(cols[2], 10);  // 이벤트 발생시간
        const object_id = cols[3];
        const object_type = cols[4];
        const object_x = parseInt(cols[6], 10);
        const object_y = parseInt(cols[7], 10);
        const object_width = parseInt(cols[8], 10);
        const object_height = parseInt(cols[9], 10);
        const object_size = object_height * object_width;
        let colors = cols[10].split(',');
        const video_timestamp = parseInt(cols[13], 10);
        const video_width = parseInt(cols[11], 10);
        const video_height = parseInt(cols[12], 10);
        let diff_y = video_height / GRID_NUM;
        let diff_x = video_width / GRID_NUM;
        console.log(`width:${video_width},height:${video_height}`);
        console.log(`x 셀크기 ${diff_x}, y 셀크기 ${diff_y}`);

        let grid_x = Math.ceil(object_x / diff_x);
        let grid_y = Math.ceil(object_y / diff_y);
        console.log(`${grid_x}-${grid_y}`);
        if (grid_x < 10) {
          grid_x = `0${grid_x}`;
        }
        if (grid_y < 10) {
          grid_y = `0${grid_y}`;
        }
        let grid = `${grid_y}${grid_x}`;

        // if (event_type === 4) {
        //   // 화재영상
        // } else if (event_type === 0) {
        return;
        if (object_result === 1) {
          // 등장로그

          console.log(`${object_id} START`);

          objs[object_id] = { timestamp: [], width: [], height: [], x: [], y: [], red: [], blue: [], green: [], grid: [], size: [] };
          objs[object_id]['timestamp'].push(video_timestamp);
          objs[object_id]['x'].push(object_x);
          objs[object_id]['y'].push(object_y);
          objs[object_id]['width'].push(object_width);
          objs[object_id]['height'].push(object_height);
          objs[object_id]['red'].push(parseInt(colors[0], 10));
          objs[object_id]['blue'].push(parseInt(colors[1], 10));
          objs[object_id]['green'].push(parseInt(colors[2], 10));
          objs[object_id]['grid'].push(grid);
          objs[object_id]['size'].push(object_size);

        } else if (object_result === -1) {
          // 종료로그
          console.log(`${object_id} END`);

          if (!objs[object_id]) {
            return;
          }
          console.log(`end - ${object_id}`);
          objs[object_id]['timestamp'].push(video_timestamp);
          objs[object_id]['x'].push(object_x);
          objs[object_id]['y'].push(object_y);
          objs[object_id]['width'].push(object_width);
          objs[object_id]['height'].push(object_height);
          objs[object_id]['red'].push(parseInt(colors[0], 10));
          objs[object_id]['blue'].push(parseInt(colors[1], 10));
          objs[object_id]['green'].push(parseInt(colors[2], 10));
          objs[object_id]['grid'].push(grid);
          objs[object_id]['size'].push(object_size);

          let result = objs[object_id];
          send_objs[object_id] = result;
          send_by_log();
          delete objs[object_id];
        } else if (object_result === 0) {
          if (!objs[object_id]) {
            return;
          }
          objs[object_id]['timestamp'].push(video_timestamp);
          objs[object_id]['x'].push(object_x);
          objs[object_id]['y'].push(object_y);
          objs[object_id]['width'].push(object_width);
          objs[object_id]['height'].push(object_height);
          objs[object_id]['red'].push(parseInt(colors[0], 10));
          objs[object_id]['blue'].push(parseInt(colors[1], 10));
          objs[object_id]['green'].push(parseInt(colors[2], 10));
          objs[object_id]['grid'].push(grid);
          objs[object_id]['size'].push(object_size);

        }

      }

    });

  }).listen(PORT);



  // let datas = fs.readFileSync('./inputData2.txt').toString().split('\n');

}
main();