const fs = require('fs');
const uploadService = require('../services/upload-service');
const createError = require('../utils/create-error');
const { User } = require('../models');
const friendService = require('../services/friend-service');

exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.files.profileImage && !req.files.coverImage) {
      createError('profile image or cover image is required');
    }

    const updateValue = {};
    if (req.files.profileImage) {
      const result = await uploadService.upload(req.files.profileImage[0].path);
      updateValue.profileImage = result.secure_url;
    }
    if (req.files.coverImage) {
      const result = await uploadService.upload(req.files.coverImage[0].path);
      updateValue.coverImage = result.secure_url;
    }

    await User.update(updateValue, { where: { id: req.user.id } });
    res.status(200).json(updateValue);
  } catch (err) {
    next(err);
  } finally {
    if (req.files.profileImage) {
      fs.unlinkSync(req.files.profileImage[0].path);
    }
    if (req.files.coverImage) {
      fs.unlinkSync(req.files.coverImage[0].path);
    }
  }
};

exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { id: req.params.id },
      attributes: { exclude: ['password', 'createdAt', 'updatedAt'] }
    });

    const friends = await friendService.getFriendsByUserId(req.params.id);
    const statusWithAuthenticatedUser =
      await friendService.getStatusWithTargetUserByUserId(
        req.user.id,
        req.params.id
      );

    await res.status(200).json({ user, friends, statusWithAuthenticatedUser });
  } catch (err) {
    next(err);
  }
};
