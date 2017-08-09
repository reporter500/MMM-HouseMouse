"use strict";
/* global Module */

/* Magic Mirror
 * Module: MMM-HouseMouse
 *
 * By Robert Porter http://www.gamerzinc.com/
 * MIT Licensed.
 */

Module.register("MMM-HouseMouse", {

	defaults: {
		mqttServer: "mqtt://192.168.1.10",
		loadingText: "Loading MQTT Data...",
		topic: "",
		showTitle: false,
		title: "House Mouse",
		interval: 300000,
		postText: ""
	},

	start: function() {
		Log.info("Starting module: " + this.name);
		this.loaded = false;
		this.mqttVal = "";
		this.moving = false;
		this.sourceModule = "";
		this.destRegion = "";
		this.updateMqtt(this);
	},

	updateMqtt: function(self) {
		self.sendSocketNotification("MQTT_SERVER", { mqttServer: self.config.mqttServer, topic: self.config.topic });
		setTimeout(self.updateMqtt, self.config.interval, self);
	},

	getDom: function() {
		var wrapper = document.createElement("div");
		if (!this.loaded) {
			wrapper.innerHTML = this.config.loadingText;
			return wrapper;
		}

		if (this.config.showTitle) {
			var titleDiv = document.createElement("div");
			titleDiv.innerHTML = this.config.title;
			wrapper.appendChild(titleDiv);
		}

		var mqttDiv = document.createElement("div");
		mqttDiv.innerHTML = this.mqttVal.toString().concat(this.config.postText);
		wrapper.appendChild(mqttDiv);

		return wrapper;
	},

	socketNotificationReceived: function(notification, payload) {
		var positions = ["top_bar", "top_left", "top_center", "top_right", "upper_third", "middle_center", "lower_third", "bottom_left", "bottom_center", "bottom_right", "bottom_bar", "fullscreen_above", "fullscreen_below"];

		if (notification === "MQTT_DATA" && payload.topic === this.config.topic) {
			this.mqttVal = payload.data.toString();
			this.loaded = true;

			var cmd = this.mqttVal.split(" ");
      			var items = "";

			if(cmd[0] === "hide") {
				MM.getModules().withClass(cmd[1]).enumerate(function(module) {
        	        		module.hide(1000, function() {
                	        	//Module hidden.
					});
				});
			}
			if(cmd[0] === "show") {
				MM.getModules().withClass(cmd[1]).enumerate(function(module) {
					module.show(1000, function() {
						//Module hidden.
					});
				});
			}
			if(cmd[0] === "list") {
				if(cmd[1] === "mods") {
					MM.getModules().enumerate(function(module) {
						items = items + module.name + "</br>";
					});
				}
			        if(cmd[1] === "regions") {
					var regions = document.getElementsByClassName("region");
					for(var i=0;i<regions.length;i++) {
						items = items + regions[i].className + "</br>";
					}
                        	}

			}

      		if(cmd[0] === "move") {
				var dSource = document.getElementById(this.identifier);
				var dDest = "";
				var sClass = "region " + cmd[2].replace("_"," ");

				var dDests = document.getElementsByClassName(sClass);
				if(dDests.length === 0) {
					items = items + sClass + " not found";
				}else{
					items = items + sClass + " found " + dDests.length;
					dDest = dDests[0].getElementsByClassName("container");
					if(dDest.length > 0) {
						dDest[0].append(dSource);
					}
				}
			}

			this.mqttVal = this.mqttVal + "</br>" + items;
			this.updateDom();
		}

		if (notification === "ERROR") {
			this.sendNotification("SHOW_ALERT", payload);
		}
	}

});
