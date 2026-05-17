import Reactotron from 'reactotron-react-native';

/**
 * Reactotron — DevTools desktop pra inspecionar requisições, AsyncStorage,
 * logs e estado em tempo real.
 *
 * Inicializa apenas em __DEV__. Em produção vira no-op.
 *
 * Como usar:
 *   1. Baixar app desktop: https://github.com/infinitered/reactotron/releases
 *   2. Abrir Reactotron desktop (default porta 9090).
 *   3. Rodar app no simulador → conecta automaticamente.
 *
 * Físico (Expo Go em celular): trocar `host` por IP LAN da máquina dev
 * (mesmo IP que aparece no Metro QR code, sem porta).
 *
 * Networking plugin (parte de useReactNative) intercepta XHR globalmente.
 * Axios usa XHR debaixo do capô em RN → todas as chamadas HTTP aparecem
 * automáticamente no painel Network do Reactotron, sem interceptor extra.
 */
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
