$(function() {
    // Define Resources
    loadResource(resources, 'lumber', 'Harvest Lumber');
    loadResource(resources, 'stone', 'Harvest Stone');
    loadResource(resources, 'copper', 'Mine Copper');
    loadResource(resources, 'iron', 'Mine Iron');
    loadResource(resources, 'coal', 'Mine Coal');
    loadResource(resources, 'aluminium', 'Mine Aluminium');
    loadResource(resources, 'gold', 'Mine Gold');
    loadResource(resources, 'titanium', 'Mine Titanium');
    loadResource(resources, 'oil', 'Harvest Oil');
    resources.lumber.unlocked = 1;
    resources.stone.unlocked = 1;
    // Set current research
    loadTech();
    
    // Load unlocked resources
    Object.keys(resources).forEach(function (key) { 
        if (resources[key].unlocked) {
            createResourceBind(resources,key);
        }
    });
    
});

// Load resource function
// This function defines each resource and loads saved values from localStorage
function loadResource(resources, name, label) {
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
function createResourceBind(resources, name) {
    var resource = $('<div class="resource"></div>');
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
        }, 25);
        
        return false;
    });
}

function showTech(techKey,techLevel) {
    var tech = $('<div id="' + techKey + 'Clicker" class="tech"></div>');
    var name = $('<div class="name">' + research[techKey][techLevel]['name'] + '</div>');
    var desc = $('<div class="desc">' + research[techKey][techLevel]['description'] + '</div>');
    tech.append(name);
    tech.append(desc);
    Object.keys(research[techKey][techLevel]['cost']).forEach(function (cost) { 
        var res = $('<span class="resource">' + nameCase(cost) + '</span>');
        var price = $('<span class="cost">' + research[techKey][techLevel]['cost'][cost] + '</span>');
        tech.append(res);
        tech.append(price);
    });
    var name = $('<div class="footer"></div>');
    tech.append(name);
    $('#research').append(tech);
    
    $('#' + techKey + 'Clicker').on('click',function(e){
        e.preventDefault();
        
        var paid = true;
        Object.keys(research[techKey][techLevel]['cost']).forEach(function (cost) {
            if (Number(save.getItem(cost)) < research[techKey][techLevel]['cost'][cost]) {
                paid = false;
                return;
            }
        });
        if (paid) {
            Object.keys(research[techKey][techLevel]['cost']).forEach(function (cost) {
                resources[cost]['amount'] = Number(save.getItem(cost)) - research[techKey][techLevel]['cost'][cost];
                save.setItem(cost,resources[cost]['amount']);
                $('#' + cost + 'Value').html(resources[cost]['amount'] + ' ' + nameCase(cost));
            });
            save.setItem(techKey,Number(save.getItem(techKey)+1));
            if (research[techKey][techLevel]['effect']) {
                research[techKey][techLevel]['effect']();
            }
            loadTech();
        }
        
        return false;
    });
}

function loadTech() {
    // Load Research Listing
    $('#research').empty();
    Object.keys(research).forEach(function (key) { 
        var techLevel = Number(save.getItem(key)) || 0;
        if (research[key][techLevel].require) {
            if (testTech(research[key][techLevel].require)) {
                showTech(key,techLevel);
            }
        }
        else {
            showTech(key,techLevel);
        }
    });
}

function testTech(requirements) {
    var available = true;
    Object.keys(requirements).forEach(function (req) {
        var testTech = Number(save.getItem(req)) || 0;
        if (testTech < Number(requirements[req])) {
            available = false;
            return false;
        }
    });
    return available;
}

function nameCase(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
