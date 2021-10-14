import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { GoogleChartsModule } from 'angular-google-charts';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MonitorComponent } from './monitor/monitor.component';

import { PelletService} from './services/pellets.service';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ConfigComponent } from './config/config.component';
import { OldstyleComponent } from './oldstyle/oldstyle.component';
import { ErrorNavComponent } from './error-nav/error-nav.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { ShutdownComponent } from './shutdown/shutdown.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  declarations: [
    AppComponent,
    MonitorComponent,
    ConfigComponent,
    OldstyleComponent,
    ErrorNavComponent,
    StatisticsComponent,
    ShutdownComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    GoogleChartsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgbModule
  ],
  providers: [ PelletService ],
  bootstrap: [AppComponent]
})
export class AppModule { }

