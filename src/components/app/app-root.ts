import { Component, ComponentFactoryResolver, ElementRef, Inject, OnInit, OpaqueToken, Renderer, ViewChild, ViewContainerRef } from '@angular/core';

import { App } from './app';
import { Config } from '../../config/config';
import { Ion } from '../ion';
import { Platform } from '../../platform/platform';
export const AppRootToken = new OpaqueToken('USERROOT');

@Component({
  selector: 'ion-app',
  template: 
    '<div>ffffffffffffffffffffffff</div>'
})
export class IonicApp extends Ion implements OnInit {
  private _stopScrollPlugin: any;
  private _tmr: number;

  @ViewChild('viewport', {read: ViewContainerRef}) _viewport: ViewContainerRef;

  constructor(
    @Inject(AppRootToken) private _userCmp: any,
    private _cfr: ComponentFactoryResolver,
    elementRef: ElementRef,
    renderer: Renderer,
    config: Config,
    private _plt: Platform,
    app: App
  ) {
    super(config, elementRef, renderer);

    // app._appRoot = this;
    // this._stopScrollPlugin = (<any>window)['IonicStopScroll'];
  }

  ngOnInit() {
    const factory = this._cfr.resolveComponentFactory(this._userCmp);
    const componentRef = this._viewport.createComponent(factory);
    this._renderer.setElementClass(componentRef.location.nativeElement, 'app-root', true);
  }
}

