import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { MomentModule } from 'ngx-moment';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { HttpClientModule } from '@angular/common/http';
import { FineDurationPipe } from './pipes/fine-duration.pipe';
import { HeaderComponent } from './components/header/header.component';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { AppRoutingModule } from './app-routing.module';
import { HomeResolver } from './resolvers/home-resolver';
import { FooterComponent } from './components/footer/footer.component';
import { DurationComponent } from './components/duration/duration.component';
import { SunriseComponent } from './components/sunrise/sunrise.component';
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    FineDurationPipe,
    HeaderComponent,
    FooterComponent,
    DurationComponent,
    SunriseComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule.withServerTransition({ appId: 'solar2' }),
    AppRoutingModule,
    MomentModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    FontAwesomeModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(library: FaIconLibrary) {
    library.addIconPacks(fas);
  }
}
