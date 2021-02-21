import { ipcRenderer } from 'electron'

export const getCredentials = async (service) => {
  const credentials = ipcRenderer.sendSync('getCredentials', service) || []
  const result = {}
  credentials.forEach(e => {
    result[e.account] = e.password
  })
  return result
}
export const deleteCredentials = async (service) => {
  return ipcRenderer.sendSync('deleteCredentials', service)
}
export const setKey = async (service, key) => {
  return ipcRenderer.sendSync('setKey', service, key)
}
export const setSecret = async (service, secret) => {
  return ipcRenderer.sendSync('setSecret', service, secret)
}
export const setCredentials = async (service, key, secret) => {
  return ipcRenderer.sendSync('setCredentials', service, key, secret)
}
