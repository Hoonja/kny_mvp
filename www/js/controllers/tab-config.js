/**
 * Created by hoonja on 2015. 12. 21..
 */
"use strict";

angular.module('KNY.controllers')
  .controller('ConfigCtrl', function($scope, $cordovaSQLite, PlaceDB) {
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
  });
