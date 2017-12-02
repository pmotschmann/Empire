// Loads all resources from storage & sets up resource definitions
function defineResources() {
    loadResource('lumber', 'Harvest Lumber');
    loadResource('stone', 'Harvest Stone');
    loadResource('copper', 'Mine Copper');
    loadResource('iron', 'Mine Iron');
    loadResource('coal', 'Mine Coal');
    loadResource('aluminium', 'Mine Aluminium');
    loadResource('gold', 'Mine Gold');
    loadResource('titanium', 'Mine Titanium');
    loadResource('oil', 'Harvest Oil');
    
    // Special resource, doesn't follow standard rules
    resources['citizen'] = {
        amount: Number(save.getItem('citizen') || 0),
        idle: Number(save.getItem('citizenIdle') || 0),
        max: Number(save.getItem('citizenMax') || 0)
    };
    var vm = new Vue({
        data: resources['citizen']
    });
    vm.$watch('amount', function (newValue, oldValue) {
        save.setItem(name,resources['citizen']['amount']);
        var dif = newValue - oldValue;
        resources['citizen']['idle'] += dif;
    });
    vm.$watch('idle', function (newValue, oldValue) {
        save.setItem(name,resources['citizen']['idle']);
    });
}

// Load resource function
// This function defines each resource, loads saved values from localStorage
// And it creates Vue binds for various resource values
function loadResource(name, label) {
    resources[name] = {
        amount: Number(save.getItem(name) || 0),
        rate: Number(save.getItem(name+'Rate') || 1),
        yield: Number(save.getItem(name+'Yield') || 1),
        unlocked: Number(save.getItem(name+'Unlocked') || 0),
        max: Number(save.getItem(name+'Max') || 1000),
        label: label
    };
    var vm = new Vue({
        data: resources[name]
    });
    vm.$watch('amount', function (newValue, oldValue) {
        if (newValue > resources[name]['max']) {
            resources[name]['amount'] = resources[name]['max'];
        }
        save.setItem(name,resources[name]['amount']);
        $('#' + name + 'Value').html(resources[name]['amount'] + ' ' + nameCase(name));
    });
    vm.$watch('rate', function (newValue, oldValue) {
        save.setItem(name,resources[name]['rate']);
    });
    vm.$watch('yield', function (newValue, oldValue) {
        save.setItem(name,resources[name]['yield']);
    });
    vm.$watch('max', function (newValue, oldValue) {
        save.setItem(name,resources[name]['max']);
    });
}

// Bind resource function
// This function adds the resource to the game world
function createResourceBind(resources, name) {
    var resource = $('<div class="resource col"></div>');
    var clicker = $('<div id="' + name + 'Clicker" class="p-bar" data-label="' + resources[name]['label'] + '"></div>');
    var progress = $('<span id="' + name + 'ProgressBar" class="p-value" style="width:0%"></span>');
    var counter = $('<span id="' + name + 'Value"></span>');
    clicker.append(progress);
    resource.append(clicker);
    resource.append(counter);
    $('#resources').append(resource);
    $('#' + name + 'Value').html(resources[name]['amount'] + ' ' + nameCase(name));
    
    $('#' + name + 'Clicker').on('click',function(e){
        e.preventDefault();
        var bar = $('#' + name + 'ProgressBar');
        if (parseInt(bar.width()) > 0) {
            return false;
        }
        var width = 1;
        var refreshId = setInterval(function() {
            if (width >= 100) {
                clearInterval(refreshId);
                resources[name]['amount'] += resources[name]['yield'];
                bar.width('0');
            } else {
                width++; 
                bar.width(width + '%');
            }
        }, gatherRateTable[resources[name]['rate']]);
        
        return false;
    });
}
