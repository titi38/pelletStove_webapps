import { Component, OnInit } from '@angular/core';
import { GoogleChartComponent} from 'angular-google-charts';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {

  charts: Array<{
    title: string,
    type: string,
    data: Array<Array<string | number | {}>>,
    roles: Array<{ type: string, role: string, index?: number }>,
    columnNames?: Array<string>,
    options?: {}
  }> = [];

  ngOnInit() {

    this.charts.push (
      {
        title: 'Last 48h',
        type: 'LineChart',
        /*columnNames: [{type: 'date', 'hour'}, { type: 'number', 'Degrees' }],*/
        columnNames: [ 'hour', 'Degrees', 'Humidity', 'RunningMode' ],
        roles: [/*
          { type: 'date', role: 'interval' },
          { type: 'number', role: 'interval' } ,
          { type: 'string', role: 'annotation' },
          { type: 'string', role: 'annotationText' },
          { type: 'boolean', role: 'certainty' }*/
        ],
        data: [
          [new Date(2014, 10, 15, 5, 30), 11.6, 80,1 ],
          [new Date(2014, 10, 15, 6, 45), 10, 70,2 ],
          [new Date(2014, 10, 15, 7, 4), 9, 80,3 ],
          [new Date(2014, 10, 15, 7, 30), 10, 56,6],
          [new Date(2014, 10, 15, 8, 30), 15, 80,3]
        ],
        options: {
          hAxis: {
            format: 'HH:mm',  /* dd/MM */
             } ,
          series: {
            0: {targetAxisIndex: 0, color: 'red' },
            1: {targetAxisIndex: 1, color: 'blue'},
            2: {targetAxisIndex: 2, color: 'orange'}
          },
          vAxes: {
            // Adds titles to each axis.
            0: { title: 'Temp in °C', gridlines : { color: 'LightRed' }, textStyle: {fontSize: 12, color: 'red' }, titleTextStyle: {color: 'red' } },
            1: { title: 'Humidity in %', gridlines : { color: 'LightBlue' }, textStyle: {fontSize: 12, color: 'blue' }, titleTextStyle: {color: 'blue' } },
            2: { viewWindow: { min: 0, max: 6}, textPosition: 'in', gridlines : { color: '#FFD580' }, textStyle: {fontSize: 12, color: 'orange' } }
          },
          width: 950, height: 400,
      }});
/*
  this.charts.push(
                    {
                      title: 'Running',
                      type: 'ColumnChart',
                      columnNames: [ 'hour', 'power'],
                      roles: [],
                      data: [
                        [new Date(2014, 10, 15, 5, 30), 1 ],
                        [new Date(2014, 10, 15, 6, 45), 0 ],
                        [new Date(2014, 10, 15, 7, 4), 2 ],
                        [new Date(2014, 10, 15, 7, 30), 2 ],
                        [new Date(2014, 10, 15, 8, 30), 4 ]
                      ],
                      options: { hAxis: {format: 'dd/MM HH:mm'} , width: 950 }
                    } );

*/
  }

  constructor() {

  }

}
