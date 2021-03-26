export default function dataTemplate () {
  return {
    chart: {
      type: 'Candles',
      indexBased: false,
      tf: '1s',
      data: []
    },
    onchart: [
      {
        name: 'Maximum',
        type: 'MAXIMUM',
        data: [],
        settings: {
          'z-index': 5
        }
      },
      {
        name: 'Split',
        type: 'Splitters',
        data: [],
        settings: {
          legend: false
        }
      },
      {
        name: 'MovingAverages',
        type: 'Splines',
        data: [],
        settings: {
          legend: true,
          'z-index': 5,
          lineWidths: [1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7],
          colors: ['orange', 'Chocolate', 'PeachPuff', 'Sienna', 'LemonChiffon', 'PaleGoldenrod', 'Moccasin', 'PapayaWhip']
        }
      },
      {
        name: 'ExponentialMovingAverages',
        type: 'Splines',
        data: [],
        onsettings (e) {
          console.log('Aqui', this)
        },
        settings: {
          legend: true,
          'z-index': 5,
          lineWidths: [1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7],
          colors: ['DodgerBlue', 'Cyan', 'CornflowerBlue', 'Aquamarine', 'RoyalBlue', 'Turquoise', 'LightCyan', 'PowderBlue']
        }
      },
      {
        name: 'Average',
        type: 'Spline',
        data: [],
        settings: {
          legend: false,
          'z-index': 5,
          color: 'yellow'
        }
      },
      {
        name: 'CostBuy',
        type: 'Segment',
        data: [],
        settings: {
          legend: false,
          'z-index': 10,
          color: 'lime'
        }
      },
      {
        name: 'CostSell',
        type: 'Segment',
        data: [],
        settings: {
          legend: false,
          'z-index': 10,
          color: 'Coral'
        }
      }
    ],
    offchart: [
      {
        name: 'Funds',
        type: 'Spline',
        data: [],
        settings: {
          legend: false,
          'z-index': 5,
          color: 'purple'
        }
      }
    ]
  }
}

const dataStore = {}

export function dataOf (symbol) {
  if (!dataStore[symbol]) {
    dataStore[symbol] = dataTemplate()
  }
  return dataStore[symbol]
}
