import { Listener, Stream } from 'xstream';

export interface DataSourceAction {
  success: boolean;
  reason?: string;
}

export abstract class DataSource<T> {
  abstract createdAt: Date = new Date();
  abstract hasMemory: boolean;
  abstract resume: () => DataSourceAction;
  abstract pause: () => DataSourceAction;
  abstract addListener: (listener: Listener<T>) => DataSourceAction;
  abstract removeListener: (listener: Listener<T>) => DataSourceAction;
  abstract removeAllListeners: () => DataSourceAction;
}
