// Loads all resources from storage & sets up resource definitions
function defineResources() {
    loadResource('lumber');
    loadResource('stone');
    loadResource('copper');
    loadResource('iron');
    loadResource('coal');
    loadResource('aluminium');
    loadResource('gold');
    loadResource('titanium');
    loadResource('oil');
    
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
function loadResource(name) {
    resources[name] = {
        amount: Number(save.getItem(name) || 0),
        rate: Number(save.getItem(name+'Rate') || 1),
        yield: Number(save.getItem(name+'Yield') || 1),
        unlocked: Number(save.getItem(name+'Unlocked') || 0),
        max: Number(save.getItem(name+'Max') || 250)
    };
    var vm = new Vue({
        data: resources[name]
    });
    vm.$watch('amount', function (newValue, oldValue) {
        if (newValue > resources[name]['max']) {
            resources[name]['amount'] = resources[name]['max'];
        }
        save.setItem(name,resources[name]['amount']);
        $('#' + name + 'Value').html(resources[name]['amount']);
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
    var resource = $('<div class="container resource"></div>');
    
    var header = $('<div class="row"></div>');
    var counter = $('<div class="col counter"><span class="text-left">' + nameCase(name) + '</span> <span id="' + name + 'Value" class="text-right"></span> / <span id="' + name + 'Max" class="text-right"></span></div>');
    var workers = $('<div class="col workers invisible"><span>Workers</span> <span id="' + name + 'Workers"></span> / <span id="' + name + 'MaxWorkers"></span> <span id="' + name + 'SubWorker">-</span> <span id="' + name + 'AddWorker">+</span></div>');
    header.append(counter);
    header.append(workers);
    resource.append(header);
    
    var footer = $('<div class="row"></div>');
    var clicker = $('<div id="' + name + 'Clicker" class="progress col"></div>');
    var title = $('<div class="progress-bar-title">Gather ' + nameCase(name) +'</div>');
    var progress = $('<div id="' + name + 'ProgressBar" class="progress-bar progress-bar-striped bg-success" style="width:0%" role="progress-bar"></div>');
    clicker.append(progress);
    clicker.append(title);
    footer.append(clicker);
    resource.append(footer);
    
    $('#resources').append(resource);
    $('#' + name + 'Value').html(resources[name]['amount']);
    $('#' + name + 'Max').html(resources[name]['max']);
    
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
