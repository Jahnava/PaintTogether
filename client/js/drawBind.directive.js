var app = angular.module("drawTogether.drawing", []);

app.directive("drawing", function(){
  return {
    restrict: "A",
    scope: true,
    link: function(scope, element){
      var offset, x, y;
      var ctx = element[0].getContext('2d');
      ctx.fillStyle = "solid";
      ctx.strokeStyle = "#ECD018";
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.strokeStyle = 'rgb(0,0,0)'

      var drawing = false;

      function draw(x, y) {
        ctx.lineTo(x, y);
        return ctx.stroke();
      };

      element.bind('mousedown', function(e) {
        ctx.beginPath()
        drawing = true;
        return ctx.moveTo(x, y);
      })

      element.bind('mouseup', function(e) {
        drawing = false;
        return ctx.closePath();
      })

      element.bind('mousemove', function(e) {
        if (drawing) {
          // offset = $(this).offset();
          // e.offsetX = e.layerX - offset.left;
          // e.offsetY = e.layerY - offset.top;
          x = e.offsetX;
          y = e.offsetY;
          draw(x, y);
          // socket.emit('drawClick', {
          //   x: x,
          //   y: y,
          // });
        }
      });

      // // the last coordinates before the current move
      // var centerX;
      // var centerY;
      
      // element.bind('mousedown', function(event){
      //   centerX = event.offsetX;
      //   centerY = event.offsetY;
      //   // begins new line
      //   ctx.beginPath();
      //   drawing = true;
      // });

      // element.bind('mousemove', function(event){
      //   if(drawing){
      //     // get current mouse position
      //     currentX = event.offsetX;
      //     currentY = event.offsetY;
          
      //     draw(centerX, centerY, currentX, currentY);
      //   }
        
      // });

      // element.bind('mouseup', function(event){
      //   // stop drawing
      //   drawing = false;
      // });
        
      // // canvas reset
      // function reset(){
      //  element[0].width = element[0].width; 
      // }
      
      // function draw(startX, startY, currentX, currentY){
      //   var sizeX = currentX - startX;
      //   var sizeY = currentY - startY;
        
      //   ctx.rect(startX, startY, sizeX, sizeY);
      //   ctx.lineWidth = 3;
      //   // color
      //   ctx.strokeStyle = '#fff';
      //   // draw it
      //   ctx.stroke();
      // }
    }
  };
});