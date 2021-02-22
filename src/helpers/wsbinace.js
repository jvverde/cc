import { ws as api } from 'src/config'
import WS from './websocks'

export function ticker (symbol, onmessage) {
  return new WS(`${api}/${symbol.toLowerCase()}@ticker`, { onmessage })
}
