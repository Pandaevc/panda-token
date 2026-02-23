/**
 * 密钥生成系统
 * 用于电子烟生产时预生成密钥
 */

const crypto = require('crypto');

// 生成随机密钥
function generateKey() {
  const randomBytes = crypto.randomBytes(32);
  return '0x' + randomBytes.toString('hex');
}

// 生成多个密钥
function generateKeys(count) {
  const keys = [];
  for (let i = 0; i < count; i++) {
    keys.push(generateKey());
  }
  return keys;
}

// 转换为bytes32格式 (Solidity)
function toBytes32(hexKey) {
  // 移除0x前缀，取最后64位
  let key = hexKey.replace('0x', '');
  if (key.length > 64) key = key.slice(-64);
  return '0x' + key.padStart(64, '0');
}

// 示例: 为一台电子烟生成30个密钥
console.log('=== 密钥生成系统 ===\n');

console.log('为每台电子烟生成30个密钥:\n');

const deviceKeys = generateKeys(30);
deviceKeys.forEach((key, i) => {
  console.log(`第${i+1}天: ${toBytes32(key)}`);
});

console.log('\n总共30个密钥，每个可兑换100代币');
console.log('总计: 3000代币/台');

