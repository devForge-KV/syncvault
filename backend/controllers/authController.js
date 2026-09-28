const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const createToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role = 'client', companyName } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email, and password are required',
      });
    }

    if (!['agency', 'client'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role,
      companyName,
    });

    return res.status(201).json({
      user: user.toObject({ transform: (_, returnedUser) => {
        delete returnedUser.password;
        return returnedUser;
      } }),
      token: createToken(user._id.toString()),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    return next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    const passwordMatches = user && (await bcrypt.compare(password, user.password));

    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const founderEmail = (process.env.FOUNDER_EMAIL || '').trim().toLowerCase();
    if (founderEmail && user.email.trim().toLowerCase() === founderEmail) {
      user.role = 'superadmin';
      await user.save();
    }

    return res.json({
      token: createToken(user._id.toString()),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getMe = async (req, res) => {
  return res.json({ user: req.user });
};

const toSafeUser = (user) => {
  const safeUser = user.toObject();
  delete safeUser.password;
  delete safeUser.resetPasswordToken;
  delete safeUser.resetPasswordExpire;
  return safeUser;
};

const forgotPassword = async (req, res, next) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const user = email && await User.findOne({ email });

    if (!user) {
      return res.json({ message: 'If that email is registered, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    try {
      await sendEmail({
        to: user.email,
        subject: 'Reset your SyncVault password',
        html: `<div style="margin:0;background:#0f1210;padding:40px 20px;font-family:Arial,sans-serif;color:#f0f2ed"><div style="max-width:560px;margin:0 auto;border:1px solid #343a36;background:#191c1b;padding:36px"><div style="color:#d9f36a;font-size:13px;font-weight:700;letter-spacing:3px">SYNCVAULT</div><h1 style="color:#f0f2ed">Reset your password</h1><p style="color:#8c958d;line-height:1.7">This link expires in 15 minutes.</p><a href="${resetLink}" style="display:inline-block;background:#d9f36a;color:#111312;padding:14px 20px;text-decoration:none;font-weight:700">Reset Password</a></div></div>`,
      });
    } catch (emailError) {
      console.error('Password reset email failed:', emailError.message);
    }

    const response = { message: 'If that email is registered, a reset link has been sent.' };
    if (process.env.NODE_ENV !== 'production') response.resetLink = resetLink;
    return res.json(response);
  } catch (error) {
    return next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Reset link is invalid or has expired' });
    }

    if (!req.body.password || req.body.password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    user.password = await bcrypt.hash(req.body.password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return res.json({ token: createToken(user._id.toString()), user: toSafeUser(user) });
  } catch (error) {
    return next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, companyName, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (name !== undefined) user.name = name;
    if (companyName !== undefined) user.companyName = companyName;

    if (newPassword) {
      if (!currentPassword || !(await bcrypt.compare(currentPassword, user.password))) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      if (newPassword.length < 8) {
        return res.status(400).json({ message: 'New password must be at least 8 characters' });
      }
      user.password = await bcrypt.hash(newPassword, 12);
    }

    await user.save();
    return res.json({ user: toSafeUser(user), token: createToken(user._id.toString()) });
  } catch (error) {
    return next(error);
  }
};

const updatePlan = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(404).json({ message: 'Not found' });
    }

    if (req.user.role !== 'agency') {
      return res.status(403).json({ message: 'Only agency accounts can switch plans' });
    }

    const allowedPlans = ['starter', 'agency_pro', 'enterprise'];
    const requestedPlan = req.body?.plan;
    if (!allowedPlans.includes(requestedPlan)) {
      return res.status(400).json({ message: 'Invalid plan' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.plan = requestedPlan;
    await user.save();

    return res.json({ user: toSafeUser(user) });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  resetPassword,
  updateProfile,
  updatePlan,
};
