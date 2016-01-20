/**
 * Created by hoonja on 2015. 12. 21..
 */
"use strict";

angular.module('KNY.controllers')
  .controller('ConfigCtrl', function($scope, $ionicModal, $cordovaSQLite, $http, PlaceDB, MapService) {
    $scope.typeMap = MapService.getMapServiceType();
    $scope.selectMap = function(value) {
      MapService.setMapService(value);
      console.log(value + " map is selected.(" + typeof(value) + ")");
    };

    $scope.paths = [];
    $scope.file_cnt = 0;
    $scope.getSummary = function() {
      $cordovaSQLite.execute(PlaceDB.getDB(), PlaceDB.SQL_PLACES_SELECT_CNT)
        .then(function(res) {
          $scope.places_cnt = res.rows.item(0).cnt;
          console.log('Places count : ' + $scope.places_cnt);
        }, function(err) {
          console.error('Getting count of Places is failed.' + JSON.stringify(err));
        });

      $cordovaSQLite.execute(PlaceDB.getDB(), PlaceDB.SQL_IMAGES_SELECT_CNT)
        .then(function(res) {
          $scope.images_cnt = res.rows.item(0).cnt;
          console.log('Images count : ' + $scope.images_cnt);
        }, function(err) {
          console.error('Getting count of Images is failed.' + JSON.stringify(err));
        });
    };

    $scope.clearTables = function() {
      $cordovaSQLite.execute(PlaceDB.getDB(), PlaceDB.SQL_PLACES_DELETE_ALL)
        .then(function(res) {
          console.log('All record of Places is deleted.');
        }, function(err) {
          console.error('Deleting records of Places is failed.' + JSON.stringify(err));
        });

      $cordovaSQLite.execute(PlaceDB.getDB(), PlaceDB.SQL_IMAGES_DELETE_ALL)
        .then(function(res) {
          console.log('All record of Images is deleted.');
        }, function(err) {
          console.error('Deleting records of Images is failed.' + JSON.stringify(err));
        });

    };

    $scope.recreateTables = function() {
      $cordovaSQLite.execute(PlaceDB.getDB(), PlaceDB.SQL_PLACES_DROP)
        .then(function(res) {
          console.log('Dropping the Places table is successed.');
          $cordovaSQLite.execute(PlaceDB.getDB(), PlaceDB.SQL_PLACES_CREATE)
            .then(function(res) {
              console.log('Creating Places table is successed.');
            }, function(err) {
              console.error('Creating Places table is failed.' + JSON.stringify(err));
            });
        }, function(err) {
          console.error('Dropping Places table is failed.' + JSON.stringify(err));
        });

      $cordovaSQLite.execute(PlaceDB.getDB(), PlaceDB.SQL_IMAGES_DROP)
        .then(function(res) {
          console.log('Dropping the Places table is successed.');
          $cordovaSQLite.execute(PlaceDB.getDB(), PlaceDB.SQL_IMAGES_CREATE)
            .then(function(res) {
              console.log('Creating Places table is successed.');
            }, function(err) {
              console.error('Creating Places table is failed.' + JSON.stringify(err));
            });
        }, function(err) {
          console.error('Dropping Places table is failed.' + JSON.stringify(err));
        });
    };

    $scope.getImagePaths = function() {
      $cordovaSQLite.execute(PlaceDB.getDB(), PlaceDB.SQL_IMAGES_SELECT_PATH)
        .then(function(res) {
          $scope.file_cnt = 0;
          $scope.paths = [];
          for(var i = 0; i < res.rows.length; i++) {
            var inner_paths = JSON.parse(res.rows.item(i).imageURI);
            for(var j = 0; j < inner_paths.length; j++) {
              $scope.paths.push(inner_paths[j]);
              $scope.file_cnt++;
            }
          }
        }, function(err) {
          console.error('Selecting imageURI is failed.' + JSON.stringify(err));
        });
    }

    $scope.showImages = function(index) {
      $scope.activeSlide = index;
      $scope.showModal('templates/image-popover.html');
    };

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

    $scope.closeModal = function() {
      $scope.modal.hide();
      $scope.modal.remove();
    };

    $scope.uploadFile = function() {
      var placeImage = document.getElementById('placeImage').files[0];
      console.log('placeImage is');
      console.dir(placeImage);
      var fd = new FormData();
      fd.append('docfile', placeImage);
      fd.append('resulttype', 'json');
      fd.append('newaddr', 'json');
      fd.append('oldaddr', 'json');
      fd.append('latitude', 'json');
      fd.append('longitude', 'json');

      $http.post('/myapp/list/', fd, {
          transformRequest: angular.identity,
          headers: {
            'Content-Type': undefined,
            'X-CSRFToken' : 'MLbLL61DzBdZnHAqqe2xGgxD6JG8NGbL'  // localhost
            //'X-CSRFToken' : 'cfgRUiJqN5usZGkXkeEO081iOaphM3Ox'    // gulby server
          }
        })
        .success(function(response) {
          console.log(response);
          var list = response;
          console.log('Response is');
          console.dir(list);
          $scope.responseText = response;
        })
        .error(function(response) {
          $scope.responseText = response;
          console.log(response);
        });
    };
  });
