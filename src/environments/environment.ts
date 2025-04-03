const baseHost = 'localhost';
const basePort = '8080';

export const environment = {
    baseUrl: `http://${baseHost}:${basePort}`, // Thay đổi URL backend của bạn
    baseWebSocket: `ws://${baseHost}:${basePort}/ws`
  };
  