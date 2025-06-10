const baseHost = 'localhost';
const basePort = '8080';

export const environment = {
    baseUrl: `http://${baseHost}:${basePort}`, // Thay đổi URL backend của bạn
    baseWebSocket: `ws://${baseHost}:${basePort}/ws`,
  };
  
export const OAuthConfig = {
  clientId: "1066090673631-ofq4q6b6fodcffa7bo6rra10sqpu4v52.apps.googleusercontent.com",
  redirectUri: `http://localhost:4200/social/register`,
  authUri: "https://accounts.google.com/o/oauth2/auth",
};
