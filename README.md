## Action Response Character:

### Main concept:
This sample is of a character that responds to actions (events) that occures on the phone.
Once an event occure (such as the user plugged the phone to a power supply) the character will activate the proper image and sound resource
that you have set.

### How to use:
In order to use this template, do the following steps:

1. Download and build it this project (following [this](https://github.com/hay12396/ImAliveGuide/wiki/How-to:-Build-and-upload-a-character-code) guide)

2. Upload resources to the actions that you wish to register (i.e upload image and sound resources to the POWER_CONNECTED category to attach them to this event)

3. Publish your character and see the results! (following [this](https://github.com/hay12396/ImAliveGuide/wiki/How-to:-Publish-your-character) guide)

### The code:
Most of the work is done in the "onActionReceived" method:
```

    onActionReceived(actionName: string, jsonedData: string): void {
        this.actionManager.showMessage(categoryName + " received");
        this.drawAndPlayRandomResourceByCategory(categoryName);
    }
```

Once an action occures, this method gets called with the actionName being the name of the action that occured, i.e in case
of the device being plugged to a power supply, this method will be called with the actionName being "POWER_CONNECTED".

If you have upload resources to the website under the "POWER_CONNECTED" category, a random image and a random sound will be picked and used
by the "drawAndPlayRandomResourceByCategory" method.
