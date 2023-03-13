
const Promise = require("bluebird");
const MongoClient = require("mongodb").MongoClient;
const mongoose = require("mongoose");
const { ObjectId } = require('mongodb');
var fs = require('fs');
const path = require("path");
const puppeteer = require("puppeteer");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken")
const config = require("../../config");

const schemaOptions = {
  timestamps: { createdAt: 'created_at', updatedAt: 'last_updated' },
};

const Bills = mongoose.model('bill', mongoose.Schema({
  client_name: { type: String, required: true },
  client_phone: { type: String, required: true },
  client_email: { type: String },
  client_location: { type: String },
  client_discount: { type: String },
  payment_method: { type: String, required: true },
  billing_info: { type: Array, required: true },
  total_person: { type: String, required: true },
  total_rs: { type: String, required: true },
  event_date: { type: Date, required: true },
}, schemaOptions));

const MahendiCategory = mongoose.model('mahendicategory', mongoose.Schema({
  short_name: { type: String, required: true, unique: true, dropDups: true },
  original_name: { type: String, unique: true, required: true, dropDups: true },
}, schemaOptions));

const User = mongoose.model('User', mongoose.Schema({
  userName: { type: String, required: true, unique: true, dropDups: true },
  password: { type: String, unique: true, required: true, dropDups: true },
}, schemaOptions));

// full-old-div
let galleryDiv = {
  string: `
<div class="col-lg-4 col-md-6 portfolio-item filter-app">
<img src="/public/img/portfolio/portfolio-1.jpg" class="img-fluid" alt="">
<div class="portfolio-info">
<h4>App 1</h4>
<p>App</p> 
</div></div>` };

let about_photo = {
  string: `<img id="output" style="width: 636px; height: 523.317px;" src="/public/img/team.jpg" class="img-fluid" alt="">`
};

{/* <a href="/public/img/portfolio/portfolio-1.jpg" data-gallery="portfolioGallery"class="portfolio-lightbox preview-link" title="App 1">
<i class="bx bx-plus"></i></a> 
<a href="portfolio-details.html" class="details-link" title="More Details">
<iclass="bx bx-link"></i></a> */}
let admingalleryDiv = {
  string: `
<div class="col-lg-4 col-md-6 portfolio-item filter-app">
<img src="/public/img/portfolio/portfolio-1.jpg" class="img-fluid" alt="">
<div class="portfolio-info">
<h4>App 1</h4>
<p>App</p>
<a idddd><i class="fa fa-times" aria-hidden="true"></i></a> 
</div>
</div>` };

let generate = (err, message, status, data) => {
  let response = {
    error: err,
    message: message,
    status: status,
    data: data
  }
  return response
}

function convertDate(inputFormat) {
  function pad(s) {
    return (s < 10) ? '0' + s : s;
  }
  var d = new Date(inputFormat)
  return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join('/')
}

function replacevalue(html, data) {
  const format = 'dd/MM/yyyy';
  const locale = 'en-US';
  html = html.replace(/{{invoice_number}}/g, data._id ? data._id : '');
  html = html.replace(/{{event_date}}/g, convertDate(data.event_date));
  html = html.replace(/{{current_date}}/g, convertDate(data.created_at));
  html = html.replace(/{{client_name}}/g, data.client_name);
  html = html.replace(/{{client_phone}}/g, data.client_phone);
  html = html.replace(/{{client_location}}/g, (data.client_location) ? data.client_location : 'Surat');
  html = html.replace(/{{discount_rs}}/g, (data.client_discount) ? data.client_discount : 0);
  html = html.replace(/{{payment_method}}/g, data.payment_method);
  html = html.replace(/{{total_rs}}/g, data.total_rs);
  let count = 0;
  let rowcount = 13;
  let str = '';
  data.billing_info.forEach(element => {
    count++;
    rowcount--;
    let className = '';

    if (data.billing_info.length === count) {
      className = 'item last1';
    } else {
      className = 'item';
    }

    let string = "<tr class=" + className + "><td colspan='3'>" + element.mehndi_description + "</td> <td class='first'>" + element.no_of_person + "</td> <td class='middle'>" + '₹ ' + element.price_per_person + "</td> <td class='last'>" + '₹ ' + element.total + "</td> </tr>"

    str += string;
  });
  for (let i = 0; i < rowcount; i++) {

    let string = "<tr style=height:34px;> <td colspan=3></td> <td class='first'></td> <td class='middle'></td> <td class='last'></td> </tr>";

    str += string;
  }
  html = html.replace(/{{tr_datas}}/g, str);
  return html;
}

async function puppeterPDF(htmlData) {
  const browser = await puppeteer.launch({
    args: [
      "--incognito",
      "--no-sandbox",
      "--single-process",
      "--no-zygote"
    ],
  });
  const page = await browser.newPage();
  await page.setContent(htmlData, {
    waitUntil: 'domcontentloaded'
  });
  await page.pdf({
    path: "invoice.pdf", format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    margin: {
      left: '0px',
      top: '0px',
      right: '0px',
      bottom: '0px'
    }
  });

  await browser.close();
  const file = path.join(__dirname, '../../invoice.pdf');
  return file;
}

function generateAccessToken(user) {
  return jwt.sign(user, config.ACCESS_TOKEN_SECRET, { expiresIn: "15m" })
}

let refreshTokens = [];

function generateRefreshToken(user) {
  const refreshToken =
    jwt.sign(user, config.REFRESH_TOKEN_SECRET, { expiresIn: "20m" })
  refreshTokens.push(refreshToken)
  return refreshToken
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

var db1, collection, collectionChunks;
MongoClient.connect("mongodb://ecommarcedb:Ab88Mi!318@mydb-shard-00-00.i78bf.mongodb.net:27017,mydb-shard-00-01.i78bf.mongodb.net:27017,mydb-shard-00-02.i78bf.mongodb.net:27017/myallinoneproject?ssl=true&replicaSet=mydb-shard-0&authSource=admin&retryWrites=true&w=majority", function (err, client) {
  if (err) {
    let apiResponse = generate(
      true,
      {
        title: "Uploaded Error",
        message: "MongoClient Connection error",
        error: err.errMsg,
      },
      500,
      null
    );
    console.log(apiResponse);
  }
  db1 = client.db("myallinoneproject");
  collection = db1.collection("uploads.files");
  collectionChunks = db1.collection("uploads.chunks");
});

let htmlConvertion = (htmlGalleryDiv, req, element, finalFile) => {

  htmlGalleryDiv.string = htmlGalleryDiv.string.replace('filter-app', 'filter-' + element.metadata.categoryName);

  htmlGalleryDiv.string = htmlGalleryDiv.string.replace(`src="/public/img/portfolio/portfolio-1.jpg"`, `src="` + finalFile + `"`);
  htmlGalleryDiv.string = htmlGalleryDiv.string.replace(`href="/public/img/portfolio/portfolio-1.jpg"`, `href="` + finalFile + `"`);

  if (req.originalUrl != "/admin") {
    htmlGalleryDiv.string = htmlGalleryDiv.string.replace("<h4>App 1</h4>", "<h4></h4>");
    htmlGalleryDiv.string = htmlGalleryDiv.string.replace("<p>App</p>", "<p>" + element.metadata.categoryPrintName + "</p>");
  } else {
    htmlGalleryDiv.string = htmlGalleryDiv.string.replace("<h4>App 1</h4>", "<h4>" + element.filename + "</h4>");
    htmlGalleryDiv.string = htmlGalleryDiv.string.replace("<p>App</p>", "<p>" + element.metadata.categoryPrintName + "</p>");
  }

  htmlGalleryDiv.string = htmlGalleryDiv.string.replace(`title="App 1"`, `title="` + element.metadata.categoryName + `"`);
  htmlGalleryDiv.string = htmlGalleryDiv.string.replace(`idddd`, `onclick="deletePhoto(\'` + element.filename.toString() + `'\)"`);

  return htmlGalleryDiv.string;
}

function gettime() {
  var date = new Date;
  date.setTime(date.getTime());

  var seconds = date.getSeconds();
  var minutes = date.getMinutes();
  var hour = date.getHours();

  return hour + ':' + minutes + ':' + seconds;
}

let getPhotosByCategory = (req, res, next) => {

  let findChunks = (element, dataObj) => {
    return new Promise((resolve, reject) => {
      if (element.metadata != undefined) {
        collectionChunks
          .find({ files_id: element._id })
          .sort({ n: 1 })
          .toArray(function (err, chunks) {
            if (err) {
              let apiResponse = generate(
                true,
                {
                  title: "Download Error",
                  message: "Error retrieving chunks",
                  error: err.errmsg,
                },
                500,
                null
              );
              reject(apiResponse);
            }
            if (!chunks || chunks.length === 0) {
              let apiResponse = generate(
                true,
                {
                  title: "Download Error",
                  message: "No data found",
                },
                500,
                null
              );
              resolve();
            }
            let fileData = [];
            for (let i = 0; i < chunks.length; i++) {
              fileData.push(chunks[i].data.toString("base64"));
            }
            let finalFile =
              "data:" + element.contentType + ";base64," + fileData.join("");
            element.imgurl = finalFile;
            var htmlGalleryDiv = {};
            htmlGalleryDiv = { ...galleryDiv };
            if (element.metadata.categoryPrintName.toLowerCase() != 'test' || element.metadata.categoryName.toLowerCase() != 'test') {
              resolve(htmlConvertion(htmlGalleryDiv, req, element, finalFile));
            }
            else
              resolve();

          });
      } else {
        resolve();
      }
    });
  }; // end of findChunks

  let findCategory = (data) => {
    return new Promise((resolve, reject) => {
      console.log('findCategory', gettime());
      let js = {
        photos: data,
        table: '',
        total_inc: 0
      }

      js.category = '';
      js.photoCategory = '';
      js.gallaryFilter = '<li data-filter="*" class="filter-active">All</li>';

      MahendiCategory.find({ short_name: { $nin: ['about_photo', 'test'] } }, function (err, catData) {
        if (err) {
          console.log("err", err);
          resolve(js);
        } else {
          console.log("cat data found", catData.length, gettime());

          for (let i = 0; i < catData.length; i++) {
            if (catData[i].short_name.toLowerCase() != 'test') {
              let str1 = `<li data-filter=".filter-` + catData[i].short_name + `">` + catData[i].original_name + `</li>`;
              js.gallaryFilter = js.gallaryFilter + str1;
            }

          }
          resolve(js);
        }
      });
    });
  }; // end of findCategory

  let findPhotosCategory = (dataObj) => {
    console.log("findPhotosCategory", gettime());
    return new Promise((resolve, reject) => {
      collection
        // .find({ "metadata.categoryName": 'test' })
        .find({ "metadata.categoryName": { $nin: ['test', 'about_photo'] } })
        .toArray((err, files) => {
          if (err) {
            reject({
              title: "File error",
              message: "Error finding file",
              error: err.errMsg,
            });
          } else {
            let ary = [];
            files = shuffleArray(files);
            console.log('Total Photos', files.length, gettime());
            files.forEach((element, i) => {
              ary.push(findChunks(element, dataObj));
            });
            Promise.all(ary)
              .then((data) => {
                console.log('photos retrive', gettime());
                return (data);
              })
              .then(findCategory)
              .then((data) => {
                resolve(data);
              })
              .catch((er) => {
                reject(er);
              });
          }
        });
    });
  }; // end of findPhotosCategory

  findPhotosCategory()
    .then((resolve) => {
      let photos = resolve.photos.join('');
      res.render('index', {
        photos: photos,
        gallaryFilter: resolve.gallaryFilter
      });
    })
    .catch((err) => {
      console.log('reject');
      console.log(err);
      res.status(err.status).send(err);
    });
};

let getPhotosByCategoryAdmin = (req, res, next) => {

  let findChunksForAboutPhoto = (element, dataObj) => {
    return new Promise((resolve, reject) => {
      if (element.metadata != undefined) {
        collectionChunks
          .find({ files_id: element._id })
          .sort({ n: 1 })
          .toArray(function (err, chunks) {
            if (err) {
              reject(err);
            }
            if (!chunks || chunks.length === 0) {
              resolve();
            }
            let fileData = [];
            for (let i = 0; i < chunks.length; i++) {
              fileData.push(chunks[i].data.toString("base64"));
            }
            let finalFile =
              "data:" + element.contentType + ";base64," + fileData.join("");
            element.imgurl = finalFile;

            about_photo.string = about_photo.string.replace(`src="/public/img/team.jpg"`, `src="` + finalFile + `"`);
            resolve(about_photo.string);
          });
      } else {
        resolve();
      }
    });
  }; // end of findChunksForAboutPhoto

  let findChunks = (element, dataObj) => {
    return new Promise((resolve, reject) => {
      if (element.metadata != undefined) {
        collectionChunks
          .find({ files_id: element._id })
          .sort({ n: 1 })
          .toArray(function (err, chunks) {
            if (err) {
              let apiResponse = generate(
                true,
                {
                  title: "Download Error",
                  message: "Error retrieving chunks",
                  error: err.errmsg,
                },
                500,
                null
              );
              reject(apiResponse);
            }
            if (!chunks || chunks.length === 0) {
              let apiResponse = generate(
                true,
                {
                  title: "Download Error",
                  message: "No data found",
                },
                500,
                null
              );
              resolve();
            }
            let fileData = [];
            for (let i = 0; i < chunks.length; i++) {
              fileData.push(chunks[i].data.toString("base64"));
            }
            let finalFile =
              "data:" + element.contentType + ";base64," + fileData.join("");
            element.imgurl = finalFile;
            var htmlGalleryDiv = {};

            htmlGalleryDiv = { ...admingalleryDiv };
            resolve(htmlConvertion(htmlGalleryDiv, req, element, finalFile));
          });
      } else {
        resolve();
      }
    });
  }; // end of findChunks

  let getBills = (data) => {
    return new Promise((resolve, reject) => {
      let js = {
        photos: data,
        table: '',
        total_inc: 0
      }
      console.log('getBills');
      let queryStr = {};
      // if (req.query.search) {
      //   queryStr = { "client_phone": "+91" + req.query.search }
      // }
      // console.log('queryStr', queryStr);
      // console.log('req.query.search', req.query.search);

      Bills.find(queryStr, null, { sort: { event_date: -1 } },
        function (err, billData) {
          if (err) {
            console.log("err", err);
            resolve(js);
          } else {
            console.log("bill Data", billData.length);

            let tableAry = '';
            let total_inc = 0;

            for (let i = 0; i <= billData.length; i++) {
              if (billData[i] !== undefined) {
                total_inc = total_inc + Number(billData[i].total_rs);
                var htmlTrCP = `<tr><td>` + billData[i].client_name + `</td><td>` + billData[i].client_phone + `</td><td>` + ((billData[i].client_location === undefined) ? "Surat" : billData[i].client_location) + `</td><td>` + ((billData[i].client_discount === undefined) ? `₹ ` + 0 : `₹ ` + billData[i].client_discount) + `</td><td>` + `₹ ` + billData[i].total_rs + `</td><td>` + convertDate(billData[i].event_date) + `</td>` +
                  `<td><button class="btn btn-primary" type="button" onclick="printRecord(\'` + billData[i].id.toString() + `'\)"'>Print</button><button class="btn btn-danger" type="button"onclick="deleteRecord(\'` + billData[i].id.toString() + `'\)">Delete</button></td></tr>`;
                // console.log(`==', htmlTrCP);
                tableAry = tableAry + htmlTrCP;
              }
            }
            console.log("resolve Table");

            js = {
              photos: data,
              table: tableAry,
              total_inc: total_inc
            }
            resolve(js);
          }
        });
    });
  }; // end of getBills

  let findCategory = (js) => {
    return new Promise((resolve, reject) => {
      console.log('findCategory', gettime());

      js.category = '';
      js.photoCategory = '';
      js.adminGallaryFilter = '<li data-filter="*" class="filter-active">All</li>';

      // { short_name: { $nin: ['about_photo'] }}
      MahendiCategory.find({ }, function (err, catData) {
        if (err) {
          console.log("err", err);
          resolve(js);
        } else {
          console.log("cat data found", catData.length, gettime());

          let tableAry = '<select class="form-control" id="newMehndiCategory">';
          let tableAry1 = '<select class="form-control" id="mehndiCategory">';

          for (let i = 0; i < catData.length; i++) {
            var htmlTrCP = `<option value="` + catData[i].short_name + `">` + catData[i].original_name + `</option>`;

            tableAry = tableAry + htmlTrCP;
            tableAry1 = tableAry1 + htmlTrCP;

            let str = `<li data-filter=".filter-` + catData[i].short_name + `">` + catData[i].original_name + `</li>`;
            js.adminGallaryFilter = js.adminGallaryFilter + str;
          }
          tableAry = tableAry + `</select>`;
          tableAry1 = tableAry1 + `</select>`;
          js.category = tableAry;
          js.photoCategory = tableAry1;
          resolve(js);
        }
      });
    });
  }; // end of findCategory

  let findPhotosCategory = (dataObj) => {
    console.log("findPhotosCategory");
    return new Promise((resolve, reject) => {
      // "metadata.categoryName": { $nin: ['about_photo'] } 
      collection
        .find({})
        .toArray((err, files) => {
          if (err) {
            reject({
              title: "File error",
              message: "Error finding file",
              error: err.errMsg,
            });
          } else {
            let ary = [];
            files = shuffleArray(files);
            console.log('Total Photos', files.length, gettime());
            files.forEach((element, i) => {
              ary.push(findChunks(element, dataObj));
            });
            Promise.all(ary)
              .then((data) => {
                console.log('photos retrive', gettime());
                return (data);
              })
              .then((data) => {
                resolve(data);
              })
              .catch((er) => {
                reject(er);
              });
          }
        });
    });
  }; // end of findPhotosCategory

  let findAboutPhoto = (dataObj) => {
    console.log("findAboutPhoto");
    return new Promise((resolve, reject) => {
      collection
        .find({ "metadata.categoryName": 'about_photo' })
        .toArray((err, files) => {
          if (err) {
            reject({
              title: "File error",
              message: "Error finding file",
              error: err.errMsg,
            });
          } else {
            let ary = [];
            console.log('Total Photos', files.length, gettime());
            files.forEach((element, i) => {
              ary.push(findChunksForAboutPhoto(element, dataObj));
            });
            Promise.all(ary)
              .then((data) => {
                console.log('photos retrive', gettime());
                return (data);
              })
              .then((data) => {
                dataObj.about_photo = data
                resolve(dataObj);
              })
              .catch((er) => {
                reject(er);
              });
          }
        });
    });
  };

  findPhotosCategory()
    .then(getBills)
    .then(findCategory)
    .then(findAboutPhoto)
    .then((resolve) => {
      let photos = resolve.photos.join('');
      res.render('adminIndex', {
        photos: photos,
        dataTable: resolve.table,
        total_in: resolve.total_inc,
        allCategoryForDelete: resolve.category,
        allCategoryForUpload: resolve.photoCategory,
        adminGallaryFilter: resolve.adminGallaryFilter,
        about_photo: resolve.about_photo
      });
    })
    .catch((err) => {
      console.log('reject');
      console.log(err);
      res.status(err.status).send(err);
    });
};


let downloadPDF = (req, res, next) => {

  let findRecord = () => {
    console.log("findRecord");
    return new Promise((resolve, reject) => {
      console.log('req.params.id', req.params.id);
      Bills.findById(ObjectId(req.params.id), async (err, data) => {
        console.log(err, data.id)
        if (err)
          reject(err)
        else {
          fs.readFile(path.join(__dirname, '../../pdfTemplate/pdfTemplate.html'), 'utf8', async function (err, html) {
            //  console.log('html', html);
            const newdata = replacevalue(html, data);
            let ccc = await puppeterPDF(newdata);
            resolve(ccc);
          })
        }
      });
    });
  }; // end of findRecord

  findRecord()
    .then((resolve) => {
      res.sendFile(resolve);
    })
    .catch((err) => {
      console.log(err);
      res.status(err.status).send(err);
    });
};

let deletePdf = (req, res, next) => {

  let findRecord = () => {
    console.log("findRecord");
    return new Promise((resolve, reject) => {
      console.log('req.params.id', req.params.id);
      Bills.findByIdAndDelete(ObjectId(req.params.id), async (err, data) => {
        console.log(err, data.id)
        if (err)
          reject(err)
        else {
          resolve(data);
        }
      });
    });
  }; // end of findRecord

  findRecord()
    .then((resolve) => {
      res.status(200).send(resolve);
    })
    .catch((err) => {
      console.log(err);
      res.status(err.status).send(err);
    });
};

let saveBilling = (req, res) => {
  let insertBill = () => {
    // console.log("insertBill", req.body);
    return new Promise((resolve, reject) => {
      Bills.create(req.body,
        function (err, billData) {
          if (err) {
            console.log("err", err);
            reject(err);
          } else {
            resolve(billData);
          }
        }
      );
    });
  }; // end of insertBill

  insertBill()
    .then((resolve) => {
      res.status(200).send(resolve);
    })
    .catch((err) => {
      console.log("err", err);
      res.status(400).send(err);
    });
};

let creteNewCategory = (req, res) => {
  let insertCategory = () => {
    console.log("insertCategory", req.body);
    return new Promise((resolve, reject) => {
      MahendiCategory.create(req.body,
        function (err, catData) {
          if (err) {
            console.log("err", err);
            reject(err);
          } else {
            resolve(catData);
          }
        }
      );
    });
  }; // end of insertCategory

  insertCategory()
    .then((resolve) => {
      res.status(200).send(resolve);
    })
    .catch((err) => {
      console.log("err", err);
      res.status(400).send(err);
    });
};

let deleteCategory = (req, res, next) => {

  let findRecord = () => {
    console.log("findRecord");
    return new Promise((resolve, reject) => {
      console.log('req.params.id', req.params.id);
      MahendiCategory.findOneAndDelete({ short_name: req.params.id }, async (err, data) => {
        console.log(err, data.id)
        if (err)
          reject(err)
        else {
          resolve(data);
        }
      });
    });
  }; // end of findRecord

  findRecord()
    .then((resolve) => {
      res.status(200).send(resolve);
    })
    .catch((err) => {
      console.log(err);
      res.status(err.status).send(err);
    });
};

let createUser = (req, res) => {

  let checkUserDetails = () => {
    console.log("checkUserDetails", req.body);
    return new Promise(async (resolve, reject) => {
      const user = req.body.user;
      const hashedPassword = await bcrypt.hash(req.body.password, 10)
      User.create({ userName: user, password: hashedPassword }, function (err, userData) {
        if (err)
          reject(err)
        else {
          resolve(userData);
        }
      })
    });
  }; // end of checkUserDetails

  checkUserDetails()
    .then((resolve) => {
      res.status(200);
      res.redirect('/admin');
    })
    .catch((err) => {
      console.log("err", err);
      res.status(400);
      res.redirect('/login');
    });
};

let checkUser = (req, res) => {

  let checkUserDetails = () => {
    console.log("checkUserDetails");
    return new Promise(async (resolve, reject) => {
      // user == "aakritimehndi@gmail.com" && pwd == "testDaisyAakriti!318"
      const user = await User.findOne({ userName: req.body.user });
      if (user == null) reject("User does not exist!");
      if (await bcrypt.compare(req.body.pwd, user.password)) {
        const accessToken = generateAccessToken({ user: req.body.name });
        const refreshToken = generateRefreshToken({ user: req.body.name });
        resolve({ accessToken: accessToken, refreshToken: refreshToken });
      }
      else {
        reject();
      }
    });
  }; // end of checkUserDetails

  checkUserDetails()
    .then((resolve) => {
      // res.status(200).send(resolve);
      res.status(200);
      // // res.setHeader("authorization", resolve.accessToken);
      // res.setHeader('authorization', 'Bearer '+ resolve.accessToken); 
      res.redirect('/admin');
    })
    .catch((err) => {
      console.log("err", err);
      res.status(400);
      res.redirect('/login');
    });
};

let refreshToken = (req, res) => {

  let checkUserDetails = () => {
    console.log("checkUserDetails");
    return new Promise(async (resolve, reject) => {
      if (!refreshTokens.includes(req.body.token)) res.status(400).send("Refresh Token Invalid")
      refreshTokens = refreshTokens.filter((c) => c != req.body.token)
      const accessToken = generateAccessToken({ user: req.body.name })
      const refreshToken = generateRefreshToken({ user: req.body.name })
      //generate new accessToken and refreshToken
      res.json({ accessToken: accessToken, refreshToken: refreshToken });
    });
  }; // end of checkUserDetails

  checkUserDetails()
    .then((resolve) => {
      res.status(200);
      res.redirect('/admin');
    })
    .catch((err) => {
      console.log("err", err);
      res.status(400);
      res.redirect('/login');
    });
};

module.exports = {
  getPhotosByCategory: getPhotosByCategory,
  getPhotosByCategoryAdmin: getPhotosByCategoryAdmin,
  downloadPdf: downloadPDF,
  deletePdf: deletePdf,
  saveBilling: saveBilling,
  creteNewCategory: creteNewCategory,
  deleteCategory: deleteCategory,
  createUser: createUser,
  checkUser: checkUser,
  refreshToken: refreshToken
};
