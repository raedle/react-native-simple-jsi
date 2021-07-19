import * as React from 'react';
import { StyleSheet, View, Text } from 'react-native';

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

export default function App() {
  const [result, setResult] = React.useState();

  React.useEffect(() => {
    let maxIdx = -1;
    let totalTime = 0;
    let iterations = 10000;
    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      maxIdx = argmax(global.myArr);
      totalTime += Date.now() - startTime;
    }
    console.log({
      time: totalTime / iterations
    })
    setResult(maxIdx);
  }, []);

  return (
    <View style={styles.container}>
      <Text >Result: {result}</Text>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
