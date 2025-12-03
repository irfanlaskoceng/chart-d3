<script setup>
    import { reactive, } from 'vue';
    import VerticalLine from './components/VerticalLine/VerticalLine.vue';

    const realtimeData = reactive({"LA": 0, "LB": 2, timestamp: null});
    let timestamp = new Date('2025-12-02T06:00:00.000Z').getTime() 
    
    setInterval(()=>{
        realtimeData["LA"] = Math.random() * (0 - 50) + 50;
        realtimeData["LB"] = Math.random() * (0 - 50) + 50;
        
        timestamp += 2 * 1000
        const t = new Date(timestamp);
        realtimeData["timestamp"] = t.toISOString();
        
    },500)

    // function generateDummyData() {
    //     const start = new Date("2025-12-02T05:00:00.000Z");
    //     const data = [];

    //     const hour = 1*60*60; // 1 jam
    //     const step = 2; //detik
    //     const len = Math.round(hour/step);

    //     for (let i = 0; i < len; i++) {
    //         const t = new Date(start.getTime() + i * step * 1000);

    //         data.push({
    //             valy: t.toISOString(),
    //             valx: [5,6,7,30].includes(i) ? -10 : Math.random() * (0 - 50) + 50
    //         });
    //     }
    //     return data;
    // }

    function generateDummyData2() {
        const start = new Date("2025-12-02T05:00:00.000Z");
        const data = [];

        const hour = 1 * 60 * 60; // 1 jam
        const step = 1;           // per 1 detik
        const len = Math.round(hour / step);

        for (let i = 0; i < len; i++) {
            const t = new Date(start.getTime() + i * step * 1000);

            let x;

            // ===== Pola 1: Tren naik linear =====
            if (i < 100) { 
                x = 20 + i * 0.02;   // naik pelan, garis lurus

            // ===== Pola 2: Flat =====
            } else if (i < 200) { 
                x = 32;

            // ===== Pola 3: Spike besar =====
            } else if (i > 300 && i < 400) {
                x = 40;

            // ===== Pola 4: Tren turun =====
            } else if (i < 2400) {
                x = 32  * i/len; // turun pelan, garis lurus

            // ===== Pola 5: Drop tajam =====
            } else if (i === 500) {
                x = 5;

            // ===== Pola 6: Flat lagi =====
            } else {
                x = 10;
            }

            // OPTIONAL: sedikit noise kecil biar natural
            // y += (Math.random() * 0.4 - 0.2);

            data.push({
                valy: t.toISOString(),
                valx: x
            });
        }

        return data;
    }
    function generateDummyData3() {
        const start = new Date("2025-12-02T05:00:00.000Z");
        const data = [];

        const hour = 1 * 60 * 60; // 1 jam
        const step = 1;           // per 1 detik
        const len = Math.round(hour / step);

        for (let i = 0; i < len; i++) {
            const t = new Date(start.getTime() + i * step * 1000);

            let x;

            // ===== Pola 1: Tren naik linear =====
            if (i < 300) { 
                x = 40 + i * 0.02;   // naik pelan, garis lurus

            // ===== Pola 2: Flat =====
            } else if (i < 500) { 
                x = 2;

            // ===== Pola 3: Spike besar =====
            } else if (i > 600 && i < 800) {
                x = 10;

            // ===== Pola 4: Tren turun =====
            } else if (i < 2000) {
                x = 10  * i/len; // turun pelan, garis lurus

            // ===== Pola 5: Drop tajam =====
            } else if (i > 2500 && i < 2600) {
                x = 30;

            // ===== Pola 6: Flat lagi =====
            } else {
                x = 40;
            }

            // OPTIONAL: sedikit noise kecil biar natural
            // y += (Math.random() * 0.4 - 0.2);

            data.push({
                valy: t.toISOString(),
                valx: x
            });
        }

        return data;
    }


    let historyData  = {
        "LA": generateDummyData2(),
        "LB": generateDummyData3()
    };
    // let historyData  = {
    //     "LA": generateDummyData(),
    //     "LB": generateDummyData()
    // };
    

</script>

<template>
    <section>
        <VerticalLine id="1" msg="Chart 1" :realtimeData="realtimeData" :historyData="historyData" :isDownsampling="false"/>
        <VerticalLine id="2" msg="Chart 2" :realtimeData="realtimeData" :historyData="historyData" :isDownsampling="true"/>
    </section>

</template>

<style lang="css" src="./App.css" scoped></style>
