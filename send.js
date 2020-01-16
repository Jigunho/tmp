var fs = require('fs');
var net = require('net')
const args = process.argv;
let transaction_cnt = 0;
var ip_address = args[2]
var port = args[3]
var data_per_second = args[4];

try {
	var data = fs.readFileSync('./inputData_rev.txt', 'utf8');
	var d = data.toString().split("\n")
	console.log(d.length);
	try {
		var connection = net.createConnection(port, ip_address);
		console.log("connection complete!")
    var s_index = 0;
    // connection.write(d);
    setInterval(function() {
      for (let i = 0; i < d.length; i ++) {
        let cols = d[i].split('\t');
        console.log(`${i}: ${d[i]}`);
        connection.write(`${cols.join('\t')}\n`);
      }
  
    }, 10000);

	}
	catch (e) { console.log(e) }

}
catch (e) {
	console.log('Error:', e.stack);
}