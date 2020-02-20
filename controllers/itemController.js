 
const Item = require('../models/item');
 

const Grid = require('gridfs-stream');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/old-movie", {useNewUrlParser: true, useUnifiedTopology: true});
const conn = mongoose.connection;


function readFile(bucket, request, response) {

 
  searchGridFs(bucket, request, response);

}
//private method
function searchGridFs(bucket , request, response) {
  
  let searchOption = {};
  if(request.params.name !== 'all') {
    searchOption = { filename: request.params.name }
  }
  const file = bucket.find(searchOption).toArray((err, files) => {
    (request.params.name === 'all') ? response.set('Content-Type', 'application/json') : response.set('Content-Type', 'audio/wav');
    
    
    if(!files || files.length === 0) {
      return response.status(400).json({
        err: 'no file exist'
      });
    }
    (request.params.name === 'all') ?  response.status(200).json({
    msg: files
  }) : bucket.openDownloadStreamByName(request.params.name).pipe(response);
  });
  
  

  
}

module.exports = {

postFile: (req, res) => {
    
    let  bucket = new mongoose.mongo.GridFSBucket(conn.db);

    req.pipe(bucket.openUploadStream(req.params.name)).on('finish', function(saveFile) {
      res.status(200).json({
        msg: saveFile
      })
       
    });
     

},


getFile:(req, res) => {
    
  //  let gfs = Grid(Item.connection.db, mongoose.mongo);
   let  bucket = new mongoose.mongo.GridFSBucket(conn.db);
   readFile(bucket, req, res);
},

deleteGridfsFile:(req, res) => {
  
  let  bucket = new mongoose.mongo.GridFSBucket(conn.db);
 
   
  bucket.delete(new mongoose.Types.ObjectId(req.params.id), (err, data) => {
    if (err) return res.status(404).json({ err: err.message });
     
    res.json({
      msg: 'remove file success!'
    })
  });

   
 }

};


