/**
 * Created by hoonja on 2015. 12. 3..
 */
"use strict";

angular.module('KNY.controllers')
  .controller('PlaceDetailCtrl', function($scope, $stateParams, $cordovaSQLite, PlaceDB) {
    //$scope.chat = Chats.get($stateParams.placeId);
    console.debug('Place ID : ' + $stateParams.placeId);
    $scope.place = {
      id: $stateParams.placeId,
      name: '',
      imageURI: '',
      memo: '',
      lat: 0.0,
      lng: 0.0
    };
  });
