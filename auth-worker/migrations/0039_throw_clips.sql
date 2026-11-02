-- Cardmate throw videos for a live round. Round media only.
-- Do not read this table from handicap, ratings, or casual_results.
CREATE TABLE throw_clips (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  scope        TEXT NOT NULL,
  scope_key    TEXT NOT NULL,
  hole         INTEGER NOT NULL,
  player_name  TEXT NOT NULL,
  player_index INTEGER,
  filmed_by    TEXT NOT NULL,
  r2_key       TEXT NOT NULL,
  content_type TEXT NOT NULL,
  bytes        INTEGER NOT NULL,
  highlight    INTEGER NOT NULL DEFAULT 0,
  moment       TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_throw_clips_scope ON throw_clips(scope, scope_key, highlight DESC, id DESC);
