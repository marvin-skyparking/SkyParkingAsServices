const { parentPort, workerData } = require('worker_threads');
const CryptoJS = require('crypto-js');

const { action, payload, secret } = workerData;

const encryptAES = (data, secret) => {
  const ciphertext = CryptoJS.AES.encrypt(data, secret).toString();
  return ciphertext;
}

const decryptAES = (cipher, key) => {
  const bytes = CryptoJS.AES.decrypt(cipher, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};

try {
  let result = "";

  if (action === 'encrypt') {
    result = encryptAES(payload, secret);
  } else if (action === 'decrypt') {
    result = decryptAES(payload, secret);
  }

  if (parentPort) {
    parentPort.postMessage({ result });
  }
} catch (error) {
  if (parentPort) {
    parentPort.postMessage({ error: error.message });
  }
}
