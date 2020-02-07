const _ = require('lodash');
const fs = require('fs');
const mathjs = require('mathjs');
const config = require('config')
// obs  -> send_objs -> grid_objs 
let objs = {}; // object 를 모아두는
let send_objs = {}; // 이벤트가 종료되어 전송할 이벤트
let time_user_objs = {}; // 단위 시간별 그리드에 모아둔 데이터들 
let camera_width_height = {}; // 카메라별 width height
let camera_img_data = {};
var net = require('net')
let output_connected = false;
let output_connection = null;
let OUTPUT_TYPE = null;
let grid_x_size = -1;
let grid_y_size = -1;
let area_x_size = -1;
let area_y_size = -1;
const area_list = [];

let prev_hour = -1;
send_by_log = () => {

  let keys = Object.keys(send_objs);

  for (let i = 0; i < keys.length; i++) {


    let object_id = keys[i];
    let list = send_objs[keys[i]];
    const timestamps = list['timestamp'];
    const user_timestamp = timestamp[0];
    const grids = list['grid'];
    const areas = list['area'];
    const camera_id = list['camera_id'][0];

    const log_count = list['grid'].length;
    const grid_count = list['grid'].filter((v, i, a) => a.indexOf(v) === i).length;

    const user_reds = list['red'];
    const user_greens = list['green'];
    const user_blues = list['blue'];

    const user_sizes = list['size'];

    const imgs = list['imgs'];


    let user_grid_result = {};
    let grid_area_dictionary = {};
    let user_grid_list = [];

    // 유저별 그리드 통계
    for (let j = 0; j < grids.length; j++) {

      let grid_id = grids[j];
      user_grid_result.push(grid_id);
      if (!user_grid_result[grid_id]) {

        grid_area_dictionary[grid_id] = areas[j];

        user_grid_result[grid_id] = { red: [], green: [], blue: [], size: [], count: 0, imgs: [] };

        user_grid_result[grid_id].red.push(user_reds[j]);
        user_grid_result[grid_id].blue.push(user_blues[j]);
        user_grid_result[grid_id].green.push(user_greens[j]);
        user_grid_result[grid_id].size.push(user_sizes[j]);
        user_grid_result[grid_id].imgs.push(imgs[j]);
        user_grid_result[grid_id].count += 1;

      } else {

        user_grid_result[grid_id].red.push(user_reds[j]);
        user_grid_result[grid_id].blue.push(user_blues[j]);
        user_grid_result[grid_id].green.push(user_greens[j]);
        user_grid_result[grid_id].size.push(user_sizes[j]);
        user_grid_result[grid_id].imgs.push(imgs[j]);

        user_grid_result[grid_id].count += 1;

      }
    }

    for (let j = 0; j < user_grid_list.length; j++) {
      let grid_id = user_grid_list[j];
      let area_id = grid_area_dictionary[user_grid_list[j]];
      let grid_result = user_grid_result[user_grid_list[j]];
      let count = grid_result.count;
      if (count > 1) {
        // 2개이상일때만 편차 추출 가능

        let str = '';

        let count = 0;
        let reds = [];
        let blues = [];
        let greens = [];


        for (let m = 0; m < grid_result.imgs; m++) { // 화재난 순간의 영역만 가져오고
          color.getColor2(grid_result.imgs[m], `grid_${grid_id}.png`, camera_width_height[camera_id].width, camera_width_height[camera_id].height
            , grid_x_size, grid_y_size, grid_id, function (result) {

              count++;
              if (result) {

                let [red, green, blue, alpha] = result;
                reds.push(red);
                greens.push(green);
                blues.push(blue);

              }

              if (count === 30) {


                let user_grid_red_avg = mathjs.mean(grid_result.red);
                let user_grid_red_std = mathjs.std(grid_result.red);

                let user_grid_blue_avg = mathjs.mean(grid_result.blue);
                let user_grid_blue_std = mathjs.std(grid_result.blue);

                let user_grid_green_avg = mathjs.mean(grid_result.green);
                let user_grid_green_std = mathjs.std(grid_result.green);

                let user_grid_size_avg = mathjs.mean(grid_result.size);
                let user_grid_size_std = mathjs.std(grid_result.size);

                str = `${user_timestamp}\t${object_id}\t${user_grid_list[j]}\t${area_id}\t`;
                str += `${user_grid_size_avg}${user_grid_size_std}\t${user_grid_red_avg}\t${user_grid_red_std}\t`
                str += `${user_grid_green_avg}\t${user_grid_green_std}\t${user_grid_blue_avg}\t${user_grid_blue_std}\t`;

                // let grid color // 해당 그리드의 색상 평균


                if (OUTPUT_TYPE && output_connected) {
                  try {
                    output_connection.write(str)
                  } catch (e) {
                    console.error(e);
                  }
                }
              }
            })
        }

        // connection write 

      }
    }


    // fs.appendFileSync(`camera_id_before.txt`, writeStr);
    time_user_objs[keys[i]] = list;

    delete send_objs[keys[i]];



    // const red_mean = mathjs.mean(list['red']);
    // const red_std = mathjs.std(list['red']);
    // const blue_mean = mathjs.mean(list['blue']);
    // const blue_std = mathjs.std(list['blue']);
    // const green_mean = mathjs.mean(list['green']);
    // const green_std = mathjs.std(list['green']);
    // const size_mean = mathjs.mean(list['size']);
    // const size_std = mathjs.std(list['size']);
    // let x_s = list['x'];
    // let y_s = list['y'];

    // let directions = [];
    // let velocities = [];
    // for (let j = 1; j < x_s.length; j++) {
    //   let direction = Math.atan2(y_s[j], y_s[j - 1], x_s[j], x_s[j - 1]);
    //   let velocity = Math.sqrt(Math.pow((y_s[j] - y_s[j - 1]), 2) + Math.pow((x_s[j] - x_s[j - 1]), 2));
    //   velocities.push(velocity);
    //   directions.push(direction);
    // }
    // directions.push(directions[directions.length - 1]); // 다른 로그 리스트와 수를 맞춰주기 위해 + 1
    // velocities.push(velocities[velocities.length - 1]);
    // 유저별 움직인 그리드 숫자


    // before file mean
    // let writeStr = `--- camera_id:${camera_id[0]}, object_id:${keys[i]} ---\nred mean: ${red_mean}, red_std: ${red_std}\ngreen mean: ${green_mean}, green std: ${green_std}\nblue mean: ${blue_mean}, blue std: ${blue_std}\n`
    // writeStr += `size mean: ${size_mean}, size std: ${size_std}\ndirection mean:${mathjs.mean(directions)}, direction std: ${mathjs.std(directions)}\nvelocity mean: ${mathjs.mean(velocities)}, velocity std: ${mathjs.std(velocities)}\n`
    // writeStr += `log_count: ${camera_id.length}, grid_count: ${grid_count}, grid_list: ${list['grid']}\n`


  }


}
main = () => {
  // if file mode
  // const con = config.get('PORT');
  // console.log(con);
  OUTPUT_TYPE = config.get('OUTPUT_TYPE'); // 0: 파일, 1: 소켓모드
  const PORT = config.get('PORT');
  const TIME_GRID_INTERVAL = config.get('TIME_GRID_INTERVAL'); // output 으로 보내는 주기
  const GRID_X_NUM = config.get('GRID_X_NUM');
  const GRID_Y_NUM = config.get('GRID_Y_NUM');
  const AREA_X_NUM = config.get('AREA_X_NUM');
  const AREA_Y_NUM = config.get('AREA_Y_NUM');
  const OUTPUT_PORT = confg.get('OUIPUT_PORT');

  const LIST_DELIMITER = config.get('LIST_DELIMITER');

  try {
    output_connection = net.createConnection(OUTPUT_PORT[0], 'localhost');

  } catch (error) {
    console.error(error);
  }

  output_connection.on('connect', function (connect) {

    console.log('output ip connected');
    output_connected = true;
  })

  net.createServer(function (sock) {
    console.log("connected");
    sock.on("error", function (err) { })
    setInterval(function () {
      let users = Object.keys(time_user_objs);
      for (let i = 0; i < users.length; i++) {
        fs.appendFileSync(`camera_id_after.txt`, `${users[i]} finished\n`, (error) => {
          console.log(`write error`);
        });
      }
      for (let camera_id in camera_img_data) {
        let info = camera_width_height[camera_id];
        fs.writeFileSync(`${camera_id}_${info.width}_${info.height}.png`, camera_img_data[camera_id]);
        delete camera_img_data[camera_id];
      }
      time_user_objs = {};
    }, TIME_GRID_INTERVAL);

    sock.on('data', function (data) {

      let data_str = data.toString('utf8');
      let datas = data_str.split('\n');
      for (let i = 0; i < datas.length; i++) {


        let cols = datas[i].split('\t');
        if (cols.length < 5) {
          continue;
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
        const img_data = cols[13];
        grid_y_size = video_height / GRID_Y_NUM;
        grid_x_size = video_width / GRID_X_NUM;

        area_x_size = video_width / AREA_X_NUM;
        area_y_size = video_height / AREA_Y_NUM;
        // console.log(`width:${video_width},height:${video_height}`);
        // console.log(`x 셀크기 ${diff_x}, y 셀크기 ${diff_y}`);

        let grid_x = Math.ceil(object_x / grid_x_size);
        let grid_y = Math.ceil(object_y / grid_y_size);

        let area_x = Math.ceil(object_x / area_x_size);
        let area_y = Math.ceil(objecT_y / area_y_size);
        let area_id = parseInt(`${area_x}${area_y}`, 10);
        let grid = parseInt(`${grid_y}${grid_x}`, 10);


        
        if (OUTPUT_TYPE && output_connected) {
          try {
            output_connection.write(str)
          } catch (e) {
            console.error(e);
          }
        }

        if (object_type === 1000) {
          // 객체가없는 frame 이미지
          
          // get image 


        } else {

          // 화재 or 일반 객체

          if (object_result === 1) {
            // 등장로그
            console.log(`${object_id} START`);
  
            objs[object_id] = { timestamp: [], width: [], height: [], x: [], y: [], red: [], blue: [], green: [], grid: [], size: [], camera_id: [], area: [], imgs: [] };
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
            objs[object_id]['camera_id'].push(camera_id);
            objs[object_id]['area'].push(area_id);
            objs[object_id]['imgs'].push(img_data);
  
          } else if (object_result === -1) {
            // 종료로그
            console.log(`${object_id} END`);
  
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
            objs[object_id]['camera_id'].push(camera_id); // 추후 카메라랑 object id랑 종속관계를 바꿈
            objs[object_id]['area'].push(area_id);
            objs[object_id]['imgs'].push(img_data);
  
  
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
            objs[object_id]['camera_id'].push(camera_id); // 추후 카메라랑 object id랑 종속관계를 바꿈
            objs[object_id]['area'].push(area_id);
            objs[object_id]['imgs'].push(img_data);
  
          }
  
  
        }

        

      }

    });

  }).listen(PORT);



  // let datas = fs.readFileSync('./inputData2.txt').toString().split('\n');

}
main();