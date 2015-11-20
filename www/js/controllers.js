"use strict";

// 내용이 긴 컨트롤러는 따로 분리하고 나머지는 모두 이 파일에 모아둠
angular.module('KNY.controllers', [])
.controller('SavedPlacesCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('PlaceDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.placeId);
})

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
