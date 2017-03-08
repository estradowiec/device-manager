import { Injectable } from '@angular/core';
import { Headers, RequestOptions, Http, Response } from '@angular/http';
import { Observable } from 'rxjs';

export class MeasurementsRepositorySettings {
    uri: string;
}

export class Point {
    value : number;
    timestamp? : Date;
}

export class QueryDescriptor {
    deviceId : string;
    dateFrom? : Date;
    dateTo? : Date;
    order?: OrderType;
    limit?: number;
}

export enum OrderType {
    Ascending,
    Descending
}

export class QueryResult {
    name : string;
    points : Array<Point>;
}

export interface IMeasurementsRepository {
    getMeasurements(queries: Array<QueryDescriptor>): Observable<Array<QueryResult>>;
}

@Injectable()
export class MeasurementsRepository implements IMeasurementsRepository {
    private readonly measurementsUrl = '/api/measurements/query';
    private readonly requestOptions = new RequestOptions({ headers: new Headers({ 'Content-Type': 'application/json' }) });

    constructor(private settings: MeasurementsRepositorySettings, private http: Http) { }

    getMeasurements(queries: Array<QueryDescriptor>): Observable<Array<QueryResult>> {
        
        return this.http.post(this.settings.uri + this.measurementsUrl, queries, this.requestOptions)
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