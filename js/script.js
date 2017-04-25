$(function () {
    d3.csv('data/pbp-2016-nfc-west.csv', function (error, allData) {

        let xScale, yScale, currentData, currentAggregatedData;

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
            .attr('transform', `translate(${margin.left - 40}, ${margin.top + drawHeight / 2 + 200}) rotate(-90)`)
            .attr('class', 'title');

        let setScales = (data, aggregated_data) => {

            let games = aggregated_data.map(game => game.value[0].DefenseTeam);
            // games = aggregated_data.map((game, i) => `${i+1}: ${game.value[0].DefenseTeam}`);

            // Define an ordinal xScale using rangeBands
            xScale = d3.scaleBand()
                .range([0, drawWidth], .2)
                .domain(games);

            var yMax = d3.max(aggregated_data, game => {
                let count_formation = 0;
                game.value.forEach(play => {
                    if (play.Formation == 'SHOTGUN') {
                        count_formation += 1;
                    }
                });
                return count_formation;
            });

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

            currentAggregatedData = d3.nest()
                .key(obj => obj.GameId)
                .rollup(objects => {
                    return objects;
                })
                .entries(currentData);
        };

        let logMeasures = () => {
            console.log(`Team: ${teamValue}`);
            console.log(`Play type: ${playTypeValue}`)
            console.log(`Touchdown plays only?: ${touchdownPlaysOnly}`);
        };


        let draw = (data, aggregated_data) => {

            // Set scales
            setScales(data, aggregated_data);

            // Set axes
            setAxes();

            let flattened_data = aggregated_data.map((game, i) => {
                let firstPlay = game.value[0];
                let game_observation = {
                    'id': i + 1,
                    'opponent': firstPlay.DefenseTeam,
                    'formations': {}
                }
                game.value.forEach(play => {
                    if (game_observation.formations[play.Formation]) {
                        game_observation.formations[play.Formation] += 1
                    } else {
                        game_observation.formations[play.Formation] = 1;
                    }
                })
                return game_observation;
            })

            console.log(flattened_data);

            // Select all rects and bind data
            let bars = g.selectAll('rect').data(flattened_data);

            // Use the .enter() method to get your entering elements, and assign initial positions
            bars.enter().append('rect')
                .attr('x', game => xScale(game.opponent))
                .attr('y', game => {
                    return yScale(game.formations['SHOTGUN']);
                })
                .attr('height', game => {
                    return drawHeight - yScale(game.formations['SHOTGUN']);
                })
                .attr('width', xScale.bandwidth())
                .attr('class', 'bar')
                .attr('title', game => `Game ${game.id} vs ${game.opponent}`)

       

            // Use the .exit() and .remove() methods to remove elements that are no longer in the data
            bars.exit().remove();

            // Transition properties of the update selection
            bars.transition()
                .duration(1500)
                .delay((d, i) => i * 50)
                .attr('height', (game) => {
                    let shotgun = game.formations['SHOTGUN'];
                    if (!shotgun) {
                        shotgun = 0;
                    }
                    return drawHeight - yScale(shotgun);
                })
                .attr('y', (game) => {
                    let shotgun = game.formations['SHOTGUN'];
                    if (!shotgun) {
                            shotgun = 0;
                    }
                    return yScale(shotgun);
                });
        };

        filterData();
        draw(currentData, currentAggregatedData);


        

        $('input').on('change', (event) => {
            teamValue = $("input[name='nfc-team']:checked").val();
            playTypeValue = $("input[name='play-type']:checked").val();
            touchdownPlaysOnly = $('#touchdowns-toggle').prop('checked');

            filterData();
            draw(currentData, currentAggregatedData);
        });

        $("rect").tooltip({
            'container': 'body',
            'placement': 'top'
        });

    });
});