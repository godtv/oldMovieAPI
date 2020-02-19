const express = require('express'),
    app = express(),
    router = require('./routes/index'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    expressSession = require( 'express-session' ),
    expressValidator = require( 'express-validator' ),
    passport = require( 'passport' ),

    User = require( './models/user' );

//Mongodb
mongoose.Promise = global.Promise;
//mongoose.connect( 'mongodb://localhost/recipe_db', {useNewUrlParser: true} );
mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/old-movie", {useNewUrlParser: true, useUnifiedTopology: true});

const amqp = require('amqplib/callback_api');
const EmailController = require('./controllers/emailController');

const db = mongoose.connection;

db.once('open', () => {
    console.log( 'Successfully connected to MongoDB using Mongoose!' );
});

//Port
app.set('port', process.env.PORT || 8000);

// const css =  require('./semantic/dist/semantic.min.css');
// app.set('views', __dirname + '/views');
// app.set('view engine', 'jsx');
// app.engine('jsx', require('express-react-views').createEngine());




/*
Passport序列化和反序列化要传递到会话中的用户数据。会话存储这个序列化的数据—用户信息的压缩形式，
它被发送回服务器，以验证用户是否是最后一个从客户机登录的用户。反序列化从压缩版本中提取用户数据，
以便验证用户的信息
*/

app.use( passport.initialize() );
app.use( passport.session() );

passport.use( User.createStrategy() );
passport.serializeUser( User.serializeUser() );
passport.deserializeUser( User.deserializeUser() );




/*
您將express.json和express.urlencoded添加到您的應用實例以分析傳入的請求正文。
請注意使用req.body將發布的數據記錄到清單9.5中的控制台。
將該代碼添加到項目的main.js.使用Express.js的app.use，
指定您要解析URL編碼的傳入請求（通常是表單post和utf-8內容）和JSON格式。然後為發布的數據創建新路線。
此過程與使用post方法和指定URL一樣簡單。最後，使用請求對象及其bodyattribute打印已發布表單的內容。
*/

// app.use(bodyParser.urlencoded({
//     extended: false
// }));


// app.use(bodyParser.json());

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.use(expressValidator());


/*
isAuthenticated是Passport提供的一种方法。您可以对传入的请求调用它，
以查看是否将现有用户存储在请求的cookie中。loggedIn要么为真，要么为假。如果请求中有用户，
可以将其取出并将其分配给自己的currentUser变量。
添加此代码后，您可以在每个页面上访问这两个变量以及flash消息。
 */

app.use((req, res, next) => {
    res.locals.loggedIn = req.isAuthenticated();
    res.locals.currentUser = req.user;
    next();
});




app.use('/', router);

const server = app.listen(app.get('port'), () => {
    console.log(`Server running at http://localhost:8000`);

    //測試rabbitmq的寄信功能
    //EmailController.sendMail();
});


/*
暫時放這裡 = =
 */





















































































































































































































































