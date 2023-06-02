const fs = require('fs');

const createError = require('../utils/create-error');
const { Post, User, Like } = require('../models');
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

    const newPost = await Post.create(value);
    const post = await Post.findOne({
      where: { id: newPost.id },
      include: User
    });

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
      include: [
        {
          model: User
        },
        {
          model: Like,
          include: User
        }
      ]
    });

    res.status(200).json({ posts });
  } catch (err) {
    next(err);
  }
};

exports.toggleLike = async (req, res, next) => {
  try {
    const existLike = await Like.findOne({
      where: {
        userId: req.user.id,
        postId: req.params.postId
      }
    });

    if (existLike) {
      // await Like.destroy({
      //   where: {
      //     userId: req.user.id,
      //     postId: req.params.postId
      //   }
      // });
      await existLike.destroy();
    } else {
      await Like.create({ userId: req.user.id, postId: req.params.postId });
    }

    res.status(201).json({ message: 'success' });
  } catch (err) {
    next(err);
  }
};
