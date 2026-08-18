-- ============================================================================
-- Atlas del Tenis — modelo de base de datos SQLite
-- Generado a partir de los datos embebidos en los ficheros js/atp-*-data.js
-- (jugadores, ranking, fotos, torneos, partidos históricos y programados,
-- cumpleaños y palmarés).
-- ============================================================================

PRAGMA foreign_keys = ON;

-- ----------------------------------------------------------------------------
-- players: ficha de cada tenista.
-- Fuente principal: atp-players-map-data.js (name, country, city, birth,
-- right, height), atp-player-photos-data.js (photo), atp-birthdays-calendar.js
-- (day/month/year de nacimiento).
-- El ranking/puntos NO se guardan aquí porque aparecen varias veces con
-- fechas distintas en el origen (mapa, compare-data, palmares-data): se
-- modelan como histórico en player_rankings.
-- ----------------------------------------------------------------------------
CREATE TABLE players (
    id            INTEGER PRIMARY KEY,
    full_name     TEXT NOT NULL UNIQUE,          -- nombre canónico, p.ej. "Jannik Sinner"
    country       TEXT,                          -- país tal cual aparece en el origen (es-ES), p.ej. "Italia"
    country_code  TEXT,                          -- ISO-2 cuando se conoce, p.ej. "IT"
    birth_city    TEXT,
    birth_date    TEXT,                          -- ISO-8601 "YYYY-MM-DD" (derivado de "birth":"20010816")
    handedness    TEXT CHECK (handedness IN ('right', 'left')),
    height_cm     INTEGER,
    photo_url     TEXT,
    CHECK (height_cm IS NULL OR height_cm >= 0)
);

CREATE INDEX idx_players_country ON players(country);
CREATE INDEX idx_players_birth_date ON players(birth_date);

-- ----------------------------------------------------------------------------
-- player_aliases: grafías alternativas del mismo jugador.
-- El propio sitio normaliza tildes/ñ al cruzar ficheros (ver normalize() en
-- atp-history.js), señal de que el mismo tenista aparece escrito de formas
-- distintas según el fichero de origen (con/sin tilde, con/sin guion, etc.):
-- "Alex De Minaur" / "Alex de Miñaur", "Jakub Mensik" / "Jakub Menšík",
-- "Marin Cilic" / "Marin Čilić"...
-- ----------------------------------------------------------------------------
CREATE TABLE player_aliases (
    id         INTEGER PRIMARY KEY,
    player_id  INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    alias      TEXT NOT NULL UNIQUE,
    source     TEXT                              -- fichero de origen del alias, p.ej. "atp-daily-matches-data"
);

CREATE INDEX idx_player_aliases_player ON player_aliases(player_id);

-- ----------------------------------------------------------------------------
-- player_rankings: histórico de posiciones y puntos ATP.
-- Fuente: atp-players-map-data.js (ranking/points), atp-compare-data.js
-- (ATP_COMPARE_RANKING_OVERRIDES con fecha "2026-08-14"), atp-palmares-data.js
-- (ATP_PALMARES_METADATA.rankingDate).
-- ----------------------------------------------------------------------------
CREATE TABLE player_rankings (
    id            INTEGER PRIMARY KEY,
    player_id     INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    ranking_date  TEXT NOT NULL,                 -- ISO-8601 "YYYY-MM-DD"
    ranking       INTEGER,
    points        INTEGER,
    source        TEXT,                          -- p.ej. "atp-players-map-data", "atp-compare-data"
    UNIQUE (player_id, ranking_date, source)
);

CREATE INDEX idx_player_rankings_player ON player_rankings(player_id);
CREATE INDEX idx_player_rankings_date ON player_rankings(ranking_date);

-- ----------------------------------------------------------------------------
-- tournaments: catálogo de torneos ATP con sede y geolocalización.
-- Fuente: atp-tournaments-data.js.
-- ----------------------------------------------------------------------------
CREATE TABLE tournaments (
    id               TEXT PRIMARY KEY,            -- slug de origen, p.ej. "roland-garros"
    name             TEXT NOT NULL,
    category         TEXT,                        -- "Grand Slam", "Masters 1000", ...
    surface          TEXT,                         -- "Hard", "Clay", "Grass", "Carpet"
    venue_street     TEXT,
    venue_city       TEXT,
    venue_country    TEXT,
    lat              REAL,
    lng              REAL,
    first_edition    INTEGER,
    prize_money      TEXT,                        -- texto libre tal cual el origen, p.ej. "68.000.000 €"
    most_titles_note TEXT,                         -- texto libre del origen, p.ej. "Novak Djokovic (10)"
    photo_url        TEXT
);

CREATE INDEX idx_tournaments_name ON tournaments(name);

-- ----------------------------------------------------------------------------
-- matches: tabla unificada de partidos, tanto el archivo histórico indexado
-- (atp-versus-data.js: players[]/tournaments[]/rounds[]/matches[[w,l,t,r,
-- fecha,score]] desde 1968), como los listados planos recientes
-- (atp-history-recent-data.js, atp-history-five-years-data.js,
-- atp-history-amateur-data.js) y los partidos programados/en vivo
-- (atp-daily-matches-data.js, atp-matches-history-data.js,
-- atp-matches-july-data.js, con player1/player2 y el flag "lost").
-- tournament_name se conserva siempre en texto porque muchos torneos
-- históricos (p.ej. eliminatorias de Davis Cup) no están en la tabla
-- tournaments; tournament_id se rellena solo cuando hay correspondencia.
-- ----------------------------------------------------------------------------
CREATE TABLE matches (
    id              INTEGER PRIMARY KEY,
    external_id     TEXT UNIQUE,                  -- id de origen si existe, p.ej. "montreal-2026-qf-jodar-fils"
    tournament_id   TEXT REFERENCES tournaments(id),
    tournament_name TEXT NOT NULL,                -- nombre tal cual el origen
    round           TEXT,                         -- p.ej. "F", "SF", "R32" o "Cuartos de final"
    match_date      TEXT,                         -- ISO-8601 "YYYY-MM-DD"
    match_time      TEXT,                         -- "HH:MM" cuando se conoce (partidos programados/en vivo)
    player1_id      INTEGER REFERENCES players(id),
    player2_id      INTEGER REFERENCES players(id),
    winner_id       INTEGER REFERENCES players(id), -- NULL si el partido aún no se ha disputado
    loser_id        INTEGER REFERENCES players(id),
    score            TEXT,
    status          TEXT NOT NULL DEFAULT 'finished' CHECK (status IN ('scheduled', 'live', 'finished')),
    source          TEXT,                          -- fichero de origen, p.ej. "atp-versus-data"
    CHECK (player1_id IS NULL OR player2_id IS NULL OR player1_id <> player2_id)
);

CREATE INDEX idx_matches_player1 ON matches(player1_id);
CREATE INDEX idx_matches_player2 ON matches(player2_id);
CREATE INDEX idx_matches_winner ON matches(winner_id);
CREATE INDEX idx_matches_tournament ON matches(tournament_id);
CREATE INDEX idx_matches_date ON matches(match_date);

-- ----------------------------------------------------------------------------
-- titles: títulos de palmarés confirmados puntualmente al margen del
-- archivo de partidos (p.ej. ATP_PALMARES_OFFICIAL_UPDATES en
-- atp-palmares-data.js, con categoría de torneo y fecha).
-- Los títulos "históricos" ya deducibles de matches (round = 'F' y
-- winner_id = player_id) no se duplican aquí.
-- ----------------------------------------------------------------------------
CREATE TABLE titles (
    id              INTEGER PRIMARY KEY,
    player_id       INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    tournament_id   TEXT REFERENCES tournaments(id),
    tournament_name TEXT NOT NULL,
    category        TEXT,                         -- p.ej. "Masters 1000"
    title_date      TEXT,                          -- ISO-8601 "YYYY-MM-DD"
    source          TEXT
);

CREATE INDEX idx_titles_player ON titles(player_id);
