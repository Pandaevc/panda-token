/**
 * 密钥管理系统
 * 用于管理电子烟密钥
 */

const keys = new Map(); // key -> { deviceId, day, used, createdAt }

// 生成密钥
function generateKey(deviceId, day) {
  const crypto = require('crypto');
  const random = crypto.randomBytes(32).toString('hex');
  const key = '0x' + random;
  
  keys.set(key, {
    deviceId,
    day,
    used: false,
    createdAt: new Date().toISOString()
  });
  
  return key;
}

// 批量生成
function generateKeysForDevice(deviceId, count = 30) {
  const deviceKeys = [];
  for (let i = 0; i < count; i++) {
    deviceKeys.push(generateKey(deviceId, i + 1));
  }
  return deviceKeys;
}

// 标记使用
function markUsed(key) {
  const keyInfo = keys.get(key);
  if (keyInfo) {
    keyInfo.used = true;
    keys.set(key, keyInfo);
    return true;
  }
  return false;
}

// 检查是否有效
function isValid(key) {
  const keyInfo = keys.get(key);
  return keyInfo && !keyInfo.used;
}

// 导出
module.exports = { generateKey, generateKeysForDevice, markUsed, isValid, keys };
