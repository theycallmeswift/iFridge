;(function ($, window, undefined) {
  'use strict';

  var $doc = $(document)
    ,  Modernizr = window.Modernizr
    , chart
    , timeout;

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
data: [{y: 500,
          color: '#6631bd'},{y:0, color: '#BD8368'},{y:0,color:'#D2E58B'},{y:0,color:'#24ACBD'},{y:0,color:'#85B6C4'}],
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

    socket.on('locked', function(id) {
      $('#' + id).attr('src', '/images/red_beer.svg');
    });

    socket.on('insert', function (id, type) {
      console.log(arguments);
      var image = "<img id='"+id+"' style='left: 450px' src='images/"+type+".svg' />";
      shelf.append(image);
      var item = $('#' + id);
      item.animate({
        left: '-=450'
      }, 500, 'swing');
      item.click(function(event) {
        event.preventDefault();
        socket.emit('lock', id);
      });
    });

    socket.on('remove', function (id, type) {
      var image = $("#"+id);
      image.fadeOut("slow", function() {
        image.remove()
      });
      var musicHTML = '';
      var music = $("#music");
      if (type == 'champagne') {
        musicHTML = '<embed autoplay="true" height="0" width="0" src="http://jonsplanet.com/getiton.mp3" />';
      }
      else if (type == 'chocolate') {
        musicHTML = '<iframe width="0" height="0" src="http://www.youtube.com/embed/k9B_6PH4dhU?autoplay=1&start=22" frameborder="0" allowfullscreen></iframe>';
      }
      else if (type == 'pretzel') {
        musicHTML = '<iframe width="0" height="0" src="http://www.youtube.com/embed/pVlr4g5-r18?autoplay=1&start=13" frameborder="0" allowfullscreen></iframe>';
      }
      clearTimeout(timeout);
      music.html(musicHTML);
      if(type !== 'champagne') {
        timeout = setTimeout(function(){ 
          music.html('');
        }, 10000 );
      }
    });
    socket.on('nutrition', function (data) {
      var calories = data.calories
        , fat = data.fat
        , carbs = data.carbs
        , protein = data.protein
        , sodium = data.sodium
        , champagne = data.champagne;

      calories = calories + 500;
      var fatdude = $("#fatdude");
      var fatmsg = $("#fatmsg");
           chart.series[0].setData([{y: calories, color: '#6631bd'},{y:fat, color: '#BD8368'},{y:carbs,color:'#D2E58B'},{y:protein,color:'#24ACBD'},{y:sodium,color:'#85B6C4'}]);

      if (champagne == true) {
        fatdude.attr('src','images/drunk.svg');
        fatmsg.html('Time to get CRUNKED!');
      }
      else if (calories < 800) {
        fatdude.attr('src','images/skinny.svg');
        fatmsg.html('You look hungry...');
      }
      else if (calories >= 800 && calories < 1200) {
        fatdude.attr('src', 'images/man.svg');
        fatmsg.html('Looking good!');
      }
      else {
        fatdude.attr('src', 'images/obese.svg');
        fatmsg.html('Time to get back to the gym.');
      }

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
      var alerttitle = $("#alerttitle");
      var music = $("#music");
      alert.html('<div class="four columns"><img src="images/'+type+'.svg" /></div><div class="eight columns"><p>Someone is trying to jack your '+title+'!</p></div>');
      alerttitle.fadeIn('slow');
      alert.fadeIn('slow');
      setTimeout(function(){ 
        alerttitle.fadeOut('slow');
        alert.fadeOut("slow"); 
      }, 5000 );
      clearTimeout(timeout);
      music.html('<iframe width="0" height="0" src="http://www.youtube.com/embed/KgmO32IdwuE?autoplay=1&start=1" frameborder="0" allowfullscreen></iframe>');
      timeout = setTimeout(function(){ 
        music.html('');
      }, 10000 );
    });
  });
})(jQuery, this);
