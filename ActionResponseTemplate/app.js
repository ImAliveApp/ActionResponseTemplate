var AliveClass = (function () {
    function AliveClass() {
        this.lastTime = 0;
        this.currentTime = 0;
        this.lastPlaySoundTime = 0;
    }
    AliveClass.prototype.onStart = function (handler, disabledPermissions) {
        this.lastPhoneEventOccurred = "";
        this.actionManager = handler.getActionManager();
        this.resourceManager = handler.getResourceManager();
        this.characterManager = handler.getCharacterManager();
        this.configurationManager = handler.getConfigurationManager();
        this.resourceManagerHelper = new ResourceManagerHelper(this.resourceManager);
        this.actionManager.move(0, this.configurationManager.getScreenHeight(), 0);
        this.resizeRatio = this.configurationManager.getMaximalResizeRatio();
        this.drawAndPlayRandomResourceByCategory(AgentConstants.CHARACTER_ACTIVATION);
        this.restManager = handler.getRestManager();
    };
    AliveClass.prototype.onTick = function (time) {
        if (!this.characterManager.isCharacterBeingDragged() && !this.configurationManager.isScreenOff())
            this.reactToSurfaceChange();
        this.currentTime = time;
    };
    AliveClass.prototype.reactToSurfaceChange = function () {
        var speed = -999;
        var category = "";
        var angle = this.configurationManager.getCurrentSurfaceAngle();
        var orientation = this.configurationManager.getScreenOrientation();
        if (orientation == AgentConstants.ORIENTATION_PORTRAIT) {
            if (angle > 10 && angle < 70) {
                speed = angle - 10;
                category = AgentConstants.ON_FALLING_RIGHT;
            }
            else if (angle > 290 && angle < 350) {
                speed = angle - 350;
                category = AgentConstants.ON_FALLING_LEFT;
            }
        }
        else {
            if (angle > 280 && angle < 340) {
                speed = angle - 280;
                category = AgentConstants.ON_FALLING_RIGHT;
            }
            else if (angle > 200 && angle < 260) {
                speed = angle - 260;
                category = AgentConstants.ON_FALLING_LEFT;
            }
            else if (angle > 100 && angle < 160) {
                speed = angle - 100;
                category = AgentConstants.ON_FALLING_RIGHT;
            }
            else if (angle > 20 && angle < 80) {
                speed = angle - 80;
                category = AgentConstants.ON_FALLING_LEFT;
            }
        }
        if (speed != -999) {
            this.drawRandomResourceByCategory(category);
            if (Math.random() > 0.8)
                this.playRandomResourceByCategory(category);
            this.actionManager.move(speed, 0, 250);
        }
        else {
            this.drawRandomResourceByCategory(AgentConstants.CHARACTER_ACTIVATION);
        }
    };
    AliveClass.prototype.onBackgroundTick = function (time) {
        this.onTick(time);
    };
    AliveClass.prototype.onPhoneEventOccurred = function (eventName, jsonedData) {
        this.drawAndPlayRandomResourceByCategory(eventName);
        if (eventName.indexOf("SCREEN_OFF") != -1) {
            this.restManager.verifyUserIdentity();
        }
    };
    AliveClass.prototype.onMove = function (oldX, oldY, newX, newY) {
        var Xdiff = Math.abs(oldX - newX);
        var Ydiff = Math.abs(oldY - newY);
        if (Xdiff > Ydiff) {
            if (newX > oldX) {
                this.drawAndPlayRandomResourceByCategory(AgentConstants.ON_MOVE_RIGHT);
            }
            else {
                this.drawAndPlayRandomResourceByCategory(AgentConstants.ON_MOVE_LEFT);
            }
        }
        else {
            if (newY > oldY) {
                this.drawAndPlayRandomResourceByCategory(AgentConstants.ON_MOVE_DOWN);
            }
            else {
                this.drawAndPlayRandomResourceByCategory(AgentConstants.ON_MOVE_UP);
            }
        }
    };
    AliveClass.prototype.onRelease = function (currentX, currentY) {
        this.drawAndPlayRandomResourceByCategory(AgentConstants.ON_RELEASE);
        var screenHeight = this.configurationManager.getScreenHeight();
        if (currentY < screenHeight - 50) {
            this.actionManager.move(0, screenHeight - 50, 250);
        }
    };
    AliveClass.prototype.onPick = function (currentX, currentY) {
        this.drawAndPlayRandomResourceByCategory(AgentConstants.ON_PICK);
    };
    AliveClass.prototype.onMenuItemSelected = function (viewName) {
    };
    AliveClass.prototype.onConfigureMenuItems = function (menuBuilder) {
    };
    AliveClass.prototype.onSpeechRecognitionResults = function (results) { };
    AliveClass.prototype.onResponseReceived = function (response) {
        this.actionManager.showMessage(response, "#000000", "#eeeeee", 2000);
        this.actionManager.showSystemMessage(JSON.stringify(response));
        this.restManager.postObject("http://f7817844.ngrok.io/api/validate", response);
    };
    AliveClass.prototype.onLocationReceived = function (location) {
        this.actionManager.showMessage("Location: Accuracy: " +
            location.getAccuracy().toString() +
            "| Bearing:" +
            location.getBearing().toString() +
            "| Latiture:" +
            location.getLatitude().toString() +
            "| Longitude:" +
            location.getLongitude().toString() +
            "| Speed:" +
            location.getSpeed().toString(), "#000000", "#eeeeee", 2000);
    };
    AliveClass.prototype.onUserActivityStateReceived = function (state) {
        this.actionManager.showMessage("UserActivity: State:" + state.getState() + " | Chance:" + state.getChance().toString(), "#000000", "#eeeeee", 2000);
    };
    AliveClass.prototype.onPlacesReceived = function (places) {
    };
    AliveClass.prototype.onHeadphoneStateReceived = function (state) {
    };
    AliveClass.prototype.onWeatherReceived = function (weather) {
        this.actionManager.showMessage("Weather: Description:" +
            weather.getWeatherDescription() +
            "DewPoint:" +
            weather.getDewPoint() +
            weather.getDewPoint().toString() +
            " | FeelsLikeTemp:" +
            weather.getFeelsLikeTemperature().toString() +
            " | Humidity:" +
            weather.getHumidity().toString() +
            " | Temp:" +
            weather.getTemperature().toString(), "#000000", "#eeeeee", 2000);
    };
    AliveClass.prototype.drawAndPlayRandomResourceByCategory = function (categoryName) {
        this.drawRandomResourceByCategory(categoryName);
        this.playRandomResourceByCategory(categoryName);
    };
    AliveClass.prototype.drawRandomResourceByCategory = function (categoryName) {
        var image = this.resourceManagerHelper.chooseRandomImage(categoryName);
        if (image != null) {
            this.actionManager.draw(image, this.resizeRatio, false);
        }
    };
    AliveClass.prototype.playRandomResourceByCategory = function (categoryName) {
        if (this.lastPhoneEventOccurred == categoryName && this.configurationManager.isSoundPlaying())
            return;
        this.lastPhoneEventOccurred = categoryName;
        var sound = this.resourceManagerHelper.chooseRandomSound(categoryName);
        if (sound != null) {
            this.lastPlaySoundTime = this.currentTime;
            this.actionManager.playSound(sound, false);
        }
    };
    AliveClass.prototype.onUserEventOccurred = function (eventName, jsonedData) {
    };
    return AliveClass;
}());
AliveClass.UNREGISTERED_CATEGORY_RESOURCE = -999;
//# sourceMappingURL=app.js.map