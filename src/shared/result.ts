export type IpcError = {
  type: string
  message: string
}

export type IpcOk<T> = { kind: 'success'; data: T }
export const IpcOk = {
  of: <T>(data: T): IpcOk<T> => ({
    kind: 'success',
    data
  })
}

export type IpcErr<E = IpcError> = { kind: 'error'; error: E }
export const IpcErr = {
  of: <E = IpcError>(error: E): IpcErr<E> => ({
    kind: 'error',
    error
  })
}

export type IpcResult<T, E = IpcError> = IpcOk<T> | IpcErr<E>
