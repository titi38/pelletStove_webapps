import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { LegacyGoogleChartComponent } from './statistics/legacy-google-chart.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LogsComponent } from './logs/logs.component';
import { PlanningComponent } from './planning/planning.component';
import { MonitorComponent } from './monitor/monitor.component';

import { PelletService} from './services/pellets.service';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ConfigComponent } from './config/config.component';
import { OldstyleComponent } from './oldstyle/oldstyle.component';
import { ErrorNavComponent } from './error-nav/error-nav.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { ShutdownComponent } from './shutdown/shutdown.component';



@NgModule({
  declarations: [
    AppComponent,
    MonitorComponent,
    PlanningComponent,
    LogsComponent,
    ConfigComponent,
    OldstyleComponent,
    ErrorNavComponent,
    StatisticsComponent,
    ShutdownComponent,
    LegacyGoogleChartComponent
  ],
  imports: [BrowserModule, AppRoutingModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  providers: [ PelletService ],
  bootstrap: [AppComponent]
})
export class AppModule { }

