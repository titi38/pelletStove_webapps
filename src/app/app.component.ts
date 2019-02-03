import {Component, OnDestroy, OnInit} from '@angular/core';
import { interval } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'pellet';
  today: number = Date.now();
  dateSubscription: any;

  ngOnInit() {
    const timerEvent = interval( 30000 );
    this.dateSubscription = timerEvent.subscribe(
      (value) => { // RECEPTION DE DONNEES
        this.today = Date.now();
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
}
