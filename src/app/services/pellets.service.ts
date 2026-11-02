import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class PelletService {
  private readonly apiUrl = '/dynamic';
  constructor(private httpClient: HttpClient) {}

  refreshInfo() {
    return this.httpClient.get<any>(`${this.apiUrl}/info.json`);
  }

  refreshStats() {
    return this.httpClient.get<{hour: number; quarter: number; stats: number[][]}>(
      `${this.apiUrl}/stats.json`, {params: {_: Date.now().toString()}}
    );
  }

  sendCommand(command: string) {
    // Keep the original raw query syntax expected by the Navajo backend.
    return this.httpClient.get<any>(`${this.apiUrl}/command.json?${command}`);
  }
}
