var app = require('koa')();

app.use(require('koa-serve-index')(process.cwd()));
app.use(require('koa-static')(process.cwd()));

app.listen(8000);
console.log('http://127.0.0.1:8000');