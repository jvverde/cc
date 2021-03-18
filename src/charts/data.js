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
          legend: false,
          'z-index': 5,
          colors: ['blue', 'cyan', 'Orchid', 'Pink', 'IndianRed', 'salmon', 'DarkSalmon', 'LightSalmon']
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
