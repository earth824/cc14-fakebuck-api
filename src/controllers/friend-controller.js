const { Op } = require('sequelize');
const { User, Friend } = require('../models');
const createError = require('../utils/create-error');
const { STATUS_PENDING, STATUS_ACCEPTED } = require('../constants');

exports.addFriend = async (req, res, next) => {
  try {
    if (req.user.id === +req.params.receiverId) {
      createError('cannot request yourself', 400);
    }

    const existUser = await User.findOne({
      where: { id: req.params.receiverId }
    });

    if (!existUser) {
      createError('user does not exist', 400);
    }

    const existRelationship = await Friend.findOne({
      where: {
        [Op.or]: [
          { requesterId: req.user.id, receiverId: req.params.receiverId },
          { requesterId: req.params.receiverId, receiverId: req.user.id }
        ]
      }
    });

    if (existRelationship) {
      createError('user already has relationship');
    }

    await Friend.create({
      status: STATUS_PENDING,
      requesterId: req.user.id,
      receiverId: req.params.receiverId
    });

    res.status(200).json({ message: 'request has been sent' });
  } catch (err) {
    next(err);
  }
};

exports.confirmFriend = async (req, res, next) => {
  try {
    const existRelationship = await Friend.findOne({
      where: {
        status: STATUS_PENDING,
        requesterId: req.params.requesterId,
        receiverId: req.user.id
      }
    });

    if (!existRelationship) {
      createError('relationship does not exist', 400);
    }

    await Friend.update(
      { status: STATUS_ACCEPTED },
      { where: { id: existRelationship.id } }
    );

    res.status(200).json({ message: 'relationship has been confirmed' });
  } catch (err) {
    next(err);
  }
};

exports.cancelRequest = async (req, res, next) => {
  try {
    const existRelationship = await Friend.findOne({
      where: {
        status: STATUS_PENDING,
        requesterId: req.user.id,
        receiverId: req.params.receiverId
      }
    });

    if (!existRelationship) {
      createError('relationship does not exist', 400);
    }

    await Friend.destroy({ where: { id: existRelationship.id } });
    res.status(200).json({ message: 'cancel success' });
  } catch (err) {
    next(err);
  }
};

exports.unfriend = async (req, res, next) => {
  try {
    const existRelationship = await Friend.findOne({
      where: {
        status: STATUS_ACCEPTED,
        [Op.or]: [
          { requesterId: req.user.id, receiverId: req.params.friendId },
          { requesterId: req.params.friendId, receiverId: req.user.id }
        ]
      }
    });

    if (!existRelationship) {
      createError('relationship does not exist', 400);
    }

    await Friend.destroy({ where: { id: existRelationship.id } });
    res.status(200).json({ message: 'unfriend success' });
  } catch (err) {
    next(err);
  }
};

exports.rejectRequest = async (req, res, next) => {
  try {
    const existRelationship = await Friend.findOne({
      where: {
        status: STATUS_PENDING,
        requesterId: req.params.requesterId,
        receiverId: req.user.id
      }
    });

    if (!existRelationship) {
      createError('relationship does not exist', 400);
    }

    await Friend.destroy({ where: { id: existRelationship.id } });
    res.status(200).json({ message: 'reject success' });
  } catch (err) {
    next(err);
  }
};
