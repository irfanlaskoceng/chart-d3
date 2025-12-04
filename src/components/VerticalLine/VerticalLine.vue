<script setup>
	import { watch, onMounted, onUnmounted, ref } from 'vue';
    import { VerticalLine } from '../CustomD3/verticalLine';
    import { RealtimeDownsampler } from '../CustomD3/realtimeDownsampler';
	
    const chart_container = ref(null);
    let chart = null;
    let realtimeDownsamplers = {};

	const props = defineProps({
		id: {
			type: String,
		},
		msg: {
			type: String,
		},
		realtimeData: {
			type: Object,
		},
		historyData: {
			type: Object,
		},
        isDownsampling:{
            type:Boolean
        }
	});


    onMounted(() => {
        initial()
    });
    
    watch(props.realtimeData, (val) => {
        const valy = chart.parseTimestamp(val.timestamp);
        for (const dataset of chart.data) {
            if (val.hasOwnProperty(dataset.code)) {
                realtimeDownsamplers[dataset.code].addPoint({valy, valx: val[dataset.code]})
            }
        }
        chart.yMinMax.max = valy;
        chart.yMinMax.min = chart.yMinMax.max - (60*60*1000);
    });



    function initial(){
        try {
            const data = [
                {
                    "code": "LA",
                    "name":"Line A",
                    "color":"#ed1515",
                    "values": [] ,
                },
                {
                    "code": "LB",
                    "name":"Line B",
                    "color":"#2715ed",
                    "values": [] ,
                }
            ];
            chart = new VerticalLine({
                container: chart_container.value,
                width: chart_container.value.clientWidth,
                height: chart_container.value.clientHeight, 
                config: {},
                id: props.id,
                data
            });
            
            for (const dataset of chart.data) {
                const  bucketMs = 60 * 1000, 
                windowMs = 1 * 60 * 60 * 1000, 
                targetPerBucket = 5, 
                propY = 'valy', 
                propX = 'valx';
                realtimeDownsamplers[dataset.code] = new RealtimeDownsampler(bucketMs, windowMs, targetPerBucket, propY, propX, props.isDownsampling);
            }

            addDummyData();

            intervalUpdate(1000);
            
        } catch (error) {
            console.log('error', error);
        }
    }
    function addDummyData(){
        for (const dataset of chart.data) {
          
            if (props.historyData.hasOwnProperty(dataset.code)) {
                const history = []
                for (const item of props.historyData[dataset.code]) {
                    const valy = chart.parseTimestamp(item.valy)
                    history.push({valy: valy, valx:item.valx})
                    realtimeDownsamplers[dataset.code].addPoint({valy: valy, valx:item.valx})
                }
                
                
                dataset.values = props.isDownsampling ? realtimeDownsamplers[dataset.code].getSampled() : history;
            }
        }
        chart.update()
    }
    function intervalUpdate(ms){
        setInterval(()=>{
            for (const dataset of chart.data) {
                const resSampled = realtimeDownsamplers[dataset.code].getSampled();
                dataset.values = resSampled;
            }
            
            if (chart) {
                chart.update()
            }
        }, ms)
    }
    
    
</script>

<template>
	<div class="chart-container" ref="chart_container">
    </div>
    
</template>

<style lang="css" src="./style.css" scoped></style>