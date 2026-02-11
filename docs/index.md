# Survival Syndicate Server — Документация

## Гайды
- **[01_serverDevelopmentGuide.md](./01_serverDevelopmentGuide.md)** - Полный гайд по разработке сервера (22 части)

---

## Архитектура (`architecture/`)

| # | Документ | Описание |
|---|----------|----------|
| 01 | [01_networkProtocol.md](./architecture/01_networkProtocol.md) | Сетевой протокол (WebSocket) |
| 02 | [02_serverArchitecture.md](./architecture/02_serverArchitecture.md) | Архитектура игрового сервера |
| 03 | [03_networkOptimizations.md](./architecture/03_networkOptimizations.md) | Сетевые оптимизации (Delta, Interest) |
| 04 | [04_persistenceArchitecture.md](./architecture/04_persistenceArchitecture.md) | Архитектура персистентности (PostgreSQL, ClickHouse) |
| 05 | [05_analyticsAndEvents.md](./architecture/05_analyticsAndEvents.md) | Архитектура аналитики |
| 06 | [06_metaApiSpec.md](./architecture/06_metaApiSpec.md) | REST API спецификация |
| 07 | [07_serverOrchestration.md](./architecture/07_serverOrchestration.md) | Оркестрация серверов (центр + регионы) |
| 08 | [08_antiCheatAndValidation.md](./architecture/08_antiCheatAndValidation.md) | Anti-Cheat и валидация |
| 09 | [09_antiDdosStrategies.md](./architecture/09_antiDdosStrategies.md) | Защита от DDoS |
| 10 | [10_paymentValidationService.md](./architecture/10_paymentValidationService.md) | Валидация покупок (IAP) |
| 11 | [11_serverMonitoringAndLogging.md](./architecture/11_serverMonitoringAndLogging.md) | Мониторинг и логирование |
| 12 | [12_databaseSchema.md](./architecture/12_databaseSchema.md) | Схема базы данных PostgreSQL |

---

## Связанные репозитории
- **GDD:** https://github.com/recferret-bit/Survival-Syndicate-GDD
- **Client:** https://github.com/recferret-bit/Survival-Syndicate-Client
