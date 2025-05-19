import { HttpService } from "@nestjs/axios";
import { HttpException, Injectable } from "@nestjs/common";
import { AxiosResponse } from "axios";
import { lastValueFrom, Observable } from 'rxjs';

@Injectable()
export class HttpClientService {
  constructor(private readonly httpService: HttpService) {}

  private async handleRequest<T>(obs$: Observable<AxiosResponse<T>>) {
    try {
      const response = await lastValueFrom(obs$);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw new HttpException('Internal server error', 500);
    }
  }

  async get<T>(url: string, config?: any): Promise<T> {
    return this.handleRequest(this.httpService.get<T>(url, config));
  }

  async post<T>(url: string, data: any, config?: any): Promise<T> {
    return this.handleRequest(this.httpService.post<T>(url, data, config));
  }

  async put<T>(url: string, data: any, config?: any): Promise<T> {
    return this.handleRequest(this.httpService.put<T>(url, data, config));
  }

  async patch<T>(url: string, data: any, config?: any): Promise<T> {
    return this.handleRequest(this.httpService.patch<T>(url, data, config));
  }

  async delete<T>(url: string, config?: any): Promise<T> {
    return this.handleRequest(this.httpService.delete<T>(url, config));
  }
}