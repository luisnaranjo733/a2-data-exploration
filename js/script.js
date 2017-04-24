$(function () {
    d3.csv('data/pbp-2016-nfc-west.csv', function (error, allData) {

        let xScale, yScale, currentData;

        let teamValue = $("input[name='nfc-team']:checked").val();
        let playTypeValue = $("input[name='play-type']:checked").val();
        let touchdownPlaysOnly = $('#touchdowns-toggle').prop('checked');

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

        let setScales = (data) => {
            let games = data.map(obj => obj);

            // Define an ordinal xScale using rangeBands
            xScale = d3.scaleBand()
                .range([0, drawWidth], .2)
                .domain(games);

            var yMin = d3.min(data, obj => +obj.measure);
            var yMax = d3.max(data, obj => +obj.measure);

            yScale = d3.scaleLinear()
                .range([drawHeight, 0])
                .domain([0, yMax]);
        };

        let setAxes = () => {
            var xAxis = d3.axisBottom()
                .scale(xScale);

            var yAxis = d3.axisLeft()
                .scale(yScale)
                .tickFormat(d3.format('.2s'));

            xAxisLabel.transition().duration(1500).call(xAxis);

            yAxisLabel.transition().duration(1500).call(yAxis);

            xAxisText.text('2016 Season');
            yAxisText.text(`Frequency of the shotgun formation for the ${teamValue} (${playTypeValue}, ${touchdownPlaysOnly})`);
        };

        let filterData = () => {

            currentData = allData.filter(play => {
                let correct_team = play.OffenseTeam == teamValue;

                let correct_play_type = null;
                if (playTypeValue === "BOTH") {
                    correct_play_type = play.PlayType == "PASS" || play.PlayType == "RUSH";
                } else {
                    correct_play_type = play.PlayType == playTypeValue;
                }

                let correct_outcome = play.IsTouchdown == touchdownPlaysOnly;
                
                return correct_team && correct_play_type && correct_outcome;
            });


            let aggregated_data = d3.nest()
                .key(obj => obj.GameId)
                .rollup(objects => {
                    return objects;
                })
                .entries(currentData);

            console.log(aggregated_data);
        };

        let logMeasures = () => {
            console.log(`Team: ${teamValue}`);
            console.log(`Play type: ${playTypeValue}`)
            console.log(`Touchdown plays only?: ${touchdownPlaysOnly}`);
        };


        let draw = (data) => {
            logMeasures();
            // console.log(data);
            // Set scales
            setScales(data);

            // Set axes
            setAxes();
        };

        filterData();
        draw(currentData);


        

        $('input').on('change', (event) => {
            teamValue = $("input[name='nfc-team']:checked").val();
            playTypeValue = $("input[name='play-type']:checked").val();
            touchdownPlaysOnly = $('#touchdowns-toggle').prop('checked');

            filterData();
            // draw(currentData);
        });

    });
});