const { validateRegister } = require('../validators/auth-validator');

exports.register = async (req, res, next) => {
  try {
    // 1.validate
    const { value, error } = validateRegister(req.body);
    if (error) {
      res.status(400).json({ message: error.details[0].message });
    }
    // 2.hash password
    // 3.insert to users table
    // 4.sign token and sent response
  } catch (err) {
    next(err);
  }
};
