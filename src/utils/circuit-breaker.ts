import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

interface Endpoints {
  failures: number;
  coolDownPeriod: number;
  circuit: string;
  nextTry: number;
}

interface CircuitBreakerOptions {
  failureThreshold?: number;
  coolDownPeriod?: number;
  requestTimeout?: number;
}

export default class CircuitBreaker {
  private states: { [key: string]: Endpoints };
  private readonly failureThreshold: number;
  private readonly coolDownPeriod: number;
  private readonly requestTimeout: number;

  constructor(options: CircuitBreakerOptions = {}) {
    this.states = {};
    this.failureThreshold = options.failureThreshold ?? 5;
    this.coolDownPeriod = options.coolDownPeriod ?? 10;
    this.requestTimeout = options.requestTimeout ?? 5;
  }

  async fire<T>(request: AxiosRequestConfig): Promise<T | false> {
    const endpoint = `${request.method}:${request.url}`;
    if (!this.onRequest(endpoint)) return false;

    request.timeout = this.requestTimeout * 1000;

    try {
      const response: AxiosResponse<T> = await axios<T>({
        ...request,
        timeout: request.timeout
      });

      this.onSuccess(endpoint);
      return response.data;
    } catch (error: any) {
      //   logMatrics("error", error.response ?? error, {
      //     name: "Circuit Breaker Module",
      //     path: request.url ?? "",
      //   });
      console.log(error?.message);
      this.onFailure(endpoint);
      return false;
    }
  }

  private onSuccess(endpoint: string) {
    this.initState(endpoint);
  }

  private onFailure(endpoint: string) {
    const state = this.states[endpoint];
    state.failures += 1;

    if (state.failures > this.failureThreshold) {
      state.circuit = 'OPEN';
      state.nextTry = Date.now() / 1000 + this.coolDownPeriod;
      console.log(`Alert! circuit for ${endpoint} is in state OPEN`);

      //   logMatrics("info", `Alert! circuit for ${endpoint} is in state OPEN`, {
      //     name: "Circuit Breaker Module",
      //     path: "",
      //   });
    }
  }

  private onRequest(endpoint: string): boolean {
    if (!this.states[endpoint]) this.initState(endpoint);

    const state = this.states[endpoint];
    if (state.circuit === 'CLOSED') return true;

    const now = Date.now() / 1000;
    if (state.nextTry <= now) {
      state.circuit = 'HALF';
      return true;
    }

    return false;
  }

  private initState(endpoint: string) {
    this.states[endpoint] = {
      failures: 0,
      coolDownPeriod: this.coolDownPeriod,
      circuit: 'CLOSED',
      nextTry: 0
    };
  }
}
