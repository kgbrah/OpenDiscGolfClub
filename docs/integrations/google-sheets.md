# Google Sheets CSV Setup

Use this when volunteers need to update events, tournaments, members, or records without editing the website.

## Steps

1. Create a Google Sheet.
2. Add column headers in row 1.
3. Choose `File` -> `Share` -> `Publish to web`.
4. Pick the sheet tab, choose `Comma-separated values (.csv)`, and publish.
5. Copy the CSV URL into your OpenDiscGolfClub config.

## Event Columns

```text
title,date,description,url,active
Saturday Singles,2026-08-08,Check in at 9 AM,https://example.com,TRUE
```

## Tournament Columns

```text
name,date,location,tier,url,active
River City Open,Aug 22 2026,River City NC,C-tier,https://example.com,TRUE
```

## Member Columns

```text
firstName,lastName,yearJoined,pdga,special,active
Alex,Rivera,2024,123456,Founder,TRUE
```

Rows with `active` set to `FALSE` are hidden.

