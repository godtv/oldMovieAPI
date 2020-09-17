const express = require('express'),
    app = express(),
    router = require('./routes/index'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    expressSession = require( 'express-session' ),
    expressValidator = require( 'express-validator' ),
    passport = require( 'passport' ),

    User = require( './models/user' );

    require('dotenv').config();
const dbURI =
    `mongodb+srv://heroku_fchm6bmt:${process.env.DATABASE_PASSWORD}@cluster-fchm6bmt.keoex.mongodb.net/${process.env.DATABASE_NAME}?retryWrites=true&w=majority`;
//Mongodb
mongoose.Promise = global.Promise;
//mongoose.connect( 'mongodb://localhost/recipe_db', {useNewUrlParser: true} );
mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.connect(dbURI || "mongodb://localhost/old-movie", { useNewUrlParser: true, useUnifiedTopology: true });

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
Passport序列化和反序列化要傳遞到會話中的用戶數據。session存儲這個序列化的數據—用戶信息的壓縮形式，
它被發送回服務器，以驗證用戶是否是最後一個來自重置登錄的用戶。反序列化從壓縮版本中提取用戶數據
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
isAuthenticated是Passport提供的一種方法。您可以對初始化的請求調用它，
以查看是否將現有用戶存儲在請求的cookie中。登錄到為真，或者為假。如果請求中有用戶，
可以將其取出重新其分配給自己的currentUser變量。
添加此代碼後，您可以在每個頁面上訪問這兩個變量以及flash消息。
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



 