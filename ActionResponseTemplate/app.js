/// <reference path="Scripts/collections.ts" />
var AliveClass = (function () {
    function AliveClass() {
        this.lastTime = 0;
        this.currentTime = 0;
        this.lastPlaySoundTime = 0;
    }
    /**
     * This method gets called once when the character is being activated by the system.
     * @param handler An object that allows the code to get reference to the managers.
     * @param disabledPermissions A list of permissions that the user disabled.
     */
    AliveClass.prototype.onStart = function (handler, disabledPermissions) {
        this.lastPhoneEventOccurred = "";
        this.actionManager = handler.getActionManager();
        this.resourceManager = handler.getResourceManager();
        this.characterManager = handler.getCharacterManager();
        this.configurationMananger = handler.getConfigurationManager();
        this.resourceManagerHelper = new ResourceManagerHelper(this.resourceManager);
        this.actionManager.move(0, this.configurationMananger.getScreenHeight(), 0);
        this.resizeRatio = this.configurationMananger.getMaximalResizeRatio();
        this.drawAndPlayRandomResourceByCategory(AgentConstants.CHARACTER_ACTIVATION);
    };
    /**
     * This method gets called every 250 milliseconds by the system, any logic updates to the state of your character should occur here.
     * Note: onTick only gets called when the screen is ON.
     * @param time The current time (in milliseconds) on the device.
     */
    AliveClass.prototype.onTick = function (time) {
        if (!this.characterManager.isCharacterBeingDragged() && !this.configurationMananger.isScreenOff())
            this.reactToSurfaceChange();
        this.onTick(time);
        this.currentTime = time;
    };
    /**
     * This method will move your character on the screen depending on the surface angle of the phone.
     */
    AliveClass.prototype.reactToSurfaceChange = function () {
        var speed = -999;
        var category = "";
        var angle = this.configurationMananger.getCurrentSurfaceAngle();
        var orientation = this.configurationMananger.getScreenOrientation();
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
    /**
     * This method gets called by the system every 1 hour (may be in a different rate depending on the device).
     * Note: this method only gets called when the screen is OFF.
     * @param time The current time (in milliseconds) on the device.
     */
    AliveClass.prototype.onBackgroundTick = function (time) {
        this.onTick(time);
    };
    /**
     * This method gets called whenever a phone event (that you registered to) occur on the phone.
     * @param eventName The name of the event that occurred.
     * @param jsonedData The data of the event that occurred.
     * For example, SMS_RECEIVED event will hold data about who sent the SMS, and the SMS content.
     */
    AliveClass.prototype.onPhoneEventOccurred = function (eventName, jsonedData) {
        this.actionManager.showMessage(eventName + " received");
        this.drawAndPlayRandomResourceByCategory(eventName);
    };
    /**
     * This method gets called when the user is holding and moving the image of your character (on screen).
     * @param oldX The X coordinate in the last tick (Top left).
     * @param oldY The Y coordinate in the last tick (Top left).
     * @param newX The X coordinate in the current tick (Top left).
     * @param newY The Y coordinate in the current tick (Top left).
     */
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
    /**
     * This method gets called when the user raised his finger off the character image (on screen).
     * @param currentX The X coordinate of the character image on screen (Top left).
     * @param currentY The Y coordinate of the character image on the screen (Top left).
     */
    AliveClass.prototype.onRelease = function (currentX, currentY) {
        this.drawAndPlayRandomResourceByCategory(AgentConstants.ON_RELEASE);
        var screenHeight = this.configurationMananger.getScreenHeight();
        if (currentY < screenHeight - 50) {
            this.actionManager.move(0, screenHeight - 50, 250);
        }
    };
    /**
     * This method gets called whenever the user is holding the character image (on screen).
     * @param currentX The current X coordinate of the character image (Top left).
     * @param currentY The current Y coordinate of the character image (Top left).
     */
    AliveClass.prototype.onPick = function (currentX, currentY) {
        this.drawAndPlayRandomResourceByCategory(AgentConstants.ON_PICK);
    };
    /**
     * This method gets called whenever the user has pressed a view in the character menu.
     * @param viewName The 'Name' property of the view that was pressed.
     */
    AliveClass.prototype.onMenuItemSelected = function (viewName) {
    };
    /**
     * This method gets called once just before the onStart method and is where the character menu views are defined.
     * @param menuBuilder An object that fills the character menu.
     */
    AliveClass.prototype.onConfigureMenuItems = function (menuBuilder) {
    };
    /**
     * This method gets called when the system done processing the speech recognition input.
     * @param results A stringed version of what the user said.
     */
    AliveClass.prototype.onSpeechRecognitionResults = function (results) { };
    /**
     * This method is called when the system received a reply from a previously HTTP request made by the character.
     * @param response The reply body in a JSON form.
     */
    AliveClass.prototype.onResponseReceived = function (response) {
        this.actionManager.showMessage(response);
    };
    /**
     * This method gets called when the system done collecting information about the device location.
     * @param location The location information collected by the system.
     */
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
            location.getSpeed().toString());
    };
    /**
     * This method gets called when the system done collecting information about the user activity.
     * @param state Information about the user activity.
     * Possible states: IN_VEHICLE, ON_BICYCLE, ON_FOOT, STILL, TILTING, WALKING, RUNNING, UNKNOWN.
     */
    AliveClass.prototype.onUserActivityStateReceived = function (state) {
        this.actionManager.showMessage("UserActivity: State:" + state.getState() + " | Chance:" + state.getChance().toString());
    };
    /**
     * This method gets called when the system done collecting information about nearby places around the device.
     * @param places A list of places that are near the device.
     */
    AliveClass.prototype.onPlacesReceived = function (places) {
    };
    /**
     * This method gets called when the system done collecting information about the headphone state.
     * @param state 1 - the headphones are PLUGGED, 2 - the headphones are UNPLUGGED.
     */
    AliveClass.prototype.onHeadphoneStateReceived = function (state) {
    };
    /**
     * This method gets called when the system done collecting information about the weather in the location of the device.
     * @param weather Information about the weather.
     */
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
            weather.getTemperature().toString());
    };
    /**
     * This method will draw a random image to the screen and play a random sound, filtered by the category name.
     * @param categoryName The name of the category that will be used as a filter.
     */
    AliveClass.prototype.drawAndPlayRandomResourceByCategory = function (categoryName) {
        this.drawRandomResourceByCategory(categoryName);
        this.playRandomResourceByCategory(categoryName);
    };
    /**
     * This method will draw a random image to the screen from the character resources.
     * @param categoryName The name of the category that the image resource belongs to.
     */
    AliveClass.prototype.drawRandomResourceByCategory = function (categoryName) {
        var image = this.resourceManagerHelper.chooseRandomImage(categoryName);
        if (image != null) {
            this.actionManager.draw(image, this.resizeRatio, false);
        }
    };
    /**
     * This method will play a random sound from the character resources.
     * @param categoryName The name of the category that the sound resource belongs to.
     */
    AliveClass.prototype.playRandomResourceByCategory = function (categoryName) {
        if (this.lastPhoneEventOccurred == categoryName && this.configurationMananger.isSoundPlaying())
            return;
        this.lastPhoneEventOccurred = categoryName;
        var sound = this.resourceManagerHelper.chooseRandomSound(categoryName);
        if (sound != null) {
            this.lastPlaySoundTime = this.currentTime;
            this.actionManager.playSound(sound);
        }
    };
    return AliveClass;
}());
// ReSharper disable once InconsistentNaming
AliveClass.UNREGISTERED_CATEGORY_RESOURCE = -999;
//# sourceMappingURL=app.js.map