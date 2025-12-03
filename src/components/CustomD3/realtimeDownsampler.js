export class RealtimeDownsampler {
    constructor(bucketMs = 1000, windowMs = 2 * 60 * 60 * 1000, targetPerBucket, propY = 'valy', propX = 'valx', isDownsampling) {
        this.bucketMs = bucketMs;
        this.windowMs = windowMs;
        this.propX = propX;
        this.propY = propY;
        this.buckets = new Map();
        this.completedBucketIds=new Map();
        this.targetPerBucket = targetPerBucket ;
        this.isDownsampling = isDownsampling;
    }

    addPoint(point) {
        const t = point[this.propY];
        const bucketStart = Math.floor(t / this.bucketMs) * this.bucketMs;

        if (!this.buckets.has(bucketStart)) {
            this.buckets.set(bucketStart, []);
            this.completedBucketIds.set(bucketStart, false);
        }
        this.buckets.get(bucketStart).push(point);

        const cutoff = t - this.windowMs;
        for (const key of this.buckets.keys()) {
            if (key < cutoff) {
                this.buckets.delete(key);
                this.completedBucketIds.delete(key);
            }
        }
    }

    getSampled() {
        const result = [];
        const sortedKeys = [...this.buckets.keys()].sort((a, b) => a - b);

        for (let i = 0; i < sortedKeys.length; i++) {
            const key = sortedKeys[i];
            const pts = this.buckets.get(key);

            if (!pts || pts.length === 0) continue;
            
            const isLast = i === sortedKeys.length - 1;
            const isCompleted = this.completedBucketIds.get(key);

            if (!isLast && !isCompleted && this.isDownsampling) {
                const resLttb = this.lttbSampling(pts, this.targetPerBucket, this.propY, this.propX);
                this.buckets.set(key, resLttb);
                this.completedBucketIds.set(key, true);
                result.push(...resLttb);
            } else {
                result.push(...pts);
            }
        }

        return result;
    }
    lttbSampling(data, threshold, propertyY = 'y', propertyX = 'x') {
        if (threshold >= data.length || threshold === 0) {
            return data;
        }

        const sampled = [];
        const bucketSize = (data.length - 2) / (threshold - 2);

        let a = 0;
        sampled.push(data[a]); // selalu ambil titik pertama

        for (let i = 0; i < threshold - 2; i++) {
            // Next bucket dipakai untuk menghitung centroid (avgX, avgY)
            const bucketStart = Math.floor((i + 1) * bucketSize) + 1;
            const bucketEnd = Math.floor((i + 2) * bucketSize) + 1;
            const bucket = data.slice(bucketStart, bucketEnd);
            let avgX = 0, avgY = 0;
            for (const point of bucket) {
                avgX += point[propertyX] * 1;
                avgY += point[propertyY] * 1;
            }
            avgX /= bucket.length || 1;
            avgY /= bucket.length || 1;

            // Current bucket dipakai untuk mencari kandidat titik yang paling "informatif" (luas segitiga terbesar)
            const rangeStart = Math.floor(i * bucketSize) + 1;
            const rangeEnd = Math.floor((i + 1) * bucketSize) + 1;
            const range = data.slice(rangeStart, rangeEnd);

            let maxArea = -1;
            let maxAreaPoint = null;

            // Hitung luas segitiga di current bucket
            for (const point of range) {
                const area = Math.abs(
                (data[a][propertyX] - avgX) * (point[propertyY] - data[a][propertyY]) -
                (data[a][propertyX] - point[propertyX]) * (avgY - data[a][propertyY])) * 0.5;

                if (area > maxArea) {
                    maxArea = area;
                    maxAreaPoint = point;
                }
            }

            sampled.push(maxAreaPoint); // Simpan titik terbaik
            a = data.indexOf(maxAreaPoint); // update index titik terakhir
        }

        sampled.push(data[data.length - 1]); // selalu ambil titik terakhir
        return sampled;
    }
}