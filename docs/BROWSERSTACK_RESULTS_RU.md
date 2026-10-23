# Результаты BrowserStack — 23 октября 2026

Все три сценария успешно выполнены на трёх реальных устройствах. Результаты собраны из нескольких запусков после исправлений, а не из одного полностью зелёного build.

| Устройство        | Фактическая iOS | Тест                                                                 | Запись и журнал                                                                                                                                           |
| ----------------- | --------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| iPhone 15 Pro     | 17.2            | displays the complete catalog in ascending price order               | [Сессия и видео](https://app-automate.browserstack.com/builds/c17cbb0e630f9eb6e677744f4554c791857f8a23/sessions/7fb063cdc51d79110e5b099fd408b1723514c3c1) |
| iPhone 15 Pro     | 17.2            | removes the drawn strokes and restores the initial canvas            | [Сессия и видео](https://app-automate.browserstack.com/builds/c17cbb0e630f9eb6e677744f4554c791857f8a23/sessions/f4bedb73ef6373635a4264fe7534714a8344b755) |
| iPhone 15 Pro     | 17.2            | rotates About to landscape and keeps its content and controls usable | [Сессия и видео](https://app-automate.browserstack.com/builds/c17cbb0e630f9eb6e677744f4554c791857f8a23/sessions/896136140e8ec788794d90cf7ec5acf017df15a3) |
| iPhone 17         | 26.6            | displays the complete catalog in ascending price order               | [Сессия и видео](https://app-automate.browserstack.com/builds/5f001bd638956064af378441c0c4f17debe709d6/sessions/0f0df21a3bc9932454ce09c38d34eadfd4b931bf) |
| iPhone 17         | 26.6            | removes the drawn strokes and restores the initial canvas            | [Сессия и видео](https://app-automate.browserstack.com/builds/5f001bd638956064af378441c0c4f17debe709d6/sessions/7e3072b62328abd022f236be37a123df2c5e62c1) |
| iPhone 17         | 26.5            | rotates About to landscape and keeps its content and controls usable | [Сессия и видео](https://app-automate.browserstack.com/builds/5f001bd638956064af378441c0c4f17debe709d6/sessions/215afcfc67020e6556db59ed8c90ed9152426cac) |
| iPhone 17 Pro Max | 26.2            | displays the complete catalog in ascending price order               | [Сессия и видео](https://app-automate.browserstack.com/builds/ebc87761735b9e5db63ccd3c3fcf2b07a627fe70/sessions/f36ac5eceb39c0475c0a8153e1280764362a7b2d) |
| iPhone 17 Pro Max | 26.6            | removes the drawn strokes and restores the initial canvas            | [Сессия и видео](https://app-automate.browserstack.com/builds/8b15e9f3b8c166580cbe85a76bdbaa7d6370a2bf/sessions/8bc1ea366280b159d82450aad1f7c2f9076e39e8) |
| iPhone 17 Pro Max | 26.6            | rotates About to landscape and keeps its content and controls usable | [Сессия и видео](https://app-automate.browserstack.com/builds/ebc87761735b9e5db63ccd3c3fcf2b07a627fe70/sessions/efc3c266759107353567db9ad302d668100b435b) |

Видео доступны внутри сессий BrowserStack. Доступ проверяющего необходимо проверить перед сдачей. Прямые ссылки на видео сохранены в игнорируемых JSON в artifacts; они могут иметь ограниченный срок действия.

Исправления: абсолютные координаты касаний, ожидание остановки анимации меню, явное отпускание pointer без неподдерживаемого DELETE /actions. Общий лимит Drawing — 300 секунд из-за задержек передачи скриншотов; ожидания элементов и критерий чистого холста не ослаблены. Последний Drawing прошёл за 1 мин 31,3 с.

В этой итерации запущены четыре сессии: три ранее неуспешных сценария Pro Max и отдельный повтор Drawing после тайм-аута. Успешные тесты iPhone 17 и iPhone 15 Pro повторно не запускались.
