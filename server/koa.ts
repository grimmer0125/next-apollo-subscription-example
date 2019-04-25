const Koa = require('koa');
const app = new Koa();

// response
// app.use(ctx => {
//   ctx.body = 'Hello Koa';
// });

app.use(async (ctx, next) => {
  console.log("1");

  const start = Date.now();
  // await next();


  // const a = new Promise(function(resolve, reject) {
  //   setTimeout(function() {
  //     resolve('foo');
  //   }, 1);
  // });
  // await a;
  console.log("2");


  // const ms = Date.now() - start;
  // console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
  // ctx.body = 'Hello Koa';
  ctx.response.body = "aaa"
});

app.listen(3000);