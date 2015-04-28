(function (window, angular) {

    var _ = require('lodash');

    var db = require('knex')({
        client: 'mysql',
        connection: {
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'paging'
        },
        debug: true
    });

    angular.module('app', ['lumx', 'infinite-scroll'])

        .controller('MainController', function ($scope, MainFactory, LxProgressService) {

            LxProgressService.circular.show('#5fa2db', '#progress');

            $scope.users = [];
            $scope.total = 0;
            $scope.recordPerPage = 2;
            $scope.currentPage = 1;
            $scope.startRecord = 0;

            $scope.busy = false;
            $scope.showButton = true;

            MainFactory.total()
                .then(function (total) {
                    $scope.total = total;
                    $scope.totalPage = Math.floor($scope.total / $scope.recordPerPage);
                });

            // Load more data
            $scope.loadMore = function () {
                if ($scope.currentPage <= $scope.totalPage) {
                    $scope.startRecord = ($scope.currentPage - 1) * $scope.recordPerPage;
                    $scope.busy = true;
                    $scope.showButton = false;
                    MainFactory.list($scope.startRecord, $scope.recordPerPage)
                        .then(function (rows) {
                            $scope.currentPage++;
                            _.forEach(rows, function (v) {
                                $scope.users.push(v);
                            });

                            $scope.busy = false;
                            $scope.showButton = true;
                        });
                } else {
                    $scope.showButton = false;
                }

            };


        })
        .factory('MainFactory', function ($q) {
            return {
                list: function (startRec, perPage) {
                    var q = $q.defer();

                    db('users')
                        .limit(perPage)
                        .offset(startRec)
                        .exec(function(err, rows) {
                            if (err) q.reject(err);
                            else q.resolve(rows);
                        });

                    return q.promise;
                },
                total: function () {
                    var q = $q.defer();

                    db('users')
                        .count('* as total')
                        .exec(function(err, rows) {
                            if (err) q.reject(err);
                            else q.resolve(rows[0].total);
                        });

                    return q.promise;
                }
            };
        });
})(window, window.angular);