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
        fs.appendFileSync('tmp_output.txt', `${ds[i]}\n`);
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
          continue;
        }
        console.log(ds[i])
        ds.push(datas[i]);

      }

    });

  }).listen(41000);

}
main();