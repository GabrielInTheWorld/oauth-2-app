import axios, { AxiosError } from 'axios';

import { HttpHandler, HttpHeaders, HttpMethod } from '../interfaces/http-handler';
import { Logger } from './logger';

export interface HttpData {
  [key: string]: any;
}

type AxiosResponseType = 'arraybuffer' | 'blob' | 'document' | 'json' | 'text' | 'stream' | undefined;

export class HttpService implements HttpHandler {
  public static readonly DEFAULT_HEADERS: HttpHeaders = {
    accept: 'application/json',
    'Content-Type': 'application/json'
  };

  public async get(url: string, data?: any, headers?: HttpHeaders, responseType?: AxiosResponseType): Promise<any> {
    return this.send(url, HttpMethod.GET, headers, data, responseType);
  }
  public async post(url: string, data?: any, headers?: HttpHeaders): Promise<any> {
    return this.send(url, HttpMethod.POST, data, headers);
  }
  public async delete(url: string, data?: any, headers?: HttpHeaders): Promise<any> {
    return this.send(url, HttpMethod.DELETE, data, headers);
  }

  private async send<T>(
    url: string,
    method: HttpMethod,
    data?: HttpData,
    headers: HttpHeaders = {},
    responseType: AxiosResponseType = 'json'
  ): Promise<T> {
    Logger.debug(`Sending a request: ${method} ${url} ${JSON.stringify(data)} ${JSON.stringify(headers)}`);
    return (await axios({ url, method, data, headers, responseType })
      .then(response => response.data)
      .catch(reason => this.handleError(reason, url, method, data, headers, responseType))) as any;
  }

  private handleError(
    error: AxiosError,
    url: string,
    method: HttpMethod,
    data?: HttpData,
    headers?: HttpHeaders,
    responseType?: AxiosResponseType
  ): void {
    Logger.error('HTTP-error occurred: ', error.message);
    Logger.error(`Error is occurred while sending the following information: ${method} ${url} ${responseType}`);
    Logger.error(`Request contains the following data ${JSON.stringify(data)} and headers ${JSON.stringify(headers)}`);
    throw new Error(error.message);
  }
}
