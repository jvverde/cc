import { allTicker24h } from 'src/api/rest/Binance.api'

export function loadPairs ({ commit }) {
  return new Promise((resolve, reject) => {
    allTicker24h()
      .then(answer => {
        commit('resetPairs')
        commit('addPairs', answer)
        resolve(answer)
      })
      .catch(err => {
        console.warn('Error on get api', err)
        reject(err)
      })
  })
}
