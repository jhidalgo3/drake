// Generated by CoffeeScript 1.6.3
(function() {
  var App, Backbone, Config, JSON, NProgress, Safe, SafeEntries, SafeEntry, SafeEntryView, Templates, el, reactive, sjcl, uid, _, _i, _len, _ref, _ref1, _ref2, _ref3, _ref4, _ref5,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  require("jquery");

  JSON = require("json");

  _ = require("underscore");

  Backbone = require("backbone");

  NProgress = require("nprogress");

  sjcl = require("sjcl");

  uid = require("uid");

  reactive = require("reactive");

  reactive.subscribe(function(obj, prop, fn) {
    return obj.on("change:" + prop, fn);
  });

  reactive.set(function(obj, prop) {
    return obj.set(prop);
  });

  reactive.get(function(obj, prop) {
    return obj.get(prop);
  });

  Config = {
    clientId: "671657367079.apps.googleusercontent.com"
  };

  Templates = {
    entry: document.querySelector(".entry")
  };

  _ref = _(Templates).values();
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    el = _ref[_i];
    el.remove();
  }

  SafeEntry = (function(_super) {
    __extends(SafeEntry, _super);

    function SafeEntry() {
      _ref1 = SafeEntry.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    return SafeEntry;

  })(Backbone.Model);

  SafeEntries = (function(_super) {
    __extends(SafeEntries, _super);

    function SafeEntries() {
      _ref2 = SafeEntries.__super__.constructor.apply(this, arguments);
      return _ref2;
    }

    SafeEntries.prototype.model = SafeEntry;

    return SafeEntries;

  })(Backbone.Collection);

  Safe = (function(_super) {
    __extends(Safe, _super);

    function Safe() {
      this.open = __bind(this.open, this);
      _ref3 = Safe.__super__.constructor.apply(this, arguments);
      return _ref3;
    }

    Safe.prototype.open = function(password) {
      var entries;
      try {
        entries = sjcl.decrypt(password, this.get("ciphertext"));
      } catch (_error) {
        return false;
      }
      this.set("entries", new SafeEntries(JSON.parse(entries)));
      return true;
    };

    return Safe;

  })(Backbone.Model);

  SafeEntryView = (function(_super) {
    __extends(SafeEntryView, _super);

    function SafeEntryView() {
      this.hidePasword = __bind(this.hidePasword, this);
      this.showPassword = __bind(this.showPassword, this);
      _ref4 = SafeEntryView.__super__.constructor.apply(this, arguments);
      return _ref4;
    }

    SafeEntryView.prototype.events = {
      "focus .password": "showPassword",
      "blur .password": "hidePasword"
    };

    SafeEntryView.prototype.showPassword = function() {
      this.$(".password").attr("type", "text");
      return this;
    };

    SafeEntryView.prototype.hidePasword = function() {
      this.$(".password").attr("type", "password");
      return this;
    };

    return SafeEntryView;

  })(Backbone.View);

  App = (function(_super) {
    __extends(App, _super);

    function App() {
      this.renderEntries = __bind(this.renderEntries, this);
      this.showEntries = __bind(this.showEntries, this);
      this.open = __bind(this.open, this);
      this.hideOpen = __bind(this.hideOpen, this);
      this.showOpen = __bind(this.showOpen, this);
      this.setSafeContent = __bind(this.setSafeContent, this);
      this.downloadSafe = __bind(this.downloadSafe, this);
      this.setSafeMetadata = __bind(this.setSafeMetadata, this);
      this.getSafeMetadata = __bind(this.getSafeMetadata, this);
      this.pickerCb = __bind(this.pickerCb, this);
      this.pick = __bind(this.pick, this);
      this.newSafe = __bind(this.newSafe, this);
      this.hideNew = __bind(this.hideNew, this);
      this.showNew = __bind(this.showNew, this);
      this.hideLoad = __bind(this.hideLoad, this);
      this.showLoad = __bind(this.showLoad, this);
      this.hideAuth = __bind(this.hideAuth, this);
      this.showAuth = __bind(this.showAuth, this);
      this.checkAuth = __bind(this.checkAuth, this);
      this.auth = __bind(this.auth, this);
      this.buildPicker = __bind(this.buildPicker, this);
      this.loadPicker = __bind(this.loadPicker, this);
      this.loadDrive = __bind(this.loadDrive, this);
      this.load = __bind(this.load, this);
      this.setupPlugins = __bind(this.setupPlugins, this);
      this.initialize = __bind(this.initialize, this);
      _ref5 = App.__super__.constructor.apply(this, arguments);
      return _ref5;
    }

    App.prototype.el = ".app";

    App.prototype.events = {
      "click .auth button": function() {
        return this.auth(false, this.checkAuth);
      },
      "click .load button.new": function() {
        this.hideLoad();
        return this.showNew();
      },
      "click .new button.ok": function() {
        var name, password;
        name = this.$(".new .name").val().trim();
        password = this.$(".new .password").val();
        if (!(name && password)) {
          return;
        }
        this.hideNew();
        return this.newSafe(name, password);
      },
      "click .new button.cancel": function() {
        this.hideNew();
        return this.showLoad();
      },
      "click .load button.pick": "pick",
      "click .open button": "open"
    };

    App.prototype.multipartBody = function(boundary, metadata, contentType, data) {
      return "--" + boundary + "\nContent-Type: application/json\n\n" + (JSON.stringify(metadata)) + "\n--" + boundary + "\nContent-Type: " + contentType + "\nContent-Transfer-Encoding: base64\n\n" + (btoa(data)) + "\n--" + boundary + "--";
    };

    App.prototype.initialize = function() {
      this.safe = new Safe();
      this.safe.on("change:entries", this.renderEntries);
      this.setupPlugins();
      return this;
    };

    App.prototype.setupPlugins = function() {
      $(document).ajaxStart(function() {
        return NProgress.start();
      }).ajaxStop(function() {
        return NProgress.done();
      });
      return this;
    };

    App.prototype.load = function() {
      NProgress.start();
      gapi.load("auth,client", this.loadDrive);
      return this;
    };

    App.prototype.loadDrive = function() {
      gapi.client.load("drive", "v2", this.loadPicker);
      return this;
    };

    App.prototype.loadPicker = function(cb) {
      google.load("picker", "1", {
        callback: this.buildPicker
      });
      return this;
    };

    App.prototype.buildPicker = function() {
      NProgress.done();
      this.picker = new google.picker.PickerBuilder().addView(google.picker.ViewId.DOCS).setCallback(this.pickerCb).build();
      this.auth(true, this.checkAuth);
      return this;
    };

    App.prototype.auth = function(immediate, cb) {
      gapi.auth.authorize({
        client_id: Config.clientId,
        scope: "https://www.googleapis.com/auth/drive",
        immediate: immediate
      }, cb);
      return this;
    };

    App.prototype.checkAuth = function(token) {
      if (token && !token.error) {
        this.hideAuth();
        this.showLoad();
      } else {
        this.showAuth();
      }
      return this;
    };

    App.prototype.showAuth = function() {
      this.$(".auth.section").show();
      return this;
    };

    App.prototype.hideAuth = function() {
      this.$(".auth.section").hide();
      return this;
    };

    App.prototype.showLoad = function() {
      return this.$(".load.section").show();
    };

    App.prototype.hideLoad = function() {
      return this.$(".load.section").hide();
    };

    App.prototype.showNew = function() {
      return this.$(".new.section").show();
    };

    App.prototype.hideNew = function() {
      return this.$(".new.section").hide();
    };

    App.prototype.newSafe = function(name, password) {
      var boundary, contentType, data, metadata, req, safe;
      safe = [
        {
          id: uid(20),
          title: "Example",
          url: "http://example.com",
          username: "username",
          password: "password"
        }
      ];
      boundary = uid();
      contentType = "application/json";
      metadata = {
        title: "" + name + ".safe",
        mimeType: contentType
      };
      data = sjcl.encrypt(password, JSON.stringify(safe));
      req = gapi.client.request({
        path: "/upload/drive/v2/files",
        method: "POST",
        params: {
          uploadType: "multipart"
        },
        headers: {
          "Content-Type": "multipart/mixed; boundary=" + boundary
        },
        body: this.multipartBody(boundary, metadata, contentType, data)
      });
      return req.execute(this.setSafeMetadata);
    };

    App.prototype.pick = function() {
      this.picker.setVisible(true);
      return this;
    };

    App.prototype.pickerCb = function(data) {
      var fileId;
      switch (data[google.picker.Response.ACTION]) {
        case google.picker.Action.PICKED:
          fileId = data[google.picker.Response.DOCUMENTS][0].id;
          this.getSafeMetadata(fileId);
      }
      return this;
    };

    App.prototype.getSafeMetadata = function(fileId) {
      var req;
      req = gapi.client.drive.files.get({
        fileId: fileId
      });
      req.execute(this.setSafeMetadata);
      return this;
    };

    App.prototype.setSafeMetadata = function(metadata) {
      this.safe.set(metadata);
      this.downloadSafe();
      return this;
    };

    App.prototype.downloadSafe = function() {
      console.log("Downloading " + (this.safe.get("downloadUrl")) + "...");
      $.ajax({
        url: this.safe.get("downloadUrl"),
        type: "get",
        headers: {
          "Authorization": "Bearer " + (gapi.auth.getToken().access_token)
        }
      }).done(this.setSafeContent).fail(function() {
        return console.error("Failed to download safe");
      });
      return this;
    };

    App.prototype.setSafeContent = function(resp) {
      this.safe.set("ciphertext", JSON.stringify(resp));
      this.hideLoad();
      this.showOpen();
      return this;
    };

    App.prototype.showOpen = function() {
      this.$(".open.section").show();
      return this;
    };

    App.prototype.hideOpen = function() {
      this.$(".open.section").hide();
      return this;
    };

    App.prototype.open = function() {
      var password;
      password = this.$(".open input[type=password]").val();
      if (this.safe.open(password)) {
        this.hideOpen();
        this.showEntries();
      }
      return this;
    };

    App.prototype.showEntries = function() {
      return this.$(".entries").show();
    };

    App.prototype.renderEntries = function() {
      var $entries;
      $entries = this.$(".entries ul");
      return this.safe.get("entries").each(function(entry) {
        return $entries.append(new SafeEntryView({
          model: entry,
          el: reactive(Templates.entry, entry).el
        }).el);
      });
    };

    return App;

  })(Backbone.View);

  module.exports = new App();

}).call(this);
