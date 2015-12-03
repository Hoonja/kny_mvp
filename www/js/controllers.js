"use strict";

// 내용이 긴 컨트롤러는 따로 분리하고 나머지는 모두 이 파일에 모아둠
angular.module('KNY.controllers', [])
  .controller('ConnectCtrl', function($scope) {
    $scope.settings = {
      enableFriends: true
    };
  })

  .controller('ConfigCtrl', function($scope) {
    $scope.settings = {
      enableMonetize: true
    };
  });
