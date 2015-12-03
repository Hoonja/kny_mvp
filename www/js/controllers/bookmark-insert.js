/**
 * Created by hoonja on 2015. 11. 19..
 */
"use strict";

angular.module('KNY.controllers')
  .controller('BookmarkInsertCtrl', function($scope, $state, $stateParams, $ionicPlatform, $cordovaCamera, $cordovaSQLite, $ionicHistory, PrivatePolicy, PlaceDB, TestPlacesSet) {
    $scope.policies = PrivatePolicy.all();
    $scope.contents_for_save = {
      id: 0,
      name: '',
      policy: PrivatePolicy.getSelected(),
      curPos: {
        lat: parseFloat($stateParams.lat),
        lng: parseFloat($stateParams.lng)
      },
      telephon_no: '010-8430-4463',
      address: '',
      memo: '',
      imgURI: '',
      create_dt: Date()
    };

    var geocoder = new google.maps.Geocoder;
    geocoder.geocode({'location' : $scope.contents_for_save.curPos}, function(results, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        if (results[1]) {
          $scope.contents_for_save.address = results[1].formatted_address;
          console.info('Current Address is ' + $scope.contents_for_save.address + '.');
        } else {
          console.warn('Geocoder results are not found.');
          $scope.contents_for_save.address = status;
        }
      } else {
        console.error('Geocoder failed due to: ' + status);
        $scope.contents_for_save.address = status;
      }
    });

    // For Test
    $scope.contents_for_save.imgURI = TestPlacesSet[Math.floor(Math.random()*TestPlacesSet.length)].imageURI;
    console.debug($scope.contents_for_save.imgURI);

    if ($stateParams.mode == 'camera') {
      $ionicPlatform.ready(function () {
        var options = {
          quality: 75,
          destinationType: Camera.DestinationType.DATA_URL,
          sourceType: Camera.PictureSourceType.CAMERA,
          encodingType: Camera.EncodingType.JPEG,
          targetWidth: 300,
          targetHeight: 300,
          popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: true
        };

        $cordovaCamera.getPicture(options)
          .then(function (imageData) {
            $scope.contents_for_save.imgURI = "data:image/jpeg;base64," + imageData;
          }, function (err) {
            console.error('[Error] getPicture failed(' + err + ').');
          });
      });
    }

    $scope.savePlaceInfo = function() {
      $cordovaSQLite.execute(PlaceDB.getDB(), PlaceDB.SQL_INSERT_PLACE, [
        $scope.contents_for_save.address,
        $scope.contents_for_save.address,
        $scope.contents_for_save.telephon_no,
        $scope.contents_for_save.create_dt,
        $scope.contents_for_save.memo,
        $scope.contents_for_save.curPos.lat,
        $scope.contents_for_save.curPos.lng
      ]).then(function () {
        console.debug('Inserting to Places was successed!');
        $cordovaSQLite.execute(PlaceDB.getDB(), PlaceDB.SQL_SELECT_RECENT)
          .then(function(res){
            console.debug('res value is..');
            console.debug(res);
            $scope.contents_for_save.id = res.rows.item(0).id;
            $cordovaSQLite.execute(PlaceDB.getDB(), PlaceDB.SQL_INSERT_IMAGE, [
                $scope.contents_for_save.id,
                $scope.contents_for_save.imgURI,
                Date()
              ])
              .then(function() {
                console.debug('Insert image success.');
                $ionicHistory.goBack();

                window.setTimeout(function() {$state.go('tab.savedplaces');}, 500);
              }, function(err) {
                console.error('Insert image failed.');
                console.error(err);
              });
          }, function (err) {
            console.error(err);
          });
      }, function (err) {
        console.error(err);
        alert('저장 중 오류가 발생했습니다.');
      });
    }
  });
