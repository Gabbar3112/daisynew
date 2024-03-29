// Imports
const express = require('express');
const app = express();
var mongoose = require("mongoose");
const morgan = require("morgan");
const GridFsStorage = require("multer-gridfs-storage").GridFsStorage;
const Grid = require("gridfs-stream");
const multer = require("multer");
const crypto = require("crypto");
const path = require("path");
var bodyParser = require("body-parser");
const ObjectId = mongoose.Types.ObjectId;
const cors = require('cors');

const aakriti = require("./backend/controller/aakriticontroller");
const config = require("./config");
const middleware = require('./backend/middlewares/auth');
let gfs;

app.use(morgan("dev"));

app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ extended: false, limit: "100mb" }));
app.use(cors());


// Static Files
app.use(express.static('public'));

// Specific folder example
app.use('/public/css', express.static(__dirname + '/public/css'));
app.use('/public/font-awesome-4.7.0/css', express.static(__dirname + '/public/font-awesome-4.7.0/css'));
app.use('/public/vendor/aos', express.static(__dirname + '/public/vendor/aos'));
app.use('/public/vendor/swiper', express.static(__dirname + '/public/vendor/swiper'));
app.use('/public/vendor/bootstrap/css', express.static(__dirname + '/public/vendor/bootstrap/css'));
app.use('/public/vendor/bootstrap-icons', express.static(__dirname + '/public/vendor/bootstrap-icons'));
app.use('/public/vendor/boxicons/css', express.static(__dirname + '/public/vendor/boxicons/css'));
app.use('/public/vendor/glightbox/css', express.static(__dirname + '/public/vendor/glightbox/css'));
app.use('/public/vendor/aos', express.static(__dirname + '/public/vendor/aos'));
app.use('/public/vendor/bootstrap/js', express.static(__dirname + '/public/vendor/bootstrap/js'));
app.use('/public/vendor/glightbox/js', express.static(__dirname + '/public/vendor/glightbox/js'));
app.use('/public/vendor/isotope-layout', express.static(__dirname + '/public/vendor/isotope-layout'));
app.use('/public/vendor/swiper', express.static(__dirname + '/public/vendor/swiper'));
app.use('/public/vendor/php-email-form', express.static(__dirname + '/public/vendor/php-email-form'));
app.use('/public/js', express.static(__dirname + '/public/js'));
app.use('/public/vendor/boxicons/fonts', express.static(__dirname + '/public/vendor/boxicons/fonts'));
app.use('/public/font-awesome-4.7.0/fonts', express.static(__dirname + '/public/font-awesome-4.7.0/fonts'));
app.use('/js', express.static(__dirname + '/public/js'));
app.use('/public/img', express.static(__dirname + '/public/img'));

// Set View's
app.set('views', './views');
app.set('view engine', 'ejs');

// let db = mongoose.connect(process.env.mongoUrl, {
//     useUnifiedTopology: true,
//     useNewUrlParser: true,
// });

mongoose.connection.on("error", function (err) {
    console.log("database connection error");
    console.log(err);
    console.error(err, "mongoose connection on error handler", 10);
    //process.exit(1)
}); // end mongoose connection error

mongoose.connection.on("open", function (err) {
    if (err) {
        console.log("database error");
        console.log(err);
        console.error(err, "mongoose connection open handler", 10);
    } else {
        console.log("database connection open success");
    }
}); // enr mongoose connection o

const mongoURI = "mongodb://ecommarcedb:Ab88Mi!318@mydb-shard-00-00.i78bf.mongodb.net:27017,mydb-shard-00-01.i78bf.mongodb.net:27017,mydb-shard-00-02.i78bf.mongodb.net:27017/myallinoneproject?ssl=true&replicaSet=mydb-shard-0&authSource=admin&retryWrites=true&w=majority";

const promise = mongoose.connect(mongoURI, { useNewUrlParser: true });

const conn = mongoose.connection;

conn.once('open', () => {
    console.log('Photo Storage connection Open');

    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection("uploads");
});

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

//create storage object
const storage = new GridFsStorage({
    db: promise,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = makeid(5) + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: "uploads",
                    metadata: req.body,
                };
                resolve(fileInfo);
            });
        });
    }
});
const upload = multer({ storage });

// Navigation

app.get("/", [aakriti.getPhotosByCategory]);

app.get('/login', (req, res) => {
    res.render('login', {})
})

app.get('/admin', middleware.isAuthorize, [aakriti.getPhotosByCategoryAdmin]);

app.post("/UploadPhoto", middleware.isAuthorize, upload.single("file"), (req, res) => {
    res.status(200).send("Photo upload Successfully!!");
});

app.delete("/deletPhotosById/:id", async (req, res) => {
    const file = await gfs.files.findOne({ filename: req.params.id });
    const gsfb = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'uploads' });
    gsfb.delete(file._id, function (err, gridStore) {
        if (err) return next(err);
        res.status(200).end();
    });
});

app.get("/deletall", async (req, res) => {
    gfs.files.remove({ "metadata.categoryName": "test" }, (err, result) => {
        if (err) {
            console.error('error removing that file');
            res.status(400).send("file not Deleted");
            process.exit(1);
        } else {
            console.info('removed file: ', result);
            res.status(200).send({ status: 200, message: "Photo Deleted Successfully!!" });
        }
    });
});

app.get("/deletall/:id", async (req, res) => {
    const file = await gfs.files.findOne({ "metadata.categoryName": "about_photo" });
    console.log('file', file);
    const gsfb = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'uploads' });
    gsfb.delete(new ObjectId(file._id), function (err, gridStore) {
        if (err) {
            console.log('err', err)
        }
        else {
            res.status(200).send(gridStore);
        }

    });
    // console.log('req.params', req.params.id, new ObjectId(req.params.id));
    // gfs.files.remove({ "metadata.categoryName": "test" }, (err, result) => {
    //     if (err) {
    //         console.error('error removing that file');
    //         res.status(400).send("file not Deleted");
    //         process.exit(1);
    //     } else {
    //         console.info('removed file: ', result);
    //         res.status(200).send({ status: 200, message: "Photo Deleted Successfully!!" });
    //     }
    // });
});

app.get("/printandpdf/:id", middleware.isAuthorize, [aakriti.downloadPdf]);

app.get("/deleteRecord/:id", middleware.isAuthorize, [aakriti.deletePdf]);

app.post("/checkUser", [aakriti.checkUser]);

app.post("/billing", middleware.isAuthorize, [aakriti.saveBilling]);

app.post("/category", middleware.isAuthorize, [aakriti.creteNewCategory]);

app.delete("/deleteCategory/:id", middleware.isAuthorize, [aakriti.deleteCategory]);

app.post("/createUser", [aakriti.createUser]);

app.post("/refreshToken", [aakriti.refreshToken]);

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});



app.listen(config.port, () => console.info(`App listening on port ${config.port}`));