$(function () {
    d3.csv('data/pbp-2016-nfc-west.csv', function (error, allData) {
        // set global variables for reusable functions to use
        let xScale, yScale, currentData, currentAggregatedData;

        // fetch default values for controls from DOM
        let teamValue = $("input[name='nfc-team']:checked").val();
        let playTypeValue = $("input[name='play-type']:checked").val();
        let playFormationValue = $("input[name='play-formation']:checked").val();
        let touchdownPlaysOnly = $('#touchdowns-toggle').prop('checked');

        // define inner svg size
        let margin = {
            left: 70,
            bottom: 100,
            top: 50,
            right: 50,
        };

        // define outer svg size
        let width = 1000;
        let height = 600;


        // compute inner svg size based on margin declaration
        let drawWidth = width - margin.left - margin.right;
        let drawHeight = height - margin.top - margin.bottom;


        // Initialize static elements (svg, g, labels, text)

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
            .attr('transform', `translate(${margin.left - 40}, ${margin.top + drawHeight / 2 + 100}) rotate(-90)`)
            .attr('class', 'title');

        /*
            The setScales function sets the global x and y scale variables 
            based on the data it is passed in. It computes the appropriate
            doman and range for the data it is given.
        */
        let setScales = (data, aggregated_data) => {

            let games = aggregated_data.map(game => game.value[0].DefenseTeam);
            // games = aggregated_data.map((game, i) => `${i+1}: ${game.value[0].DefenseTeam}`);

            xScale = d3.scaleBand()
                .range([0, drawWidth], .2)
                .domain(games);

            var yMax = d3.max(aggregated_data, game => {
                let count_formation = 0;
                game.value.forEach(play => { // need to compute the sum of all the formations used for the nested data given
                    if (play.Formation == playFormationValue) {
                        count_formation += 1;
                    }
                });
                return count_formation;
            });

            yScale = d3.scaleLinear()
                .range([drawHeight, 0])
                .domain([0, yMax]);
        };

        /*
            The setAxes function takes the scales set by the setScales function and renders them.
            It also sets the text for the axis labels/text.
        */
        let setAxes = () => {
            var xAxis = d3.axisBottom()
                .scale(xScale);

            var yAxis = d3.axisLeft()
                .scale(yScale)
                .tickFormat(d3.format('.2s'));

            xAxisLabel.transition().duration(1500).call(xAxis);

            yAxisLabel.transition().duration(1500).call(yAxis);

            xAxisText.text('2016 Season');
            yAxisText.text(`${playTypeValue} plays from ${playFormationValue} for ${teamValue}`);
        };

        /*
            The filterData function filters the data set based on the html input controls
            that the user has manipulated.
        */
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

                let correct_formation = play.Formation == playFormationValue;

                return correct_team && correct_play_type && correct_outcome && correct_formation;
            });

            // take the play by play data and nest it by game and store it in a global variable.
            currentAggregatedData = d3.nest()
                .key(obj => obj.GameId)
                .rollup(objects => {
                    return objects;
                })
                .entries(currentData);
        };

        /*
            The draw function takes the provided data and renders it.

            It leverages the setScales and setAxes function so that it can
            focus on the data join for the redraw.
        */
        let draw = (data, aggregated_data) => {

            // Set scales
            setScales(data, aggregated_data);

            // Set axes
            setAxes();

            // The nested data needs to be flattened again so that it is easier
            // to do a join on it.
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


            let bars = g.selectAll('rect').data(flattened_data);

            // append entering datum
            bars.enter().append('rect')
                .attr('x', game => xScale(game.opponent))
                .attr('y', game => {
                    let n_formation_plays = game.formations[playFormationValue];
                    if (!n_formation_plays) {
                        n_formation_plays = 0;
                    }
                    return yScale(n_formation_plays);
                })
                .attr('height', game => {
                    let n_formation_plays = game.formations[playFormationValue];
                    if (!n_formation_plays) {
                        n_formation_plays = 0;
                    }
                    return drawHeight - yScale(n_formation_plays);
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
                    let n_formation_plays = game.formations[playFormationValue];
                    if (!n_formation_plays) {
                        n_formation_plays = 0;
                    }
                    return drawHeight - yScale(n_formation_plays);
                })
                .attr('y', (game) => {
                     let n_formation_plays = game.formations[playFormationValue];
                    if (!n_formation_plays) {
                        n_formation_plays = 0;
                    }
                    return yScale(n_formation_plays);
                });
        };

        filterData();
        draw(currentData, currentAggregatedData);

        $('input').on('change', (event) => {
            teamValue = $("input[name='nfc-team']:checked").val();
            playTypeValue = $("input[name='play-type']:checked").val();
            playFormationValue = $("input[name='play-formation']:checked").val();
            touchdownPlaysOnly = $('#touchdowns-toggle').prop('checked');

            filterData();
            draw(currentData, currentAggregatedData);

            // Compute new question text based on the user's html input control

            let outcome = null;
            if (touchdownPlaysOnly) {
                outcome = 'touchdowns';
            } else {
                outcome = 'plays';
            }

            let method = null;
            if (playTypeValue == 'PASS') {
                method = 'throw';
            } else if(playTypeValue == 'RUSH') {
                method = 'run';
            } else {
                method = 'execute';
            }

            let team = null;
            if (teamValue == 'SEA') {
                team = 'Seahawks';
            } else if (teamValue == 'LA') {
                team = 'Rams';
            } else if (teamValue == 'SF') {
                team = '49ers';
            } else if (teamValue == 'ARI'){
                team = 'Cardinals';
            }

            playFormationValue = playFormationValue.toLowerCase();
            let question = `How many ${outcome} did the ${team} ${method} from the ${playFormationValue} formation in 2016?`;
            $('#question').text(question);
           

        });

        $("rect").tooltip({
            'container': 'body',
            'placement': 'top'
        });

    });
});