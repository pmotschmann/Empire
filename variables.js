var save = window.localStorage;
var resources = {};
var building = {};
var research = {};
var city = {};

var gatherRateTable = {
    1: 30, //3000 milliseconds
    2: 25, //2500 milliseconds
    3: 20, //2000 milliseconds
    4: 15, //1500 milliseconds
    5: 10, //1000 milliseconds
    6: 5,  // 500 milliseconds
    7: 1   // 100 milliseconds
};
