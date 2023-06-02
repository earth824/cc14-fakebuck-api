const fs = require('fs');

const createError = require('../utils/create-error');
const { Post } = require('../models');
const uploadService = require('../services/upload-service');

exports.createPost = async (req, res, next) => {
  try {
    if (!req.file && (!req.body.message || !req.body.message.trim())) {
      createError('message or image is required', 400);
    }

    const value = {
      userId: req.user.id
    };

    if (req.body.message && req.body.message.trim()) {
      value.message = req.body.message.trim();
    }

    if (req.file) {
      const result = await uploadService.upload(req.file.path);
      value.image = result.secure_url;
    }

    const post = await Post.create(value);
    res.status(201).json({ post });
  } catch (err) {
    next(err);
  } finally {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
  }
};
