// Loads all resources from storage & sets up resource definitions
function defineResources() {
    loadResource('lumber',1);
    loadResource('stone',1);
    loadResource('copper',1);
    loadResource('iron',1);
    loadResource('coal',1);
    loadResource('steel',0);
    loadResource('aluminium',0);
    loadResource('gold',0);
    loadResource('titanium',0);
    loadResource('oil',0);
}

// Load resource function
// This function defines each resource, loads saved values from localStorage
// And it creates Vue binds for various resource values
function loadResource(name,manual) {
    global['resource'][name] = {
        manual: manual,
        unlocked: 0,
        rate: 1,
        yield: 1
    };
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
    
    $('#resources div').first().append(resource);
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
