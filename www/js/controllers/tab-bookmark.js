/**
 * Created by hoonja on 2015. 11. 19..
 */
"use strict";

angular.module('KNY.controllers')
  .controller('BookmarkCtrl', function($scope, $ionicPlatform, $ionicActionSheet, $ionicModal, $cordovaCamera, $cordovaSQLite, $ionicLoading, PrivatePolicy, PlaceDB, CacheService, ImageService, MapService, FileUploader, SERVER_ADDR) {
    var MapService = MapService.getMapService();
    $scope.showBookmarkEntryUI = function() {
      // Show the action sheet
      $ionicActionSheet.show({
        buttons: [
          { text: '사진 찍고 저장' },
          { text: '사진 앨범에서 골라 저장' },
          { text: '바로 저장' }
        ],
        titleText: '현재의 위치를 저장합니다.',
        cancelText: 'Cancel',
        cancel: function() {
          // add cancel code..
        },
        buttonClicked: function(index) {
          console.log('[Event(ActionSheet:click)]Button['+ index + '] is clicked.');
          // index : 0(camera), 1(library), 2(direct)
          ImageService.handleMediaDialog('' + index)
            .then(function() {
              $scope.showBookmarkInsertDlg();
            });

          return true;
        }
      });
    };

    $scope.showBookmarkInsertDlg = function() {
      $ionicModal.fromTemplateUrl('templates/bookmark-insert.html', {
          scope : $scope,
          focusFirstInput: true,
          animation : 'slide-in-up'
        })
        .then(function(modal) {
          var _today = new Date();
          $scope.policies = PrivatePolicy.all();
          $scope.contents_for_save = {
            name: '',
            estimation_place: '',
            address: MapService.getAddress(),
            telephone_no: '',
            memo: '',
            imgURI: '',
            curPos: {
              lat: MapService.getCurPosition().lat,
              lng: MapService.getCurPosition().lng
            },
            create_dt: _today
          };

          $scope.images = CacheService.images();

          $scope.modal = modal;
          $scope.modal.show();
        });
    };

    $scope.closeBookmarkInsertDlg = function() {
      $scope.modal.hide();
      $scope.modal.remove();
      CacheService.resetImage();
    };

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

    $scope.selectPolicy = function(selectedPolicy) {
      PrivatePolicy.select(selectedPolicy);
      console.log("Selected policy : " + selectedPolicy);
    }

    $scope.estimatePlaces = function() {
      if (ionic.Platform.isIOS() || ionic.Platform.isAndroid()) {
        var options = {
          fileKey: 'docfile',
          fileName: 'place_image',
          httpMethod: 'POST',
          params: {
            resulttype: 'json',
            newaddr: $scope.contents_for_save.address,
            oldaddr: '',
            latitude: $scope.contents_for_save.curPos.lat,
            longitude: $scope.contents_for_save.curPos.lng
          }
        };
        console.debug('options is');
        console.dir(options);
        $ionicLoading.show({
          content: 'Processing..',
          noBackdrop: true
        });
        FileUploader.estimatePlaces(SERVER_ADDR.pp, $scope.images[0], options)
          .then(function (result) {
            console.log('File upload is success(' + result.bytesSent + ' bytes is sent).');
            console.dir(result.response);
            $scope.placesProposed = JSON.parse(result.response);
            $ionicLoading.hide();
            $ionicModal.fromTemplateUrl('templates/plist-popover.html', {
                scope: $scope,
                animation: 'slide-in-up'
              })
              .then(function (modal) {
                $scope.plistModal = modal;
                $scope.plistModal.show();
              });
          }, function (err) {
            $ionicLoading.hide();
            console.error('File upload failed.');
            console.dir(err);
          }, function (progress) {

          });
      }
      // For test in browser
      else {
        console.info('This platform does not support FileTransfer');
        $ionicModal.fromTemplateUrl('templates/plist-popover.html', {
            scope: $scope,
            animation: 'slide-in-up'
          })
          .then(function (modal) {
            $scope.placesProposed = JSON.parse('{\"top3\": [\"\\ud0a4\\uc988\\uc2a4\\ud50c\\ub798\\uc26c\", \"0.040563\"], \"top2\": [\"\\uc9c4\\uc9c4\\ubc18\\uc0c1\", \"0.061957\"], \"top1\": [\"\\ubc45\\uc2a4\\ud5e4\\uc5b4\", \"0.778192\"]}');
            console.dir($scope.placesProposed);
            $scope.plistModal = modal;
            $scope.plistModal.show();
          });
      }
    };

    $scope.closePlistModal = function() {
      $scope.plistModal.hide();
      $scope.plistModal.remove();
    };

    $scope.setPlaceByProposing = function(name) {
      $scope.contents_for_save.name = name;
      $scope.closePlistModal();
    }

    $scope.savePlaceInfo = function() {
      $cordovaSQLite.execute(PlaceDB.getDB(), PlaceDB.SQL_PLACES_INSERT, [
        $scope.contents_for_save.name,
        $scope.contents_for_save.address,
        $scope.contents_for_save.telephone_no,
        $scope.contents_for_save.create_dt,
        $scope.contents_for_save.memo,
        PrivatePolicy.getSelected().id,
        $scope.contents_for_save.curPos.lat,
        $scope.contents_for_save.curPos.lng
      ]).then(function () {
        console.log('Inserting to Places was successed!');
        $cordovaSQLite.execute(PlaceDB.getDB(), PlaceDB.SQL_PLACES_SELECT_RECENT)
          .then(function(res){
            var place_id = res.rows.item(0).id;
            $cordovaSQLite.execute(PlaceDB.getDB(), PlaceDB.SQL_IMAGES_INSERT, [
                place_id,
                JSON.stringify($scope.images),
                $scope.contents_for_save.create_dt
              ])
              .then(function() {
                console.log('Insert image success.');
                $scope.$emit('refresh-in');
              }, function(err) {
                console.error('Inserting an image failed : ' + JSON.stringify(err));
              });
          }, function (err) {
            console.error('Selecting recent place is failed : ' + JSON.stringify(err));
          });
      }, function (err) {
        console.error('Inserting a place is failed : ' + JSON.stringify(err));
        alert('저장 중 오류가 발생했습니다.');
      })
        .then(function() {
          alert('저장했습니다.^^');
          $scope.closeBookmarkInsertDlg();
        });
    }

    $scope.relayout = function() {
      MapService.relayout('myMap');
    };

    $scope.$on('$stateChangeSuccess', function() {
      // MapService.relayout();
    });

    $scope.setCenter = function() {
      MapService.setCenterToCurPosition('myMap');
    }

    $ionicPlatform.ready(function() {
      MapService.init('myMap', true, $scope.showBookmarkEntryUI);
    });
  });
