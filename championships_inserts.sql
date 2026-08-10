BEGIN TRANSACTION;

INSERT INTO CHAMPIONSHIPS
  (tournament, inicio, fin, year, ganador, finalista)
VALUES
  (
    (SELECT id FROM TOURNAMENTS WHERE name = 'EFG Swiss Open Gstaad'),
    '2026-07-13',
    '2026-07-19',
    2026,
    (SELECT id FROM TENNIS_PLAYERS WHERE name = 'Stefanos Tsitsipas'),
    (SELECT id FROM TENNIS_PLAYERS WHERE name = 'Raphael Collignon')
  ),
  (
    (SELECT id FROM TOURNAMENTS WHERE name = 'Nordea Open'),
    '2026-07-13',
    '2026-07-19',
    2026,
    (SELECT id FROM TENNIS_PLAYERS WHERE name = 'Andrey Rublev'),
    (SELECT id FROM TENNIS_PLAYERS WHERE name = 'Luciano Darderi')
  ),
  (
    (SELECT id FROM TOURNAMENTS WHERE name = 'Plava Laguna Croatia Open Umag'),
    '2026-07-13',
    '2026-07-19',
    2026,
    (SELECT id FROM TENNIS_PLAYERS WHERE name = 'Daniel Mérida'),
    (SELECT id FROM TENNIS_PLAYERS WHERE name = 'Damir Džumhur')
  ),
  (
    (SELECT id FROM TOURNAMENTS WHERE name = 'Generali Open Kitzbühel'),
    '2026-07-20',
    '2026-07-25',
    2026,
    (SELECT id FROM TENNIS_PLAYERS WHERE name = 'Quentin Halys'),
    (SELECT id FROM TENNIS_PLAYERS WHERE name = 'Alexander Bublik')
  );

COMMIT;
