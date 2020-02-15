const _ = require('lodash');
const fs = require('fs');
const mathjs = require('mathjs');
const config = require('config');
const net = require('net')
// obs  -> send_objs -> grid_objs 
let ds = [];

main = () => {

  console.log('main start');
  net.createServer(function (sock) {
    console.log("connected");
    sock.on("error", function (err) {
      console.error(err);
    })

    setInterval(function () {
      for (let i = 0 ; i < ds.length ; i ++) {
        let cols = ds[i].split('\t');
        let img = cols.splice(13,1);
        fs.appendFileSync('tmp_output.txt', `${cols.join('\t')}\n`);
        // fs.writeFileSync(`${i}.png`, img);
        console.log('write complete');
      }
      ds = [];
    }, 1000 * 5)

    sock.on('data', function (data) {

      let data_str = data.toString('utf8');
      let datas = data_str.split('\n');
      for (let i = 0; i < datas.length; i++) {


        let cols = datas[i].split('\t');
        if (cols.length < 5) {
          sock.write('-1')
          continue;
        } else {
          sock.write('1')
        }
        console.log(ds[i])
        ds.push(datas[i]);

      }

    });

  }).listen(parseInt(config.get('PORT'), 10));

}
main();