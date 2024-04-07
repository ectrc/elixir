/// <reference types="vite/client" />

interface ResponseOrError<T> {
  success: boolean;
  data: T;
}
