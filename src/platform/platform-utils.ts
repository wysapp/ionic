import { Platform } from './platform';

export function isCordova(plt: Platform) : boolean {
  const win: any = plt.win();
  return !!(win['cordova'] || win['PhoneGap'] || win['phonegap']);
}

export function isIos(plt: Platform): boolean {
  return plt.testNavigatorPlatform('iphone|ipad|ipod');
}

export function isSafari(plt: Platform): boolean {
  return plt.testUserAgent('Safari');
}

export function isWKWebView(plt: Platform) : boolean {
  return isIos(plt) && !!(<any>plt.win())['webkit'];
}

export function isIosUIWebView(plt: Platform): boolean {
  return isIos(plt) && !isWKWebView(plt) && !isSafari(plt);
}