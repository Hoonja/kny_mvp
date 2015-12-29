/**
 * Created by hoonja on 2015. 11. 19..
 */
"use strict";

angular.module('KNY.controllers')
  .controller('SavedPlacesCtrl', function($scope, $ionicPlatform, $stateParams, $cordovaSQLite, $ionicActionSheet, PlaceDB, DaumMapService) {
    $scope.load = function() {
      $scope.places = [];

      $cordovaSQLite.execute(PlaceDB.getDB(), PlaceDB.SQL_PLACES_SELECT, [0, 100])
        .then(function(res) {
          console.log('장소 목록 불러오기 성공.(총 ' + res.rows.length + '건)');
          $scope.places.length = 0; // 배열 초기화 기법
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
            console.debug(JSON.stringify(place));
          }
        }, function(err) {
          console.error('장소 데이터 목록을 불러오는데 실패했습니다.');
          console.error(err);
        })
        .then(function() {
          $scope.addMarker();
        });
    };

    $scope.remove = function(place) {
      console.log('Delete button was clicked.');
    };

    $scope.$on('refresh-out', function(event, args){
      $scope.load();
    });

    $scope.addMarker = function() {
      for(var i = 0; i < $scope.places.length; i++) {
        MapService.addMarker($scope.places[i].lat, $scope.places[i].lng, $scope.places[i].name, $scope.places[i].id);
      }
    };

    var MapService = DaumMapService;
    $ionicPlatform.ready(function() {
      MapService.init('savedMap', false, null)
        .then(function(){
          $scope.load();
        })
    });
  });
