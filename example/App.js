import * as React from 'react';
import { Button, StyleSheet, View, Text, ActivityIndicator, NativeModules } from 'react-native';

const { TestModule } = NativeModules;

function argmax(arr) {
  let maxValue = -Number.MAX_VALUE;
  let maxIdx = -1;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] > maxValue) {
      maxValue = arr[i];
      maxIdx = i;
    }
  }
  return maxIdx;
}

async function runTest(getArr, iterations) {
  let maxIdx = -1;
  let totalTime = 0;
  const times = [];
  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    maxIdx = argmax(await getArr());
    const elapsedTime = performance.now() - startTime;
    times.push(elapsedTime);
    totalTime += elapsedTime;
  }
  return [maxIdx, totalTime, totalTime / iterations, times];
}

export default function App() {
  const [hasBenchmarks, setHasBenchmarks] = React.useState(false);

  const iterations = React.useMemo(() => 2500, []);

  const [nativeSyncResult, setNativeSyncResult] = React.useState();
  const [nativeAsyncResult, setNativeAsyncResult] = React.useState();
  const [jsiResult, setJsiResult] = React.useState();
  const [asyncResult, setAsyncResult] = React.useState();
  const [syncResult, setSyncResult] = React.useState();

  const runBenchmark = React.useCallback(async () => {
    setHasBenchmarks(true);

    setNativeSyncResult(undefined);
    setJsiResult(undefined);
    setAsyncResult(undefined);
    setSyncResult(undefined);

    let startTime;

    startTime = performance.now();
    const nativeSyncRes = TestModule.runNativeTestSync(iterations);
    console.log({
      nativeSyncTime: performance.now() - startTime,
    });
    // console.log({
    //   nativeSyncTimes: nativeSyncRes.times,
    // });
    setNativeSyncResult([nativeSyncRes.maxIdx, nativeSyncRes.totalTime, nativeSyncRes.avgTime, nativeSyncRes.times]);

    startTime = performance.now();
    const nativeAsyncRes = await TestModule.runNativeTest(iterations);
    console.log({
      nativeAsyncTime: performance.now() - startTime,
    });
    console.log({
      nativeAsyncTimes: nativeAsyncRes.times,
    });
    setNativeAsyncResult([nativeAsyncRes.maxIdx, nativeAsyncRes.totalTime, nativeAsyncRes.avgTime, nativeAsyncRes.times]);

    startTime = performance.now();
    const jsiRes = await runTest(() => global.myArrFunc(), iterations);
    console.log({
      jsiTime: performance.now() - startTime,
    });
    // console.log({
    //   jsiTimes: jsiRes[3],
    // });
    setJsiResult(jsiRes);

    startTime = performance.now();
    const asyncRes = await runTest(() => TestModule.myArr(), iterations);
    console.log({
      syncTime: performance.now() - startTime,
    });
    // // console.log({
    // //   asyncTimes: asyncRes[3],
    // // });
    setAsyncResult(asyncRes);
    
    startTime = performance.now();
    const syncRes = await runTest(() => TestModule.myArrSync(), iterations);
    console.log({
      asyncTime: performance.now() - startTime,
    });
    // // console.log({
    // //   syncTimes: syncRes[3],
    // // });
    setSyncResult(syncRes);
  }, [setHasBenchmarks, iterations, setNativeSyncResult, setNativeAsyncResult, setJsiResult, setAsyncResult, setSyncResult]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Run Benchmark</Text>
      <Button style={styles.button} title="Run" onPress={runBenchmark} />

      {hasBenchmarks && <Text style={styles.header}>Test Results</Text>}
      {hasBenchmarks && <Text style={styles.description}>Executing argmax on a 1000 elements array with {iterations} iterations</Text>}
      {hasBenchmarks ? nativeSyncResult ? <Text >Native sync result: {nativeSyncResult[0]} (totalTime={nativeSyncResult[1]}ms, avgTime={nativeSyncResult[2]}ms)</Text> : <ActivityIndicator size="small" color="#0000ff" /> : null}
      {hasBenchmarks ? nativeAsyncResult ? <Text >Native async result: {nativeAsyncResult[0]} (totalTime={nativeAsyncResult[1]}ms, avgTime={nativeAsyncResult[2]}ms)</Text> : <ActivityIndicator size="small" color="#0000ff" /> : null}
      {hasBenchmarks ? jsiResult ? <Text >Jsi result: {jsiResult[0]} (totalTime={jsiResult[1]}ms, avgTime={jsiResult[2]}ms)</Text> : <ActivityIndicator size="small" color="#0000ff" /> : null}
      {hasBenchmarks ? asyncResult ? <Text >Async result: {asyncResult[0]} (totalTime={asyncResult[1]}ms, avgTime={asyncResult[2]}ms)</Text> : <ActivityIndicator size="small" color="#0000ff" /> : null}
      {hasBenchmarks ? syncResult ? <Text >Sync result: {syncResult[0]} (totalTime={syncResult[1]}ms, avgTime={syncResult[2]}ms)</Text> : <ActivityIndicator size="small" color="#0000ff" /> : null}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  button: {
    marginBottom: 30,
  },
  header: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
  },
  description: {
    marginBottom: 10,
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
