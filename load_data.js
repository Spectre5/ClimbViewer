var data = []
var newGraph

// var publicSpreadsheetUrl = 'https://spreadsheets.google.com/spreadsheets/d/134lDX_ZJL0Jj4vZcV3msJaLIujyOJzg_9V389CpKXxU/pubhtml';
var publicSpreadsheetKey = '134lDX_ZJL0Jj4vZcV3msJaLIujyOJzg_9V389CpKXxU'

function init () {
  Tabletop.init({
    key: publicSpreadsheetKey,
    callback: showInfo,
    simpleSheet: true,
    parseNumbers: true,
    orderby: 'manufacturer',
    prettyColumnNames: false, // need to turn this off or else the second call wipes out what we do in the postProcess function
    postProcess: function (item) {
      // Add a new column
      if (item['weight'] === '') {
        item['weight'] = 0
      }
      item['makemodel'] = item['manufacturer'] + ' - ' + item['model']
      item['fullname'] = item['makemodel'] + ' - ' + item['size']
      item['range'] = item['high'] - item['low']
      item['nondimweightrange'] = item['weight'] / item['range']
      item['nondimweightaverage'] = item['weight'] / (item['high'] + item['low'])
    }
  })
}

function showInfo (spreadsheetData, tabletop) {
  // alert('Successfully processed!')
  var uniqueTypes = _.uniqBy(spreadsheetData, 'makemodel')

  _.each(uniqueTypes, function (spreadsheetData) {
    var opt = document.createElement('option')
    opt.setAttribute('value', spreadsheetData.makemodel)
    opt.textContent = spreadsheetData.makemodel
    $('#camChecklistSelect').append(opt)
  })

  $('#camChecklistSelect').multiselect({
    buttonText: function (options, select) { return 'Cams' },
    onChange: buildDisplayData
  })

  data = spreadsheetData
  /* global plotCams */
  newGraph = plotCams(data)

  window.addEventListener('resize', newGraph.update)
  $('#sortOrder :input').change(newGraph.sort)
  $('#sortBy :input').change(newGraph.sort)
  // console.log(data);
}

function buildDisplayData (options, selected) {
  var selectedData = []

  $('#camChecklistSelect option:selected').filter(function () {
    var that = $(this)
    selectedData = selectedData.concat(_.filter(data, function (thisdata) {
      return that.val() === thisdata.makemodel
    }))
  })

  // console.log(selectedData)

  newGraph.create(selectedData)
  newGraph.sort()
}

$(document).ready(function () {
  init()
})
