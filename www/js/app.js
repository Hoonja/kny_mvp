// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
"use strict";

angular.module('KNY', ['ionic', 'ngCordova', 'KNY.controllers', 'KNY.services'])

  .run(function($ionicPlatform, $rootScope, $cordovaSQLite, PlaceDB) {
    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)

      // select box에서 완료 버튼이 나오기 위해서는 아래 세 줄을 주석처리해야 한다
      // 아래 줄이 무슨 짓을 하는 문장인지는 추가로 파악을 해야 함
      //if(window.cordova && window.cordova.plugins.Keyboard) {
      //  cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      //}
      if(window.StatusBar) {
        StatusBar.styleDefault();
      }
      console.log('[Event(device:deviceready)] Now you can use cordova plug-in.');

      $cordovaSQLite.execute(PlaceDB.getDB(), PlaceDB.SQL_PLACES_CREATE).then(function () {
        console.log('Places table was successfuly created.');
      }, function (err) {
        console.error(err);
      });
      $cordovaSQLite.execute(PlaceDB.getDB(), PlaceDB.SQL_IMAGES_CREATE).then(function () {
        console.log('Images table was successfuly created.');
      }, function (err) {
        console.error(err);
      });

      // 장소가 저장되었다는 알림 이벤트를 받으면, 적절히 목록을 갱신하도록 event를 broadcasting 한다
      $rootScope.$on('refresh-in', function(event, args){
        $rootScope.$broadcast('refresh-out', args);
      });
    });
  })
  .config(function($stateProvider, $urlRouterProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

    // setup an abstract state for the tabs directive
    .state('tab', {
      url: '/tab',
      abstract: true,
      controller: 'TabCtrl',
      templateUrl: 'templates/tabs.html'
    })

    // Each tab has its own nav history stack:
    .state('tab.bookmark', {
      url: '/bookmark',
      views: {
        'tab-bookmark': {
          templateUrl: 'templates/tab-bookmark.html',
          controller: 'BookmarkCtrl'
        }
      }
    })
    .state('tab.bookmark_insert', {
      url: '/insert/:mode?lat&lng',
      views: {
        'tab-bookmark': {
          templateUrl: 'templates/bookmark-insert.html',
          controller: 'BookmarkInsertCtrl'
        }
      }
    })

    .state('tab.savedplaces', {
      url: '/savedplaces',
      views: {
        'tab-savedplaces': {
          templateUrl: 'templates/tab-savedplaces.html',
          controller: 'SavedPlacesCtrl'
        }
      }
    })
    .state('tab.place-detail', {
      url: '/place/:placeId',
      views: {
        'tab-savedplaces': {
          templateUrl: 'templates/place-detail.html',
          controller: 'PlaceDetailCtrl'
        }
      }
    })

    .state('tab.connect', {
      url: '/connect',
      views: {
        'tab-connect': {
          templateUrl: 'templates/tab-connect.html',
          controller: 'ConnectCtrl'
        }
      }
    })

    .state('tab.config', {
      url: '/config',
      views: {
        'tab-config': {
          templateUrl: 'templates/tab-config.html',
          controller: 'ConfigCtrl'
        }
      }
    });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/bookmark');

  });
