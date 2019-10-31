'use strict';

const router = require( 'express' ).Router(),
    usersController = require('../controllers/userController'),
    oldMoviecontroller = require('../controllers/oldMovieoController');

//Login
router.post('/login', usersController.apiVerify , usersController.apiAuthenticate);

//Create Users
router.post('/create',usersController.validateUserData, usersController.create);

router.post('/createMovie', oldMoviecontroller.createMovie);


//ex:查詢其他資料必須先驗證token
router.use(usersController.verifyJWT);
//ex:查詢其他資料必須先驗證token
router.get('/getmovies', oldMoviecontroller.getMovies);


//router.get( '/courses/:id/join', coursesController.join, coursesController.respondJSON );
//使用者增加喜歡的電影

 router.post('/addOnemovie/:id', oldMoviecontroller.checkUserExist, oldMoviecontroller.addOneMovie,oldMoviecontroller.respondJSON);

 //刪除使用者的電影收藏
router.post('/userRemoveMovie/', oldMoviecontroller.checkUserExist, oldMoviecontroller.userRemoveMovies, oldMoviecontroller.respondJSON);


//使用者增加喜歡的電影 ，更新array內元素
router.post('/userAddMovies/', oldMoviecontroller.checkUserExist, oldMoviecontroller.userAddMovies);

//顯示使用者喜歡的電影收藏
router.get('/showusermovie/', oldMoviecontroller.checkUserExist, oldMoviecontroller.showUserMovie);

module.exports = router;

















