var express = require('express');
var app = express();

app.get('/', async function (req, res) {
  console.log("1")
  const a = new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve('foo');
    }, 5000);
  });

  await a;

  console.log("2")


  res.send('Hello World!');
});

app.listen(3000, function () {

  console.log('Example app listening on port 3000!');
});