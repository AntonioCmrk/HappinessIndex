const loadAndProcessData = () =>
	Promise.all([
		d3.tsv("data/50m.tsv"),
		d3.json("https://unpkg.com/world-atlas@1.1.4/world/50m.json"),
	]).then(([tsvData, topoJSONdata]) => {
		const rowById = tsvData.reduce((accumulator, d) => {
			accumulator[d.iso_n3] = d;
			return accumulator;
		}, {});

		const countries = topojson.feature(
			topoJSONdata,
			topoJSONdata.objects.countries,
		);

		countries.features.forEach((d) => {
			Object.assign(d.properties, rowById[d.id]);
		});

		return countries;
	});

const colorLegend = (selection, props) => {
	const {
		colorScale,
		circleRadius,
		spacing,
		textOffset,
		backgroundRectWidth,
		onClick,
		selectedColorValue,
	} = props;

	const backgroundRect = selection.selectAll("rect").data([null]);
	const n = colorScale.domain().length;
	backgroundRect
		.enter()
		.append("rect")
		.merge(backgroundRect)
		.attr("x", -circleRadius * 2)
		.attr("y", -circleRadius * 2)
		.attr("rx", circleRadius * 2)
		.attr("width", backgroundRectWidth)
		.attr("height", spacing * n + circleRadius * 2)
		.attr("fill", "white")
		.attr("opacity", 0.8);

	const groups = selection.selectAll(".tick").data(colorScale.domain());
	const groupsEnter = groups.enter().append("g").attr("class", "tick");
	groupsEnter
		.merge(groups)
		.attr("transform", (d, i) => `translate(0, ${i * spacing})`)
		.attr("opacity", (d) =>
			!selectedColorValue || d === selectedColorValue ? 1 : 0.2,
		)
		.on("click", (d) => onClick(d === selectedColorValue ? null : d));
	groups.exit().remove();

	groupsEnter
		.append("circle")
		.merge(groups.select("circle"))
		.attr("r", circleRadius)
		.attr("fill", colorScale);

	groupsEnter
		.append("text")
		.merge(groups.select("text"))
		.text((d) => d)
		.attr("dy", "0.32em")
		.attr("x", textOffset);
};

const projection = d3.geoNaturalEarth1();
const pathGenerator = d3.geoPath().projection(projection);

const choroplethMap = (selection, props) => {
	const { features, colorScale, colorValue, selectedColorValue } = props;

	//console.log(features);

	const gUpdate = selection.selectAll("g").data([null]);
	const gEnter = gUpdate.enter().append("g");
	const g = gUpdate.merge(gEnter);

	gEnter
		.append("path")
		.attr("class", "sphere")
		.attr("d", pathGenerator({ type: "Sphere" }))
		.merge(gUpdate.select(".sphere"))
		.attr("opacity", selectedColorValue ? 0.05 : 1);

	selection.call(
		d3.zoom().on("zoom", () => {
			g.attr("transform", d3.event.transform);
		}),
	);

	const countryPaths = g.selectAll(".country").data(features);
	const countryPathsEnter = countryPaths
		.enter()
		.append("path")
		.attr("class", "country");
	countryPaths
		.merge(countryPathsEnter)
		.attr("d", pathGenerator)
		.attr("fill", (d) => colorScale(colorValue(d)))
		.attr("opacity", (d) =>
			!selectedColorValue || selectedColorValue === colorValue(d) ? 1 : 0.1,
		)
		.classed(
			"highlighted",
			(d) => selectedColorValue && selectedColorValue === colorValue(d),
		);

	countryPathsEnter
		.append("title")
		.text(
			(d) =>
				d.properties.name +
				"\nRank: " +
				d.properties.overall_rank +
				"\nScore: " +
				d.properties.score +
				"\nGDP per capita: " +
				d.properties.GDP_per_capita +
				"\nSocial support: " +
				d.properties.social_support +
				"\nHealthy life expectancy: " +
				d.properties.healthy_life_expectancy +
				"\nFreedom to make life choices: " +
				d.properties.freedom_to_make_life_choices +
				"\nGenerosity: " +
				d.properties.generosity +
				"\nPerceptions of corruption: " +
				d.properties.perceptions_of_corruption,
		);
};

const svg = d3.select("svg");
const choroplethMapG = svg.append("g");
const colorLegendG = svg.append("g").attr("transform", `translate(40,310)`);

/*const customColors = ["#FFFF00", "#FFA500", "#FF0000", "#00FF00", "#ADD8E6", "00008B"];
const domain = [0, 100];
const colorScale = d3.scaleLinear()
.domain(domain)
.range(customColors);*/
const colorScale = d3.scaleOrdinal();

// const colorValue = d => d.properties.income_grp;
const colorValue = (d) => d.properties.happines_rank;

let selectedColorValue;
let features;

const onClick = (d) => {
	selectedColorValue = d;
	render();
};

loadAndProcessData().then((countries) => {
	features = countries.features;
	render();
});

const render = () => {
	colorScale
		.domain(features.map(colorValue))
		.domain(colorScale.domain().sort())
		.range(d3.schemeSpectral[colorScale.domain().length]);

	colorLegendG.call(colorLegend, {
		colorScale,
		circleRadius: 8,
		spacing: 20,
		textOffset: 12,
		backgroundRectWidth: 235,
		onClick,
		selectedColorValue,
	});

	choroplethMapG.call(choroplethMap, {
		features,
		colorScale,
		colorValue,
		selectedColorValue,
	});
};
