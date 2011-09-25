var assert = buster.assert;

buster.testCase("Backbone.Validation", {
    setUp: function() {
        var View = Backbone.View.extend({
            render: function() {
                var html = $('<input type="text" id="name" /><input type="text" id="age" />');
                this.$(this.el).append(html);

                Backbone.Validation.bind(this);
            }
        });

        var Model = Backbone.Model.extend({
            validation: {
                age: function(val) {
                    if (val === 0) {
                        return "Age is invalid";
                    }
                }
            }
        });

        this.model = new Model();
        this.view = new View({
            model: this.model
        });

        this.view.render();
        this.el = $(this.view.$("#age"));
    },

    "setting valid value": {
        setUp: function() {
            this.model.set({
                age: 1
            });
        },

        "should not have invalid class": function() {
            assert.isFalse(this.el.hasClass('invalid'));
        },

        "should not have data property with error message": function() {
            assert.isUndefined(this.el.data('error'));
        },

        "should return the model": function() {
            assert.equals(this.model.set({
                age: 1
            }), this.model);
        }
    },

    "setting invalid value": {
        setUp: function() {
            this.model.set({
                age: 0
            });
        },

        "should have invalid class": function() {
            assert.isTrue(this.el.hasClass('invalid'));
        },

        "should have data attribute with error message": function() {
            assert.equals(this.el.data('error'), 'Age is invalid');
        },

        "should return false": function() {
            assert.isFalse(this.model.set({
                age: 0
            }));
        }
    },
    
    "should ignore property without validator": function(){
        this.model.set({someProperty: true});
    }
});

buster.testCase("Backbone.Validation cutomize", {
    setUp: function() {
        Backbone.Validation.valid = this.spy();
        Backbone.Validation.invalid = this.spy();
        
        var View = Backbone.View.extend({
            render: function() {
                Backbone.Validation.bind(this);
            }
        });

        var Model = Backbone.Model.extend({
            validation: {
                age: function(val) {
                    if (val === 0) {
                        return "Age is invalid";
                    }
                }
            }
        });
        
        this.model = new Model();
        this.view = new View({
            model: this.model
        });

        this.view.render();
    },

    "should call overridden valid function": function() {
        this.model.set({
            age: 1
        });

        assert.called(Backbone.Validation.valid);
    },

    "should call overridden invalid function": function() {
        this.model.set({
            age: 0
        });

        assert.called(Backbone.Validation.invalid);
    }
});

buster.testCase("Backbone.Validation bind options", {
    setUp: function() {
        var that = this;
        this.valid = this.spy();
        this.invalid = this.spy();

        var View = Backbone.View.extend({
            render: function() {
                Backbone.Validation.bind(this, {
                    valid: that.valid,
                    invalid: that.invalid
                });
            }
        });

        var Model = Backbone.Model.extend({
            validation: {
                age: function(val) {
                    if (val === 0) {
                        return "Age is invalid";
                    }
                }
            }
        });

        this.model = new Model();
        this.view = new View({
            model: this.model
        });

        this.view.render();
    },

    "should call valid function passed with options": function() {
        this.model.set({
            age: 1
        });

        assert.called(this.valid);
    },
    
    "should call invalid function passed with options": function() {
        this.model.set({
            age: 0
        });

        assert.called(this.invalid);
    }
});

buster.testCase("Backbone.Validation builtin validators", {
    setUp: function() {
        var that = this;
        this.valid = this.spy();
        this.invalid = this.spy();

        var View = Backbone.View.extend({
            render: function() {
                Backbone.Validation.bind(this, {
                    valid: that.valid,
                    invalid: that.invalid
                });
            }
        });

        var Model = Backbone.Model.extend({});

        this.model = new Model();
        this.view = new View({
            model: this.model
        });

        this.view.render();
    },

    "required": {
        setUp: function() {
            this.model.validation = {
                name: {
                    required: true
                }
            };
        },

        "should call valid with correct arguments when property is valid": function() {
            this.model.set({
                name: 'valid'
            });

            assert.calledWith(this.valid, this.view, 'name');
        },

        "should call invalid with correct arguments when property is invalid": function() {
            this.model.set({
                name: ''
            });

            assert.calledWith(this.invalid, this.view, 'name', 'name is required');
        },

        "should override error msg when specified": function() {
            this.model.validation = {
                name: {
                    required: true,
                    msg: 'Error'
                }
            };
            this.model.set({
                name: ''
            });

            assert.calledWith(this.invalid, this.view, 'name', 'Error');
        },

        "empty string should be invalid": function() {
            this.model.set({
                name: ''
            });

            assert.called(this.invalid);
        },

        "blank string should be invalid": function() {
            this.model.set({
                name: '  '
            });

            assert.called(this.invalid);
        },

        "null should be invalid": function() {
            this.model.set({
                name: null
            });

            assert.called(this.invalid);
        },

        "undefined should be invalid": function() {
            this.model.set({
                name: undefined
            });

            assert.called(this.invalid);
        }
    },

    "min": {
        setUp: function() {
            this.model.validation = {
                age: {
                    min: 1
                }
            };
        },

        "setting value lower than min should be invalid": function() {
            this.model.set({
                age: 0
            });

            assert.called(this.invalid);
        },

        "setting value equal to min should be valid": function() {
            this.model.set({
                age: 1
            });

            assert.called(this.valid);
        },

        "should override error msg when specified": function() {
            this.model.validation = {
                age: {
                    min: 1,
                    msg: 'Error'
                }
            };
            this.model.set({
                age: 0
            });

            assert.calledWith(this.invalid, this.view, 'age', 'Error');
        }
    },

    "max": {
        setUp: function() {
            this.model.validation = {
                age: {
                    max: 10
                }
            };
        },

        "setting value higher than max should be invalid": function() {
            this.model.set({
                age: 11
            });

            assert.called(this.invalid);
        },

        "setting value equal to max should be valid": function() {
            this.model.set({
                age: 10
            });

            assert.called(this.valid);
        },

        "should override error msg when specified": function() {
            this.model.validation = {
                age: {
                    max: 1,
                    msg: 'Error'
                }
            };
            this.model.set({
                age: 2
            });

            assert.calledWith(this.invalid, this.view, 'age', 'Error');
        }
    },

    "min && max": {
        setUp: function() {
            this.model.validation = {
                age: {
                    min: 1,
                    max: 10
                }
            };
        },

        "setting value lower than min should be invalid": function() {
            this.model.set({
                age: 0
            });

            assert.called(this.invalid);
        },

        "setting value equal to min should be valid": function() {
            this.model.set({
                age: 1
            });

            assert.called(this.valid);
        },

        "setting value higher than max should be invalid": function() {
            this.model.set({
                age: 11
            });

            assert.called(this.invalid);
        },

        "setting value equal to max should be valid": function() {
            this.model.set({
                age: 10
            });

            assert.called(this.valid);
        }
    }
});