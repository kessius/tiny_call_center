(function() {
  var Agent, Call, CallCollection, CallView, CallsView, Collection, DispositionView, Model, OriginateView, Ribbon, StateView, StatusView, TransferView, View, divmod, formatInterval, p, sprintTime,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __slice = Array.prototype.slice;

  p = function() {
    var _ref;
    return (_ref = window.console) != null ? _ref.debug.apply(_ref, arguments) : void 0;
  };

  formatInterval = function(start) {
    var hours, minutes, rest, seconds, total, _ref, _ref2;
    total = parseInt((Date.now() - start) / 1000, 10);
    _ref = divmod(total, 60 * 60), hours = _ref[0], rest = _ref[1];
    _ref2 = divmod(rest, 60), minutes = _ref2[0], seconds = _ref2[1];
    return sprintTime(hours, minutes, seconds);
  };

  sprintTime = function() {
    var parts;
    parts = _.map(arguments, function(arg) {
      if (arg > 9) {
        return parseInt(arg, 10).toString();
      } else {
        return "0" + (parseInt(arg, 10));
      }
    });
    return parts.join(":");
  };

  divmod = function(num1, num2) {
    return [num1 / num2, num1 % num2];
  };

  View = (function(_super) {

    __extends(View, _super);

    function View() {
      View.__super__.constructor.apply(this, arguments);
    }

    View.prototype.show = function() {
      return $(this.el).show();
    };

    View.prototype.hide = function() {
      return $(this.el).hide();
    };

    return View;

  })(Backbone.View);

  Model = (function(_super) {

    __extends(Model, _super);

    function Model() {
      Model.__super__.constructor.apply(this, arguments);
    }

    return Model;

  })(Backbone.Model);

  Collection = (function(_super) {

    __extends(Collection, _super);

    function Collection() {
      Collection.__super__.constructor.apply(this, arguments);
    }

    return Collection;

  })(Backbone.Collection);

  Agent = (function(_super) {

    __extends(Agent, _super);

    function Agent() {
      Agent.__super__.constructor.apply(this, arguments);
    }

    Agent.prototype.url = 'Agent';

    return Agent;

  })(Model);

  Call = (function(_super) {

    __extends(Call, _super);

    function Call() {
      Call.__super__.constructor.apply(this, arguments);
    }

    Call.prototype.url = 'Call';

    return Call;

  })(Model);

  CallCollection = (function(_super) {

    __extends(CallCollection, _super);

    function CallCollection() {
      CallCollection.__super__.constructor.apply(this, arguments);
    }

    CallCollection.prototype.model = Call;

    return CallCollection;

  })(Collection);

  CallsView = (function(_super) {

    __extends(CallsView, _super);

    function CallsView() {
      CallsView.__super__.constructor.apply(this, arguments);
    }

    CallsView.prototype.tagName = 'div';

    CallsView.prototype.el = '#calls';

    CallsView.prototype.initialize = function() {
      var _this = this;
      this.calls = this.options.calls;
      this.calls.bind('add', this.addCall, this);
      this.calls.bind('remove', this.removeCall, this);
      this.calls.bind('reset', (function() {
        return p('reset Calls');
      }));
      this.calls.bind('change', this.changeCall, this);
      this.calls.bind('destroy', (function() {
        return p('destroy Calls');
      }));
      this.calls.bind('error', (function() {
        return p('error Calls');
      }));
      $('#transfer').hide();
      return this.callTimer = setInterval(function() {
        return _this.updateCallTimer();
      }, 1000);
    };

    CallsView.prototype.updateCallTimer = function() {
      return this.calls.each(function(call) {
        return call.callView.updateCallTimer();
      });
    };

    CallsView.prototype.addCall = function(call, calls, options) {
      p.apply(null, ['add Call'].concat(__slice.call(arguments)));
      call.callView = new CallView({
        ribbon: this.options.ribbon,
        call: call
      });
      return $(this.el).append(call.callView.render().el);
    };

    CallsView.prototype.changeCall = function(call, calls, options) {
      return p.apply(null, ['change Call'].concat(__slice.call(arguments)));
    };

    CallsView.prototype.removeCall = function(call, calls, options) {
      p.apply(null, ['remove Call'].concat(__slice.call(arguments)));
      call.callView.remove();
      return delete call.callView;
    };

    return CallsView;

  })(View);

  CallView = (function(_super) {

    __extends(CallView, _super);

    function CallView() {
      CallView.__super__.constructor.apply(this, arguments);
    }

    CallView.prototype.tagName = 'div';

    CallView.prototype.className = 'call';

    CallView.prototype.events = {
      'click .transfer': 'transfer',
      'click .hangup': 'hangup',
      'click .dtmf': 'dtmf'
    };

    CallView.prototype.template = _.template("<div class=\"call-control\">\n  <a href=\"#\" title=\"Transfer\" class=\"transfer\">&#x27f9;</a>\n  <a href=\"#\" title=\"Dialpad\" class=\"dtmf\">&#x266f;</a>\n  <a href=\"#\" title=\"Hang up\" class=\"hangup\">&#x2715;</a>\n</div>\n<div class=\"call-data\">\n  <span class=\"name-and-number\"><%- nameAndNumber %></span>\n  <span class=\"answered\"><%- answered %></span>\n</div>\n<form class=\"dtmf-form\">\n  <input type=\"dtmf\" class=\"dtmf-input\" />\n</form>");

    CallView.prototype.initialize = function() {
      this.call = this.options.call;
      this.call.bind('change', this.render, this);
      this.localCallStart = new Date(Date.now());
      this.serverCallStart = new Date(this.call.get('created_epoch') * 1000);
      if (this.localCallStart.getTime() < this.serverCallStart.getTime()) {
        return this.callStart = this.localCallStart;
      } else {
        return this.callStart = this.serverCallStart;
      }
    };

    CallView.prototype.updateCallTimer = function() {
      return this.$('.answered').text("" + (this.callStart.toLocaleTimeString()) + " " + (formatInterval(this.callStart)));
    };

    CallView.prototype.transfer = function() {
      var view;
      view = new TransferView({
        ribbon: this.options.ribbon,
        call: this.call
      });
      return view.render();
    };

    CallView.prototype.dtmf = function() {
      var form, input, valueLen,
        _this = this;
      form = this.$('.dtmf-form');
      input = $('.dtmf-input', form);
      valueLen = input.val().length;
      form.bind('input', function(event) {
        var newValueLen, value;
        value = input.val();
        newValueLen = value.length;
        if (newValueLen > valueLen) {
          _this.options.ribbon.sendMessage({
            body: {
              url: 'DTMF',
              uuid: _this.call.get('uuid'),
              tone: value.slice(valueLen, newValueLen)
            }
          });
        } else if (newValueLen === valueLen) {
          p('no input');
        } else if (newValueLen < valueLen) {
          p('deletion');
        }
        return valueLen = newValueLen;
      });
      return form.slideToggle('fast', function() {
        if (form.is(':visible')) {
          input.val('');
          return input.focus();
        }
      });
    };

    CallView.prototype.hangup = function() {
      return this.options.ribbon.sendMessage({
        body: {
          url: 'Hangup',
          uuid: this.call.get('uuid'),
          cause: "Ribbon hangup"
        }
      });
    };

    CallView.prototype.render = function() {
      $(this.el).html(this.template({
        nameAndNumber: this.call.get('display_name_and_number'),
        answered: this.call.get('callstate')
      }));
      return this;
    };

    return CallView;

  })(View);

  DispositionView = (function(_super) {

    __extends(DispositionView, _super);

    function DispositionView() {
      DispositionView.__super__.constructor.apply(this, arguments);
    }

    DispositionView.prototype.tagName = 'form';

    DispositionView.prototype.el = '#disposition';

    DispositionView.prototype.initialize = function() {
      return this.hide();
    };

    return DispositionView;

  })(View);

  TransferView = (function(_super) {

    __extends(TransferView, _super);

    function TransferView() {
      TransferView.__super__.constructor.apply(this, arguments);
    }

    TransferView.prototype.tagName = 'form';

    TransferView.prototype.el = '#transfer';

    TransferView.prototype.events = {
      'click .transfer': 'transfer',
      'click .close': 'close'
    };

    TransferView.prototype.initialize = function() {
      return this.hide();
    };

    TransferView.prototype.render = function() {
      return this.show();
    };

    TransferView.prototype.transfer = function() {
      this.options.ribbon.sendMessage({
        body: {
          url: 'Transfer',
          dest: this.$('#transfer-dest').val(),
          uuid: this.options.call.get('call_uuid')
        }
      });
      return this.hide();
    };

    TransferView.prototype.close = function() {
      return this.hide();
    };

    return TransferView;

  })(View);

  OriginateView = (function(_super) {

    __extends(OriginateView, _super);

    function OriginateView() {
      OriginateView.__super__.constructor.apply(this, arguments);
    }

    OriginateView.prototype.tagName = 'form';

    OriginateView.prototype.el = '#originate-form';

    OriginateView.prototype.events = {
      'click .close': 'hide',
      'click .call': 'call'
    };

    OriginateView.prototype.initialize = function() {
      return this.hide();
    };

    OriginateView.prototype.call = function() {
      this.options.ribbon.sendMessage({
        body: {
          url: 'Originate',
          dest: this.$('#originate-dest').val(),
          identifier: $('#originate-identifier').val()
        }
      });
      return this.hide();
    };

    return OriginateView;

  })(View);

  StatusView = (function(_super) {

    __extends(StatusView, _super);

    function StatusView() {
      StatusView.__super__.constructor.apply(this, arguments);
    }

    StatusView.prototype.tagName = 'ul';

    StatusView.prototype.el = '#status';

    StatusView.prototype.events = {
      'click .available': 'available',
      'click .on_break': 'onBreak',
      'click .logged_out': 'loggedOut'
    };

    StatusView.prototype.statusMap = {
      'available': '.available',
      'available (on demand)': '.available',
      'on break': '.on_break',
      'logged out': '.logged_out'
    };

    StatusView.prototype.initialize = function() {
      return this.options.agent.bind('change:status', this.render, this);
    };

    StatusView.prototype.render = function() {
      var klass, status;
      status = this.options.agent.get('status');
      klass = this.statusMap[status.toLowerCase()];
      this.$('button').removeClass('active');
      this.$(klass).addClass('active');
      return this;
    };

    StatusView.prototype.available = function() {
      return this.options.agent.save({
        status: 'Available'
      });
    };

    StatusView.prototype.onBreak = function() {
      return this.options.agent.save({
        status: 'On Break'
      });
    };

    StatusView.prototype.loggedOut = function() {
      return this.options.agent.save({
        status: 'Logged Out'
      });
    };

    return StatusView;

  })(View);

  StateView = (function(_super) {

    __extends(StateView, _super);

    function StateView() {
      StateView.__super__.constructor.apply(this, arguments);
    }

    StateView.prototype.tagName = 'ul';

    StateView.prototype.el = '#state';

    StateView.prototype.events = {
      'click .Waiting': 'waiting',
      'click .In_a_queue_call': 'inQueue',
      'click .Idle': 'idle'
    };

    StateView.prototype.initialize = function() {
      return this.options.agent.bind('change:state', this.render, this);
    };

    StateView.prototype.render = function() {
      var klass, state;
      state = this.options.agent.get('state');
      klass = "." + state.replace(/\s+/g, "_");
      this.$('button').removeClass('active');
      this.$(klass).addClass('active');
      return this;
    };

    StateView.prototype.waiting = function() {
      return this.options.agent.save({
        state: 'Waiting'
      });
    };

    StateView.prototype.inQueue = function() {
      return this.options.agent.save({
        state: 'In a queue call'
      });
    };

    StateView.prototype.idle = function() {
      return this.options.agent.save({
        state: 'Idle'
      });
    };

    return StateView;

  })(View);

  Ribbon = (function(_super) {

    __extends(Ribbon, _super);

    function Ribbon() {
      Ribbon.__super__.constructor.apply(this, arguments);
    }

    Ribbon.prototype.tagName = 'div';

    Ribbon.prototype.el = '#ribbon';

    Ribbon.prototype.events = {
      'click #originate': 'showOriginate'
    };

    Ribbon.prototype.initialize = function() {
      _.bindAll(this, 'render');
      this.agent = this.options.agent;
      this.calls = this.options.calls;
      this.agent.bind('change', this.render);
      this.statusView = new StatusView({
        agent: this.agent
      });
      this.stateView = new StateView({
        agent: this.agent
      });
      this.dispositionView = new DispositionView({
        agent: this.agent
      });
      this.callsView = new CallsView({
        agent: this.agent,
        calls: this.calls,
        ribbon: this
      });
      return this.originateView = new OriginateView({
        ribbon: this
      });
    };

    Ribbon.prototype.render = function() {
      this.dispositionView.render();
      return this;
    };

    Ribbon.prototype.showOriginate = function() {
      return this.originateView.show();
    };

    Ribbon.prototype.sendMessage = function() {
      var _ref;
      return (_ref = this.options.socket).say.apply(_ref, arguments);
    };

    return Ribbon;

  })(View);

  window.Ribbon = Ribbon;

  $(function() {
    var agent, calls, height, ribbon, socket, width, _ref;
    calls = new CallCollection();
    agent = new Agent({
      name: $('#agent_name').text(),
      extension: $('#agent_ext').text()
    });
    ribbon = new Ribbon({
      agent: agent,
      calls: calls
    });
    socket = new Rubyists.BackboneWebSocket({
      server: $('#server').text(),
      onopen: function() {
        ribbon.options.socket = socket;
        agent.fetch({
          success: (function() {
            return p.apply(null, ['Agent success'].concat(__slice.call(arguments)));
          }),
          error: (function() {
            return p.apply(null, ['Agent error'].concat(__slice.call(arguments)));
          })
        });
        return ribbon.render();
      }
    });
    Backbone.sync = socket.sync();
    socket.listen('pg', function(msg) {
      var call;
      switch (msg.kind) {
        case 'agent_update':
          return agent.set(msg.body);
        case 'call_create':
          msg.body.id = msg.body.uuid;
          return calls.create(msg.body);
        case 'call_update':
          return calls.get(msg.body.uuid).set(msg.body);
        case 'call_delete':
          call = calls.get(msg.body.uuid);
          return calls.remove(call);
      }
    });
    setTimeout(function() {
      return $(window).resize(function(event) {
        localStorage.setItem('agent.bar.width', top.outerWidth);
        localStorage.setItem('agent.bar.height', top.outerHeight);
        return true;
      });
    }, 500);
    _ref = [localStorage.getItem('agent.bar.width'), localStorage.getItem('agent.bar.height')], width = _ref[0], height = _ref[1];
    if (width && height) return top.resizeTo(width, height);
  });

}).call(this);
