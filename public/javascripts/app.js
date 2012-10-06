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
  $doc.ready(function() {
    var shelf = $("#emptyshelf");
    var socket = io.connect('/');
    socket.on('insert', function (id, type) {
      image = "<img id='"+id+"' src='images/"+type+".svg' />";
      image.appendTo(shelf).fadeIn("slow");
    });
    socket.on('remove', function (id, type) {
      image = $("#"+id);
      image.fadeOut("slow");
      var musicHTML = '';
      var music = $("#music");
      if (type == 'champagne') {
        musicHTML = '<embed autoplay="true" height="0" width="0" src="http://jonsplanet.com/getiton.mp3" />';
      }
      else if (type == 'chocolate') {
        musicHTML = '<iframe width="0" height="0" src="http://www.youtube.com/embed/k9B_6PH4dhU?autoplay=1&start=22" frameborder="0" allowfullscreen></iframe>';
      }
      else if (type == 'soda') {
        musicHTML = '<iframe width="0" height="0" src="http://www.youtube.com/embed/Q8H5263jCGg?autoplay=1&start=1" frameborder="0" allowfullscreen></iframe>';
      }
      else if (type == 'pretzel') {
        musicHTML = '<iframe width="0" height="0" src="http://www.youtube.com/embed/pVlr4g5-r18?autoplay=1&start=13" frameborder="0" allowfullscreen></iframe>';
      }
      music.html(musicHTML);
      setTimeout(function(){ 
        music.html('');
      }, 10000 );
    });
    socket.on('nutrition', function (calories,fat,carbs,protein,sodium) {
      chart.series[0].setData([{y: calories, color: 'black'},{y:fat, color: 'green'},{y:carbs,color:'red'},{y:protein,color:'yellow'},{y:sodium,color:'blue'}]);

    });
    socket.on('expired', function(title, type) {
      var alert = $("#alert");
      alert.html('<div class="four columns"><img src="images/'+type+'.svg" /></div><div class="eight columns"><p>Oh snap, your '+title+' is expired!</p></div>');
      alert.fadeIn('slow');
      setTimeout(function(){ 
        alert.fadeOut("slow"); 
      }, 5000 );
    });
    socket.on('protected', function(title, type) {
      var alert = $("#alert");
      var music = $("#music");
      alert.html('<div class="four columns"><img src="images/'+type+'.svg" /></div><div class="eight columns"><p>Someone is trying to jack your '+title+'!</p></div>');
      alert.fadeIn('slow');
      setTimeout(function(){ 
        alert.fadeOut("slow"); 
      }, 5000 );
      music.html('<iframe width="0" height="0" src="http://www.youtube.com/embed/KgmO32IdwuE?autoplay=1&start=1" frameborder="0" allowfullscreen></iframe>');
      setTimeout(function(){ 
        music.html('');
      }, 10000 );
    });
  });
})(jQuery, this);
