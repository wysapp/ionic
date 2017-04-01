import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule } from '../../../../src';

import { AppComponent } from './app.component';


@NgModule({
  declarations: [
    IonicApp
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(IonicApp)
  ],
  bootstrap: [ IonicApp]
})
export class AppModule {}