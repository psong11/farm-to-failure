let barChart,
    bar2,
displayData;

var slider = document.getElementById("myRange");

function initMainPage() {
    barChart = new BarChart();
    bar2 = new BarChart2();
}

initMainPage();

// on slider change, update the bar chart
slider.oninput = function() {
    barChart.updateBarChart(this.value);
    // change html to display the year
    document.getElementById("yearId").innerHTML = this.value;

}

