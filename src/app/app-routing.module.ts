import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MonitorComponent } from './monitor/monitor.component';
import { ConfigComponent } from './config/config.component';
import { OldstyleComponent } from './oldstyle/oldstyle.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { ShutdownComponent } from './shutdown/shutdown.component';
import { ErrorNavComponent } from './error-nav/error-nav.component';


const routes: Routes = [
  {path : 'monitor', component: MonitorComponent},
  {path : 'oldstyle', component: OldstyleComponent},
  {path : 'stats', component: StatisticsComponent},
  {path : 'config', component: ConfigComponent},
  {path : 'shutdown', component: ShutdownComponent},
  {path : '', redirectTo: 'monitor', pathMatch: 'full'},
  {path : '**', component: ErrorNavComponent}
]

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
