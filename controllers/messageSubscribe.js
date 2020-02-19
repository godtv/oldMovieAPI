/*
這裡是將郵件資料送到Queue的地方
 */
const amqp = require('amqplib/callback_api');

//const url = process.env.CLOUDAMQP_URL || 'amqp://localhost';
const url = 'amqp://localhost';
function sendToQueue(msg) {
  amqp.connect(url, function (err, conn) {
       conn.createChannel(function (err, channel) {
            const queue = 'email';
            channel.assertQueue(queue, { durable: true });
            channel.sendToQueue(queue, new Buffer(JSON.stringify(msg)), { persistent:  true });
            //console.log("Message sent to queue: " , msg);
       })
  });
};

module.exports = {
     publishSendQueue: (req, res ) => {
      sendToQueue(req.body);
      console.log("成功將郵件消息送到Queue");
      res.status(200).json({
         message: "已準備寄信啦(丟到Queue)"
      });
      //next();
    },
};