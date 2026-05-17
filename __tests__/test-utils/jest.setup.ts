import '@testing-library/jest-native/extend-expect';

import { notifyManager } from '@tanstack/react-query';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// React Query agenda notificações com setTimeout(_, 0). Quando o timer dispara
// depois do `await waitFor(...)` retornar, o setState cai fora de `act` e o
// React 19 reclama. Em testes, executar notificações de forma síncrona.
notifyManager.setScheduler((cb) => cb());
