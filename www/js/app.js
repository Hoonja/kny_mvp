// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
"use strict";

angular.module('KNY', ['ionic', 'KNY.controllers', 'KNY.services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
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
