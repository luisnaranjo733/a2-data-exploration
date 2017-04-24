$(function() {

    $('#touchdowns-toggle').change(function() {
        let checked = $(this).prop('checked');
        console.log(checked);
    })

    $('input[type=radio][name=nfc-team]').change(function() {
        console.log(this.value);
    })

    $('input[type=radio][name=play-type]').change(function() {
        console.log(this.value);
    })

    // Graph margin settings
    let margin = {
        top: 10,
        right: 10,
        bottom: 150,
        left: 60
    };

    // SVG width and height
    let width = 960;
    let height = 500;

    // Graph width and height - accounting for margins
    let drawWidth = width - margin.left - margin.right;
    let drawHeight = height - margin.top - margin.bottom;

    /************************************** Create chart wrappers ***************************************/
    // Create a letiable `svg` in which you store a selection of the element with id `viz`
    // Set the width and height to your `width` and `height` letiables
    let svg = d3.select('#viz')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    // Append a `g` element to your svg in which you'll draw your bars. Store the element in a letiable called `g`, and
    // Transform the g using `margin.left` and `margin.top`
    let g = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')


    // Load data in using d3's csv function.
    d3.csv('data/pbp-2016-nfc-west.csv', function(error, data) {
        console.log(data);

        // /************************************** Data prep ***************************************/

        // // You'll need to *aggregate* the data such that, for each device-app combo, you have the *count* of the number of occurances
        // // Lots of ways to do it, but here's a slick d3 approach: 
        // // http://www.d3noob.org/2014/02/grouping-and-summing-data-using-d3nest.html

        let aggregated_data = d3.nest()
            .key(obj => obj.GameId)
            .rollup(objects => {
                return objects;
            })
            .entries(data);

        /*
            - Toggle button for touchdown plays (filter by touchdown plays)
                * Will require adjusting y scale significantly
            - Dropdown to select NFC West Teams (filter data by team)
                * Will change the subset of the data set being visualized entirely
            - Radio button for passing plays and running plays
                * One can be selected at a time

            Grouped bar chart that show how teams lined up for each game in the 2016 season
                * Frequency of use of formations
        */

        console.log(aggregated_data);
        // /************************************** Defining scales and axes ***************************************/

        // // Create an `xScale` for positioning the bars horizontally. Given the data type, `d3.scaleBand` is a good approach.
        // let xScale = d3.scaleBand()
        //     .range([0, drawWidth])
        //     .domain(aggregated_data.map(obj => obj.key))
        //     .paddingInner(0.15)  // inner padding: Space between bands
        //     .paddingOuter(0.15); // outer padding: Space before first band and after last band\

        // // Using `d3.axisBottom`, create an `xAxis` object that holds can be later rendered in a `g` element
        // // Make sure to set the scale as your `xScale`

        // let xAxis = d3.axisBottom()
        //     .scale(xScale);

        // // Create a letiable that stores the maximum count using `d3.max`, and multiply this valu by 1.1
        // // to create some breathing room in the top of the graph.

        // let yMax = d3.max(aggregated_data, obj => +obj.value) * 1.1;

        // // Create a `yScale` for drawing the heights of the bars. Given the data type, `d3.scaleLinear` is a good approach.
        // let yScale = d3.scaleLinear()
        //     .range([drawHeight, 0])
        //     .domain([0, yMax]);

        // // Using `d3.axisLeft`, create a `yAxis` object that holds can be later rendered in a `g` element
        // // Make sure to set the scale as your `yScale`

        // let yAxis = d3.axisLeft()
        //     .scale(yScale);
            
        // /************************************** Rendering Axes and Axis Labels ***************************************/

        // // Create an `xAxisLabel` by appending a `g` element to your `svg` letiable and give it a class called 'axis'.
        // // Transform the `g` element so that it will be properly positioned (need to shift x and y position)
        // // Finally, use the `.call` method to render your `xAxis` in your `xAxisLabel`        

        // let xAxisLabel = svg.append('g')
        //     .attr('transform', `translate(${margin.left}, ${margin.top + drawHeight})`)
        //     .attr('class', 'axis')
        //     .call(xAxis);

        // // To rotate the text elements, select all of the `text` elements in your `xAxisLabel and rotate them 45 degrees        
        // // This may help: https://bl.ocks.org/mbostock/4403522
        // xAxisLabel.selectAll('text')
        //     .attr("y", 10)
        //     .attr("x", -10)
        //     .attr("dy", ".35em")
        //     .attr("transform", "rotate(315)")
        //     .style("text-anchor", "end");


        // // Create a text element to label your x-axis by appending a text element to your `svg` 
        // // You'll need to use the `transform` property to position it below the chart
        // // Set its class to 'axis-label', and set the text to "Device-App Combinations"
        // let xAxisText = svg.append('text')
        //     .attr('transform', `translate(${margin.left + drawWidth / 2}, ${margin.top + drawHeight + 130})`)
        //     .attr('class', 'axis-label')
        //     .text('Device-App combinations');


        // // Using the same pattern as your x-axis, append another g element and create a y-axis for your graph
        // let yAxisLabel = svg.append('g')
        //     .attr('class', 'axis')
        //     .attr('transform', `translate(${margin.left}, ${margin.top})`)
        //     .call(yAxis);


        // // Using the same pattern as your x-axis, append a text element to label your y axis
        // // Set its class to 'axis-label', and set the text to "Count"
        // let yAxisText = svg.append('text')
        //     .attr('transform', `translate(${margin.left - 50}, ${margin.top + drawHeight / 2}) rotate(-90)`)
        //     .attr('class', 'axis-label')
        //     .text('Count');

        // /************************************** Drawing Data ***************************************/

        // // Select all elements with the class 'bar' in your `g` element. Then, conduct a data-join
        // // with your parsedData array to append 'rect' elements with `he class set as 'bar'
        // let bars = g.selectAll('.bar').data(aggregated_data, obj => obj.key);


        // // Determine which elements are new to the screen (`enter`), and for each element, 
        // // Append a `rect` element, setting the `x`, `y`, `width`, and `height` attributes using your data and scales
        // bars.enter().append('rect')
        //     .merge(bars)
        //     .attr('x', obj => xScale(obj.key))
        //     .attr('y', obj => yScale(obj.value))
        //     .attr('width', xScale.bandwidth())
        //     .classed('bar', false)
        //     .attr('height', obj => drawHeight - yScale(obj.value))
        //     .attr('class', 'bar primary-bar-color')
        //     .on("mouseover", function() { // mouseover code found at http://bl.ocks.org/phil-pedruco/9032348
        //         d3.select(this)
        //             .classed('primary-bar-color', false)
        //             .classed('secondary-bar-color', true);
        //     })
        //     .on("mouseout", function(d, i) {
        //         d3.select(this)
        //             .classed('secondary-bar-color', false)
        //             .classed('primary-bar-color', true);
        //     });

        // bars.exit().remove();

    });
});