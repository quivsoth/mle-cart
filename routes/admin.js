var express = require("express");
var router = express.Router();
var Collection = require("../models/collection");
const nodemailer = require("nodemailer");

const {MongoClient} = require('mongodb');
const uri = process.env.MONGO_DB;

/*    Description: Get a Product Item
      Method: GET                     */
router.get('/getItem', function (req, res, next) {
    (async function () {
        let itemId = req.query.itemId;
        let collectionId = req.query.collectionId;
        const item = await getItem(itemId, collectionId);
        res.json(item);
    })();
});

/*    Description: Get a Product Item
      Method: GET                     */
    //   router.get('/sendEmail', function (req, res, next) {
    //     (async function () {
            
    //         // Generate test SMTP service account from ethereal.email
    //         // Only needed if you don't have a real mail account for testing
    //         let testAccount = await nodemailer.createTestAccount();

    //         // create reusable transporter object using the default SMTP transport
    //         let transporter = nodemailer.createTransport({
    //             host: "smtp.ethereal.email",
    //             port: 587,
    //             secure: false, // true for 465, false for other ports
    //             auth: {
    //             user: testAccount.user, // generated ethereal user
    //             pass: testAccount.pass, // generated ethereal password
    //             },
    //         });

    //         // send mail with defined transport object
    //         let info = await transporter.sendMail({
    //             from: '"Mailer" <info@bajalabruja.org>', // sender address
    //             to: "pksubscriber@gmail.com, pksubscriber@gmail.com", // list of receivers
    //             subject: "Hello", // Subject line
    //             text: "Hello world?", // plain text body
    //             html: "<b>Hello world?</b>", // html body
    //         });

    //         console.log("Message sent: %s", info.messageId);
    //          // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    //         // Preview only available when sending through an Ethereal account
    //         console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    //         // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    //     })();
    // }); 

// router.get('/sendEmail', function (req, res, next) {
//     (async function () {
//         // Use at least Nodemailer v4.1.0
// const nodemailer = require('nodemailer');

// // Generate SMTP service account from ethereal.email
// nodemailer.createTestAccount((err, account) => {
//             if (err) {
//                 console.error('Failed to create a testing account. ' + err.message);
//                 return process.exit(1);
//             }

//             console.log('Credentials obtained, sending message...');

//             // Create a SMTP transporter object
//             // let transporter = nodemailer.createTransport({
//             //     host: account.smtp.host,
//             //     port: account.smtp.port,
//             //     secure: account.smtp.secure,
//             //     auth: {
//             //         user: account.user,
//             //         pass: account.pass
//             //     }
//             // });

//             let transporter = nodemailer.createTransport({
//                 host: "mail.bajalabruja.org",
//                 port: 2079,
//                 secure: true,
//                 auth: {
//                   user: "billing@bajalabruja.org",
//                   pass: "Samnmax11!"
//                 },
//                 tls: {
//                     rejectUnauthorized: false
//                 }
//              });

//             // Message object
//             let message = {
//                 from: 'Sender Name <billing@bajalabruja.org>',
//                 to: 'Recipient <pksubscriber@gmail.com>',
//                 subject: 'Nodemailer is unicode friendly',
//                 text: 'Hello to myself!',
//                 html: '<p><b>Hello</b> to myself!</p>'
//             };

//             transporter.sendMail(message, (err, info) => {
//                 if (err) {
//                     console.log('Error occurred. ' + err.message);
//                     return process.exit(1);
//                 }

//                 console.log('Message sent: %s', info.messageId);
//                 // Preview only available when sending through an Ethereal account
//                 console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
//             });
//         });
//     })();
// }); 


// /*    Description: Delete Product Thumb
//       Method: PUT                     */
// router.put('/deleteThumb/:collection/:productId/:thumb', function (req, res, next) {
//     (async function () {
//         let itemId = req.params.productId;
//         let collectionId = req.params.collection;
//         let thumb = req.params.thumb;
//         const item = await deleteThumb(itemId, collectionId, thumb);
//         console.log(item);
//         res.send(item);
//     })();
// });



/*      Description: Update item in collection
        Method: PUT                           */
router.put('/updateProduct/:collection/:id', function (req, res) {
    (async function () {
        console.log("Update Product");
        let itemId = parseInt(req.params.id);
        let collectionId = parseInt(req.params.collection);
        await updateItem(itemId, collectionId, req.body.productName, req.body.description, req.body.price, req.body.size, req.body.measurements, req.body.parcel);
        req.flash('info', 'Item # ' + itemId + 'has been updated');
        res.redirect('/item_admin?itemId=' + itemId + "&collectionId=" + collectionId);
    })();
});



module.exports = router;

// -*-*-*-*-*-*-*-*-*-*-*-*-* DB FUNCTIONS -*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*//

async function getItem(productId, collectionId) {
    const client = new MongoClient(uri, {useUnifiedTopology: true});
    try {
        await client.connect();
        var result = {};
        const cursor = await client.db("shop").collection("bruja").findOne({"collectionId": parseInt(collectionId)});
        result.collectioName = cursor.collectionName;
        let item = cursor.products.find(product => product.productId == productId);
        result.item = item;
        return result;
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

async function updateItem(productId, collectionId, productName, description, price, size, measurements, ausPostParcel) {
    var query = {
        collectionId: collectionId
    };
    Collection.findOne(query, function (err, result) {
        if (err) {
            console.log(err);
        }
        var p = result.products.filter(function (item) {
            return item.productId === productId;
        }).pop();
        p.productName = productName;
        p.description = description;
        p.price = price;
        p.size = size;
        p.measurements = measurements;
        p.ausPostParcel = ausPostParcel;
        result.save();
    });
}



