/**
* componentModule Module
*
* Description
*/

angular.module('component-templates', []); //overridden by build process

angular.module('componentModule', ['component-templates'])

.directive('itSlider', function($document, $window){
  return {
    restrict:'E',
    require:'?ngModel',
    scope: {
      min:"=",
      max:"="
    },
    templateUrl:'component/templates/slider.svg',
    link:function(scope,iElem,iAttrs,ngModel){
      
      // Defaults
      var selectedOpts ={
        min: 0,
        max: 100
      }
      
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
        console.log(event.clientX/trackWidth);
        var value = selectedOpts.min + selectedOpts.max*(event.clientX-30)/trackWidth
        console.log(value);
        setValue(value.toFixed());
        scope.$evalAsync(read)
      })
      
        
      $document[0].body.addEventListener('mouseleave', function(event){
        if(event.target == $document[0].body){
          scope.handleMouseUp();
        }
      });

      var handleMouseMove = function(event){
        var newPos = thumbStartX+(event.clientX-startX);
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


      scope.handleMouseDown = function(event){
        thumbStartX = getThumbX();
        if(isNaN(thumbStartX))
          thumbStartX =0
        startX = event.clientX;
        $document.bind('mousemove', handleMouseMove);
        $document.bind('mouseup', scope.handleMouseUp);
        
        $window.addEventListener('resize', function(){
          setValue(curPos.toFixed(0));
        });
      }
      
      
      scope.handleMouseUp = function(){
        $document.unbind('mousemove', handleMouseMove);
      }
      
      function setValue(value){
        var trackWidth = track.width.baseVal.value;
        var newPos = (value-selectedOpts.min)/selectedOpts.max*trackWidth;
        setThumbX(newPos);
        label.textContent=value;
        curPos = value;
      }
      
      
      
      if (!ngModel) return; // do nothing if no ng-model

      // Specify how UI should be updated
      ngModel.$render = function() {
        setValue(parseInt(ngModel.$viewValue))
      };

      read(); // initialize

      // Write data to the model
      function read() {
        ngModel.$setViewValue(curPos);
      }
    }
  };
})