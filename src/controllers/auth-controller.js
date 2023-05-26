const { validateRegister } = require('../validators/auth-validator');
const userService = require('../services/user-service');
const createError = require('../utils/create-error');
const bcryptService = require('../services/bcrypt-service');
const tokenService = require('../services/token-service');

exports.register = async (req, res, next) => {
  try {
    const value = validateRegister(req.body);
    const isUserExist = await userService.checkEmailOrMobileExist(
      value.email || value.mobile
    );
    if (isUserExist) {
      createError('email address or mobile number already in use');
    }

    value.password = await bcryptService.hash(value.password);

    const user = await userService.createUser(value);

    const accessToken = tokenService.sign({ id: user.id });
    res.status(200).json({ accessToken });
  } catch (err) {
    next(err);
  }
};
