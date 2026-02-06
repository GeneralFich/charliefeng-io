
import { performance } from 'perf_hooks';

// Mock data structure
interface MockDoc {
    id: string;
    chunks: string[];
}

// Generate mock data
const generateDocs = (numDocs: number, chunksPerDoc: number) => {
    const docs: MockDoc[] = [];
    for (let i = 0; i < numDocs; i++) {
        const chunks = [];
        for (let j = 0; j < chunksPerDoc; j++) {
            chunks.push(`chunk-${i}-${j}`);
        }
        docs.push({ id: `doc-${i}`, chunks });
    }
    return docs;
};

// Mock API call with latency
const mockGetEmbeddings = async (text: string): Promise<number[]> => {
    await new Promise(resolve => setTimeout(resolve, 50)); // 50ms latency
    return [0.1, 0.2, 0.3];
};

// Sequential implementation (Current Baseline)
async function runSequential(docs: MockDoc[]) {
    console.log('Starting Sequential...');
    const start = performance.now();
    const results: any[] = [];

    for (const doc of docs) {
        for (let i = 0; i < doc.chunks.length; i++) {
            const chunk = doc.chunks[i];
            const embedding = await mockGetEmbeddings(chunk);
            results.push({ id: doc.id, chunk, embedding });
            // Rate limiting aid from original code (simulating 20ms here for speed, original was 200)
             await new Promise(resolve => setTimeout(resolve, 20));
        }
    }

    const end = performance.now();
    console.log(`Sequential took ${(end - start).toFixed(2)}ms`);
    return end - start;
}

// Parallel implementation (Proposed Optimization)
async function runParallel(docs: MockDoc[], concurrency: number) {
    console.log(`Starting Parallel (Concurrency: ${concurrency})...`);
    const start = performance.now();
    const results: any[] = [];

    // Flatten tasks
    const tasks = [];
    for (const doc of docs) {
        for (let i = 0; i < doc.chunks.length; i++) {
            tasks.push({ docId: doc.id, chunk: doc.chunks[i] });
        }
    }

    // Simple concurrency pool
    let index = 0;
    const worker = async () => {
        while (index < tasks.length) {
            const taskIndex = index++; // atomic-ish in JS event loop
            if (taskIndex >= tasks.length) break;

            const task = tasks[taskIndex];
            const embedding = await mockGetEmbeddings(task.chunk);
            results.push({ id: task.docId, chunk: task.chunk, embedding });
        }
    };

    const workers = [];
    for (let i = 0; i < concurrency; i++) {
        workers.push(worker());
    }

    await Promise.all(workers);

    const end = performance.now();
    console.log(`Parallel took ${(end - start).toFixed(2)}ms`);
    return end - start;
}

async function main() {
    const docs = generateDocs(10, 5); // 50 total chunks

    const seqTime = await runSequential(docs);
    const parTime = await runParallel(docs, 5); // Concurrency 5

    console.log(`\nImprovement: ${(seqTime / parTime).toFixed(2)}x faster`);
}

main();
