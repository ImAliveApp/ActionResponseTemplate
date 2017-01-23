/// <reference path="Scripts/collections.ts" />

class AliveClass implements IAliveAgent {

    // ReSharper disable once InconsistentNaming
    private static UNREGISTERED_CATEGORY_RESOURCE = -999;

    private actionManager: IActionManager;
    private resourceManager: IResourceManager;
    private databaseManager: IDatabaseManager;
    private characterManager: ICharacterManager;
    private tamagochyManager: IMenuManager;
    private configurationMananger: IConfigurationManager;
    private restManager: IRestManager;
    private managersHandler: IManagersHandler;
    private awarenessManager: IAwarenessManager;

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

    onTick(time: number): void {
        if (!this.characterManager.isCharacterBeingDragged() && !this.configurationMananger.getIsScreenOff())
            this.reactToSurfaceChange();

        this.onTick(time);

        this.currentTime = time;
    }

    reactToSurfaceChange(): void {
        let speed = -999;
        let category = "";
        let angle = this.configurationMananger.getCurrentSurfaceAngle();
        let orientation = this.configurationMananger.getScreenOrientation();
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

    onBackgroundTick(time: number) {
        this.onTick(time);
    }

    onStart(handler: IManagersHandler, disabledPermissions: string[]): void {
        this.actionManager = handler.getActionManager();
        this.resourceManager = handler.getResourceManager();
        this.databaseManager = handler.getDatabaseManager();
        this.characterManager = handler.getCharacterManager();
        this.tamagochyManager = handler.getMenuManager();
        this.configurationMananger = handler.getConfigurationManager();
        this.restManager = handler.getRestManager();
        this.awarenessManager = handler.getAwarenessManager();
        this.resourceManagerHelper = new ResourceManagerHelper(this.resourceManager);
        this.actionManager.move(0, this.configurationMananger.getScreenHeight(), 0);
        this.resizeRatio = this.configurationMananger.getMaximalResizeRatio();
        this.drawAndPlayRandomResourceByCategory(AgentConstants.CHARACTER_ACTIVATION);
    }

    onActionReceived(categoryName: string, jsonedData: string): void {
        this.actionManager.showMessage(categoryName + " received");
        this.drawAndPlayRandomResourceByCategory(categoryName);
    }

    onMove(oldX: number, oldY: number, newX: number, newY: number): void {
        let Xdiff = Math.abs(oldX - newX);
        let Ydiff = Math.abs(oldY - newY);
        if (Xdiff > Ydiff)
        {
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

    onRelease(currentX: number, currentY: number): void {
        this.drawAndPlayRandomResourceByCategory(AgentConstants.ON_RELEASE);
        let screenHeight = this.configurationMananger.getScreenHeight();
        if (currentY < screenHeight - 50) {
            this.actionManager.move(0, screenHeight - 50, 250);
        }
    }

    onPick(currentX: number, currentY: number): void {
        this.drawAndPlayRandomResourceByCategory(AgentConstants.ON_PICK);
    }

    onMenuItemSelected(itemName: string): void {
       
    }

    onConfigureMenuItems(menuBuilder: IMenuBuilder): void {

    }

    onSpeechRecognitionResults(results: string): void { }

    onResponseReceived(response: string): void {
        this.actionManager.showMessage(response);
    }

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
            location.getSpeed().toString());
    }

    onUserActivityStateReceived(state: IAliveUserActivity) {
        this.actionManager.showMessage("UserActivity: State:" + state.getState() + " | Chance:" + state.getChance().toString());
    }

    onPlacesReceived(places: IAlivePlaceLikelihood[]): void {
        
    }

    onHeadphoneStateReceived(state: number) {

    }

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
            weather.getTemperature().toString());
    }

    drawAndPlayRandomResourceByCategory(categoryName: string): void {
        this.drawRandomResourceByCategory(categoryName);
        this.playRandomResourceByCategory(categoryName);
    }

    drawRandomResourceByCategory(categoryName: string): void {
        let image = this.resourceManagerHelper.chooseRandomImage(categoryName);
        if (image != null) {
            this.actionManager.draw(image, this.resizeRatio, false);
        }
    }

    playRandomResourceByCategory(categoryName: string): void {
        let sound = this.resourceManagerHelper.chooseRandomSound(categoryName);
        if (sound != null)
        {
            this.lastPlaySoundTime = this.currentTime;
            this.actionManager.playSound(sound);
        }
    }
}