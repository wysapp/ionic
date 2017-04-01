import { EventEmitter, NgZone } from '@angular/core';

import { getCss, isTextInput } from '../util/dom';
import { QueryParams } from './query-params';

export class Platform {
  private _win: Window;
  private _doc: HTMLDocument;
  private _versions: {[name: string]: PlatformVersion} = {};
  private _dir: string;
  private _lang: string;
  private _ua: string;
  private _qp = new QueryParams();
  private _nPlt: string;
  private _readyPromise: Promise<any>;
  private _readyResolve: any;
  private _bbActions : BackButtonAction[] = [];
  private _registry: {[name: string]: PlatformConfig};
  private _default: string;
  private _pW = 0;
  private _pH = 0;
  private _lW = 0;
  private _lH = 0;
  private _isPortrait: boolean = null;
  private _uiEvtOpts = false;

  zone: NgZone;

  Css: {
    transform?: string;
    transition?: string;
    transitionDuration?: string;
    transitionDelay?: string;
    transitionTimingFn?: string;
    transitionStart?: string;
    transitionEnd?: string;
    transformOrigin?: string;
    animationDelay?: string;
  };

  _platforms: string[] = [];

  constructor() {
    this._readyPromise = new Promise(res => { this._readyResolve = res; });
  }

  setWindow(win: Window) {
    this._win = win;
  }

  win() {
    return this._win;
  }

  setDocument(doc: HTMLDocument) {
    this._doc = doc;
  }

  doc() {
    return this._doc;
  }

  setZone(zone: NgZone) {
    this.zone = zone;
  }

  setCssProps(docElement: HTMLElement) {
    this.Css = getCss(docElement);
  }


  is(platformName: string): boolean {
    return (this._platforms.indexOf(platformName) > -1);
  }


  platforms(): Array<string> {
    return this._platforms;
  }

  versions(): {[name: string]: PlatformVersion} {
    return this._versions;
  }


  version(): PlatformVersion {
    for (var platformName in this._versions) {
      if (this._versions[platformName]) {
        return this._versions[platformName];
      }
    }
    return {};
  }


  setDir(dir: string, updateDocument: boolean) {
    this._dir = (dir || '').toLowerCase();
    if (updateDocument !== false) {
      this._doc['documentElement'].setAttribute('dir', dir);
    }
  }

  dir() : string {
    return this._dir;
  }

  isRTL(): boolean {
    return (this._dir === 'rtl');
  }

  setLang(language: string, updateDocument: boolean) {
    this._lang = language;
    if (updateDocument !== false) {
      this._doc['documentElement'].setAttribute('lang', language);
    }
  }

  lang(): string {
    return this._lang;
  }


  exitApp() {}

  backButton: EventEmitter<Event> = new EventEmitter<Event>();

  pause: EventEmitter<Event> = new EventEmitter<Event>();

  resume: EventEmitter<Event> = new EventEmitter<Event>();

  resize: EventEmitter<Event> = new EventEmitter<Event>();

  setUserAgent(userAgent: string){
    this._ua = userAgent;
  }

  setQueryParams(url: string) {
    this._qp.parseUrl(url);
  }

  getQueryParam(key: string) {
    return this._qp.get(key);
  }

  url() {
    return this._win['location']['href'];
  }

  userAgent(): string {
    return this._ua || '';
  }


  setNavigatorPlatform(navigatorPlt: string) {
    this._nPlt = navigatorPlt;
  }

  navigatorPlatform(): string {
    return this._nPlt;
  }

  width(): number {
    this._calcDim();
    return this._isPortrait ? this._pW : this._lW;
  }

  height(): number {
    this._calcDim();
    return this._isPortrait ? this._pH : this._lH;
  }


  private _calcDim() {    
    // we're caching window dimensions so that
    // we're not forcing many layouts
    // if _isPortrait is null then that means
    // the dimensions needs to be looked up again
    // this also has to cover an edge case that only
    // happens on iOS 10 (not other versions of iOS)
    // where window.innerWidth is always bigger than
    // window.innerHeight when it is first measured,
    // even when the device is in portrait but
    // the second time it is measured it is correct.
    // Hopefully this check will not be needed in the future
    if (this._isPortrait === null || this._isPortrait === false && this._win['innerWidth'] < this._win['innerHeight']) {
      var win = this._win;

      var innerWidth = win['innerWidth'];
      var innerHeight = win['innerHeight'];

      if (win.screen.width > 0 && win.screen.height > 0) {
        if (innerWidth < innerHeight) {
          // the device is in portrait
          // we have to do fancier checking here
          // because of the virtual keyboard resizing
          // the window
          if (this._pW <= innerWidth) {
            console.debug('setting _isPortrait to true');
            this._isPortrait = true;
            this._pW = innerWidth;
          }

          if (this._pH <= innerHeight) {
            console.debug('setting _isPortrait to true');
            this._isPortrait = true;
            this._pH = innerHeight;
          }
        } else {
          // the device is in landscape
          if (this._lW !== innerWidth) {
            console.debug('setting _isPortrait to false');
            this._isPortrait = false;
            this._lW = innerWidth;
          }

          if (this._lH !== innerHeight) {
            console.debug('setting _isPortrait to false');
            this._isPortrait = false;
            this._lH = innerHeight;
          }
        }
      }
    }

  }


  timeout(callback: Function, timeout?: number): number {
    const win: any = this._win;
    return win['__zone_symbol__setTimeout'](callback, timeout);
  }

  registerListener(ele: any, eventName: string, callback: {(ev?: UIEvent): void}, opts: EventListenerOptions, unregisterListenersCollection?: Function[]): Function {
    const listenerOpts: any = this._uiEvtOpts ? {
      'capture': !!opts.capture,
      'passive': !!opts.passive,
    } : !!opts.capture;

    let unReg: Function;
    if (!opts.zone && ele['__zone_symbol__addEventListener']) {
      ele['__zone_symbol__addEventListener'](eventName, callback, listenerOpts);
      unReg = function unregisterListener() {
        ele['__zone_symbol__removeEventListener'](eventName, callback, listenerOpts);
      };
    } else {
      ele['addEventListener'](eventName, callback, listenerOpts);

      unReg = function unregisterListener() {
        ele['removeEventListener'](eventName, callback, listenerOpts);
      };
    }

    if (unregisterListenersCollection) {
      unregisterListenersCollection.push(unReg);
    }

    return unReg;
  }


  windowLoad(callback: Function) {
    const win = this._win;
    const doc = this._doc;
    let unreg: Function;

    if (doc.readyState === 'complete') {
      callback(win, doc);
    } else {
      unreg = this.registerListener(win, 'load', () => {
        unreg && unreg();
        callback(win, doc);
      }, { zone: false });
    }


  }

  getActiveElement() {
    return this._doc['activeElement'];
  }


  hasFocusedTextInput() {
    const ele = this.getActiveElement();
    if (isTextInput(ele)) {
      return (ele.parentElement.querySelector(':focus') === ele);
    }
    return false;
  }


  private _initEvents() {

    try {
      var opts = Object.defineProperty({}, 'passive', {
        get: () => {
          this._uiEvtOpts = true;
        }
      });
      this._win.addEventListener('optsTest', null, opts);
    } catch(e) {}

    this.timeout(() => {
      var timerId: any;
      this.registerListener(this._win, 'resize', () => {
        clearTimeout(timerId);

        timerId = setTimeout(() => {

          if (this.hasFocusedTextInput() === false) {
            this._isPortrait = null;
          }
          this.resize.emit();
        }, 200);
      }, {passive: true, zone: true});
    }, 2000);
  }


  setPlatformConfigs(platformConfigs: {[key: string]: PlatformConfig}) {
    this._registry = platformConfigs || {};
  }

  getPlatformConfig(platformName: string): PlatformConfig {
    return this._registry[platformName] || {};
  }


  setDefault(platformName: string) {
    this._default = platformName;
  }

  testQuery(queryValue: string, queryTestValue: string): boolean {
    const valueSplit = queryValue.toLowerCase().split(';');
    return valueSplit.indexOf(queryTestValue) > -1;
  }

  testNavigatorPlatform(navigatorPlatformExpress: string): boolean {
    const rgx = new RegExp(navigatorPlatformExpress, 'i');
    return rgx.test(this._nPlt);
  }


  matchUserAgentVersion(userAgentExpression: RegExp): any {
    if (this._ua && userAgentExpression) {
      const val = this._ua.match(userAgentExpression);
      if(val) {
        return {
          major: val[1],
          minor: val[2]
        };
      }
    }
  }

  testUserAgent(expression: string): boolean {
    if (this._ua) {
      return this._ua.indexOf(expression) >= 0;
    }
    return false;
  }


  isPlatformMatch(queryStringName: string, userAgentAtLesstHas?: string[], userAgentMustNoHave: string[] = []): boolean {
    const queryValue = this._qp.get('ionicplatform');
    if (queryValue){
      return this.testQuery(queryValue, queryStringName);
    }

    userAgentAtLesstHas = userAgentAtLesstHas || [queryStringName];

    const userAgent = this._ua.toLowerCase();

    for (var i = 0; i < userAgentAtLesstHas.length; i++) {
      if (userAgent.indexOf(userAgentAtLesstHas[i]) > -1) {
        for (var j = 0; j < userAgentMustNoHave.length; j++) {
          if (userAgent.indexOf(userAgentMustNoHave[j]) > -1) {
            return false;
          }
        }
        return true;
      }
    }
    return false;
  }


  init() {
    this._initEvents();
    
    let rootPlatformNode: PlatformNode;
    let enginePlatformNode: PlatformNode;

    let tmpPlt: PlatformNode;
    for (let platformName in this._registry) {
      tmpPlt = this.matchPlatform(platformName);
      if (tmpPlt) {
        if (tmpPlt.isEngine) {
          enginePlatformNode = tmpPlt;
        } else if (!rootPlatformNode || tmpPlt.depth > rootPlatformNode.depth) {
          rootPlatformNode = tmpPlt;
        }
      }
    }

    if (!rootPlatformNode) {
      rootPlatformNode = new PlatformNode(this._registry, this._default);
    }

    if (rootPlatformNode) {
      if (enginePlatformNode) {
        enginePlatformNode.child = rootPlatformNode;
        rootPlatformNode.parent = enginePlatformNode;
        rootPlatformNode = enginePlatformNode;
      }

      let platformNode = rootPlatformNode;
      while(platformNode) {
        insertSuperset(this._registry, platformNode);
        platformNode = platformNode.child;
      }

      platformNode = rootPlatformNode.parent;
      while(platformNode) {
        rootPlatformNode = platformNode;
        platformNode = platformNode.parent;
      }

      platformNode = rootPlatformNode;
      while(platformNode) {
        platformNode.initialize(this);

        if (platformNode.name === 'iphone' && this.navigatorPlatform() === 'iPad') {
          this._platforms.push('tablet');
          this._platforms.push('ipad');
          return;
        }

        this._platforms.push(platformNode.name);

        this._versions[platformNode.name] = platformNode.version(this);

        platformNode = platformNode.child;
      }
    }

    if (this._platforms.indexOf('mobile') > -1 && this._platforms.indexOf('cordova') === -1) {
      this._platforms.push('mobileweb');
    }
  }

  private matchPlatform(platformName: string): PlatformNode {
    let platformNode = new PlatformNode(this._registry, platformName);
    let rootNode = platformNode.getRoot(this);

    if (rootNode) {
      rootNode.depth = 0;
      let childPlatform = rootNode.child;
      while(childPlatform){
        rootNode.depth++;
        childPlatform = childPlatform.child;
      }
    }

    return rootNode;
  }

}


function insertSuperset(registry: any, platformNode: PlatformNode) {
  let supersetPlatformName = platformNode.superset();
  if (supersetPlatformName) {
    let supersetPlatform = new PlatformNode(registry, supersetPlatformName);
    supersetPlatform.parent = platformNode.parent;
    supersetPlatform.child = platformNode;
    if (supersetPlatform.parent) {
      supersetPlatform.parent.child = supersetPlatform;
    }
    platformNode.parent = supersetPlatform;
  }
}

class PlatformNode {
  private c: PlatformConfig;

  parent: PlatformNode;
  child: PlatformNode;
  name: string;
  isEngine: boolean;
  depth: number;

  constructor(public registry: {[name: string]: PlatformConfig}, platformName: string) {
    this.c = registry[platformName];
    this.name = platformName;
    this.isEngine = this.c.isEngine;
  }

  settings(): any {
    return this.c.settings || {};
  }

  superset(): any {
    return this.c.superset;
  }

  isMatch(p: Platform): boolean {
    return this.c.isMatch && this.c.isMatch(p) || false;
  }

  initialize(plt: Platform) {
    this.c.initialize && this.c.initialize(plt);
  }


  version(plt: Platform): PlatformVersion {
    if (this.c.versionParser) {
      const v = this.c.versionParser(plt);
      if (v) {
        const str = v.major + '.' + v.minor;
        return {
          str: str,
          num: parseFloat(str),
          major: parseInt(v.major, 10),
          minor: parseInt(v.minor, 10)
        };
      }
    }
  }

  getRoot(plt: Platform): PlatformNode {
    if (this.isMatch(plt)) {
      let parents = this.getSubsetParents(this.name);

      if (!parents.length) {
        return this;
      }

      let platformNode: PlatformNode =null;
      let rootPlatformNode: PlatformNode = null;

      for (let i = 0; i < parents.length; i++) {
        platformNode = new PlatformNode(this.registry, parents[i]);
        platformNode.child = this;

        rootPlatformNode = platformNode.getRoot(plt);
        if (rootPlatformNode) {
          this.parent = platformNode;
          return rootPlatformNode;
        }
      }
    }

    return null;
  }

  getSubsetParents(subsetPlatformName: string): string[] {
    const parentPlatformNames: string[] = [];
    let pltConfig: PlatformConfig = null;

    for(let platformName in this.registry) {
      pltConfig = this.registry[platformName];

      if (pltConfig.subsets && pltConfig.subsets.indexOf(subsetPlatformName) > -1) {
        parentPlatformNames.push(platformName);
      }
    }

    return parentPlatformNames;
  }
}


export interface PlatformConfig {
  isEngine?: boolean;
  initialize?: Function;
  isMatch?: Function;
  superset?: string;
  subsets?: string[];
  settings?: any;
  versionParser?: any;
}

export interface PlatformVersion {
  str?: string;
  num?: number;
  major?: number,
  minor?: number;
}


interface BackButtonAction {
  fn: Function;
  priority: number;
}

export interface EventListenerOptions {
  capture?: boolean;
  passive?: boolean;
  zone?: boolean;
}


export function setupPlatform(doc: HTMLDocument, platformConfigs: {[key: string]: PlatformConfig}, zone: NgZone): Platform {
  const plt = new Platform();
  plt.setDefault('core');
  plt.setPlatformConfigs(platformConfigs);
  plt.setZone(zone);

  const docElement = doc.documentElement;
  plt.setDocument(doc);
  plt.setDir(docElement.dir, false);
  plt.setLang(docElement.lang, false);

  plt.setCssProps(docElement);

  const win = doc.defaultView;
  plt.setWindow(win);
  plt.setNavigatorPlatform(win.navigator.platform);
  plt.setUserAgent(win.navigator.userAgent);

  plt.setQueryParams(win.location.href);

  plt.init();

  (<any>win)['Ionic'] = (<any>win)['Ionic'] || {};
  (<any>win)['Ionic']['platform'] = plt;

  console.log('price-ionic-platofrm', plt);

  return plt;
}