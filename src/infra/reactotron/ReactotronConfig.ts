import Reactotron from 'reactotron-react-native';

if (__DEV__) {
  Reactotron.configure({ name: 'GitHub Explorer' })
    .useReactNative({
      networking: {
        ignoreUrls: /symbolicate|logs|generate_204|\/hot$/,
      },
    })
    .connect();
}

export default Reactotron;
