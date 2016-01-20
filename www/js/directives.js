/**
 * Created by hoonja on 2016. 1. 18..
 */
"use strict";

angular.module('KNY.directives', [])
  // 뭔가 scope 처리 부분에 문제가 있는지, 예제처럼 제대로 작동을 안함 -_- (괜히 붙였어..씨..)
  .directive('fileModel', ['$parse', function ($parse) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        var model = $parse(attrs.fileModel);
        var modelSetter = model.assign;

        element.bind('change', function(){
          console.log('fileModel value is changed.');
          scope.$apply(function(){
            modelSetter(scope.$parent.$parent, element[0].files[0]);
            console.log('scope is');
            console.dir(scope);
            console.log('file is');
            console.dir(element[0].files[0]);
          });
        });
      }
    };
  }]);
