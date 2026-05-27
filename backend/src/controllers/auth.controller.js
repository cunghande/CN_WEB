import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { generateToken } from '../config/jwt.js';
import User from '../models/User.model.js';
import { sendResponse } from '../utils/helpers.js';

const invalidLoginMessage = 'Email hoặc mật khẩu không chính xác';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

const redirectWithError = (res, message) => {
  const url = new URL(frontendUrl);
  url.searchParams.set('login', 'true');
  url.searchParams.set('social_error', message);
  return res.redirect(url.toString());
};

const redirectWithSession = (res, user) => {
  const token = generateToken({ id: user.id, email: user.email, role: user.role });
  const url = new URL(frontendUrl);
  url.searchParams.set('social_token', token);
  url.searchParams.set('social_user', encodeURIComponent(JSON.stringify(user)));
  return res.redirect(url.toString());
};

const makeSocialPassword = async () => {
  return bcrypt.hash(`social:${crypto.randomUUID()}`, 10);
};

const exchangeGoogleCode = async (code) => {
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback';
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    })
  });

  if (!tokenResponse.ok) throw new Error('Không thể xác thực Google');
  const tokens = await tokenResponse.json();
  const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` }
  });
  if (!profileResponse.ok) throw new Error('Không thể lấy hồ sơ Google');

  const profile = await profileResponse.json();
  if (!profile.email) throw new Error('Tài khoản Google không trả về email');
  return {
    email: profile.email,
    full_name: profile.name || profile.email,
    avatar_url: profile.picture || ''
  };
};

const exchangeFacebookCode = async (code) => {
  const redirectUri = process.env.FACEBOOK_REDIRECT_URI || 'http://localhost:5000/api/auth/facebook/callback';
  const tokenUrl = new URL('https://graph.facebook.com/oauth/access_token');
  tokenUrl.searchParams.set('client_id', process.env.FACEBOOK_APP_ID);
  tokenUrl.searchParams.set('client_secret', process.env.FACEBOOK_APP_SECRET);
  tokenUrl.searchParams.set('redirect_uri', redirectUri);
  tokenUrl.searchParams.set('code', code);

  const tokenResponse = await fetch(tokenUrl);
  if (!tokenResponse.ok) throw new Error('Không thể xác thực Facebook');
  const tokens = await tokenResponse.json();

  const profileUrl = new URL('https://graph.facebook.com/me');
  profileUrl.searchParams.set('fields', 'id,name,email,picture.type(large)');
  profileUrl.searchParams.set('access_token', tokens.access_token);

  const profileResponse = await fetch(profileUrl);
  if (!profileResponse.ok) throw new Error('Không thể lấy hồ sơ Facebook');
  const profile = await profileResponse.json();
  if (!profile.email) throw new Error('Facebook chưa cấp quyền email cho tài khoản này');

  return {
    email: profile.email,
    full_name: profile.name || profile.email,
    avatar_url: profile.picture?.data?.url || ''
  };
};

const signInSocialProfile = async (res, profile) => {
  const password = await makeSocialPassword();
  const user = await User.findOrCreateSocialUser({ ...profile, password });
  return redirectWithSession(res, user);
};

export const register = async (req, res, next) => {
  try {
    const { full_name, email, password } = req.body;
    if (!full_name || !email || !password) {
      return sendResponse(res, 400, false, 'Vui lòng điền đầy đủ thông tin');
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return sendResponse(res, 400, false, 'Email này đã được đăng ký');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await User.create({ full_name, email, password: hashedPassword, role: 'customer' });
    const token = generateToken({ id: userId, email, role: 'customer' });
    const user = await User.findById(userId);

    return sendResponse(res, 201, true, 'Đăng ký tài khoản thành công', { user, token });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendResponse(res, 400, false, 'Vui lòng nhập email và mật khẩu');
    }

    const user = await User.findByEmail(email);
    if (!user) return sendResponse(res, 401, false, invalidLoginMessage);

    let isMatch = false;
    if (user.password?.startsWith('$2a$') || user.password?.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = password === user.password;
    }

    if (!isMatch) return sendResponse(res, 401, false, invalidLoginMessage);

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    const safeUser = await User.findById(user.id);

    return sendResponse(res, 200, true, 'Đăng nhập thành công', { user: safeUser, token });
  } catch (error) {
    next(error);
  }
};

export const startGoogleLogin = (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return redirectWithError(res, 'Chưa cấu hình Google OAuth trong backend/.env');
  }

  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback';
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid email profile');
  url.searchParams.set('prompt', 'select_account');
  return res.redirect(url.toString());
};

export const handleGoogleCallback = async (req, res) => {
  try {
    if (!req.query.code) return redirectWithError(res, 'Google không trả về mã xác thực');
    const profile = await exchangeGoogleCode(req.query.code);
    return signInSocialProfile(res, profile);
  } catch (error) {
    return redirectWithError(res, error.message || 'Đăng nhập Google thất bại');
  }
};

export const startFacebookLogin = (req, res) => {
  if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
    return redirectWithError(res, 'Chưa cấu hình Facebook OAuth trong backend/.env');
  }

  const redirectUri = process.env.FACEBOOK_REDIRECT_URI || 'http://localhost:5000/api/auth/facebook/callback';
  const url = new URL('https://www.facebook.com/dialog/oauth');
  url.searchParams.set('client_id', process.env.FACEBOOK_APP_ID);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('scope', 'email,public_profile');
  return res.redirect(url.toString());
};

export const handleFacebookCallback = async (req, res) => {
  try {
    if (!req.query.code) return redirectWithError(res, 'Facebook không trả về mã xác thực');
    const profile = await exchangeFacebookCode(req.query.code);
    return signInSocialProfile(res, profile);
  } catch (error) {
    return redirectWithError(res, error.message || 'Đăng nhập Facebook thất bại');
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return sendResponse(res, 404, false, 'Không tìm thấy tài khoản');
    return sendResponse(res, 200, true, 'Lấy thông tin tài khoản thành công', user);
  } catch (error) {
    next(error);
  }
};

export const getPublicProfile = async (req, res, next) => {
  try {
    const user = await User.findPublicById(req.params.id);
    if (!user) return sendResponse(res, 404, false, 'Không tìm thấy người dùng');
    return sendResponse(res, 200, true, 'Lấy hồ sơ công khai thành công', user);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { full_name, phone, gender, theme_preference } = req.body;
    if (!full_name) return sendResponse(res, 400, false, 'Vui lòng nhập họ tên');

    const user = await User.updateProfile(req.user.id, { full_name, phone, gender, theme_preference });
    return sendResponse(res, 200, true, 'Cập nhật hồ sơ thành công', user);
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password || new_password.length < 6) {
      return sendResponse(res, 400, false, 'Mật khẩu mới phải có ít nhất 6 ký tự');
    }

    const user = await User.findByEmail(req.user.email);
    const isMatch = user.password?.startsWith('$2')
      ? await bcrypt.compare(current_password, user.password)
      : current_password === user.password;

    if (!isMatch) return sendResponse(res, 400, false, 'Mật khẩu hiện tại không đúng');

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await User.updatePassword(req.user.id, hashedPassword);
    return sendResponse(res, 200, true, 'Đổi mật khẩu thành công');
  } catch (error) {
    next(error);
  }
};

export const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) return sendResponse(res, 400, false, 'Vui lòng chọn ảnh đại diện');

    const user = await User.updateAvatar(req.user.id, `/uploads/${req.file.filename}`);
    return sendResponse(res, 200, true, 'Cập nhật ảnh đại diện thành công', user);
  } catch (error) {
    next(error);
  }
};
