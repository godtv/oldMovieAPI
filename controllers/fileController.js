const imgur = require('imgur');
const fs = require("fs");
const multer = require('multer');
const Items = require('../models/item');//把item放在fileController這邊呼叫，新增 or remove
const User = require('../models/user');

const mongoose = require('mongoose');
const conn = mongoose.connection;


//注意，Multer不會添加任何文件擴展名
const storage = multer.diskStorage({
    destination: './uploads',
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
   
});
 
const uploadSingle = multer({ storage: storage }).single('avatar');
const uploadmultiple = multer({storage: storage}).array('images', 8);

imgur.setClientId('cefcd89343c7e67');
imgur.setAPIUrl('https://api.imgur.com/3/');
imgur.setCredentials('mrlaba@gmail.com', 'kick1911', 'cefcd89343c7e67');

  function readImgurImagesByAlbumID(albumid)
{
    imgur.setClientId('cefcd89343c7e67');
    imgur.setAPIUrl('https://api.imgur.com/3/');
    imgur.setCredentials('mrlaba@gmail.com', 'kick1911', 'cefcd89343c7e67');

       return  imgur.getAlbumInfo(albumid).then(result => {
           
            return  result;
        })
            .catch(error => {
                 
                return  error;
            });
          
        
}

module.exports = {

    //將檔案上傳至Node.js的uploads資料夾
    uploadFile: (function (req, res, next) {
        uploadSingle(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                res.status(500).send(err);
            } else if (err) {
                res.status(400).send({
                    status: false,
                    data: 'No file is selected.'
                });
            }
            next();
        })

    }), 
    //然後再上傳至imgur
    uploadFileToimgur: (req, res) => {

        let albumid = 'ZcYhT2m';
        const uploadFile = req.file;

       //form data得解析成JSON字串
        let imgTitle = JSON.parse(req.body.title);
        let imageSetName =  imgTitle["info"];
        
        imgur.uploadFile(uploadFile.path, albumid, imageSetName).then((json) => {
            res.status(200).json({
                status: "200",
                imageId: imageSetName,
                server: json
            });
        })
            .catch(error => {
                res.status(400).json({
                    responseError: error.message
                })
            });;

      

    },

    searchFileFromImgur: (req, res) => {
        let image = 'CNpQYo0'; //這是id
        imgur.getInfo(image).then(responseData => {
            res.status(200).json({
                success: 'success',
                response: responseData
            });
        })
            .catch(error => {
                res.json({
                    error: 'error',
                    errMsg: error.message
                });
            });

    },
    //用這個可取得所以圖片資訊
    getAlbumInfo: (req, res) => { 

           let albumidData = { id: req.body.id };
            readImgurImagesByAlbumID(albumidData.id).then(result => {
              res.json({
                responseData: result
              });
            }).catch(error => {
                res.json({
                    errorMsg: error
                })
            });
            
    },
    //一次上傳多個圖檔
    uploadMutiple:(req, res, next) => {
        uploadmultiple(req, res, function(err) {

            if (err) {
                res.status(400).send({
                    status: false,
                    data: 'No image is selected.'
                });
            }

            const images = req.files;
            //check if images are available
            if(!images) {
                res.json({
                    status: "error",
                    data: 'No image is selected.'
                });
            } else {
              //直接傳圖檔路徑給imgur
               let data = [];
               images.map(img => data.push(img.path));
               res.locals.uploadImages = data;
                next();
            }
        });
    },
     // 多個圖檔從檔案夾一口氣傳到imgur，無法設定title，或許存放到另一個album
     uploadMutipleFileToimgur: (req, res) => {

        let albumid = 'ZcYhT2m';
         const uploadFiles = req.files;
        
        //console.log('images : ' + JSON.stringify(res.locals.uploadImages) );
    
         
        imgur.uploadImages(res.locals.uploadImages, 'File',albumid).then(result => {
            res.status(200).json({
                status: "200",
                response: result  
            });
        })
        .catch(error => {
            res.json({
                Error: error.message
            });
        });

    },
    //刪除圖檔，跟上傳多個圖檔都不開放給前端使用= =
    deleteImageFromImgur:(req, res) => {
        imgur.deleteImage(req.body.removeid["deleteHash"]).then(result => {
            res.status(200).json({
                response: result
            });
            
        })
        .catch(error => {
            res.json({
                error: error.message
            })
        });
    },

    //重要，這個理論上只需要新增一次即可 = =，用這類方法一次新增多筆資料
    configItemList: (req, res) => {
       let albumid = { id: req.body.id };
       readImgurImagesByAlbumID(albumid.id).then(result => {

        let fullUrl = req.protocol + '://' + req.get('host') + "/api/getFile/";
         
        //取得audio file list
        let  bucket = new mongoose.mongo.GridFSBucket(conn.db);
        let dynamicAudios = [];
        let dynamicImages = [];
        const GridAudiofile = bucket.find().toArray((err, files) => {
            
            //將audio fileName放到dynamicAudios
            files.map(singleFile => {
                let audioHolder = singleFile["filename"];
                dynamicAudios.push(audioHolder);
            });
            //將從imgur取得的圖檔取出需要的部分塞到dynamicImages
            result.data.images.map((image) => {

                let imageHolder = { 
                    id : image.id,
                    name: image.name,
                    imageURL: image.link
                 };
                //dynamicAudios內的音訊檔名與image檔名一致，就取出並與fullUrl組合成音訊連結
                for (let index = 0; index < dynamicAudios.length; index++) {
                    const fileName = dynamicAudios[index];
                    if(fileName.includes(image.name)) {
                        imageHolder.audioURL = fullUrl + fileName
                    }
                }

                dynamicImages.push(imageHolder);
                 
            });
            
            //利用mongodb提供的方法一次塞入多筆資料
            Items.CatalogItem.insertMany(dynamicImages).then((item) => {
                 res.json(item);
            })
            .catch(error => {
                res.json({
                    errMsg: error.message
                })
            });
        
        });
       
       }).catch(error => {
           res.json({
               errorMsg: error 
           }) 
       });
    },
//取得item list
    getItems:(req, res) => {
        Items.CatalogItem.find().then(items => {
            res.status(200).json({
                animalItem: items
            });
        }).catch(error => {
            res.json({
                errorMessage: error.message
            });
        });
    },
    //刪除item，但其實去heroku上提供的mongodb刪除快很多 = =
    deleteItem:(req, res) => {
        Items.CatalogItem.findByIdAndRemove(req.params.id).then(() => {
            res.json({
                message: 'remove the item'
            })  
        })
        .catch(error => {
            res.json({
                errorMsg: error.message
            })
        });
    }
    ,
    //使用者我的最愛Item列表的增刪 ->第一個api 顯示使用者最愛的聲音
    showUserFavoriteItem: (req, res) => {
        let currentUser = res.locals.clientLoginUser;
        User.findOne({email:currentUser.email})
            .populate('favoriteItem')
            .exec()
            .then((user) => {
                res.status(200).json({
                    status: 200,
                    userFavoriteItem: user.favoriteItem
                });
            }).catch((error) => {
                res.json({
                    errorMsg: error.message
                });
            });
        
    },
    //使用者新增我的最愛項目
    userAddFavoriteItem: (req, res) => {
        let currentUser = res.locals.clientLoginUser;

        const mapItem = req.body.map(data => {
            var itemids = [];
            itemids.push(data.id);
            return itemids;
        });
        Items.CatalogItem.find({
            '_id': { $in: mapItem}
        }, function(err, docs){
            if (!err) {
                //新增不應該使用$set，比如有A.B兩個item，只傳送C，會造成我的最愛只剩下C = =
                if (typeof docs !== 'undefined' && docs.length > 0) {

                    User.findByIdAndUpdate(currentUser, {
                        
                        $addToSet: { favoriteItem: docs }
                    }, { new: true})
                        .then((user) => {
                            if (user) {
                                console.log('新增我的最愛item成功');
                           
                                console.log('user.favoriteItem' + user.favoriteItem);

                                res.status(200).json({
                                    status: '成功',
                                    userLoveMovie: user.favoriteItem
                                });
 
                            }
                        })
                        .catch((error) => {
                            console.log( `Error updating user by ID: ${error.message}` );
                             res.status(400).json({
                                status: '失敗'
                             });
                        });
                }
                else {
                    res.status(400).json({
                        status: "失敗",
                        message: "沒有這個item"
                    });
                }

            } else {
                res.status(400).json({
                    status: "失敗",
                    message: "沒有這個item"
                });
            }
        });

    },
    
    //使用 $pull 刪除post的item array ->這只會影響使用者的item收藏
    userRemoveItems: (req, res, next) => {

        let currentUser = res.locals.clientLoginUser;

        const mapItem = req.body.map(data => {
            var a = [];
            a.push(data.id);
            return a;
        });
        
        Items.CatalogItem.find({
            '_id': { $in: mapItem}
        }, function(err, docs){
            if (!err) {
                 
                console.log("docs is " + docs);

                if (typeof docs !== 'undefined' && docs.length > 0) {
                    
                    User.findByIdAndUpdate(currentUser, {
                        $pull:{favoriteItem: {$in: docs}}
                    }, {new: true})
                        .then((user) => {
                            if (user) {
                                console.log('刪除Item成功');

                                res.status(200).json({
                                    status: '成功',
                                    response: user.favoriteItem
                                });
                                 
                            }
                        })
                        .catch((error) => {
                            console.log( `Error updating user by ID: ${error.message}` );
                            next( error );
                        });

                }
                else {
                    res.status(400).json({
                        status: "失敗",
                        message: "沒有這個Item"
                    });
                }

            } else {
                res.status(400).json({
                    status: "失敗",
                    message: "沒有這個Item"
                });
            }
        });


    }

};
