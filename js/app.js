var app = angular.module("jetJedi", ["ngRoute"]);

app.value('BackAnd', BackAnd);
app.value('jQuery', jQuery);
app.value('bootbox', bootbox);

app.config(function($routeProvider) {
   $routeProvider
   .when("/", {
      templateUrl : "pages/home.html"
   })
    .when("/acessar", {
       templateUrl : "pages/access.html"
    })
   .when("/jedis", {
      templateUrl : "pages/jedis.html"
   })
   .when("/novo-jedi", {
      templateUrl : "pages/jedi.html"
   })
   .when("/jedi/:id", {
      templateUrl : "pages/jedi.html"
   })
});

app.run(function($rootScope, $location){
   $rootScope.showMenu = true;

   console.log(localStorage, sessionStorage);

   if (localStorage.getItem('access_token') != null) {
      sessionStorage.setItem('access_token', localStorage.getItem('access_token'))

   }

   $rootScope.access_token = sessionStorage.getItem('access_token');

   console.log('runn', $rootScope.access_token);

   $rootScope.$on( "$routeChangeStart", function(event, next, current) {
      if (next.templateUrl != "pages/access.html" && $rootScope.access_token == null) {
         $location.path( '/acessar' );
      }
   });
})

app.controller('MainController', function($scope, $rootScope) {

});

app.controller('AccessController', function($scope, $rootScope, $location) {
   $rootScope.showMenu = false;

   $scope.token = null;
   $scope.keep_alive = null;

   $scope.access = function() {
      if (!$scope.token) {
         bootbox.alert('Informe um Token válido.');
         return false;
      }

      $rootScope.access_token = $scope.token;

      sessionStorage.setItem('access_token', $rootScope.access_token);
      if ($scope.keep_alive) {
         localStorage.setItem('access_token', $rootScope.access_token);
      }


      $location.path('/');
   }
});

app.controller('NavController', function($scope, $rootScope, $location) {
   $scope.location = $location.path();

   $scope.logout = function() {

      $rootScope.access_token = null;
      localStorage.removeItem('access_token');
      sessionStorage.removeItem('access_token');

      $location.path('/acessar');
   }

   $rootScope.$on('$routeChangeSuccess', function() {
      $scope.location = $location.path();
   });
});

app.controller('DashboardController', [
   '$scope', '$rootScope', '$location',
   'BackAnd', 'jQuery', function($scope, $rootScope, $location, BackAnd, $){

      BackAnd.config.set('access_token', $rootScope.access_token);

   $rootScope.showMenu = true;
   $scope.getStatus = function(id) {
      for( var i in $scope.status )
         if  ($scope.status[i].id == id)
            return $scope.status[i];
   }

   BackAnd.list('jedi').done(function(d){

      var dataStatus = {};
      var dataPlanet = {};

      for (var i in d.data) {
         if (dataStatus[d.data[i].status] === undefined)
            dataStatus[d.data[i].status] = 0;

         if (dataPlanet[d.data[i].planet] === undefined)
            dataPlanet[d.data[i].planet] = 0;

         dataStatus[d.data[i].status]++;
         dataPlanet[d.data[i].planet]++;
      }

      BackAnd.list('status').done(function(q){
         $scope.status = q.data;

         var chartStatusData = [];

         for (var j in q.data)
            chartStatusData.push({
               y:  dataStatus[q.data[j].id] || 0 ,
               legendText: q.data[j].status_name,
               label: q.data[j].status_name
            });

         $(".chartJediStatusContainer").CanvasJSChart({
            animationEnabled: true,
            legend:{
               verticalAlign: "center",
               horizontalAlign: "left",
               fontSize: 20,
               fontFamily: "Helvetica"
            },
            theme: "theme2",
            data: [
               {
                  type: "pie",
                  startAngle:-20,
                  showInLegend: true,
                  toolTipContent:"{legendText} {y}",
                  dataPoints: chartStatusData
               }
            ]
         });

      }).fail(function(x, t, e){
         console.log(arguments);
         if (e == "Unauthorized")
            bootbox.alert('Você não foi autorizado jovem Padawan. Somente o token de um Mestre Jedi pode acessar os dados.', function(){
               $rootScope.$apply(function(){$location.path('/acessar')});
            });
         else
            bootbox.alert('Houve um disturbio na força e não foi possível carregar os dados dos Jedis.');
      });;

      chartPlanetData = [];

      for (var p in dataPlanet)
         chartPlanetData.push({
            y:  dataPlanet[p],
            legendText: p,
            label: p
         });

      $(".chartJediPlanetaContainer").CanvasJSChart({
         animationEnabled: true,
         legend:{
            verticalAlign: "center",
            horizontalAlign: "left",
            fontSize: 20,
            fontFamily: "Helvetica"
         },
         theme: "theme2",
         data: [
            {
               type: "pie",
               indexLabelFontFamily: "Garamond",
               indexLabelFontSize: 20,
               indexLabel: "{label} {y}",
               startAngle:-20,
               showInLegend: true,
               toolTipContent:"{legendText} {y}",
               dataPoints: chartPlanetData
            }
         ]
      });

   }).fail(function(x, t, e){
      console.log(arguments);
      if (e == "Unauthorized")
         bootbox.alert('Você não foi autorizado jovem Padawan. Somente o token de um Mestre Jedi pode acessar os dados.', function(){
            $rootScope.$apply(function(){$location.path('/acessar')});
         });
      else
         bootbox.alert('Houve um disturbio na força e não foi possível carregar os dados dos Jedis.');
   });


}]);

app.controller('JediController', [
   '$scope', '$rootScope', '$routeParams', '$location',
   'BackAnd', 'bootbox', function($scope, $rootScope, $routeParams, $location, BackAnd, bootbox) {

   $('form#jedi-form input[type=text], form#jedi-form select').prop('readonly', true);

   $scope.status = [{id:null, status_name:'Carregando'}];

   $scope.jedi = {status:null};

   $scope.convertToString = function(id){
      return ''+id;
   };

   BackAnd.list('status').done(function(d){
      $scope.status = d.data;
      $scope.jedi = {};
      $scope.$digest();

      if ($routeParams.id) {
         BackAnd.get('jedi', $routeParams.id).done(function(d){
            $scope.jedi = d;
            $scope.$digest();
            $('form#jedi-form input[type=text], form#jedi-form select').prop('readonly', false);
         }).fail(function(x, t, e){
            console.log(arguments);
            if (e == "Unauthorized")
               bootbox.alert('Você não foi autorizado jovem Padawan. Somente o token de um Mestre Jedi pode acessar os dados.', function(){
                  $rootScope.$apply(function(){$location.path('/acessar')});
               });
            else
               bootbox.alert('Houve um disturbio na força e não foi possível carregar os dados dos Jedis.');
         });
      } else 
         $('form#jedi-form input[type=text], form#jedi-form select').prop('readonly', false);

   }).fail(function(x, t, e){
      console.log(arguments);
      if (e == "Unauthorized")
         bootbox.alert('Você não foi autorizado jovem Padawan. Somente o token de um Mestre Jedi pode acessar os dados.', function(){
            $rootScope.$apply(function(){$location.path('/acessar')});
         });
      else
         bootbox.alert('Houve um disturbio na força e não foi possível carregar os dados dos Jedis.');
   });


   $scope.submitjedi = function() {
      var data = {
         name: $scope.jedi.name,
         planet: $scope.jedi.planet,
         master: $scope.jedi.master,
         status: $scope.jedi.status
      };

      if ($scope.jedi.id)
          BackAnd.update('jedi', $scope.jedi.id, data).done(function(d){
             bootbox.alert('Os dados foram salvos com sucesso.');
             console.log(d);
          }).fail(function(x, t, e){
             console.log(arguments);

             if (e == "Unauthorized")
                bootbox.alert('Você não foi autorizado jovem Padawan. Somente o token de um Mestre Jedi pode acessar os dados.', function(){
                   $rootScope.$apply(function(){$location.path('/acessar')});
                });
             else
                bootbox.alert('Houve um disturbio na força e não foi possível salvar os dados do Jedi.');


          });
      else
          BackAnd.create('jedi', data).done(function(d){
             bootbox.alert('Os dados foram salvos com sucesso.');
             console.log(d);
             if (d.__metadata && d.__metadata.id)
                $scope.jedi.id = d.__metadata.id;
          }).fail(function(x, t, e){
             console.log(arguments);
             if (e == "Unauthorized")
                bootbox.alert('Você não foi autorizado jovem Padawan. Somente o token de um Mestre Jedi pode acessar os dados.', function(){
                   $rootScope.$apply(function(){$location.path('/acessar')});
                });
             else
                bootbox.alert('Houve um disturbio na força e não foi possível salvar os dados do Jedi.');

          });
   };
}]);


app.controller('JediListController', [
   '$scope', '$rootScope', '$location', 'BackAnd',
   'bootbox', 'jQuery', function($scope, $rootScope, $location, BackAnd, bootbox, $){

   $scope.jedis = [];
   $scope.status = [];

   $scope.getStatus = function(id) {
      for( var i in $scope.status )
         if  ($scope.status[i].id == id)
            return $scope.status[i];
   }

   $scope.getJediIndex = function(id) {
      for( var i in $scope.jedis )
         if  ($scope.jedis[i].id == id)
            return i;
   }

   $scope.removeJedi = function(id) {
      var i = $scope.getJediIndex(id);
      if (i)
         BackAnd.delete('jedi', id).done(function(d){
            var jedi = $scope.jedis[i];
            if ( jedi.status == 6 || jedi.status == 7 )
               bootbox.alert('Eliminado o Sith, por um jovem Jedi ele foi.');
            else
               bootbox.alert('Muito bem jovem Sith, o Jedi foi eliminado.');

            $scope.jedis.splice( i, 1 );
            $scope.$digest();
         });
      else
          bootbox.alert('Encontrado não, o Jedi foi, a força usando.');
   }

   $scope.copyJedi = function(jedi) {
      BackAnd.create('jedi', {
         name: jedi.name,
         planet: jedi.planet,
         master: jedi.master,
         status: jedi.status
      }).done(function(d){
         if (d.__metadata && d.__metadata.id)
            $rootScope.$apply(function() {
               $location.path( "/jedi/"+d.__metadata.id );
            });
         else
             bootbox.alert('Não foi possível copiar os dados');
      }).fail(function(x, t, e){
         console.log(arguments);
         if (e == "Unauthorized")
            bootbox.alert('Você não foi autorizado jovem Padawan. Somente o token de um Mestre Jedi pode acessar os dados.', function(){
               $rootScope.$apply(function(){$location.path('/acessar')});
            });
         else
            bootbox.alert('Não foi possível carregar os dados. Detalhes: ' + e);

      });
   }

   BackAnd.list('status').done(function(d){
      console.log(d);
      $scope.status = d.data;
      $scope.$digest();
   }).fail(function(x, t, e){
      console.log(arguments);

      if (e == "Unauthorized")
         bootbox.alert('Você não foi autorizado jovem Padawan. Somente o token de um Mestre Jedi pode acessar os dados.', function(){
            $rootScope.$apply(function(){$location.path('/acessar')});
         });
      else
         bootbox.alert('Não foi possível carregar os dados. Detalhes: ' + e);

   });

   BackAnd.list('jedi').done(function(d){
      console.log(d);
      $scope.jedis = d.data;
      $scope.$digest();
   }).fail(function(x, t, e){
      console.log(arguments);
      if (e != "Unauthorized")
         bootbox.alert('Não foi possível carregar os dados. Detalhes: ' + e);
   });

}]);