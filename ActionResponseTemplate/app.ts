/// <reference path="Scripts/collections.ts" />

class AliveClass implements IAliveAgent {

    // ReSharper disable once InconsistentNaming
    private static UNREGISTERED_CATEGORY_RESOURCE = -999;

    private lastPhoneEventOccurred: string;

    private actionManager: IActionManager;
    private resourceManager: IResourceManager;
    private characterManager: ICharacterManager;
    private configurationManager: IConfigurationManager;
    private managersHandler: IManagersHandler;

    private restManager: IRestManager

    private resourceManagerHelper: ResourceManagerHelper;

    private lastVisabilityChangeTime: number;
    private visible: boolean;
    private deadPainted: boolean;
    private lastTime: number;
    private lastFallLeftTime: number;
    private lastFallRightTime: number;
    private currentTime: number;
    private lastPlaySoundTime: number;
    private resizeRatio: number;

    public constructor() {
        this.lastTime = 0;
        this.currentTime = 0;
        this.lastPlaySoundTime = 0;
    }

    /**
     * This method gets called once when the character is being activated by the system.
     * @param handler An object that allows the code to get reference to the managers.
     * @param disabledPermissions A list of permissions that the user disabled.
     */
    onStart(handler: IManagersHandler, disabledPermissions: string[]): void {
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
    }

    /**
     * This method gets called every 250 milliseconds by the system, any logic updates to the state of your character should occur here.
     * Note: onTick only gets called when the screen is ON.
     * @param time The current time (in milliseconds) on the device.
     */
    onTick(time: number): void {
        if (!this.characterManager.isCharacterBeingDragged() && !this.configurationManager.isScreenOff())
            this.reactToSurfaceChange();

        this.currentTime = time;
    }

    /**
     * This method will move your character on the screen depending on the surface angle of the phone.
     */
    reactToSurfaceChange(): void {
        let speed = -999;
        let category = "";
        let angle = this.configurationManager.getCurrentSurfaceAngle();
        let orientation = this.configurationManager.getScreenOrientation();
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
    }

    /**
     * This method gets called by the system every 1 hour (may be in a different rate depending on the device).
     * Note: this method only gets called when the screen is OFF.
     * @param time The current time (in milliseconds) on the device.
     */
    onBackgroundTick(time: number) {
        this.onTick(time);
    }

    /**
     * This method gets called whenever a phone event (that you registered to) occur on the phone.
     * @param eventName The name of the event that occurred.
     * @param jsonedData The data of the event that occurred.
     * For example, SMS_RECEIVED event will hold data about who sent the SMS, and the SMS content.
     */
    onPhoneEventOccurred(eventName: string, jsonedData: string): void {
        this.drawAndPlayRandomResourceByCategory(eventName);
        if (eventName.indexOf("SCREEN_OFF") != -1)
        {
            this.restManager.verifyUserIdentity();
        }
    }

    /**
     * This method gets called when the user is holding and moving the image of your character (on screen).
     * @param oldX The X coordinate in the last tick (Top left).
     * @param oldY The Y coordinate in the last tick (Top left).
     * @param newX The X coordinate in the current tick (Top left).
     * @param newY The Y coordinate in the current tick (Top left).
     */
    onMove(oldX: number, oldY: number, newX: number, newY: number): void {
        let Xdiff = Math.abs(oldX - newX);
        let Ydiff = Math.abs(oldY - newY);
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
    }

    /**
     * This method gets called when the user raised his finger off the character image (on screen).
     * @param currentX The X coordinate of the character image on screen (Top left).
     * @param currentY The Y coordinate of the character image on the screen (Top left).
     */
    onRelease(currentX: number, currentY: number): void {
        this.drawAndPlayRandomResourceByCategory(AgentConstants.ON_RELEASE);
        let screenHeight = this.configurationManager.getScreenHeight();
        if (currentY < screenHeight - 50) {
            this.actionManager.move(0, screenHeight - 50, 250);
        }
    }

    /**
     * This method gets called whenever the user is holding the character image (on screen).
     * @param currentX The current X coordinate of the character image (Top left).
     * @param currentY The current Y coordinate of the character image (Top left).
     */
    onPick(currentX: number, currentY: number): void {
        this.drawAndPlayRandomResourceByCategory(AgentConstants.ON_PICK);
    }

    /**
     * This method gets called whenever the user has pressed a view in the character menu.
     * @param viewName The 'Name' property of the view that was pressed.
     */
    onMenuItemSelected(viewName: string): void {

    }

    /**
     * This method gets called once just before the onStart method and is where the character menu views are defined.
     * @param menuBuilder An object that fills the character menu.
     */
    onConfigureMenuItems(menuBuilder: IMenuBuilder): void {

    }

    /**
     * This method gets called when the system done processing the speech recognition input.
     * @param results A stringed version of what the user said.
     */
    onSpeechRecognitionResults(results: string): void { }

    /**
     * This method is called when the system received a reply from a previously HTTP request made by the character.
     * @param response The reply body in a JSON form.
     */
    onResponseReceived(response: string): void {
        this.actionManager.showMessage(response, "#000000", "#eeeeee", 2000);
        this.actionManager.showSystemMessage(JSON.stringify(response));
        this.restManager.postObject("http://f7817844.ngrok.io/api/validate", response);
    }

    /**
     * This method gets called when the system done collecting information about the device location.
     * @param location The location information collected by the system.
     */
    onLocationReceived(location: IAliveLocation): void {
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
    }

    /**
     * This method gets called when the system done collecting information about the user activity.
     * @param state Information about the user activity.
     * Possible states: IN_VEHICLE, ON_BICYCLE, ON_FOOT, STILL, TILTING, WALKING, RUNNING, UNKNOWN.
     */
    onUserActivityStateReceived(state: IAliveUserActivity) {
        this.actionManager.showMessage("UserActivity: State:" + state.getState() + " | Chance:" + state.getChance().toString(), "#000000", "#eeeeee", 2000);
    }

    /**
     * This method gets called when the system done collecting information about nearby places around the device.
     * @param places A list of places that are near the device.
     */
    onPlacesReceived(places: IAlivePlaceLikelihood[]): void {

    }

    /**
     * This method gets called when the system done collecting information about the headphone state.
     * @param state 1 - the headphones are PLUGGED, 2 - the headphones are UNPLUGGED.
     */
    onHeadphoneStateReceived(state: number) {

    }

    /**
     * This method gets called when the system done collecting information about the weather in the location of the device.
     * @param weather Information about the weather.
     */
    onWeatherReceived(weather: IAliveWeather) {
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
    }

    /**
     * This method will draw a random image to the screen and play a random sound, filtered by the category name.
     * @param categoryName The name of the category that will be used as a filter.
     */
    drawAndPlayRandomResourceByCategory(categoryName: string): void {
        this.drawRandomResourceByCategory(categoryName);
        this.playRandomResourceByCategory(categoryName);
    }

    /**
     * This method will draw a random image to the screen from the character resources.
     * @param categoryName The name of the category that the image resource belongs to.
     */
    drawRandomResourceByCategory(categoryName: string): void {
        let image = this.resourceManagerHelper.chooseRandomImage(categoryName);
        if (image != null) {
            this.actionManager.draw(image, this.resizeRatio, false);
        }
    }

    /**
     * This method will play a random sound from the character resources.
     * @param categoryName The name of the category that the sound resource belongs to.
     */
    playRandomResourceByCategory(categoryName: string): void {
        if (this.lastPhoneEventOccurred == categoryName && this.configurationManager.isSoundPlaying())
            return;

        this.lastPhoneEventOccurred = categoryName;
        let sound = this.resourceManagerHelper.chooseRandomSound(categoryName);
        if (sound != null) {
            this.lastPlaySoundTime = this.currentTime;
            this.actionManager.playSound(sound, false);
        }
    }
}