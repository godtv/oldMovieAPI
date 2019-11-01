const OldMovies = require('../models/oldmovie'),
    User = require('../models/user'),
    getOldMovieParams = (body) => {
        return {
            name: body.name,
            description: body.description,

            albumArt: body.albumArt,
            rating: body.rating
        };

    };
const express = require('express'),
    app = express();

module.exports = {
    getMovies: (req, res) => {
        OldMovies.find()
            .then(movies => {
                res.locals.movies = movies;
                res.status(200).json({
                    status: "success",
                    movies: movies
                })
            })
            .catch(error => {
                console.log( `Error fetching movies: ${error.message}` );

            })

    },

    createMovie: (req, res) => {
        let courseParams = getOldMovieParams( req.body );
        OldMovies.create( courseParams )
            .then( movies => {
                res.status(200).json({
                    status: "success",
                    movies: movies
                })
            } )
            .catch( error => {
                console.log( `Error saving course: ${error.message}` );
                res.json({
                    status: "success",
                    error: error.message
                })
            } );
    },
    show: (req, res, next) => {
        let movieId = req.params.id;
        OldMovies.findById(movieId)
            .then(movie => {
                req.locals.movie = movie;
                next();
            })
            .catch( error => {
                console.log( `Error fetching course by ID: ${error.message}` );
                next( error );
            } );
    },
    update: ( req, res, next ) => {
        let moveId = req.params.id,
            movieParams = getOldMovieParams( req.body );
        OldMovies.findByIdAndUpdate(moveId, {
            $set: movieParams
        })
            .then(movie => {
                res.locals.movie = movie;
            })
    },
    delete:(req, res, next) => {
        let movieId = req.params.id;
        OldMovies.findByIdAndRemove(movieId)
            .then(() => {
                res.status(200).json({
                    status: 200,
                    message: "remove this movie!"
                })
            }).catch(error => {
            console.log( `Error deleting movie by ID: ${error.message}` );
            next();
        });
    },

    errorJSON: ( error, req, res, next ) => {
        let errorObject;

        if ( error ) {
            errorObject = {
                status: 500,
                message: error.message
            };
        } else {
            errorObject = {
                status: 200,
                message: 'Unknown Error.'
            };
        }
        res.json( errorObject );

    },
    respondJSON: ( req, res ) => {
        res.json( {
            status: 200,
            data: res.locals
        } );

    },
    checkUserExist: ( req, res, next ) => {

        //測試
        let apiUserEmail =  res.locals.userEmial;

        if (apiUserEmail) { //注意，無法res.locals無法 log

            User.findOne({email: apiUserEmail})
                .then((user) => {
                    if (user) {

                        res.locals.clientLoginUser = user;
                        next();
                    }

                }).catch(error => {

                console.log( `Error find user by email: ${error.message}` );
                next();
            });
        }
        else {
            console.log('clientLoginUser checkUserExist失敗');
        }

    },
    showUserMovie: (req, res) => {
        let currentUser = res.locals.clientLoginUser;
        
        User.findOne({email: currentUser.email})
            .populate('oldmovie')
            .exec()
            .then((user) => {
            res.status(200).json({
              status: 200,
              userLoveMovie: user.oldmovie
            });
        }).catch((error) => {
            res.status(400).js({
                status:"顯示電影收藏錯誤",
                errorMessage: error.message
            });
        });
    },
    userAddMovies: (req, res) => {
        let currentUser = res.locals.clientLoginUser;

        const mapMovie = req.body.map(data => {
            var movieids = [];
            movieids.push(data.id);
            return movieids;
        });
        OldMovies.find({
            '_id': { $in: mapMovie}
        }, function(err, docs){
            if (!err) {

                //新增電影不應該使用$set，比如有A.B兩部，只傳送C電影，會造成收藏只剩下C = =
                if (typeof docs !== 'undefined' && docs.length > 0) {

                    User.findByIdAndUpdate(currentUser, {
                        //$set: { oldmovie: docs },
                        $addToSet: { oldmovie: docs }
                    }, { new: true})
                        .then((user) => {
                            if (user) {
                                console.log('新增電影收藏成功');
                                //next();

                                console.log('user.oldmovie' + user.oldmovie);

                                res.status(200).json({
                                    status: '成功',
                                    userLoveMovie: user.oldmovie
                                });

                                //測試,寫進的movie，從user中取出
                                // User.findOne({email: currentUser})
                                //     .populate('oldmovie')
                                //     .exec().then( (user) => {
                                //     console.log('test' + JSON.stringify(user));
                                // });
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
                        message: "沒有這部電影"
                    });
                }

            } else {
                res.status(400).json({
                    status: "失敗",
                    message: "沒有這部電影"
                });
            }
        });

    },
    //使用$pull刪除post的電影array
    userRemoveMovies: (req, res, next) => {

        let currentUser = res.locals.clientLoginUser;

        const mapMovie = req.body.map(data => {
            var a = [];
            a.push(data.id);
            return a;
        });
        //console.log("mapMovie is " + mapMovie);
        OldMovies.find({
            '_id': { $in: mapMovie}
        }, function(err, docs){
            if (!err) {
                //確認目前使用者後，更新使用者的電影收藏
                console.log("docs is " + docs);

                if (typeof docs !== 'undefined' && docs.length > 0) {
                    // the array is defined and has at least one element
                    User.findByIdAndUpdate(currentUser, {
                        $pull:{oldmovie: {$in: docs}}
                    }, {new: true})
                        .then((user) => {
                            if (user) {
                                console.log('刪除電影收藏成功');

                                res.status(200).json({
                                    status: '成功',
                                    userLoveMovie: user.oldmovie
                                });
                                //測試,寫進的cousre，從user中取出
                                // User.findOne({email: currentUser})
                                //     .populate('oldmovie')
                                //     .exec().then( (user) => {
                                //     console.log('test' + JSON.stringify(user));
                                // });
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
                        message: "沒有這部電影"
                    });
                }

            } else {
                res.status(400).json({
                    status: "失敗",
                    message: "沒有這部電影"
                });
            }
        });


    },

    addOneMovie: (req, res, next) => {
        //Get the movie id and current user from the request
        let movieId = req.params.id;

        let currentUser = res.locals.clientLoginUser;

        OldMovies.findById(movieId).then(movie => {
            if (movie) {
                if (currentUser) {

                    User.findByIdAndUpdate(currentUser, {
                        $addToSet: {
                            oldmovie: movieId
                        }
                    })
                        .then(() => {
                            res.locals.success = true;
                            next();
                        })
                        .catch(error => {
                            next(error);
                        });
                } else {
                    next(new Error('User must log in.'));
                }
            }
            else {
                res.status(400).json({
                    status: "失敗",
                    message: "沒有這部電影"
                })
            }
        }).catch(error => {
            console.log( `Error find movie by ID: ${error.message}` );
            next();
        });


    },

};





















































































































