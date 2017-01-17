var BackAnd = (function($){

   function BackAnd() {
      this.config.set('api_url', 'https://api.backand.com/');
   };

   function Config() {
      this.items = {};
   };

   Config.prototype.set = function(k, v) {
      this.items[k] = v;
   };

   Config.prototype.merge = function(o) {
      this.items = $.extend({}, this.items, o);
   }

   Config.prototype.get = function(k) {
      return this.items[k];
   };

   BackAnd.prototype.config = new Config();

   /*
      /1/objects/{object name}         GET         Gets a list of all objects of type {object name}
      /1/objects/{object name}         POST        Creates an object of type {object name}
      /1/objects/{object name}/{id}    GET         Gets an object of type {object name} with ID {id}
      /1/objects/{object name}/{id}    PUT         Updates an object of type {object name} with ID {id}
      /1/objects/{object name}/{id}    DELETE      Deletes an object of type {object name} with ID {id}
   */

   BackAnd.prototype.list = function(o) {
      return this.rest('1/objects/'+o, {type:'GET'})
   };

   BackAnd.prototype.create = function(o, d) {
      return this.rest('1/objects/'+o, {type:'POST', data: JSON.stringify(d)})
   };

   BackAnd.prototype.get = function(o, i) {
      return this.rest('1/objects/'+o+'/'+i, {type:'GET'})
   };

   BackAnd.prototype.update = function(o, i, d) {
      return this.rest('1/objects/'+o+'/'+i, {type:'PUT',data: JSON.stringify(d)})
   };

   BackAnd.prototype.delete = function(o, i) {
      return this.rest('1/objects/'+o+'/'+i, {type:'DELETE'})
   };

   BackAnd.prototype.rest = function(uri, o) {
      var self = this;
      return $.ajax($.extend({}, {
          url: this.config.get('api_url') + uri,
          beforeSend: function (xhr) {
             console.log(self.config.get('access_token'));
             xhr.setRequestHeader('Authorization', 'bearer '+self.config.get('access_token'));
          }
       }, o));
   };



   return new BackAnd();

})(jQuery);