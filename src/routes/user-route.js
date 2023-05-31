const express = require('express');

const upload = require('../middlewares/upload');
const authenticate = require('../middlewares/authenticate');
const userController = require('../controllers/user-controller');

const router = express.Router();

router.patch(
  '/image',
  authenticate,
  upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
  ]),
  userController.uploadImage
);
router.get('/:id/profile', authenticate, userController.getUserProfile);

module.exports = router;
