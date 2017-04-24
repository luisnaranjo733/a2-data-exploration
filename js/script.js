$(function() {
    d3.csv('data/pbp-2016-nfc-west.csv', function(error, data) {

        let xScale, yScale, currentData;

        let team = 'seahawks';
        let playType = 'both';
        let touchdownPlaysOnly = false;


        let margin = {
            left: 70,
            bottom: 100,
            top: 50,
            right: 50,
        };

        let width = 1000;
        let height = 600;


        let drawWidth = width - margin.left - margin.right;
        let drawHeight = height - margin.top - margin.bottom;


        let svg = d3.select('#viz')
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        let g = svg.append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`)
            .attr('height', drawHeight)
            .attr('width', drawWidth);


        let xAxisLabel = svg.append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top + drawHeight})`)
            .attr('class', 'axis');

        let yAxisLabel = svg.append('g')
            .attr('class', 'axis')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        let xAxisText = svg.append('text')
            .attr('transform', `translate(${margin.left + drawWidth / 2}, ${margin.top + drawHeight + 40})`)
            .attr('class', 'title');

        let yAxisText = svg.append('text')
            .attr('transofmr', `translate(${margin.left - 40}, ${margin.top + drawHeight / 2}) rotate(-90)`)
            .attr('class', 'title');

        let aggregated_data = d3.nest()
            .key(obj => obj.GameId)
            .rollup(objects => {
                return objects;
            })
            .entries(data);
        console.log(aggregated_data);

        let setScales = (data) => {

        };

        let setAxes = () => {

        };

        let filterData = () => {

        };

        let draw = (data) => {

        };

        filterData();
        draw(currentData);

        $('input').on('change', (event) => {
            let teamValue = $("input[name='nfc-team']:checked").val();
            let playTypeValue = $("input[name='play-type']:checked").val();
            let touchdownPlaysOnly = $('#touchdowns-toggle').prop('checked');

            // console.log(`Team: ${teamValue}`);
            // console.log(`Play type: ${playTypeValue}`)
            // console.log(`Touchdown plays only?: ${touchdownPlaysOnly}`);
            
        });

    });
});