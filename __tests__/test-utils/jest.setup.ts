import '@testing-library/jest-native/extend-expect';

import { notifyManager } from '@tanstack/react-query';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Força React Query a notificar listeners sincronamente, eliminando a
// necessidade de `await waitFor` em testes de hooks/screens para observar
// transições simples loading→success. Sem isso, o scheduler padrão usa
// `setTimeout(0)` e estados intermediários não aparecem no mesmo tick em que
// a Promise resolve, o que força esperas artificiais em quase todo teste.
// Pago em troca: testes podem mascarar bugs de re-render fora-de-ordem que
// só apareceriam com scheduler real — para fluxos críticos use specs de
// integração (Fase 5) que rodam sem este override.
notifyManager.setScheduler((cb) => cb());
