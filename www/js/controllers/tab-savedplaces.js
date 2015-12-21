/**
 * Created by hoonja on 2015. 11. 19..
 */
"use strict";

angular.module('KNY.controllers')
  .controller('SavedPlacesCtrl', function($scope, $ionicPlatform, $stateParams, $cordovaSQLite, PlaceDB) {
    $scope.load = function() {
      $scope.places = [];

      $cordovaSQLite.execute(PlaceDB.getDB(), PlaceDB.SQL_PLACES_SELECT, [0, 100])
        .then(function(res) {
          console.log('장소 목록 불러오기 성공.');
          $scope.places.length = 0;
          console.log('저장된 레코드 수: ' + res.rows.length);
          for(var i = 0; i < res.rows.length; i++) {
            var place = {
              id: res.rows.item(i).id,
              name: res.rows.item(i).name,
              address: res.rows.item(i).address,
              images: JSON.parse(res.rows.item(i).imageURI),
              memo: res.rows.item(i).memo,
              lat: res.rows.item(i).lat,
              lng: res.rows.item(i).lng
            };
            $scope.places.push(place);
            console.log(place);
          }
        }, function(err) {
          console.error('장소 데이터 목록을 불러오는데 실패했습니다.');
          console.error(err);
        });
    };

    $scope.remove = function(place) {
      console.log('Delete button was clicked.');
    };

    $ionicPlatform.ready(function() {
      $scope.load();
    });

    $scope.$on('refresh-out', function(event, args){
      $scope.load();
    });

  });
