"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _apolloLinkWs = require("apollo-link-ws");

var _apolloCacheInmemory = require("apollo-cache-inmemory");

var _apolloClient = _interopRequireDefault(require("apollo-client"));

var _graphqlTag = _interopRequireDefault(require("graphql-tag"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _templateObject() {
  var data = _taggedTemplateLiteral(["subscription liveConsumption($homeId: ID!) {\n  liveMeasurement(homeId:$homeId)\n    {\n      timestamp\n      power\n      powerProduction\n      accumulatedConsumption\n      accumulatedProduction\n      accumulatedCost\n      accumulatedReward\n      currency\n      minPower\n      averagePower\n      maxPower\n      minPowerProduction\n      maxPowerProduction\n      lastMeterConsumption\n      lastMeterProduction\n      voltagePhase1\n      voltagePhase2\n      voltagePhase3\n      currentPhase1\n      currentPhase2\n      currentPhase3\n    }\n  }"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var ENDPOINT = "wss://api.tibber.com/v1-beta/gql/subscriptions";
var CONSUMPTION_QUERY = (0, _graphqlTag["default"])(_templateObject());

var tibberConnector = function tibberConnector(options) {
  var _this = this;

  _classCallCheck(this, tibberConnector);

  this.start = function () {
    _this.homeId.forEach(function (id) {
      _this.client.subscribe({
        query: CONSUMPTION_QUERY,
        variables: {
          homeId: id
        }
      }).subscribe({
        next: function next(data) {
          _this.onData(data, id);
        },
        error: function error(err) {
          _this.onError(err, id);
        }
      });
    });
  };

  var token = options.token,
      homeId = options.homeId,
      onData = options.onData,
      ws = options.ws,
      onError = options.onError;

  if (!token) {
    console.log("No token provided. Computer says no.");
    throw new Error("No token supplied");
  }

  if (!homeId) {
    console.log("No homeId provided. Computer says no.");
    throw new Error("No homeID supplied");
  }

  this.onData = onData ? onData : function (data) {
    return console.log('Data', data);
  };
  this.onError = onError ? onError : function (error) {
    return console.log('Error', error);
  };

  if (Array.isArray(homeId)) {
    this.homeId = _toConsumableArray(homeId);
  } else {
    this.homeId = [homeId];
  }

  var linkOptions = {
    uri: ENDPOINT,
    options: {
      reconnect: true,
      connectionParams: function connectionParams() {
        return {
          token: token
        };
      }
    }
  };

  if (ws) {
    linkOptions.webSocketImpl = ws;
  }

  this.link = new _apolloLinkWs.WebSocketLink(linkOptions);
  this.client = new _apolloClient["default"]({
    link: this.link,
    cache: new _apolloCacheInmemory.InMemoryCache()
  });
};

module.exports = tibberConnector;
var _default = tibberConnector;
exports["default"] = _default;