import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';



@Injectable()
export class PelletService {
  constructor (private httpClient: HttpClient) {

  }

  refreshInfo() {
    return this.httpClient.get<any[]>( /*'http://192.168.8.10:8080/info.json' */ 'http://localhost/pellets/info.json');
  }

  sendCommand(command: string) {
  return this.httpClient.get<any[]>( /*'http://192.168.8.10:8080/command.json?'+command */ 'http://localhost/pellets/command.json');
  }

  // getLcdMsg() {
  //  return this.httpClient.get<any[]>( /*'http://192.168.8.10:8080/command.json?getLcdMsg' */ 'http://localhost/pellets/getLcdMsg');
  // }
}
