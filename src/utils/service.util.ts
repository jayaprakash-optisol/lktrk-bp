/**
 * A factory function that creates a singleton service
 * @param ServiceClass The service class constructor
 * @returns A singleton instance of the service
 */
export const createSingletonService = <T>(ServiceClass: new () => T): T => {
  const instance = new ServiceClass();
  return instance;
};

/**
 * A decorator that makes a class a singleton
 * @returns A singleton decorator
 */
export function Singleton<T extends { new (...args: any[]): object }>(constructor: T): T {
  let instance: object | null = null;

  // Return new constructor
  const ExtendedClass = class extends constructor {
    constructor(...args: any[]) {
      if (instance) {
        return instance as InstanceType<T>;
      }

      super(...args);
      // Using 'instance' is allowed in the new ESLint configuration
      instance = this;
    }
  };

  return ExtendedClass as T;
}
