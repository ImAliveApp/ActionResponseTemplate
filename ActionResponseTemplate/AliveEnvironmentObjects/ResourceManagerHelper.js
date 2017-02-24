var ResourceManagerHelper = (function () {
    function ResourceManagerHelper(resourceManager) {
        this.resourceManager = resourceManager;
        this.setupResourceMap();
    }
    ResourceManagerHelper.prototype.setupResourceMap = function () {
        this.soundResources = new collections.Dictionary();
        this.imageResources = new collections.Dictionary();
        this.soundList = new Array();
        this.imageList = new Array();
        this.setupResourceLists();
        this.setupResourceMaps();
    };
    ResourceManagerHelper.prototype.setupResourceLists = function () {
        var allResources = this.resourceManager.getAllResources();
        for (var i = 0; i < allResources.length; i++) {
            if (allResources[i].getType() === 5) {
                this.soundList.push(allResources[i]);
            }
            else {
                this.imageList.push(allResources[i]);
            }
        }
    };
    ResourceManagerHelper.prototype.setupResourceMaps = function () {
        var arraySoundResources = this.soundList;
        var arrayImageResources = this.imageList;
        for (var i = 0; i < this.soundList.length; i++) {
            this.addResourceToMap(arraySoundResources[i], this.soundResources);
        }
        for (var i = 0; i < this.imageList.length; i++) {
            this.addResourceToMap(arrayImageResources[i], this.imageResources);
        }
    };
    ResourceManagerHelper.prototype.addResourceToMap = function (res, dict) {
        var categoryName = res.getCategoryName();
        if (dict.containsKey(categoryName)) {
            dict.getValue(categoryName).push(res);
        }
        else {
            var newSet = new Array();
            newSet.push(res);
            dict.setValue(categoryName, newSet);
        }
    };
    ResourceManagerHelper.prototype.chooseRandomImage = function (state) {
        var randomIndex = this.getRandomIndex(state, this.imageResources.getValue(state));
        if (randomIndex < 0)
            return null;
        return this.imageResources.getValue(state)[randomIndex].getResourceName();
    };
    ResourceManagerHelper.prototype.chooseRandomSound = function (state) {
        var randomIndex = this.getRandomIndex(state, this.soundResources.getValue(state));
        if (randomIndex < 0)
            return null;
        return this.soundResources.getValue(state)[randomIndex].getResourceName();
    };
    ResourceManagerHelper.prototype.getRandomIndex = function (state, list) {
        var index = -1;
        if (list == null)
            return index;
        index = Math.floor(Math.random() * list.length);
        return index;
    };
    return ResourceManagerHelper;
}());
//# sourceMappingURL=ResourceManagerHelper.js.map