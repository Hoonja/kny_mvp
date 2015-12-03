/**
 * Created by hoonja on 2015. 11. 19..
 */
"use strict";

angular.module('KNY.controllers')
  .controller('SavedPlacesCtrl', function($scope, $ionicPlatform, $cordovaSQLite, PlaceDB) {
    $ionicPlatform.ready(function() {
      $scope.init = function() {
        $scope.places = [];

        $cordovaSQLite.execute(PlaceDB.getDB(), PlaceDB.SQL_SELECT_PLACES, [0, 100])
          .then(function(res) {
            console.debug('장소 목록 불러오기 성공.');
            $scope.places.length = 0;
            for(var i = 0; i < res.rows.length; i++) {
              $scope.places.push(res.rows[i]);
              console.debug(res.rows[i]);
            }
          }, function(err) {
            console.error('장소 데이터 목록을 불러오는데 실패했습니다.');
            console.error(err);
          });
      };

      $scope.remove = function(place) {
        console.log('Delete button was clicked.');
      };

      $scope.init();
    });

  });
