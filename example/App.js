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

  const [jsiResult, setJsiResult] = React.useState();
  const [asyncResult, setAsyncResult] = React.useState();
  const [syncResult, setSyncResult] = React.useState();

  const runBenchmark = React.useCallback(async () => {
    setHasBenchmarks(true);

    setJsiResult(undefined);
    setAsyncResult(undefined);
    setSyncResult(undefined);
    const jsiRes = await runTest(() => global.myArrFunc(), iterations);
    console.log({
      jsiTimes: jsiRes[3],
    });
    setJsiResult(jsiRes);
    const asyncRes = await runTest(() => TestModule.myArr(), iterations);
    // console.log({
    //   asyncTimes: asyncRes[3],
    // });
    setAsyncResult(asyncRes);
    const syncRes = await runTest(() => TestModule.myArrSync(), iterations);
    // console.log({
    //   syncTimes: syncRes[3],
    // });
    setSyncResult(syncRes);
  }, [setHasBenchmarks, iterations, setJsiResult, setAsyncResult, setSyncResult]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Run Benchmark</Text>
      <Button style={styles.button} title="Run" onPress={runBenchmark} />

      {hasBenchmarks && <Text style={styles.header}>Test Results</Text>}
      {hasBenchmarks && <Text style={styles.description}>Executing argmax on a 1000 elements array with {iterations} iterations</Text>}
      {hasBenchmarks ? jsiResult ? <Text >Jsi result: {jsiResult[0]} (avgTime={jsiResult[1]}ms, totalTime={jsiResult[2]}ms)</Text> : <ActivityIndicator size="small" color="#0000ff" /> : null}
      {hasBenchmarks ? asyncResult ? <Text >Async result: {asyncResult[0]} (avgTime={asyncResult[1]}ms, totalTime={asyncResult[2]}ms)</Text> : <ActivityIndicator size="small" color="#0000ff" /> : null}
      {hasBenchmarks ? syncResult ? <Text >Sync result: {syncResult[0]} (avgTime={syncResult[1]}ms, totalTime={syncResult[2]}ms)</Text> : <ActivityIndicator size="small" color="#0000ff" /> : null}
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
