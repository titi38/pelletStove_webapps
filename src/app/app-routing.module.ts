import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MonitorComponent } from './monitor/monitor.component';
import { ConfigComponent } from './config/config.component';
import { OldstyleComponent } from './oldstyle/oldstyle.component';
import { ErrorNavComponent } from './error-nav/error-nav.component';


const routes: Routes = [
  {path : 'monitor', component: MonitorComponent},
  {path : 'config', component: ConfigComponent},
  {path : 'oldstyle', component: OldstyleComponent},
  {path : '', redirectTo: 'monitor', pathMatch: 'full'},
  {path : '**', component: ErrorNavComponent}
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
