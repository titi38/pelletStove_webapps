import { FRONTEND_VERSION } from './version';
import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import { PelletService } from './services/pellets.service';
import { interval } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'pellet';
  readonly frontendVersion = FRONTEND_VERSION;
  today: number = Date.now();
  dateSubscription: any;

  constructor(private pelletService: PelletService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    const timerEvent = interval( 30000 );
    this.dateSubscription = timerEvent.subscribe(
      (value) => { // RECEPTION DE DONNEES
        this.today = Date.now();
        this.cdr.markForCheck();
      },
      (error) => { // ERREUR
        console.log ( 'Erreur: ' + error );
      },
      () => {
      }
    );
  }

  ngOnDestroy() {
    this.dateSubscription.unsubscribe();
  }

  onShutdown() {
    this.pelletService.sendCommand('shutdown').subscribe(
      (response) => {
        // this.info = response;
        console.log(response);
      },
      (error) => {
        console.log('Erreur !: ' + error);
      }
    );
  }

}

