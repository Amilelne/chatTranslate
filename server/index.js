var app = require('express')();
var bodyParser = require("body-parser");
var http = require('http').Server(app);
var io = require('socket.io')(http);
const https = require('http');
const Md5 = require('md5');
var amqp = require('amqplib/callback_api');

// app.use(bodyParser.urlencoded({ extended: false}));
// app.use(bodyParser.json());
//
// // Consume messages and 'broadcast' over all open client connections
// var chat = io.of('/chat')
//
// amqp.connect('amqp://localhost', function(err, conn) {
//   conn.createChannel(function(err, ch) {
//     var ex = 'chat_ex';
//
//     ch.assertExchange(ex, 'fanout', {durable: false});
//
//     ch.assertQueue('', {exclusive: true}, function(err, q){
//       console.log(" [*] Waiting for messages in %s.", q.queue);
//       ch.bindQueue(q.queue, ex, '');
//
//       ch.consume(q.queue, function(msg){
//         chat.emit('message',msg.content.toString())
//       })
//     },{noAck: true})
//   })
// })

app.get('/', function(req, res){
        res.send('<h1>Welcome Realtime Server</h1>');
});
app.post('/chat',function(req,res){
  console.log("visit /chat");
  amqp.connect('amqp://localhost', function(err, conn) {
    conn.createChannel(function(err, ch) {
      var ex = 'chat_ex';
      var q = 'chat_q';

      var msg = req.body.content;
      console.log("msg: " + JSON.stringify(msg));
      res.status(200);
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Content-Type");
      res.end("ok");

      ch.assertExchange(ex, 'fanout', {durable: false});
      ch.publish(ex, '', new Buffer(msg), {persistent: false});
      ch.assertQueue(q,{durable: true});
      ch.sendToQueue(q, new Buffer(msg), {persistent: true});
      ch.close(function() {conn.close()});
    })
  })
})
app.get('/chat',function(req,res) {
  amqp.connect('amqp://localhost',function(err, conn) {
    var q = 'chat_q';

    ch.assertQueue(q, {durable: true}, function(err, status) {
      if(err) {
        throw new Error(err);
      }
      else if(status.messageCount == 0){
        res.send('{"messages": 0}');
      }else{
        var numChunks = 0;

        res.writeHead(200, {"Content-Type": "application/json"});
        res.write('{"messages": [');

        ch.consume(q.queue, function(msg) {
          var resChunk = msg.content.toString();

          res.write(resChunk);
          numChunks += 1;
          if(numChunks === status.messageCount) {
            res.write(']}');
            res.end();
            ch.close(function() {conn.close()})
          }
        })
      }
    },{noAck: true})
  })
})
app.post('/translate',function(req,res){
        res.send('post success');
});

//在线用户
var onlineUsers = {};
//当前在线人数
var onlineCount = 0;

io.on('connection', function(socket){
        console.log('a user connected');

        //监听新用户加入
        socket.on('login', function(obj){
                //将新加入用户的唯一标识当作socket的名称，后面退出的时候会用到
                socket.name = obj.userid;

                //检查在线列表，如果不在里面就加入
                if(!onlineUsers.hasOwnProperty(obj.userid)) {
                        onlineUsers[obj.userid] = obj.username;
                        //在线人数+1
                        onlineCount++;
                }

                //向所有客户端广播用户加入
                io.emit('login', {onlineUsers:onlineUsers, onlineCount:onlineCount, user:obj});
                console.log(obj.username+'加入了聊天室');
        });

        //监听用户退出
        socket.on('disconnect', function(){
                //将退出的用户从在线列表中删除
                if(onlineUsers.hasOwnProperty(socket.name)) {
                        //退出用户的信息
                        var obj = {userid:socket.name, username:onlineUsers[socket.name]};

                        //删除
                        delete onlineUsers[socket.name];
                        //在线人数-1
                        onlineCount--;

                        //向所有客户端广播用户退出
                        io.emit('logout', {onlineUsers:onlineUsers, onlineCount:onlineCount, user:obj});
                        console.log(obj.username+'退出了聊天室');
                }
        });

        //监听用户发布聊天内容
        socket.on('message', function(obj){
                var translateUrl = 'http://api.fanyi.baidu.com/api/trans/vip/translate';
                var query = obj.content;
                var appid = '20180425000150229';
                var userkey = 't51EKZ8veg2u_1snCNpM';
                var salt = (new Date).getTime();
                var from = 'en';
                var to = 'zh';
                var str1 = appid + query + salt +userkey;
                var sign = Md5(str1);
                translateUrl = translateUrl+'?q='+query+'&from='+from+'&to='+to+'&appid='+appid+'&salt='+salt+'&sign='+sign;
                https.get(translateUrl,(res) => {
                  let data = '';
                  res.on('data',(chunk) => {
                    data += chunk;
                  });
                  res.on('end',()=>{
                    jsonData = JSON.parse(data);
                    console.log("trans_re:" + JSON.stringify(jsonData["trans_result"][0]["dst"]));
                    obj.translate = JSON.stringify(jsonData["trans_result"][0]["dst"]).slice(1,-1);
                    //向所有客户端广播发布的消息
                    io.emit('message', obj);

                    console.log(data);
                  });
                }).on('error',(err)=>{
                  console.log("Error: "+ err.message);
                });

                console.log(obj.username+'说：'+obj.content);
        });

});

http.listen(3000, function(){
        console.log('listening on *:3000');
});
