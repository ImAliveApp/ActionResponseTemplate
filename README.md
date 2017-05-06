## Normal (Action Response) Template:

### Main concept:
This sample is of a character that responds to actions (events) that occures on the phone.
Once an event occure (such as the user plugged the phone to a power supply) the character will activate the proper image and sound resource
that you have set.

### How to use:
In order to use this template, do the following steps:

1. Download the project.

2. Upload your assets ([guide](https://youtu.be/2eHSx10HHuc))

3. Publish your character and see the results! ([guide](https://github.com/ImAliveApp/ImAliveGuide/wiki/How-to:-Publish-your-character))

### The code:
Most of the work is done in the "onPhoneEventOccurred" method:
```javascript
    onPhoneEventOccurred(eventName: string, jsonedData: string): void {
        this.actionManager.showMessage(eventName + " received");
        this.drawAndPlayRandomResourceByCategory(eventName);
    }
```

Once an action occures, this method gets called with the actionName being the name of the action that occured, i.e in case
of the device being plugged to a power supply, this method will be called with the actionName being "POWER_CONNECTED".

If you have upload resources to the website under the "POWER_CONNECTED" category, a random image and a random sound will be picked and used
by the "drawAndPlayRandomResourceByCategory" method.

**Note**: you must [register](https://youtu.be/HGkpn2y04B8) to a phone action in order to be notified when it occures.
