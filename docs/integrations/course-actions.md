# Course Action Setup

Course actions are optional and appear only when the matching URL or coordinates are present.

```json
{
  "name": "North Park",
  "location": "River City, NC",
  "holes": 18,
  "difficulty": "Intermediate",
  "udiscUrl": "https://udisc.com/courses/...",
  "coordinates": {
    "lat": 35.631092,
    "lng": -77.319923
  },
  "youtubeUrl": "https://www.youtube.com/watch?v=..."
}
```

- `udiscUrl` enables the UDisc action.
- `coordinates` builds a Google Maps directions URL.
- `mapUrl` can be used instead of coordinates.
- `youtubeUrl` enables the course preview action.

