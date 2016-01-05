"use strict";

// 내용이 긴 컨트롤러는 따로 분리하고 나머지는 모두 이 파일에 모아둠
angular.module('KNY.controllers', [])
  .controller('TabCtrl', function($scope){
    $scope.platform = ionic.Platform.platform();
    $scope.onBookmarkTabSelected = function() {
      console.log("Bookmark tab selected.");
    };

    $scope.onSavedPlacesTabSelected = function() {
      console.log("SavedPlaces tab selected.");
    };

    $scope.$on('refresh-in', function(event, args){
      $scope.$broadcast('refresh-out', args);
    });
  })
  .controller('ConnectCtrl', function($scope) {
    $scope.settings = {
      enableMonetize: true
    };
  });
