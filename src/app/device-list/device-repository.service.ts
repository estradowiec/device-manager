import { Injectable } from '@angular/core';
import { Headers, RequestOptions, Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { FilterResult } from './filter-result';
import { FilterDescriptor } from './filter-descriptor';
import { DeviceRepositorySettings } from './device-repository-settings';



export interface IDeviceRepository {
  filter(filter: FilterDescriptor): Observable<FilterResult>;
}

@Injectable()
export class DeviceRepositoryService implements IDeviceRepository {
  private readonly devicesUrl = '/api/devices/find';
  private readonly requestOptions = new RequestOptions({ headers: new Headers({ 'Content-Type': 'application/json' }) });

  constructor(private settings: DeviceRepositorySettings, private http: Http) { }

  filter(filter: FilterDescriptor): Observable<FilterResult> {

    return this.http.post(this.settings.uri + this.devicesUrl, filter, this.requestOptions)
      .map(this.extractData)
      .catch(this.handleError);
  }

  private extractData(res: Response) {
    let body = res.json();
    return body.data || {};
  }

  private handleError(error: Response | any) {
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg);
  }
}
