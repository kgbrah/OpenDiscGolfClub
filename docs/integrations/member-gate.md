# Member Directory Gate

The member gate is optional and client-side. It is useful for low-risk privacy, but it is not a secure access-control system because all browser-delivered data can be inspected by a determined visitor.

```json
{
  "members": {
    "gate": {
      "password": "club-password",
      "codePhrase": "ask a member",
      "hint": "Shared with paid members"
    }
  }
}
```

For sensitive member data, put the data behind your own authenticated backend and expose only the data the visitor is allowed to see.

