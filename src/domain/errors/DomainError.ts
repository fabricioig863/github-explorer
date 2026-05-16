type ErrorWithCapture = ErrorConstructor & {
  captureStackTrace?: (target: object, constructor?: Function) => void;
};

export abstract class DomainError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    const ErrorCtor = Error as ErrorWithCapture;
    if (typeof ErrorCtor.captureStackTrace === 'function') {
      ErrorCtor.captureStackTrace(this, this.constructor);
    }
  }
}
