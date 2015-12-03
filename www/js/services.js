"use strict";

angular.module('KNY.services', [])

  .factory('PrivatePolicy', function(){
    var policies = [{
      id: 0,
      name: '전체 공개',
      selected: false
    }, {
      id: 1,
      name: '친구 공유',
      selected: false
    }, {
      id: 2,
      name: '나만 보기',
      selected: true
    }];

    return {
      all : function() {
        return policies;
      },
      select: function(id) {
        for (var idx = 0; idx < policies.length; idx += 1) {
          if (idx == id) {
            policies[idx].selected = true;
          } else {
            policies[idx].selected = false;
          }
        }
        console.debug('Selected policy is ' + policies[id].name + '.');
      },
      getSelected: function() {
        for (var idx = 0; idx < policies.length; idx += 1) {
          if (policies[idx] == true) {
            return policies[idx];
          }
        }
        return null;
      }
    };
  })

  .factory('PlaceDB', function() {
    var $db = '';
    return {
      getDB: function() {
        console.debug('The value of db : ' + $db);
        if ($db === '') {
          if (ionic.Platform.isIOS() || ionic.Platform.isAndroid()) {
            $db = window.sqlitePlugin.openDatabase({name: 'KNY.db'});
            //$db = $cordovaSQLite.openDB({name: 'KNY.db'});
            console.debug('SQLite DB is created.');
          } else {
            $db = window.openDatabase('KNY.db', '1.0', 'KNY Place DB', 1024 * 1024 * 5);
            console.debug('WebSQL DB is created.');
          }
        }
        return $db;
      },
      close: function() {
        if (ionic.Platform.isIOS() || ionic.Platform.isAndroid()) {
          if ($db !== '') {
            $db.close(function () {
              console.log('Database is closed ok.');
            });
          }
        }
      },
      SQL_DROP_PLACES: "DROP TABLE IF EXISTS Places",
      SQL_CREATE_PLACES: "CREATE TABLE IF NOT EXISTS Places " +
      "(id INTEGER PRIMARY KEY ASC AUTOINCREMENT" +
      ", name TEXT" +
      ", address TEXT" +
      ", tel TEXT" +
      ", create_dt NUMERIC" +
      ", memo TEXT" +
      ", lat REAL" +
      ", lng REAL)",
      SQL_INSERT_PLACE: "INSERT INTO Places " +
      "(name, address, tel, create_dt, memo, " +
      "lat, lng)" +
      "VALUES (?, ?, ?, ?, ?, ?, ?)",
      SQL_SELECT_RECENT: "SELECT id FROM Places ORDER BY id DESC LIMIT 1",
      SQL_DROP_IMAGES: "DROP TABLE IF EXISTS Images",
      SQL_CREATE_IMAGES: "CREATE TABLE IF NOT EXISTS Images " +
      "(id INTEGER PRIMARY KEY ASC AUTOINCREMENT" +
      ", place_id INTEGER" +
      ", imageURI TEXT" +
      ", create_dt NUMERIC)",
      SQL_INSERT_IMAGE: "INSERT INTO Images (place_id, imageURI, create_dt) VALUES (?, ?, ?)",
      SQL_SELECT_PLACES: "SELECT * FROM Places p INNER JOIN Images i ON p.id = i.place_id ORDER BY p.id DESC LIMIT ?, ?",
      SQL_SELECT_ONE_PLACE: "SELECT * FROM Places p INNER JOIN Images i ON p.id = i.place_id WHERE p.id = ?"
    };
  })

  // browser test 용
  .factory('TestPlacesSet', function() {
    var TestImageDB = [
      'http://cfile202.uf.daum.net/image/23665741512D94732585CD',
      'http://cfile29.uf.tistory.com/image/25022E475337F9940D476E',
      'http://cfile2.uf.tistory.com/image/2128C535546F12F109843C',
      'http://file1.menupan.com/FILE/GoodRest/201210/IMG_9817.jpg',
      'http://pangyo.egot.co.kr/wp-content/uploads/sites/2/2014/04/dram.gif',
      'http://file1.menupan.com/FILE/GoodRest/201201/69543d5c29ec391b51cdb7e269df6560.jpg',
      'http://cfile1.uf.tistory.com/image/223872425569DF542B9E9D',
      'http://cfile1.uf.tistory.com/image/261A6D3955AE56D8311551',
      'http://cfile30.uf.tistory.com/image/1252B64A510F3640126F40',
      'http://www.bundangnews.co.kr/news/photo/201209/3252_3963_4919.jpg'
    ];
    return [
      {
        name: '첫 번째',
        address: '경기도 성남시 분당구 삼평동',
        telephon_no: '010-1111-1111',
        create_dt: new Date(),
        memo:'(테스트)첫 번째로 추가한 장소입니다.',
        lat: 1.0,
        lng: 1.0,
        imageURI: TestImageDB[0],
        image_dt: new Date()
      },
      {
        name: '두 번째',
        address: '경기도 성남시 분당구 삼평동',
        telephon_no: '010-2222-2222',
        create_dt: new Date(),
        memo: '(테스트)두 번째로 추가한 장소입니다.',
        lat: 2.0,
        lng: 2.0,
        imageURI: TestImageDB[1],
        image_dt: new Date()
      },
      {
        name: '세 번째',
        address: '경기도 성남시 분당구 삼평동',
        telephon_no: '010-3333-3333',
        create_dt: new Date(),
        memo: '(테스트)세 번째로 추가한 장소입니다.',
        lat: 3.0,
        lng: 3.0,
        imageURI: TestImageDB[2],
        image_dt: new Date()
      },
      {
        name: '네 번째',
        address: '경기도 성남시 분당구 삼평동',
        telephon_no: '010-4444-4444',
        create_dt: new Date(),
        memo: '(테스트)네 번째로 추가한 장소입니다.',
        lat: 4.0,
        lng: 4.0,
        imageURI: TestImageDB[3],
        image_dt: new Date()
      },
      {
        name: '다섯 번째',
        address: '경기도 성남시 분당구 삼평동',
        telephon_no: '010-5555-6666',
        create_dt: new Date(),
        memo: '(테스트)다섯 번째로 추가한 장소입니다.',
        lat: 5.0,
        lng: 5.0,
        imageURI: TestImageDB[4],
        image_dt: new Date()
      },
      {
        name: '여섯 번째',
        address: '경기도 성남시 분당구 삼평동',
        telephon_no: '010-6666-6666',
        create_dt: new Date(),
        memo: '(테스트)여섯 번째로 추가한 장소입니다.',
        lat: 6.0,
        lng: 6.0,
        imageURI: TestImageDB[5],
        image_dt: new Date()
      },
      {
        name: '일곱 번째',
        address: '경기도 성남시 분당구 삼평동',
        telephon_no: '010-7777-7777',
        create_dt: new Date(),
        memo: '(테스트)일곱 번째로 추가한 장소입니다.',
        lat: 7.0,
        lng: 7.0,
        imageURI: TestImageDB[6],
        image_dt: new Date()
      },
      {
        name: '여덟 번째',
        address: '경기도 성남시 분당구 삼평동',
        telephon_no: '010-8888-8888',
        create_dt: new Date(),
        memo: '(테스트)여덟 번째로 추가한 장소입니다.',
        lat: 8.0,
        lng: 8.0,
        imageURI: TestImageDB[7],
        image_dt: new Date()
      },
      {
        name: '아홉 번째',
        address: '경기도 성남시 분당구 삼평동',
        telephon_no: '010-9999-9999',
        create_dt: new Date(),
        memo: '(테스트)아홉 번째로 추가한 장소입니다.',
        lat: 9.0,
        lng: 9.0,
        imageURI: TestImageDB[8],
        image_dt: new Date()
      },
      {
        name: '열 번째',
        address: '경기도 성남시 분당구 삼평동',
        telephon_no: '010-1010-1010',
        create_dt: new Date(),
        memo: '(테스트)열 번째로 추가한 장소입니다.',
        lat: 10.0,
        lng: 10.0,
        imageURI: TestImageDB[9],
        image_dt: new Date()
      }
    ];
  });
