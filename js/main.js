let barChart,
displayData;

var slider = document.getElementById("myRange");

function initMainPage() {
    barChart = new BarChart();
}

initMainPage();

// on slider change, update the bar chart
slider.oninput = function() {
    barChart.updateBarChart(this.value);
    // change html to display the year
    document.getElementById("yearId").innerHTML = this.value;

}

