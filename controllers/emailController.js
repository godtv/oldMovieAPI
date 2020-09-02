 const nodemailer = require('nodemailer');
const amqp = require('amqplib/callback_api');

//test
const OldMovies = require('../models/oldmovie');

// 從簡單的web api改寫，controller收到from data後，會交由amqp publisher送到Queue，然後再由一個senderEmailWorker寄信，
// 也就是把這段Nodemailer的部分改寫

/*
module.exports = {

   sendMail:(req, res) => {
       let transport = nodemailer.createTransport({
           host: 'smtp.mailtrap.io',
           port: 2525,
           auth: {
               user: 'a53c928991193a',
               pass: '615f8a6ec61573'
           }
       });

       const message = {
           from: req.body.from, // Sender address
           to: req.body.to,         // List of recipients
           subject: req.body.subject, // Subject line
           text: req.body.text // Plain text body
       };


       transport.sendMail(message, function(err, info) {
           if (err) {
               console.log(err)
           } else {
               res.status(200).json({
                   info: info
               });
               console.log(info);
           }
       });
   },

};
*/


function sendMail(form) {
    let transport = nodemailer.createTransport({
        host: 'smtp.mailtrap.io',
        port: 2525,
        auth: {
            user: 'a53c928991193a',
            pass: '615f8a6ec61573'
        }
    });

    const message = {
        from: form.from, // Sender address
        to: form.to,         // List of recipients
        subject: form.subject, // Subject line
        text: form.text // Plain text body
    };

    transport.sendMail(message, function(err, info) {
        if (err) {
            console.log(err)
        } else {
            console.log("已寄出，呵呵")
        }
    });
}

// const url = process.env.CLOUDAMQP_URL || 'amqp://localhost';
const url = 'amqp://localhost';

module.exports = {
    sendMail:(req, res ) => {

         amqp.connect(url, function (err, conn) {
            conn.createChannel(function (err, ch) {

                console.log("先初始化Receiver了啦 = =,但還不可能收到任何東西，呵呵");

                const q = 'email';
                ch.assertQueue(q, { durable: true  });

                 ch.consume(q, async function (msg) {

                    console.log("[x] 已收到，但還沒丟給Nodemailer %s", msg.content.toString());

                    let form = JSON.parse(msg.content.toString());

                    //這裡先放nodemailer的方法
                     await sendMail(form, res);

                    //這裡先放nodemailer的方法

                     ch.ack(msg)

                }, { noAck: false });
            })
        })
    },
};

/*
{
  "from": "elonmusk@tesla.com",
  "to": "mrlaba@email.com",
  "subject": "Design Your Model S | Tesla",
  "text": "這裡開始使用消息隊列啦 = ="
}
 */








































