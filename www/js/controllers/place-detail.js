/**
 * Created by hoonja on 2015. 12. 3..
 */
"use strict";

angular.module('KNY.controllers')
  .controller('PlaceDetailCtrl', function($scope, $stateParams, $ionicModal, $cordovaSQLite, PlaceDB) {
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
    $scope.paths = [];

    $scope.load = function() {
      $cordovaSQLite.execute(PlaceDB.getDB(), PlaceDB.SQL_PLACES_SELECT_ONE, [$stateParams.placeId])
        .then(function(res) {
          console.log(res.rows.length + '개의 장소 데이터 불러오기 성공.');
          $scope.place.id = res.rows.item(0).id;
          $scope.place.name = res.rows.item(0).name;
          $scope.place.address = res.rows.item(0).address;
          $scope.place.images = JSON.parse(res.rows.item(0).imageURI);
          $scope.paths = $scope.place.images;
          $scope.place.memo = res.rows.item(0).memo;
          $scope.place.lat = res.rows.item(0).lat;
          $scope.place.lng = res.rows.item(0).lng;
        }, function(err) {
          console.error('장소 데이터를 불러오는데 실패했습니다.');
          console.error(err);
        });
    }

    $scope.showModal = function(templateUrl) {
      $ionicModal.fromTemplateUrl(templateUrl, {
          scope : $scope,
          animation : 'slide-in-up'
        })
        .then(function(modal) {
          $scope.modal = modal;
          $scope.modal.show();
        });
    };

    $scope.showImages = function(index) {
      console.log('image index : ' + index);
      $scope.activeSlide = index;
      $scope.showModal('templates/image-popover.html');
    };

    $scope.closeModal = function() {
      $scope.modal.hide();
      $scope.modal.remove();
    }

    $scope.load();
  });
