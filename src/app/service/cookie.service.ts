import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CookieService {

  private tokenKey: string = "dm";
  private refreshTokenKey: string = "rf";

  constructor() {}  

  public getCookie(name: string) {
    let ca: Array<string> = document.cookie.split(';');
    let caLen: number = ca.length;
    let cookieName = `${name}=`;
    let c: string;

    for (let i: number = 0; i < caLen; i += 1) {
      c = ca[i].replace(/^\s+/g, '');
      if (c.indexOf(cookieName) == 0) {
        return c.substring(cookieName.length, c.length);
      }
    }
    return '';
  }
  
  /**
   * Expires default 1 day
   * If params.session is set and true expires is not added
   * If params.path is not set or value is not greater than 0 its default value will be root "/"
   * Secure flag can be activated only with https implemented
   * Examples of usage:
   * {service instance}.setCookie({name:'token',value:'abcd12345', session:true }); <- This cookie will not expire
   * {service instance}.setCookie({name:'userName',value:'John Doe', secure:true }); <- If page is not https then secure will not apply
   * {service instance}.setCookie({name:'niceCar', value:'red', expireDays:10 }); <- For all this examples if path is not provided default will be root
   */
  public setCookie(params: any) {
    let d: Date = new Date();
    d.setTime(
      d.getTime() +
        (params.expireDays ? params.expireDays : 1) * 24 * 60 * 60 * 1000
    );
    document.cookie =
      (params.name ? params.name : '') +
      '=' +
      (params.value ? params.value : '') +
      ';' +
      (params.session && params.session == true
        ? ''
        : 'expires=' + d.toUTCString() + ';') +
      'path=' +
      (params.path && params.path.length > 0 ? params.path : '/') +
      ';' +
      (location.protocol === 'https:' && params.secure && params.secure == true
        ? 'secure'
        : '');
  }

  public deleteCookie(cookieName: string) {
    this.setCookie({ name: cookieName, value: '', expireDays: -1 });
  }

  // Access token
  public setToken(token: string){
    this.setCookie({
      name: this.tokenKey,
      value: token
    });
  }

  public getToken(){
    return this.getCookie(this.tokenKey);
  }

  public deleteToken(){
    this.deleteCookie(this.tokenKey);
  }

  // Refresh token
  public setRefreshToken(refreshToken: string){
    this.setCookie({
      name: this.refreshTokenKey,
      value: refreshToken
    });
  }

  public getRefreshToken(){
    return this.getCookie(this.refreshTokenKey);
  }

  public deleteRefreshToken(){
    this.deleteCookie(this.refreshTokenKey);
  }
}
