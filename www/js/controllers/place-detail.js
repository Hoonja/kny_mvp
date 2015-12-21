/**
 * Created by hoonja on 2015. 12. 3..
 */
"use strict";

angular.module('KNY.controllers')
  .controller('PlaceDetailCtrl', function($scope, $stateParams, $cordovaSQLite, PlaceDB) {
    console.log('Place ID : ' + $stateParams.placeId);
    $scope.place = {
      id: $stateParams.placeId,
      name: '',
      address: '',
      images: [],
      memo: '',
      lat: 0.0,
      lng: 0.0
    };

    $scope.load = function() {
      $cordovaSQLite.execute(PlaceDB.getDB(), PlaceDB.SQL_PLACES_SELECT_ONE, [$stateParams.placeId])
        .then(function(res) {
          console.log(res.rows.length + '개의 장소 데이터 불러오기 성공.');
          $scope.place.id = res.rows.item(0).id;
          $scope.place.name = res.rows.item(0).name;
          $scope.place.address = res.rows.item(0).address;
          $scope.place.images = JSON.parse(res.rows.item(0).imageURI);
          $scope.place.memo = res.rows.item(0).memo;
          $scope.place.lat = res.rows.item(0).lat;
          $scope.place.lng = res.rows.item(0).lng;
        }, function(err) {
          console.error('장소 데이터를 불러오는데 실패했습니다.');
          console.error(err);
        });
    }

    $scope.load();
  });
