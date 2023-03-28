var mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const AuthModel = mongoose.model('tokenCollection');
const token = require('../lib/tokenLib');

let trim = (x) => {
    let value = String(x)
    return value.replace(/^\s+|\s+$/gm, '')
}

let isEmpty = (value) => {
    if (value === null || value === undefined || trim(value) === '' || value.length === 0) {
        return true
    } else {
        return false
    }
}

let isAuthorize = (req, res, next) => {
    console.log("isAuthorize");
    if (req.params.authToken || req.query.authToken || req.body.authToken || req.header('authToken')) {
        AuthModel.findOne({ authToken: req.params.authToken || req.query.authToken || req.body.authToken || req.header('authToken') }).exec((err, authDetails) => {
            if (err) {
                console.log(err);
                res.status(200);
                res.redirect('login');
            } else if (isEmpty(authDetails)) {
                res.status(200);
                res.redirect('login');
            } else {
                token.verifyClaims(authDetails.authToken, (err, decoded) => {
                    if (err) {
                        res.status(200);
                        res.redirect('login');
                    } else {
                        console.log(decoded.data);
                        req.user = decoded.data;
                        next();
                    }
                });
            }
        });
    } else {
        res.status(200);
        res.redirect('login');
    }

}; // end of isAuthorize

module.exports = {
    isAuthorize: isAuthorize
};
