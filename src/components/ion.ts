import { ElementRef, Renderer, Input } from '@angular/core';

import { Config } from '../config/config';

export class Ion {
  _config: Config;

  _elementRef: ElementRef;
  _renderer: Renderer;
  _color: string;
  _mode: string;
  _componentName: string;


  constructor(config: Config, elementRef: ElementRef, renderer: Renderer, componentName?: string) {
    this._config = config;
    this._elementRef = elementRef;
    this._renderer = renderer;
    this._componentName = componentName;
    
  }
}