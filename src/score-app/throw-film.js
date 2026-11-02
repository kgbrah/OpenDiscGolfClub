import React from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronUp, Video, X } from "lucide-react";

import { useAccessibleDialog } from "../shared/a11y.js";
import { resolveApiBase } from "../shared/api-base.js";
import { liveRoundCodeFromSearch } from "../shared/live-watch.js";
import { readMemberToken } from "../shared/member-session.js";
import { readOpenPlayToken } from "./open-play-session.js";

const h = React.createElement;
const MAX_SECONDS = 12;
const CLIPS_EVENT = "gvdg:throw-clips";
const CLIP_POLL_MS = 5000;

function icon(Icon) {
  return h(Icon, { "aria-hidden": "true", focusable: "false", size: 16, strokeWidth: 2.4 });
}

export function suggestedMoment(strokes, par) {
  if (typeof strokes !== "number" || typeof par !== "number") return null;
  if (strokes === 1) return "ace";
  if (strokes < par) return "birdie";
  return null;
}

export function clipScopeFromLocation(loc) {
  const params = new URLSearchParams((loc && loc.search) || "");
  const code = liveRoundCodeFromSearch(params);
  const eventId = String(params.get("event") || "").replace(/[^0-9]/g, "");
  if (code) return { key: code, listPath: "/rounds/" + code + "/live/clips" };
  if (eventId) return { key: eventId, listPath: "/events/" + eventId + "/live/clips" };
  return null;
}

function guestToken() {
  try {
    return new URLSearchParams(window.location.search).get("gt") || "";
  } catch {
    return "";
  }
}

function authHeaders(token) {
  return token ? { Authorization: "Bearer " + token } : {};
}

function withGuest(path) {
  const token = readMemberToken() || readOpenPlayToken() || "";
  const gt = token ? "" : guestToken();
  if (!gt) return { path, token };
  return { path: path + (path.includes("?") ? "&" : "?") + "gt=" + encodeURIComponent(gt), token };
}

async function readJson(response) {
  try { return await response.json(); } catch { return null; }
}

export function useThrowClips(options) {
  const refresh = !options || options.refresh !== false;
  const scope = React.useMemo(() => clipScopeFromLocation(window.location), []);
  const api = React.useMemo(() => resolveApiBase({ datasetKeys: ["apiBase"] }), []);
  const [clips, setClips] = React.useState([]);

  React.useEffect(() => {
    if (!scope) return undefined;
    let alive = true;
    const controller = new AbortController();
    async function load() {
      if (typeof document !== "undefined" && document.hidden) return;
      try {
        const { path } = withGuest(scope.listPath);
        const response = await fetch(api + path, { cache: "no-store", signal: controller.signal });
        const data = response.ok ? await response.json() : null;
        if (alive && data && Array.isArray(data.clips)) setClips(data.clips);
      } catch {
        /* keep the last list; a blip shouldn't blank the round */
      }
    }
    void load();
    const onChange = () => { void load(); };
    window.addEventListener(CLIPS_EVENT, onChange);
    const timer = refresh ? window.setInterval(() => { void load(); }, CLIP_POLL_MS) : 0;
    const onVisible = () => {
      if (!document.hidden) void load();
    };
    if (refresh && typeof document !== "undefined") document.addEventListener("visibilitychange", onVisible);
    return () => {
      alive = false;
      controller.abort();
      window.removeEventListener(CLIPS_EVENT, onChange);
      if (timer) window.clearInterval(timer);
      if (refresh && typeof document !== "undefined") document.removeEventListener("visibilitychange", onVisible);
    };
  }, [api, refresh, scope]);

  return { api, clips, scope };
}

function momentLabel(moment) {
  if (moment === "ace") return "Ace";
  if (moment === "birdie") return "Birdie";
  return "Highlight";
}

export function RoundHighlights(props) {
  const { api, clips } = useThrowClips({ refresh: props.live !== false });
  const [open, setOpen] = React.useState(false);
  const rows = clips.filter((clip) => clip && clip.mediaPath);
  if (!rows.length) return null;
  const canStar = props.canStar === true;
  const countLabel = rows.length === 1 ? "1 clip" : rows.length + " clips";
  async function toggle(clip) {
    const { path, token } = withGuest(clip.mediaPath.replace(/\/media$/, "/highlight"));
    const response = await fetch(api + path, {
      body: JSON.stringify({ highlight: !clip.highlight }),
      headers: { ...authHeaders(token), "Content-Type": "application/json" },
      method: "POST",
    });
    if (response.ok) window.dispatchEvent(new CustomEvent(CLIPS_EVENT));
  }
  return h("section", {
    className: "throw-highlights" + (open ? " open" : ""),
    "data-react-throw-highlights": open ? "open" : "collapsed",
  }, [
    h("button", {
      "aria-controls": "throw-videos-body",
      "aria-expanded": open ? "true" : "false",
      "aria-label": open ? "Minimize throw videos" : "Expand throw videos",
      className: "throw-highlights-head",
      key: "head",
      type: "button",
      onClick: () => setOpen((value) => !value),
    }, [
      h("span", { className: "throw-highlights-copy", key: "copy" }, [
        h("span", { className: "throw-highlights-title", key: "title" }, "Throw videos"),
        h("span", { className: "throw-highlights-meta", key: "meta" }, countLabel + " · stays with this round"),
      ]),
      h("span", { className: "throw-highlights-toggle", key: "toggle" }, [
        h("span", { key: "label" }, open ? "Minimize" : "Expand"),
        h(open ? ChevronUp : ChevronDown, {
          "aria-hidden": "true",
          focusable: "false",
          key: "chev",
          size: 14,
          strokeWidth: 2.4,
        }),
      ]),
    ]),
    open ? h("div", { className: "throw-highlights-row", id: "throw-videos-body", key: "row" }, rows.map((clip) =>
      h("figure", { className: "throw-highlight", key: clip.id }, [
        h("video", {
          controls: true,
          key: "video",
          playsInline: true,
          preload: "metadata",
          src: api + clip.mediaPath,
        }),
        h("figcaption", { key: "cap" }, [
          clip.highlight ? momentLabel(clip.moment) + " · " : "",
          clip.playerName,
          " · Hole " + clip.hole,
        ]),
        canStar ? h("button", {
          className: "throw-highlight-star",
          key: "star",
          onClick: () => { void toggle(clip); },
          type: "button",
        }, clip.highlight ? "Unstar" : "Star highlight") : null,
      ]),
    )) : null,
  ]);
}

function highestVideoConstraints(capabilities) {
  const caps = capabilities || {};
  const width = Number(caps.width && caps.width.max);
  const height = Number(caps.height && caps.height.max);
  return {
    frameRate: { ideal: 30 },
    width: { ideal: Number.isFinite(width) && width > 0 ? width : 3840 },
    height: { ideal: Number.isFinite(height) && height > 0 ? height : 2160 },
  };
}

function throwVideoBitrate(width, height) {
  const pixels = (Number(width) || 1920) * (Number(height) || 1080);
  const wanted = Math.round(pixels * 30 * 0.08);
  // Twelve seconds at this rate, plus audio, stays under the 6MB clip limit.
  return Math.min(Math.max(wanted, 2_000_000), 3_200_000);
}

async function useHighestCameraMode(stream) {
  const track = stream.getVideoTracks()[0];
  if (!track || typeof track.getCapabilities !== "function") return track || null;
  const caps = track.getCapabilities() || {};
  const settings = typeof track.getSettings === "function" ? track.getSettings() : {};
  const maxW = Number(caps.width && caps.width.max) || 0;
  const maxH = Number(caps.height && caps.height.max) || 0;
  const curW = Number(settings.width) || 0;
  const curH = Number(settings.height) || 0;
  if (maxW > curW || maxH > curH) {
    try {
      await track.applyConstraints(highestVideoConstraints(caps));
    } catch {
      /* the open request already asked for the highest mode */
    }
  }
  return track;
}

function recorderMime() {
  if (typeof MediaRecorder === "undefined") return "";
  if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")) return "video/webm;codecs=vp8,opus";
  if (MediaRecorder.isTypeSupported("video/webm")) return "video/webm";
  if (MediaRecorder.isTypeSupported("video/mp4")) return "video/mp4";
  return "";
}

export function ThrowFilm(props) {
  const { api, scope } = useThrowClips();
  const [open, setOpen] = React.useState(false);
  const rows = Array.isArray(props.rows) ? props.rows : [];
  const hole = props.hole && props.hole.hole;
  const par = props.hole && props.hole.par;
  if (!scope || !rows.length || !hole) return null;
  return h(React.Fragment, null, [
    h("button", {
      "aria-label": "Film a throw",
      className: "score-glove-tool",
      key: "film",
      title: "Film a throw",
      type: "button",
      onClick: () => setOpen(true),
    }, [icon(Video), h("span", { key: "label" }, "Film")]),
    open ? h(ThrowFilmSheet, {
      api,
      hole,
      key: "sheet",
      listPath: scope.listPath,
      par,
      rows,
      onClose: () => setOpen(false),
    }) : null,
  ]);
}

function ThrowFilmSheet(props) {
  const dialog = useAccessibleDialog({
    open: true,
    onClose: props.onClose,
    labelledBy: "throw-film-title",
    label: "Film a throw",
  });
  const rows = props.rows;
  const [playerKey, setPlayerKey] = React.useState(() => {
    const me = rows.find((row) => row.isMe);
    return String((me || rows[0]).key);
  });
  const player = rows.find((row) => String(row.key) === playerKey) || rows[0];
  const moment = suggestedMoment(player.currentScore, props.par);
  const [highlight, setHighlight] = React.useState(Boolean(moment));
  const [phase, setPhase] = React.useState("idle");
  const [error, setError] = React.useState("");
  const [seconds, setSeconds] = React.useState(0);
  const [clipUrl, setClipUrl] = React.useState("");
  const [blob, setBlob] = React.useState(null);
  const liveRef = React.useRef(null);
  const playRef = React.useRef(null);
  const streamRef = React.useRef(null);
  const recorderRef = React.useRef(null);
  const chunksRef = React.useRef([]);
  const timerRef = React.useRef(0);

  React.useEffect(() => {
    setHighlight(Boolean(suggestedMoment(player.currentScore, props.par)));
  }, [player.key, player.currentScore, props.par]);

  React.useEffect(() => () => {
    window.clearInterval(timerRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());
    if (clipUrl) URL.revokeObjectURL(clipUrl);
  }, [clipUrl]);

  function stopStream() {
    if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  async function start() {
    setError("");
    const mime = recorderMime();
    if (!mime || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("This phone can't record video in the browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          ...highestVideoConstraints(),
          facingMode: { ideal: "environment" },
        },
      });
      streamRef.current = stream;
      const track = await useHighestCameraMode(stream);
      const settings = track && typeof track.getSettings === "function" ? track.getSettings() : {};
      if (liveRef.current) liveRef.current.srcObject = stream;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream, {
        mimeType: mime,
        audioBitsPerSecond: 128000,
        videoBitsPerSecond: throwVideoBitrate(settings.width, settings.height),
      });
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const next = new Blob(chunksRef.current, { type: mime.split(";")[0] });
        stopStream();
        if (clipUrl) URL.revokeObjectURL(clipUrl);
        setBlob(next);
        setClipUrl(URL.createObjectURL(next));
        setPhase("review");
      };
      recorderRef.current = recorder;
      recorder.start();
      setSeconds(0);
      setPhase("recording");
      const started = Date.now();
      timerRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - started) / 1000);
        setSeconds(elapsed);
        if (elapsed >= MAX_SECONDS && recorder.state === "recording") recorder.stop();
      }, 250);
    } catch {
      setError("Camera permission is needed to film the throw.");
    }
  }

  function stop() {
    window.clearInterval(timerRef.current);
    const recorder = recorderRef.current;
    if (recorder && recorder.state === "recording") recorder.stop();
    else stopStream();
  }

  async function save() {
    if (!blob || phase === "saving") return;
    if (blob.size > 6_000_000) {
      setError("That clip is too long to save. Record a shorter one.");
      return;
    }
    setPhase("saving");
    setError("");
    const source = player.source || {};
    const index = Array.isArray(source.playerIndexes) ? source.playerIndexes[0] : source.index;
    const playerName = source.type === "pair" ? "" : String(player.label || "").replace(/\s+\(you\)$/i, "");
    const query = new URLSearchParams({
      hole: String(props.hole),
      highlight: highlight ? "1" : "0",
      moment: moment || (highlight ? "manual" : ""),
      playerIndex: String(index),
      playerName,
    });
    const { path, token } = withGuest(props.listPath + "?" + query.toString());
    try {
      const response = await fetch(props.api + path, {
        body: blob,
        headers: { ...authHeaders(token), "Content-Type": blob.type || "application/octet-stream" },
        method: "POST",
      });
      const data = await readJson(response);
      if (!response.ok) {
        const reason = data && data.error === "clip_limit"
          ? "This round already has enough clips."
          : data && data.error === "round_not_live"
            ? "The round isn't live, so the clip wasn't saved."
            : "The clip didn't save. Try again.";
        setError(reason);
        setPhase("review");
        return;
      }
      window.dispatchEvent(new CustomEvent(CLIPS_EVENT));
      props.onClose();
    } catch {
      setError("Network hiccup. The clip is still on this phone until you close this.");
      setPhase("review");
    }
  }

  const title = moment === "ace"
    ? "That's an ace. Save it as a highlight?"
    : moment === "birdie"
      ? "Birdie. Star it as a highlight?"
      : "Film the throw. Star it if it's a highlight.";

  return createPortal(h("div", {
    className: "overlay",
    "data-a11y-overlay": "true",
    ref: dialog.overlayRef,
    role: "presentation",
  }, h("div", {
    "aria-label": "Film a throw",
    "aria-labelledby": "throw-film-title",
    "aria-modal": dialog.isolated ? "true" : undefined,
    className: "sheet throw-film-sheet",
    ref: dialog.panelRef,
    role: "dialog",
    tabIndex: -1,
  }, [
    h("div", { className: "grab", key: "grab" }),
    h("div", { className: "throw-film-head", key: "head" }, [
      h("h2", { className: "section", id: "throw-film-title", key: "title" }, "Hole " + props.hole + " throw"),
      h("button", {
        "aria-label": "Close",
        className: "iconbtn",
        key: "close",
        onClick: props.onClose,
        type: "button",
      }, icon(X)),
    ]),
    h("p", { className: "muted", key: "hint" }, title),
    h("label", { className: "lbl", key: "who" }, [
      "Player",
      h("select", {
        key: "select",
        onChange: (event) => setPlayerKey(event.target.value),
        value: String(player.key),
      }, rows.map((row) => h("option", { key: row.key, value: String(row.key) }, row.label))),
    ]),
    phase === "review"
      ? h("video", { autoPlay: true, className: "throw-film-preview", controls: true, key: "play", playsInline: true, ref: playRef, src: clipUrl })
      : h("video", { autoPlay: true, className: "throw-film-preview", key: "live", muted: true, playsInline: true, ref: liveRef }),
    phase === "recording" ? h("p", { className: "throw-film-timer", key: "timer" }, "Recording " + seconds + "s / " + MAX_SECONDS + "s") : null,
    error ? h("p", { className: "throw-film-error", key: "error", role: "alert" }, error) : null,
    h("label", { className: "throw-film-star", key: "star" }, [
      h("input", {
        checked: highlight,
        key: "check",
        onChange: (event) => setHighlight(event.target.checked),
        type: "checkbox",
      }),
      "Round highlight",
    ]),
    h("div", { className: "throw-film-actions", key: "actions" }, [
      phase === "recording"
        ? h("button", { className: "btn primary", key: "stop", onClick: stop, type: "button" }, "Stop")
        : phase === "review" || phase === "saving"
          ? h("button", { className: "btn primary", disabled: phase === "saving", key: "save", onClick: () => { void save(); }, type: "button" }, phase === "saving" ? "Saving" : "Save to round")
          : h("button", { className: "btn primary", key: "start", onClick: () => { void start(); }, type: "button" }, "Record"),
      phase === "review"
        ? h("button", { className: "btn", key: "retake", onClick: () => { setPhase("idle"); setBlob(null); }, type: "button" }, "Retake")
        : null,
    ]),
    h("p", { className: "muted throw-film-note", key: "note" }, "A cardmate films it. The clip stays with this round. Highlights are the ones you star."),
  ])), document.body);
}
