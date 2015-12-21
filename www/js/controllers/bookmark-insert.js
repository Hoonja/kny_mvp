/**
 * Created by hoonja on 2015. 11. 19..
 */
"use strict";

angular.module('KNY.controllers')
  .controller('BookmarkInsertCtrl', function($scope, $state, $stateParams, $ionicPlatform, $cordovaCamera, $cordovaSQLite, $ionicHistory, $ionicActionSheet, PrivatePolicy, PlaceDB, CacheService, ImageService) {
    var _today = new Date();
    var _lat = parseFloat($stateParams.lat);
    var _lng = parseFloat($stateParams.lng);
    $scope.policies = PrivatePolicy.all();
    $scope.contents_for_save = {
      id: 0,
      name: '',
      policy: PrivatePolicy.getSelected().id,
      curPos: {
        lat: _lat,
        lng: _lng
      },
      telephone_no: '010-1234-5678',
      address: '',
      memo: '',
      // imgURI: TestPlacesSet[Math.floor(Math.random()*TestPlacesSet.length)].imageURI,
      imgURI: '',
      create_dt: _today
    };

    $scope.images = CacheService.images();

    /*$scope.addImage = function() {
      ImageService.handleMediaDialog($stateParams.mode)
        .then(function() {
          $scope.$apply();
          console.log($scope.images);
        });
    }*/

    $scope.addImage = function() {
      // Show the action sheet
      $ionicActionSheet.show({
        buttons: [
          { text: '카메라로 찍기' },
          { text: '사진 앨범에서 선택' },
          { text: '무작위 이미지 추가(테스트용)' }
        ],
        titleText: '사진을 추가 합니다.',
        cancelText: 'Cancel',
        cancel: function() {
          // add cancel code..
        },
        buttonClicked: function(index) {
          console.log('[Event(ActionSheet:click)]Button['+ index + '] is clicked.');
          // index : 0(camera), 1(library), 2(direct)
          ImageService.handleMediaDialog('' + index)
            .then(function() {
              console.log($scope.images);
            });

          return true;
        }
      });
    };

    // 주소? 지역? 추출
    var geocoder = new google.maps.Geocoder;
    geocoder.geocode({'location' : $scope.contents_for_save.curPos}, function(results, status) {
      //console.log('Geocoder.geocode is invoked.');
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

    $scope.selectPolicy = function(selectedPolicy) {
      $scope.contents_for_save.policy = selectedPolicy;
      PrivatePolicy.select(selectedPolicy);
      console.log("Selected policy : " + selectedPolicy);
    }

    $scope.savePlaceInfo = function() {
      $cordovaSQLite.execute(PlaceDB.getDB(), PlaceDB.SQL_PLACES_INSERT, [
        $scope.contents_for_save.name,
        $scope.contents_for_save.address,
        $scope.contents_for_save.telephone_no,
        $scope.contents_for_save.create_dt,
        $scope.contents_for_save.memo,
        $scope.contents_for_save.policy,
        $scope.contents_for_save.curPos.lat,
        $scope.contents_for_save.curPos.lng
      ]).then(function () {
        console.log('Inserting to Places was successed!');
        $cordovaSQLite.execute(PlaceDB.getDB(), PlaceDB.SQL_PLACES_SELECT_RECENT)
          .then(function(res){
            console.log('res value is..');
            console.log(res);
            $scope.contents_for_save.id = res.rows.item(0).id;
            $cordovaSQLite.execute(PlaceDB.getDB(), PlaceDB.SQL_IMAGES_INSERT, [
                $scope.contents_for_save.id,
                // $scope.contents_for_save.imgURI,
                JSON.stringify($scope.images),
                Date()
              ])
              .then(function() {
                console.log('Insert image success.');
                CacheService.resetImage();
                $state.go('tab.bookmark');

                window.setTimeout(function() {$state.go('tab.savedplaces');}, 500);
                $scope.$emit('refresh-in');
              }, function(err) {
                console.error('Insert image failed.');
                CacheService.resetImage();
                console.error(err);
              });
          }, function (err) {
            console.error(err);
            CacheService.resetImage();
          });
      }, function (err) {
        console.error(err);
        CacheService.resetImage();
        alert('저장 중 오류가 발생했습니다.');
      });
    }
  });
