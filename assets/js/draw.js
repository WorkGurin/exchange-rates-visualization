var histcatexplong;
var request = new XMLHttpRequest();
request.open('GET', 'https://api.fixer.io/latest');
request.send();
request.onreadystatechange = function (e) {
    if (this.readyState === 4 && this.status === 200) {
        var response = JSON.parse(this.responseText);
        var finalArray2 = [];

        function finalToData2(currency, spot) {
            this.currency = currency;
            this.spot = spot;
        }

        var cuisines = ["EUR"];
        var val = response.rates;
        for (var j in val) {
            var sub_key = j;
            cuisines.push(sub_key);
            var sub_val = val[j];
            var object = new finalToData2(sub_key, sub_val);
            finalArray2.push(object);
        }

        $(function () {
            $('#table').bootstrapTable({
                data: finalArray2
            });
        });

        var sel = document.getElementById('baseList');
        var fragment = document.createDocumentFragment();
        cuisines.forEach(function (cuisine, index) {
            var opt = document.createElement('option');
            opt.innerHTML = cuisine;
            opt.value = cuisine;
            fragment.appendChild(opt);
        });
        sel.appendChild(fragment);

        var sel2 = document.getElementById('symbolList');
        var fragment2 = document.createDocumentFragment();
        cuisines.forEach(function (cuisine, index) {
            var opt2 = document.createElement('option');
            opt2.innerHTML = cuisine;
            opt2.value = cuisine;
            fragment2.appendChild(opt2);
        });
        sel2.appendChild(fragment2);

        console.log(JSON.stringify(finalArray2));
    }
};

$(function () {

    $('#colorpicker').colorpicker();
    $("#imagepicker").imagepicker({
        show_label: true,
    });

    $('#datepicker').datepicker({
        format: 'mm/dd/yyyy',
        startDate: '01/01/2000',
        weekStart: 1,
        autoclose: true,
        todayHighlight: true
    });
    if ($("#dateFrom").val() === '') {
        function createDate() {
            var date = new Date();
            date.setMonth(date.getMonth() - 1);
            return date;
        }

        $("#dateFrom").val(d3.time.format('%x')(createDate()));
    }
    if ($("#dateTo").val() === '') {
        $("#dateTo").val(d3.time.format('%x')(new Date()));
    }
});

d3.select(".save").on("click", function () {
    saveSvgAsPng(d3.select('svg').node(), 'chart.png');
});

var color = document.getElementById('color').value;

function drawStackedAreaChart(histcatexplong) {
    Array.prototype.max = function () {
        return Math.max.apply(null, this);
    };

    Array.prototype.min = function () {
        return Math.min.apply(null, this);
    };

    var arrayY = [];
    for (var hist in histcatexplong[0].values) {
        arrayY.push(histcatexplong[0].values[hist][1]);
    }

    var minYValue = arrayY.min();
    var maxYValue = arrayY.max();

    nv.addGraph(function () {
        var chart = nv.models.stackedAreaChart()
            .useInteractiveGuideline(true)
            .x(function (d) {
                return d['x']
            })
            .y(function (d) {
                return d['y']
            })
            .duration(300)
            .showControls(false)
            .clipEdge(true)
            .color([color])
            .forceY([minYValue, maxYValue])
        ;
        chart.xAxis
            .tickFormat(function (d) {
                return d3.time.format('%x')(new Date(d))
            });
        chart.yAxis.tickFormat(d3.format(',.4f'));

        d3.select("svg").remove();
        // d3.select('svg')

        d3.select('#chart1')
            .append("svg")
            .datum(histcatexplong)
            .transition().duration(300)
            .call(chart);
        nv.utils.windowResize(chart.update);
        return chart;
    });
}

function drawBarChart(histcatexplong) {

    Array.prototype.max = function () {
        return Math.max.apply(null, this);
    };

    Array.prototype.min = function () {
        return Math.min.apply(null, this);
    };

    var arrayY = [];
    for (var hist in histcatexplong[0].values) {
        arrayY.push(histcatexplong[0].values[hist][1]);
    }

    var minYValue = arrayY.min();
    var maxYValue = arrayY.max();

    nv.addGraph(function () {
        var chart = nv.models.multiBarChart()
            .showControls(false)
            .color([color])
            .forceY([minYValue, maxYValue])
        ;

        chart.xAxis
            .tickFormat(function (d) {
                return d3.time.format('%x')(new Date(d))
            });
        chart.yAxis.tickFormat(d3.format(',.4f'));

        d3.select("svg").remove();

        d3.select('#chart1')
            .append("svg")
            .datum(histcatexplong)
            .transition().duration(100)
            .call(chart);

        nv.utils.windowResize(chart.update);

        return chart;
    });
}

function allIn(responseArray) {
    function finalToData(key, value) {
        this.key = key;
        this.values = value;
    }

    function valueToChart(x, y) {
        this.x = new Date(x).getTime();
        this.y = y;
    }

    var finalArray = [];
    var keyArray = [];

    //get keyArray
    for (var ra in responseArray) {
        var response = responseArray[ra];
        var val = response.rates;
        for (var j in val) {
            var sub_key = j;
            keyArray.push(sub_key);
        }
    }

    keyArray = jQuery.unique(keyArray);
    console.log(keyArray);

    for (var ka in keyArray) {
        var valueArray = [];
        for (var ra in responseArray) {
            var response = responseArray[ra];
            var val = response.rates;
            var sub_val = val[keyArray[ka]];
            valueArray.push(new valueToChart(response.date, sub_val));
        }

        var object = new finalToData(keyArray[ka], valueArray);
        finalArray.push(object);
    }

    console.log("finalArray: " + JSON.stringify(finalArray));

    return finalArray;
}

$('#getData').click(function () {
    Date.prototype.addDays = function (days) {
        var dat = new Date(this.valueOf());
        dat.setDate(dat.getDate() + days);
        return dat;
    };

    function getDates(startDate, stopDate) {
        var dateArray = [];
        var currentDate = startDate;
        while (currentDate <= stopDate) {
            dateArray.push(currentDate);
            currentDate = currentDate.addDays(1);
        }
        return dateArray;
    }

    function getFormattedDate(date) {
        var year = date.getFullYear();
        var month = (1 + date.getMonth()).toString();
        month = month.length > 1 ? month : '0' + month;
        var day = date.getDate().toString();
        day = day.length > 1 ? day : '0' + day;
        return year + '-' + month + '-' + day;
    }

    var dateFrom = document.getElementById('dateFrom').value;
    var dateTo = document.getElementById('dateTo').value;
    var dateArray = getDates(new Date(dateFrom), new Date(dateTo));

    var base = document.getElementById('baseList').value;
    var symbol = document.getElementById('symbolList').value;

    var f = (function () {
        var xhr = [];
        var successfulRequests = 0;
        var responseArray = [];

        for (i = 0; i < dateArray.length; i++) {
            (function (i) {
                xhr[i] = new XMLHttpRequest();
                url = 'http://api.fixer.io/' + getFormattedDate(dateArray[i]) + '?base=' + base + '&symbols=' + symbol;
                xhr[i].open("GET", url, true);
                xhr[i].onreadystatechange = function () {
                    if (xhr[i].readyState === 4 && xhr[i].status === 200) {
                        successfulRequests++;
                        responseArray.push(JSON.parse(this.responseText));

                        if (successfulRequests === dateArray.length) {
                            responseArray.sort(function (a, b) {
                                return new Date(a.date).getTime() - new Date(b.date).getTime()
                            });

                            histcatexplong = allIn(responseArray);
                        }
                    }
                };
                xhr[i].send();
            })(i);
        }
    })();
});

$('.draw').click(function () {
    var selectedGraph = $("#imagepicker").data('picker').selected_values()[0];
    console.info("selectedGraph", selectedGraph)

    if (selectedGraph == 1) {
        drawStackedAreaChart(histcatexplong);
    }
    if (selectedGraph == 2) {
        drawBarChart(histcatexplong);
    }

    return false;
});


$('.clear').click(function () {
    d3.select("svg").remove();
});