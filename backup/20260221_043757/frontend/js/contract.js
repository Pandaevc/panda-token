/**
 * 合约交互
 */

const CONTRACTS = {
  pandaToken: '41e79cc9de0911d1080cf3d72b1f4a594f72600138',
  pandaExchange: '410a9593fac129d4b63ea7fab3a24d4725be846fc3'
};

// 兑换密钥
async function redeemKey(key) {
  // tronweb调用
  // contract.redeemKey(key).send()
}

// 交换代币
async function swapToUSDT(amount) {
  // contract.swapToUSDT(amount).send()
}

// 添加密钥 (Admin)
async function addKeys(keys, value) {
  // contract.addKeys(keys, value).send()
}

console.log('合约地址:', CONTRACTS);
