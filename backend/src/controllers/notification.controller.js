import Notification from '../models/Notification.model.js';
import { sendResponse } from '../utils/helpers.js';

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.findByUserId(req.user.id);
    return sendResponse(res, 200, true, 'Lấy thông báo thành công', notifications);
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.markRead(req.params.id, req.user.id);
    return sendResponse(res, 200, true, 'Đã đọc thông báo', notification);
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsRead = async (req, res, next) => {
  try {
    await Notification.markAllRead(req.user.id);
    return sendResponse(res, 200, true, 'Đã đọc tất cả thông báo');
  } catch (error) {
    next(error);
  }
};
