import { OpaqueToken } from '@angular/core';

import { Platform } from '../platform/platform';
import { isObject, isArray} from '../util/util';

export class Config {
  private _c: any = {};
  private _s: any = {};
  private _modes: any = {};
  private _trns: any = {};

  plt: Platform;

  init(config: any, plt: Platform) {
    this._s = config && isObject(config) && !isArray(config) ? config : {};
    this.plt = plt;
  }
}


export function setupConfig(userConfig: any, plt: Platform) : Config {
  const config = new Config();
  config.init(userConfig, plt);

  const win: any = plt.win();
  win['Ionic'] = win['Ionic'] || {};
  win['Ionic']['config'] = config;

  return config;
}


export const ConfigToken = new OpaqueToken('USERCONFIG');