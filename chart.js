/* eslint-disable no-unused-vars */
var plotCams = function (dataInput) {
  /* eslint-enable no-unused-vars */

  // var allData = dataInput
  // console.log(allData)
  var data = []
  var rowHeight = 20
  var margin = {left: 212, right: 5, top: 5, bottom: 25}

  var svgWidth
  var chartWidth

  var chartHeight
  var svgHeight

  var maxHighValue
  var svg
  var xScale
  var xAxis
  var yScale
  var yAxis
  var xAxisElement
  var chart
  var bars
  var defs
  var textLabels

  var toolTip = d3.select('#toolTipDiv')

  var colorMap = function (color) {
    var map = {
      'blue': '#0093d8',
      'dark blue': '#1c42c0',
      'light blue': '#0093d8',

      'gray': '#bcbdc0',
      'grey': '#bcbdc0',
      'silver': '#bcbdc0',

      'purple': '#9a72b1',
      'light purple': '#ac7eb4',

      'green': '#76bc61',

      'orange': '#ef9747',
      'red': '#ee3e34',
      'maroon': '#592f36',

      'yellow': '#ffdb01',
      'gold': '#ffdb01',

      'black': '#000000'
    }

    var colors = []

    _.forEach(color.toLowerCase().split('/'), function (color) {
      colors.push(map[color])
      if (!map[color]) {
        console.log('Unknown Color: ' + color)
      }
    })

    return colors
  }

  function create (selectedData) {
    data = selectedData

    svgWidth = $('#svgDiv').width()
    chartWidth = svgWidth - margin.left - margin.right

    chartHeight = data.length * rowHeight
    svgHeight = chartHeight + margin.top + margin.bottom

    d3.selectAll('.svgContainer svg').remove()
    if (data.length < 1) {
      return
    }

    maxHighValue = _.maxBy(data, function (d) { return d['high'] })['high']

    xScale = d3.scaleLinear()
      .range([0, chartWidth])
      .domain([0, maxHighValue])
    xAxis = d3.axisBottom(xScale)
      .tickSize(-chartHeight, 0, 0)

    yScale = d3.scaleBand()
      .padding(0.075)
      .range([0, chartHeight])
      .domain(data.map(function (d) { return d['fullname'] }))
    yAxis = d3.axisLeft(yScale)

    svg = d3.select('.svgContainer')
      .append('svg')
      .attr('height', svgHeight)
      .attr('width', svgWidth)

    // defs for doing gradients
    defs = svg.append('defs')

    chart = svg.append('g')
      .attr('height', chartHeight)
      .attr('width', chartWidth)
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

    xAxisElement = chart.append('g')
      .attr('class', 'xaxis')
      .attr('transform', 'translate(0,' + chartHeight + ')')
      .call(xAxis)

    chart.append('g')
      .attr('class', 'yaxis')
      .call(yAxis)

    bars = chart.selectAll('.bar')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'bargs')
      .attr('transform', function (d) { return 'translate(0,' + yScale(d['fullname']) + ')' })

    bars.append('rect')
      .attr('class', 'bar')
      .style('fill', function (d) {
        var colors = colorMap(d['color'])

        if (colors.length === 1) {
          return colors[0]
        } else if (colors.length === 2) {
          var id = 'grad-' + Math.random().toString(36).substr(2, 16)
          var linGrad = defs.append('linearGradient')
            .attr('id', id)
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '100%')
            .attr('y2', '0%')
          linGrad.append('stop')
              .attr('offset', '0%')
              .attr('stop-color', colors[0])
          linGrad.append('stop')
              .attr('offset', '100%')
              .attr('stop-color', colors[1])
          return 'url(#' + id + ')'
        } else {
          return undefined
        }
      })
      .attr('x', function (d) { return xScale(d['low']) })
      .transition()
      .duration(300)
      .delay(function (d, i) {
        return i * 5
      })
      .attr('width', function (d) { return xScale(d['high'] - d['low']) })
      .attr('y', function (d) { return 0 })
      .attr('height', yScale.bandwidth())
      .attr('rx', 4)
      .attr('ry', 4)

    textLabels = bars.append('text')
      .text(function (d) { return d['weight'] })
      .attr('alignment-baseline', 'middle')
      .attr('y', function (d) { return yScale.bandwidth() / 2 })
    updateXaxis()

    bars.on('mousemove', function (d) {
      toolTip.style('opacity', 0.9)
        .style('left', d3.event.pageX + 10 + 'px')
        .style('top', d3.event.pageY - 25 + 'px')
        .style('display', 'inline-block')
        .html(d['fullname'] + '<br>' +
             'Range: ' + d['low'] + '-' + d['high'] + ' mm (' + d['range'].toFixed(2) + ' mm)<br>' +
             'Weight: ' + d.weight + ' g')
    })
    bars.on('mouseout', function (d) {
      toolTip.style('display', 'none')
    })
  }

  function updateXaxis () {
    textLabels.each(function (d) {
      var textLength = this.getComputedTextLength()
      var barWidth = xScale(d['high']) - xScale(d['low'])
      if (textLength + 3 > barWidth && xScale(d['high']) < maxHighValue / 2) {
        d3.select(this).attr('class', 'displayValue displayValueOutside')
          .attr('text-anchor', 'start')
          .attr('x', xScale(d['high']) + 3)
      } else if (textLength + 3 > barWidth) {
        d3.select(this).attr('class', 'displayValue displayValueOutside')
          .attr('text-anchor', 'end')
          .attr('x', xScale(d['low']) - 3)
      } else {
        d3.select(this).attr('class', 'displayValue')
          .attr('text-anchor', 'middle')
          .attr('x', xScale(d['high'] + d['low']) / 2)
      }
    })
  }

  function update () {
    if (data.length < 1) {
      return
    }
    svgWidth = d3.max([$('#svgDiv').width(), 2 * (margin.left + margin.right)])
    chartWidth = svgWidth - margin.left - margin.right
    svg.attr('width', svgWidth)
    chart.attr('width', chartWidth)
    xScale.range([0, chartWidth])
    xAxisElement.call(xAxis)
    bars.selectAll('.bar')
      .attr('x', function (d) { return xScale(d['low']) })
      .attr('width', function (d) { return xScale(d['high'] - d['low']) })
    updateXaxis()
  }

  function sort () {
    if (data.length < 1) {
      return
    }
    var sortOrder = $('#sortOrder label.active > input').val()
    var sortByInput = $('#sortBy label.active > input')
    var sortBy = sortByInput.val()
    var decDigits = sortByInput.attr('decDigits')
    var sortFunction
    // console.log(sortOrder, sortBy, decDigits)

    if (sortOrder === 'sortAscending') {
      sortFunction = function (a, b) { return (a[sortBy] < b[sortBy]) ? -1 : (a[sortBy] > b[sortBy]) ? 1 : ((a['high'] < b['high']) ? -1 : (a['high'] > b['high']) ? 1 : 0) }
    } else {
      sortFunction = function (a, b) { return (a[sortBy] > b[sortBy]) ? -1 : (a[sortBy] < b[sortBy]) ? 1 : ((a['high'] > b['high']) ? -1 : (a['high'] < b['high']) ? 1 : 0) }
    }

    var sorted = data.sort(sortFunction)

    yScale.domain(sorted.map(function (d) { return d['fullname'] }))

    chart.selectAll('.bargs').sort(sortFunction)

    yScale.domain(sorted.map(function (d) { return d['fullname'] }))

    // console.log(data.length)
    var transition = chart.transition()
      .duration(50 * Math.sqrt(data.length))
      .on('end', update)
    var delay = function (d, i) { return i * 20 / Math.sqrt(data.length) }

    transition.selectAll('.bargs')
      .ease(d3.easeCubic)
      .delay(delay)
      .attr('transform', function (d) { return 'translate(0,' + yScale(d['fullname']) + ')' })

    transition.select('.yaxis')
      .call(yAxis)
      .selectAll('g')
      .ease(d3.easeCubic)
      .delay(delay)

    if (sortBy !== 'makemodel') {
      transition.selectAll('.displayValue')
        .text(function (d) { return d[sortBy].toFixed(decDigits) })
        .delay(delay)
    }
  }

  return {
    create: create,
    update: update,
    sort: sort
  }
}
