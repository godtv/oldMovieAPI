'use strict';

const router = require( 'express' ).Router(),
    usersController = require('../controllers/userController'),
    oldMoviecontroller = require('../controllers/oldMovieoController'),
    sendMailController = require('../controllers/emailController'),
    messageController = require("../controllers/messageSubscribe"),
    itemController = require("../controllers/itemController"),
    fileController = require('../controllers/fileController'),
    pythonController = require('../controllers/pythonScriptController')

//localhost:3000/name?firstname=Ram&lastname=Sharma
//test call python script
router.get('/callpython', pythonController.callName);
router.post('/counterpython', pythonController.countArray);

//router.post('/subscript',messageController.publishSendQueue);

//test send get mp3  /uploadFile/:name/file
router.post('/uploadFile/:name/file', itemController.postFile);
router.get('/getFile/:name', itemController.getFile);//這個api能取得單一檔案或列表
router.post('/removeAudio/:id',itemController.deleteGridfsFile);

//imgur
router.post('/uploadLocalFileToimgur', fileController.uploadFile, fileController.uploadFileToimgur);
router.post('/uploadMutipleFileToimgur', fileController.uploadMutiple, fileController.uploadMutipleFileToimgur);
router.get('/getimageFromImgur', fileController.searchFileFromImgur); 
router.get('/getAlbumInfomation', fileController.getAlbumInfo); 
router.post('/deleteImage',fileController.deleteImageFromImgur);

//Add Voice Item
router.post('/addItem',fileController.configItemList);
//取得item，包含圖跟Audio，很有用
router.get('/getAnimalItem', fileController.getItems);

//Login
router.post('/login', usersController.apiVerify , usersController.apiAuthenticate);

//Create Users
router.post('/createUser', usersController.validateUserData, usersController.create);

router.post('/createMovie', oldMoviecontroller.createMovie);


//Admin刪除其他User


//ex:查詢其他資料必須先驗證token Each app.use(middleware) is called every time a request is sent to the server.
router.use(usersController.verifyJWT);
//ex:查詢其他資料必須先驗證token Each app.use(middleware) is called every time a request is sent to the server.


//Change Password
router.post('/userChangePassword',oldMoviecontroller.checkUserExist ,usersController.changePassword);

//取得電影列表
router.get('/getmovies', oldMoviecontroller.getMovies);

//查詢使用者列表
router.get('/showUsers', usersController.showAdminUserList);

//router.get( '/courses/:id/join', coursesController.join, coursesController.respondJSON );
//使用者增加喜歡的電影

 router.post('/addOnemovie/:id', oldMoviecontroller.checkUserExist, oldMoviecontroller.addOneMovie,oldMoviecontroller.respondJSON);

 //刪除使用者的電影收藏
router.post('/userRemoveMovie/', oldMoviecontroller.checkUserExist, oldMoviecontroller.userRemoveMovies, oldMoviecontroller.respondJSON);


//使用者增加喜歡的電影 ，更新array內元素
router.post('/userAddMovies/', oldMoviecontroller.checkUserExist, oldMoviecontroller.userAddMovies);

//顯示使用者喜歡的電影收藏
router.get('/showusermovie/', oldMoviecontroller.checkUserExist, oldMoviecontroller.showUserMovie);


/* 使用者我的最愛Item 相關 api */
router.post('/userRemoveFavoriteItems/', oldMoviecontroller.checkUserExist, fileController.userRemoveItems);
router.post('/userAddFavoriteItems/', oldMoviecontroller.checkUserExist, fileController.userAddFavoriteItem);
router.get('/showUserFavoriteItem/', oldMoviecontroller.checkUserExist, fileController.showUserFavoriteItem);

module.exports = router;

















