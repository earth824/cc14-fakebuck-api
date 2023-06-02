const fs = require('fs');

const createError = require('../utils/create-error');
const { Post, User } = require('../models');
const uploadService = require('../services/upload-service');
const friendService = require('../services/friend-service');

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

exports.getAllPostIncludeFriend = async (req, res, next) => {
  try {
    // 1 , [2, 3, 4, 5, 6]
    // SELECT * FROM posts WHERE userId = 1 OR userId = 2 OR userId= 3
    // SELECT * FROM posts WHERE userId IN (1, 2, 3)

    const friendsId = await friendService.getFriendsIdByUserId(req.user.id);
    const meIncludeFriendsId = [req.user.id, ...friendsId];
    const posts = await Post.findAll({
      where: { userId: meIncludeFriendsId },
      order: [['createdAt', 'DESC']],
      include: {
        model: User
      }
    });

    res.status(200).json({ posts });
  } catch (err) {
    next(err);
  }
};
