var Router = Backbone.Router.extend({

  routes: {
    '': 'index',
    'onblur': 'onblur'
  },

  index: function() {
    var basicModel = new BasicModel();
    this._render(new BasicView({ model: basicModel }));
    this._render2(new BasicView({ model: basicModel }));
  },
  onblur: function() {
    this._render(new OnBlurView({ model: new BasicModel() }));
    //this._render2(new OnBlurView({ model: new BasicModel() }));
  },

  _render: function(view){
    if(this.currentView){
      Backbone.Validation.unbind(view);
      this.currentView.remove();
    }
    this.currentView = view;
    $('#example').html(view.render().el);
  },

  _render2: function(view){
    if(this.currentView2){
      Backbone.Validation.unbind(view);
      this.currentView2.remove();
    }
    this.currentView2 = view;
    $('#example2').html(view.render().el);
  }

});

$(function(){
  new Router();
  Backbone.history.start({root: '/projects/backbone-validation/examples/'});
});