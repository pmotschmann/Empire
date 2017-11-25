var save = window.localStorage;

$(function(){
    // Definate Resources
    var resources = {};
    loadResource(resources, 'lumber', 'Harvest Lumber');
    loadResource(resources, 'coal', 'Mine Coal');
    loadResource(resources, 'copper', 'Mine Copper');
    loadResource(resources, 'iron', 'Mine Iron');
    resources.lumber.unlocked = 1;
    resources.coal.unlocked = 1;
    resources.copper.unlocked = 1;
    
    // Load unlocked resources
    Object.keys(resources).forEach(function (key) { 
        if (resources[key].unlocked) {
            createResourceBind(resources,key);
        }
    });
    
});

// Load resource function
// This function defines each resource and loads saved values from localStorage
function loadResource(resources, name, label){
    resources[name] = {
        amount: Number(save.getItem(name) || 0),
        miners: Number(save.getItem(name+'Miners') || 0),
        rate: Number(save.getItem(name+'Rate') || 1),
        unlocked: Number(save.getItem(name+'Unlocked') || 0),
        label: label
    };
}

// Bind resource function
// This function adds the resource to the game world
function createResourceBind(resources, name){
    var resource = $('<div class="resource"></div>');
    //var input = $('<input id="' + name + 'Clicker" type="button" name="' + name + '" value="' + resources[name]['label'] + '">');
    //var input = $('<progress id="' + name + 'Clicker" max="100" value="0">' + resources[name]['label'] + '</progress>');
    var clicker = $('<div id="' + name + 'Clicker" class="progress" data-label="' + resources[name]['label'] + '"></div>');
    var progress = $('<span id="' + name + 'ProgressBar" class="progressValue" style="width:0%"></span>');
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
                resources[name]['amount'] += resources[name]['rate'];
                save.setItem(name,resources[name]['amount']);
                bar.width('0');
                $('#' + name + 'Value').html(resources[name]['amount'] + ' ' + nameCase(name));
            } else {
                width++; 
                bar.width(width + '%');
            }
        }, 50);
        
        return false;
    });
}

function nameCase(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}