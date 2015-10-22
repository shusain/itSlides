(function(){
  'use strict';

  /**
   * itSlides Module
   *
   * Description
   */

  angular.module('component-templates', []); //overridden by build process

  angular.module('itSlides', ['component-templates'])

    .directive('itSlider', function($document, $window){
      return {
        restrict:'E',
        require:'?ngModel',
        scope: {
          min:"=",
          max:"="
        },
        templateUrl:'component/templates/slider.svg',
        link:function(scope,iElem,iAttr,ngModel){

          // Defaults
          var selectedOpts ={
            min: 0,
            max: 100
          };

          if(!angular.isUndefined(scope.min)) {
            selectedOpts.min = scope.min;
          }
          if(!angular.isUndefined(scope.max)) {
            selectedOpts.max = scope.max;
          }

          var startX = 0;
          var thumbStartX = 0;

          var thumb = angular.element(iElem.children()[0]).find("g")[0];
          var track = angular.element(iElem.children()[0]).find("rect")[0];
          var label = angular.element(thumb).find("text")[0];
          var curPos = 0;



          track.addEventListener('click', function(event){
            var trackWidth = track.width.baseVal.value;
            var value = selectedOpts.min + selectedOpts.max*(event.clientX-30)/trackWidth
            setValue(value);
            scope.$evalAsync(read)
          });


          $document[0].body.addEventListener('mouseleave', function(event){
            if(event.target == $document[0].body){
              handleMouseUp();
            }
          });


          function handleMouseUp(){
            $document.unbind('mousemove touchmove', handleMouseMove);
            $document.unbind('mouseup touchend', handleMouseUp);
          }

          function handleMouseMove(event){
            var commonX = event.clientX || event.changedTouches[0].clientX;

            var newPos = thumbStartX+(commonX-startX);
            if(newPos<0)
              newPos = 0;

            var trackWidth = track.width.baseVal.value;
            if(newPos>trackWidth - 60)
              newPos = trackWidth - 60

            curPos = newPos/(trackWidth - 60)*selectedOpts.max + selectedOpts.min
            label.textContent = curPos.toFixed(0);
            scope.$evalAsync(read)
            setThumbX(newPos);
          }

          function handleMouseDown(event){
            thumbStartX = getThumbX();
            if(isNaN(thumbStartX))
              thumbStartX =0
            startX = event.clientX || event.changedTouches[0].clientX;
            $document.bind('mousemove touchmove', handleMouseMove);
            $document.bind('mouseup touchend', handleMouseUp);

            $window.addEventListener('resize', function(){
              setValue(curPos.toFixed(0));
            });
          }

          thumb.addEventListener("mousedown", handleMouseDown);
          thumb.addEventListener("touchstart", handleMouseDown);

          var matrixToArray = function(str){
            return str.match(/(-?[0-9\.]+)/g);
          };
          function getThumbX(){
            var arr = matrixToArray(thumb.style.transform);

            return parseInt(arr[0]);
          }
          function setThumbX(val){
            thumb.style.transform = "translate("+val+"px)";
          }

          function setValue(value){
            var trackWidth = track.width.baseVal.value;
            var newPos = (value-selectedOpts.min)/selectedOpts.max*(trackWidth-60);
            setThumbX(newPos);
            if(value.toFixed)
              label.textContent=value.toFixed(0);
            else
              label.textContent=value;
            curPos = value;
          }



          if (!ngModel) return; // do nothing if no ng-model

          // Specify how UI should be updated
          ngModel.$render = function() {
            setValue(parseFloat(ngModel.$viewValue))
          };

          read(); // initialize

          // Write data to the model
          function read() {
            ngModel.$setViewValue(curPos);
          }
        }
      };
    });
})();
