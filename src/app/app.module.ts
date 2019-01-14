import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import {MomentModule} from 'ngx-moment';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import {HttpClientModule} from '@angular/common/http';
import { FineDurationPipe } from './pipes/fine-duration.pipe';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    FineDurationPipe
  ],
  imports: [
    HttpClientModule,
    BrowserModule.withServerTransition({appId: 'solar2'}),
    MomentModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
