import * as d3 from "d3";

export class VerticalLine{
    constructor({container, width, height, config, id, data}){
        this.container = container;
        this.width = width;
        this.height = height;
        this.config = config;
        this.id = id;
        this.data = data
        this.init()
    }
    init(){
        this.resetMinmax();
        this.createLegend();
        this.createSVG();

        this.createYAxis();
        this.createXAxis();

        this.createClip();

        this.createHoverLine();
        this.createOverlay();

        this.createTooltipElement();

        this.update();
    }
    createLegend(){
        this.legend = d3.select(this.container).append("div").attr("class","legend-"+this.id);
        for (const dataset of this.data) {
            const row = this.legend.append("div").style("display","flex").style("align-items", 'center').style("gap","2px");
            row.append("div").attr("class","legend-row-name-"+this.id).style("white-space","nowrap").text(dataset.name);
            row.append("div").style("height","2px").style("width","100%").style("background",dataset.color);
            row.append("div").attr("class","legend-row-value-"+this.id).style("white-space","nowrap").text(0);
        }
        
        this.legendBBox = this.legend.node().getBoundingClientRect();
        this.height = this.height - this.legendBBox.height; 
        
    }
    createSVG(){
        this.svg = d3.select(this.container).append("svg").attr("width", this.width).attr("height", this.height);

        this.svg
            .on("mousemove", (event) => {
                this.showTooltip(event)
            })
            .on("mouseleave", () => {
                this.hideTooltip();
            });
    }

    createYAxis(){
        this.yScale = d3.scaleTime().range([this.height, 0]);
        this.yAxisG = this.svg.append("g").attr("class", `y-axis-${this.id} y-axis`);
    }
    callYAxis(){
        const yAxisGen = d3.axisLeft(this.yScale).ticks(10).tickFormat(d3.timeFormat("%d/%m/%Y %H:%M"));
        this.yAxisG.call(yAxisGen);
    }

    createXAxis(){
        this.xScale = d3.scaleLinear().range([0, this.width]);
        this.xAxisG = this.svg.append("g").attr("class", `x-axis-${this.id} x-axis`);
    }
    callXAxis(){
        const xAxisGen = d3.axisBottom(this.xScale).ticks(4);
        this.xAxisG.call(xAxisGen);
    }
    
    lines(data){
        const { yScale : y, xScale: x, id, clipped } = this;

        const lineGenerator = d3.line()
            .y(d => y(d.valy))
            .x(d => x(d.valx));
        
        clipped.selectAll(`.line-${id}`)
            .data(data)
            .join("path")
            .attr("class", d => `line-${id} no-${d.code}${id}`)
            .attr("d", d => lineGenerator(d.values))
            .attr("stroke", d => d.color)
            .attr("stroke-width", 3)
            .attr("fill", "none");
    }


    createClip(){
        this.defs = this.svg.append("defs");

        this.clipRect = this.defs
            .append("clipPath")
            .attr("id", `clip-${this.id}`)
            .append("rect")
            .attr("width", this.width)
            .attr("height", this.height);

        this.clipped = this.svg.append("g")
            .attr("clip-path", `url(#clip-${this.id})`);
    }
    updateClipPath() {
        if (this.defs && this.clipRect) {
            let width = this.width - this.yAxisBBox.width;
            
            this.clipRect
                .attr("width",width)
                .attr("height", this.height - this.xAxisBBox.height)
                .attr("transform", `translate(${this.yAxisBBox.width}, 0)`)
        }
    }

    createHoverLine(){
        this.hoverLine = this.svg.append("line")
            .attr("x1", 0).attr("x2", this.width)
            .attr("y1", 0).attr("y2", 0)
            .attr("stroke", "#1c1b21").attr("stroke-width", 1)
            .style("display", "none");
    }
    createOverlay(){
        this.overlay = this.svg.append("rect")
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("fill", "transparent");
    }

    createTooltipElement(){
        this.Tooltip = d3.select(this.container)
            .append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("opacity", 0)
            .style("pointer-events", "none")
            .style("z-index", 9999);
    }
    showTooltip(event){
        const pointer_x_y = d3.pointer(event, this.svg.node());
                const my = pointer_x_y[1];
                const mx = pointer_x_y[0];
                const hoveredY = this.yScale.invert(my);

                this.Tooltip.interrupt();
                const formatDate = d3.timeFormat("%d %b %Y %H:%M:%S");

                let innerHTML = `
                <div style="background: #e5f6ff; padding: 6px">
                   <div>Time : ${formatDate(hoveredY)}</div> 
                `;

                for (const dataset of this.data) {
                    // Cari titik terdekat berdasarkan Y
                    let show_data = null;
                    const bisect2 = d3.bisector(d => d.valy).left;
                    let i2 = bisect2(dataset.values, hoveredY);
                    if (i2 >= dataset.values.length) i2 = dataset.values.length - 1;
                    if (i2 > 0) {
                        const d0 = dataset.values[i2 - 1];
                        const d1 = dataset.values[i2];
                        if (Math.abs(d1.valy - hoveredY) >= Math.abs(d0.valy - hoveredY)) {
                            i2 = i2 - 1;
                        }
                    }
                    
                    const closestPoint = dataset.values[i2];
                    show_data = closestPoint || null;
                    if (show_data) {
                         innerHTML += `<div>${dataset.name} : ${show_data.valx.toFixed(2)}</div>`
                    }
                    
                }

                innerHTML += `</div>`

                let posx = mx+this.legendBBox.left;
                let posy = my + this.legendBBox.top+this.legendBBox.top;

                this.Tooltip.html(innerHTML);
                this.Tooltip
                .style("left", posx + "px")
                .style("top", posy + "px")
                .transition()
                .style("opacity", 1);


                this.hoverLine
                .style("display", "block")
                .attr("y1", my)
                .attr("y2", my);
                this.hoverLine.attr("x1", this.yAxisBBox.width).attr("x2", this.width)

    }
    hideTooltip() {
        if (this.Tooltip) {
            this.Tooltip
                .transition()
                .duration(100)
                .style("opacity", 0)
                .style("pointer-events", "none");
            
             this.hoverLine.transition().style("display", "none");
        }
    }

    update(){
        this.callYAxis();
        this.callXAxis();

        this.yAxisBBox = this.yAxisG.node().getBBox();
        this.xAxisBBox = this.xAxisG.node().getBBox();

        this.yScale.range([this.height-this.xAxisBBox.height, 0]);
        this.xScale.range([this.yAxisBBox.width, this.width-6]);

        this.yScale.domain([this.yMinMax.max, this.yMinMax.min])
        this.xScale.domain([this.xMinMax.min, this.xMinMax.max])

        this.callYAxis();
        this.callXAxis();

        this.updateClipPath();

        this.lines(this.data);

        if (this.hoverLine) {
            this.hoverLine.attr("x1", 0).attr("x2", this.width);
            this.hoverLine.raise();
        }

        if (this.overlay) {
            this.overlay.attr("width", this.width-this.yAxisBBox.width).attr("height", this.height-this.xAxisBBox.height);
            this.overlay.attr("transform", `translate(0, 0)`);
            this.overlay.raise();
        }
        

        this.yAxisG.attr("transform", `translate(${this.yAxisBBox.width},0)`);
        this.xAxisG.attr("transform", `translate(0,${this.height-this.xAxisBBox.height})`);
    }
    resetMinmax(){
        this.xMinMax = { min: 0, max: 50};
        this.yMinMax = { min: this.parseTimestamp('2025-12-02T05:00:00.000Z'), max: this.parseTimestamp('2025-12-02T06:00:00.000Z') };
    }
    parseTimestamp(data){
        let parseUTCDate = d3.timeParse("%Y-%m-%dT%H:%M:%S.%LZ");
        let formatUTCDate = d3.timeFormat("%H:%M:%S.%L %d-%m-%Y");
        let parse = d3.timeParse("%H:%M:%S.%L %d-%m-%Y");
        return parse(formatUTCDate(parseUTCDate(data)));
    }

}