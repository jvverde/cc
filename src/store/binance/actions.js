import axios from 'axios'
import { apiv3 } from 'src/config'

export function loadPairs ({ commit }) {
  return new Promise((resolve, reject) => {
    axios.get(`${apiv3}/ticker/24hr`)
      .then(answer => {
        commit('addPairs', answer.data)
        resolve(answer.data)
      })
      .catch(err => {
        console.warn('Error on get api', err)
        reject(err)
      })
  })
}
