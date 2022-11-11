// Loading data, and casting to integer
d3.csv("data/obesity-cleaned.csv", d => {
    return d;


}).then(data => {
    console.log(data);
});