interface Config {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  forceDev?: boolean;
}

export function register(config?: Config): void;
export function unregister(): void;