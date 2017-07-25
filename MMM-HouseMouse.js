'use strict';
/* global Module */

/* Magic Mirror
 * Module: MMM-HouseMouse
 *
 * By Robert Porter http://www.gamerzinc.com/
 * MIT Licensed.
 */

Module.register('MMM-HouseMouse', {

  defaults: {
    mqttServer: 'mqtt://192.168.1.10',
    loadingText: 'Loading MQTT Data...',
    topic: '',
    showTitle: false,
    title: 'House Mouse',
    interval: 300000,
    postText: '',
    modules: {}
  },

  start: function() {
    Log.info('Starting module: ' + this.name);
    this.loaded = false;
    this.mqttVal = '';
    this.updateMqtt(this);
  },

  updateMqtt: function(self) {
    self.sendSocketNotification('MQTT_SERVER', { mqttServer: self.config.mqttServer, topic: self.config.topic });
    setTimeout(self.updateMqtt, self.config.interval, self);
  },

  getDom: function() {
    var wrapper = document.createElement('div');

    if (!this.loaded) {
      wrapper.innerHTML = this.config.loadingText;
      return wrapper;
    }

    if (this.config.showTitle) {
      var titleDiv = document.createElement('div');
      titleDiv.innerHTML = this.config.title;
      wrapper.appendChild(titleDiv);
    }

    var mqttDiv = document.createElement('div');
    mqttDiv.innerHTML = this.mqttVal.toString().concat(this.config.postText);
    wrapper.appendChild(mqttDiv);

    return wrapper;
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === 'MQTT_DATA' && payload.topic === this.config.topic) {
      this.mqttVal = payload.data.toString();
      this.loaded = true;
      this.updateDom();
    }

    if (notification === 'ERROR') {
      this.sendNotification('SHOW_ALERT', payload);
    }
  }

});
