const express = require('express');
const multer = require('multer');
const controller = require('../controllers/predict.controller');
// configure multer
const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, 'images');
  },
  filename: (_req, _file, callback) => {
    callback(null, 'test-image.jpg');
  },
});
const imageFileFilter = (_req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
    return callback(new Error('You can upload only image files'), false);
  }
  callback(null, true);
};
const upload = multer({ storage, fileFilter: imageFileFilter });
const router = express.Router();
router
  .route('/cherry')
  .post(upload.single('file'), (_req, res, _next) =>
    controller.makePredictions(res, 'cherry')
  );
router
  .route('/peach')
  .post(upload.single('file'), (_req, res, _next) =>
    controller.makePredictions(res, 'peach')
  );
router
  .route('/pepper')
  .post(upload.single('file'), (_req, res, _next) =>
    controller.makePredictions(res, 'pepper')
  );
module.exports = router;
