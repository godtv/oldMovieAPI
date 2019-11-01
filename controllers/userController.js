const User = require('../models/user'),
    passport = require('passport'),
    httpStatus = require('http-status-codes'),
    jsonWebToken = require('jsonwebtoken'),
    getUserParams = ( body ) => {
        return {
            name: {
                first: body.name.first,
                last: body.name.last
            },
            email: body.email,
            password: body.password,
            role: body.role
        };
    };
const express = require('express'),
    app = express();

const conf = require('../conf');


const contentTypePlainText = {
    'Content-Type': 'text/plain'
};

module.exports = {
    //create user(account)
    create: (req, res) => {
        let newUSer = new User(getUserParams(req.body));

        console.log('user is:', JSON.stringify(newUSer));
        User.register(newUSer, req.body.password, (error, user) => {
            if (user) {
                res.status(200).json({
                    success: true,
                    message: 'Create new user.',
                    user: user
                });
            } else {
                res.json({
                    error: error ,
                    message: 'Could not create new user. So sad'
                });
            }
        })
    },

    //帳號資料驗證無誤,再去create user
    validateUserData: (req, res, next) => {
        req.sanitizeBody('email')
            .normalizeEmail({
                all_lowercase: true
            })
        .trim();
        req.check('email', 'Email is invalid').isEmail();

        // req.check('zipCode', 'Zip code is invalid').notEmpty().isInt().isLength({
        //     min: 5,
        //     max: 5
        // }).equals(req.body.zipCode);

        req.check('password', 'Password cannot be empty')
            .notEmpty();

        /*
        無論是否錯誤，都要next()
         */
        // req.getValidationResult()
        //     .then((error) => {
        //         if (!error.isEmpty()) {
        //             next();
        //         } else {
        //             res.status(400).json({
        //                 success: false,
        //                 message: 'Could not create new user. Please check again',
        //
        //             });
        //         }
        //     });
        req.getValidationResult()
            .then( ( error ) => {
                if ( !error.isEmpty() ) {
                    let messages = error.array()
                        .map( e => e.msg );

                    next();
                } else {
                    let messages = error.array()
                        .map( e => e.msg );

                    next();
                }
            } );
    },
    //Login前先檢查是否有此人
    apiVerify: (req, res, next) => {

        passport.authenticate('local', (err, user, info) => {
            if (err) { console.log('god'); }
            if (!user) {
                res.status(400).json(
                { error: 'unsupported_grant_type',
                    error_description: '密碼或郵件輸入錯誤!'
                });
            } else {
                next()
            }
        })(req, res, next);
    },
    //如果有且header及post body正確，則給予Token
    apiAuthenticate: ( req, res, next ) => {
        User.findOne({email: req.body.email}).exec()
            .then((user) => {

                if (user) {

                    if (!req.body.grant_type || req.body.grant_type != 'password') {
                        res.status(400).json(
                            { error: 'unsupported_grant_type',
                                error_description: '授權類型無法識別，本伺服器僅支持 Password 類型！'
                            });
                        return;
                    }

                    let payload = {
                        iss: req.body.email,
                        sub: 'HR System Web API',
                        role: req.body.role   // 自訂聲明。用來讓伺服器確認使用者的角色權限 (決定使用者能使用 Web API 的權限)
                    };
                    // 產生 JWT
                    let token = jsonWebToken.sign(payload, conf.secret, {
                        algorithm: 'HS256',
                        expiresIn: conf.increaseTime + 's'  // JWT 的到期時間 (當前 UNIX 時間戳 + 設定的時間)。必須加上時間單位，否則預設為 ms (毫秒)
                    });

                    res.json( {

                        access_token: token,
                        token_type: 'bearer',
                        expires_in: (Date.parse(new Date()) / 1000) + conf.increaseTime,    // UNIX 時間戳 + conf.increaseTime
                        scope: req.body.role,
                        info: {
                            email: req.body.email
                        }

                    });

                }
                else {
                    res.json({
                        success: false,
                        message: 'Could not authenticate user.'
                    })
                }

            })

            .catch( error => {
                console.log( `Error : ${error.message}` );
                next( error );
            })

    },
    //驗證token,放上next是因為之後每個呼叫的api幾乎都會驗證token = =
    verifyJWT: ( req, res, next ) => {
        // 沒有 JWT
        if (!req.headers.authorization) {

            res.status(httpStatus.UNAUTHORIZED).json({
                error: true,
                message: { error: 'invalid_client', error_description: '沒有 token！' }
            })
        }

        if (req.headers.authorization && req.headers.authorization.split(' ')[0] == 'bearer')
        {
            var token = req.headers.authorization.split('bearer ')[1];

            jsonWebToken.verify(token, conf.secret, function (err, decoded) {

                if (err) {

                    switch (err.name) {
                        // JWT 過期
                        case 'TokenExpiredError':

                            res.status(httpStatus.BAD_REQUEST).json({
                                error: 'invalid_grant', error_description: 'token 過期！'
                            });


                            break;
                        // JWT 無效
                        case 'JsonWebTokenError':

                            res.status(httpStatus.BAD_REQUEST).json({
                                error: 'invalid_grant', error_description: 'token 無效！'
                            });

                            break;
                    }

                } else {

                    //驗證Token後，將email放在res.locals
                    let email = decoded.iss;
                    res.locals.userEmial = email;

                    console.log('驗證token成功'+ email);
                    next();
                }
            });

        }

    },

};


