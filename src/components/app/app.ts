import { EventEmitter, Injectable, Optional } from '@angular/core';
import { Title, DOCUMENT } from '@angular/platform-browser';

import { IonicApp } from './app-root';

@Injectable()
export class App {
  private _distTime: number = 0;
  private _scrollTime: number = 0;
  private _title: string = '';
  private _titleSrv: Title = new Title(DOCUMENT);
  
  private _disableScrollAssist: boolean;

  _appRoot: IonicApp;

  
}