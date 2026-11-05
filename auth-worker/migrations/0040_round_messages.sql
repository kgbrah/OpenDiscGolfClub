-- Watcher and card messages for one live round. Not a result, handicap, or rating input.
CREATE TABLE round_messages (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  scope       TEXT NOT NULL,
  scope_key   TEXT NOT NULL,
  side        TEXT NOT NULL,
  author_name TEXT NOT NULL,
  to_name     TEXT,
  body        TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_round_messages_scope ON round_messages(scope, scope_key, id);
