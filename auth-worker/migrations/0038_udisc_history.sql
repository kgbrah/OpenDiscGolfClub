-- Personal UDisc rounds CSV (You → Rounds → Export to CSV). These are the member's own
-- history, not club rounds. Do not read this table from handicap, ratings, or casual_results.
CREATE TABLE udisc_history (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id    TEXT NOT NULL,
  round_key    TEXT NOT NULL,
  player_name  TEXT NOT NULL,
  course_name  TEXT NOT NULL,
  layout_name  TEXT NOT NULL DEFAULT '',
  played_at    TEXT NOT NULL,
  total        INTEGER,
  to_par       INTEGER,
  holes        TEXT NOT NULL,
  imported_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX idx_udisc_history_member_round ON udisc_history(member_id, round_key);
CREATE INDEX idx_udisc_history_member_played ON udisc_history(member_id, played_at DESC, id DESC);
