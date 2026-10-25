import React from "react";

import { downloadCalendarFile } from "./event-calendar.js";

const h = React.createElement;

export function AddToCalendarButton({ item, className = "passkey-btn" }) {
  if (!item) return null;
  return h("button", {
    className,
    type: "button",
    onClick: () => downloadCalendarFile(item),
  }, "Add to calendar");
}
