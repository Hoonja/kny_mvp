/**
 * Created by hoonja on 2015. 11. 19..
 */
"use strict";

angular.module('KNY.controllers')
.controller('BookmarkInsertCtrl', function($scope, $stateParams) {
  $scope.mode = $stateParams.mode;
  $scope.curRealPos = {
    lat: $stateParams.lat,
    lng: $stateParams.lng
  };
});
