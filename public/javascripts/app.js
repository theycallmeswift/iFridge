;(function ($, window, undefined) {
  'use strict';

  var $doc = $(document)
    ,  Modernizr = window.Modernizr
    , chart;

  $.fn.foundationAlerts ? $doc.foundationAlerts() : null;

  // Hide address bar on mobile devices
  if (Modernizr.touch) {
    $(window).load(function () {
      setTimeout(function () {
        window.scrollTo(0, 1);
      }, 0);
    });
  }

  $doc.ready(function() {
    chart = new Highcharts.Chart({
      chart: {
        renderTo: 'nutrition',
        type: 'column'
      },
      title: {
        text: null
      },
      xAxis: {
        categories: [
          'Calories',
          'Fat',
          'Carbs',
          'Protein',
          'Sodium'
        ],
        labels: {
          rotation: -45,
          align: 'right',
          style: {
            fontSize: '13px',
            fontFamily: 'Verdana, sans-serif'
          }
        }
      },
      yAxis: {
        min: 0,
        title: {
          text: null
        }
      },
      legend: {
        enabled: false
      },
      series: [{
        name: 'Amount',
        data: [{y: 216.4,
          color: 'black'},{y:40, color: 'green'},{y:30,color:'red'},{y:100,color:'yellow'},{y:50,color:'blue'}],
          dataLabels: {
          enabled: false,
          rotation: -90,
          color: '#FFFFFF',
          align: 'right',
          x: -3,
          y: 10,
          formatter: function() {
            return this.y;
          },
          style: {
            fontSize: '13px',
            fontFamily: 'Verdana, sans-serif'
          }
        }
      }]
    });
  });

})(jQuery, this);
