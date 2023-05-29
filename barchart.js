const countriesList = new Set();
let countries = [];
let dropdown;
let data;
d3.json("data/2018-2019.json")
	.then(function (data) {
		data.forEach((element) => {
			if (!countriesList.has(element.Country_or_region)) {
				countriesList.add(element.Country_or_region);
			}
		});

		countries = Array.from(countriesList);

		dropdown = d3.select("#country");
		dropdown
			.selectAll("option")
			.data(countries)
			.enter()
			.append("option")
			.text((d) => d);

		dropdown.on("change", () => {
			const countryName = dropdown.property("value");
			updateScoreChart(countryName, data);
			updateRankChart(countryName, data);
		});

		updateScoreChart(countries[0], data);
		updateRankChart(countries[0], data);
	})
	.catch(function (error) {
		console.error(error);
	});

const margin = { top: 20, right: 20, bottom: 30, left: 40 };
const width = 500 - margin.left - margin.right;
const height = 300 - margin.top - margin.bottom;

const scoreChartSvg = d3
	.select("#score-chart")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const scoreX = d3.scaleBand().range([0, width]).padding(0.1);
const scoreY = d3.scaleLinear().range([height, 0]);

const scoreXAxis = d3.axisBottom(scoreX);
const scoreYAxis = d3.axisLeft(scoreY);

const rankChartSvg = d3
	.select("#rank-chart")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const rankX = d3.scaleBand().range([0, width]).padding(0.1);
const rankY = d3.scaleLinear().range([height, 0]);

const rankXAxis = d3.axisBottom(rankX);
const rankYAxis = d3.axisLeft(rankY);

function updateScoreChart(countryName, data) {
	const filteredData = data.filter(
		(item) =>
			item.Country_or_region === countryName &&
			(item.Year === 2018 || item.Year === 2019),
	);

	filteredData.sort((a, b) => a.Year - b.Year);
	scoreX.domain(filteredData.map((item) => item.Year));
	scoreY.domain([0, d3.max(filteredData, (item) => item.Score)]);

	scoreChartSvg.selectAll(".bar").remove();
	scoreChartSvg.select(".x-axis").remove();
	scoreChartSvg.select(".y-axis").remove();

	scoreChartSvg
		.selectAll(".bar")
		.data(filteredData)
		.enter()
		.append("rect")
		.attr("class", "bar")
		.attr("x", (d) => scoreX(d.Year))
		.attr("y", (d) => scoreY(d.Score))
		.attr("width", scoreX.bandwidth())
		.attr("height", (d) => height - scoreY(d.Score))
		.attr("fill", "steelblue");

	scoreChartSvg
		.append("g")
		.attr("class", "x-axis")
		.attr("transform", "translate(0," + height + ")")
		.call(scoreXAxis.tickFormat(d3.format("d")));

	scoreChartSvg.append("g").attr("class", "y-axis").call(scoreYAxis);

	scoreChartSvg
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 0 - margin.left)
		.attr("x", 0 - height / 2)
		.attr("dy", "1em")
		.style("text-anchor", "middle")
		.text("Score");
}
function updateRankChart(countryName, data) {
	const filteredData = data.filter(
		(item) =>
			item.Country_or_region === countryName &&
			(item.Year === 2018 || item.Year === 2019),
	);

	filteredData.sort((a, b) => a.Year - b.Year);
	rankX.domain(filteredData.map((item) => item.Year));
	rankY.domain([0, d3.max(filteredData, (item) => item.Overall_rank)]);

	rankChartSvg.selectAll(".bar").remove();
	rankChartSvg.select(".x-axis").remove();
	rankChartSvg.select(".y-axis").remove();

	rankChartSvg
		.selectAll(".bar")
		.data(filteredData)
		.enter()
		.append("rect")
		.attr("class", "bar")
		.attr("x", (d) => rankX(d.Year))
		.attr("y", (d) => rankY(d.Overall_rank))
		.attr("width", rankX.bandwidth())
		.attr("height", (d) => height - rankY(d.Overall_rank))
		.attr("fill", "darkred");

	rankChartSvg
		.append("g")
		.attr("class", "x-axis")
		.attr("transform", "translate(0," + height + ")")
		.call(rankXAxis.tickFormat(d3.format("d")));

	rankChartSvg.append("g").attr("class", "y-axis").call(rankYAxis);
	rankChartSvg
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 0 - margin.left)
		.attr("x", 0 - height / 2)
		.attr("dy", "1em")
		.style("text-anchor", "middle")
		.text("Rank");
}
