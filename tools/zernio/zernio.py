#!/usr/bin/env python3
"""Zernio from the command line (stdlib only). The key comes from ZERNIO_API_KEY or the project's .env; it is never printed.

    python3 -I tools/zernio/zernio.py accounts
    python3 -I tools/zernio/zernio.py upload <file>                        → prints the public URL
    python3 -I tools/zernio/zernio.py draft --video <url> --caption <CAPTION.md> [--cover <url>]
                                           [--yt-video <url> --yt-title "…" --yt-desc <file>]   → prints the DRAFT post id
    python3 -I tools/zernio/zernio.py draft --images <url> <url>… --caption <CAPTION.md>      → an Instagram carousel DRAFT
                                           (2–10 slides in order, JPEG/PNG ≤ 8 MB each, all the shape of the first)
    python3 -I tools/zernio/zernio.py analytics [--out research/analytics/posts.json]
    python3 -I tools/zernio/zernio.py insights                               → account totals (30 days) + best times
    python3 -I tools/zernio/zernio.py audit [--out research/analytics/audit.json]   → everything /page-audit needs, one file

Uploads and drafts only ever create DRAFTS. Scheduling happens in the Studio bot (one ✅ on the reel card) or with
`schedule <postId> <UTC ISO>` after the creator said so in chat. Nothing here publishes on its own.
"""
import argparse, json, mimetypes, os, sys, urllib.error, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BASE = os.environ.get("ZERNIO_API", "https://zernio.com/api/v1")


def key():
    k = os.environ.get("ZERNIO_API_KEY")
    if not k and (ROOT / ".env").exists():
        for line in (ROOT / ".env").read_text(encoding="utf-8").splitlines():
            if line.startswith("ZERNIO_API_KEY="):
                k = line.split("=", 1)[1].strip().strip('"')
    if not k:
        sys.exit("ZERNIO_API_KEY missing: put it in .env at the project root (git-ignored) or export it.")
    return k


def call(method, path, body=None):
    req = urllib.request.Request(BASE + path, method=method, data=json.dumps(body).encode() if body is not None else None,
                                 headers={"Authorization": "Bearer " + key(), "content-type": "application/json", "user-agent": "reel-studio"})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return json.loads(r.read() or b"{}")
    except urllib.error.HTTPError as e:
        sys.exit(f"Zernio {method} {path} → {e.code}: {e.read()[:400].decode(errors='replace')}")


def accounts():
    return call("GET", "/accounts").get("accounts", [])


def acc(platform):
    return next((a for a in accounts() if a.get("platform") == platform), None)


def cmd_accounts(a):
    for x in accounts():
        print(f"{x.get('platform'):10} {x.get('username') or x.get('displayName') or '':24} id={x.get('_id')}  followers={x.get('followersCount', '—')}")


def cmd_upload(a):
    p = Path(a.file)
    ctype = mimetypes.guess_type(p.name)[0] or "application/octet-stream"
    pre = call("POST", "/media/presign", {"filename": p.name, "contentType": ctype, "size": p.stat().st_size})
    req = urllib.request.Request(pre["uploadUrl"], method="PUT", data=p.read_bytes(), headers={"content-type": ctype})
    with urllib.request.urlopen(req, timeout=600) as r:
        if r.status >= 300:
            sys.exit(f"upload failed: {r.status}")
    print(pre["publicUrl"])


def cmd_draft(a):
    if a.images and not 2 <= len(a.images) <= 10:
        sys.exit("a carousel has 2 to 10 slides (Instagram's limit)")
    if a.images and (a.cover or a.yt_video):
        sys.exit("--cover and --yt-* are for reels: a carousel's cover is its first slide, and YouTube takes no carousels")
    ig = acc("instagram")
    if not ig:
        sys.exit("no Instagram account connected in Zernio")
    caption = Path(a.caption).read_text(encoding="utf-8").strip()
    if a.images:   # Zernio: several mediaItems on one Instagram post = a carousel, slides in this order
        r = call("POST", "/posts", {"content": caption, "mediaItems": [{"type": "image", "url": u} for u in a.images],
                                    "platforms": [{"platform": "instagram", "accountId": ig["_id"]}], "isDraft": True})
        print((r.get("post") or r).get("_id"))
        return
    media = [{"type": "video", "url": a.video, **({"thumbnail": a.cover} if a.cover else {})}]
    platforms = [{"platform": "instagram", "accountId": ig["_id"], "platformSpecificData": {"shareToFeed": True, **({"instagramThumbnail": a.cover} if a.cover else {})}}]
    yt = acc("youtube") if a.yt_video else None
    if a.yt_video and yt:
        platforms.append({"platform": "youtube", "accountId": yt["_id"], "customContent": Path(a.yt_desc).read_text(encoding="utf-8").strip() if a.yt_desc else caption,
                          "customMedia": [{"type": "video", "url": a.yt_video, **({"thumbnail": a.cover} if a.cover else {})}],
                          "platformSpecificData": {"title": (a.yt_title or "")[:100], "visibility": "public", "madeForKids": False}})
    r = call("POST", "/posts", {"content": caption, "mediaItems": media, "platforms": platforms, "isDraft": True})
    print((r.get("post") or r).get("_id"))


def cmd_schedule(a):
    r = call("PUT", f"/posts/{a.post_id}", {"isDraft": False, "scheduledFor": a.at, "timezone": "UTC"})
    print("scheduled", (r.get("post") or r).get("_id"), a.at)


def cmd_analytics(a):
    ig = acc("instagram"); rows, page = [], 1
    while True:
        d = call("GET", f"/analytics?limit=50&page={page}" + (f"&accountId={ig['_id']}" if ig else ""))
        for x in d.get("posts", []):
            if x.get("platform") not in (None, "instagram"):
                continue
            m = x.get("analytics") or {}; v = m.get("views") or 0
            watch = round(m["igReelsAvgWatchTime"] / 1000, 1) if m.get("igReelsAvgWatchTime") else None
            rows.append({"url": x.get("platformPostUrl"), "posted": (x.get("publishedAt") or "")[:10], "hook": (x.get("content") or "").split("\n")[0][:90],
                         "views": v, "reach": m.get("reach"), "saves": m.get("saves"), "shares": m.get("shares"), "comments": m.get("comments"),
                         "savesPer1k": round(1000 * (m.get("saves") or 0) / v, 1) if v else None,
                         "sharesPer1k": round(1000 * (m.get("shares") or 0) / v, 1) if v else None,
                         "skipRate": m.get("reelsSkipRate"), "avgWatchSec": watch, "duration": m.get("videoDurationSeconds")})
        if page >= (d.get("pagination") or {}).get("pages", 1):
            break
        page += 1
    rows.sort(key=lambda r: r["posted"], reverse=True)
    if a.out:
        Path(a.out).parent.mkdir(parents=True, exist_ok=True)
        Path(a.out).write_text(json.dumps(rows, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"{'posted':10} {'views':>8} {'saves/1k':>8} {'shares/1k':>9} {'skip%':>6}  hook")
    for r in rows:
        print(f"{r['posted']:10} {r['views']:>8} {str(r['savesPer1k']):>8} {str(r['sharesPer1k']):>9} {str(r['skipRate']):>6}  {r['hook']}")


def cmd_insights(a):
    ig = acc("instagram")
    if not ig:
        sys.exit("no Instagram account connected in Zernio")
    m = call("GET", f"/analytics/instagram/account-insights?accountId={ig['_id']}").get("metrics", {})
    print("followers", ig.get("followersCount"))
    for k in ("views", "reach", "accounts_engaged", "total_interactions"):
        print(f"{k:20} {(m.get(k) or {}).get('total')}")
    bt = call("GET", f"/analytics/best-time?accountId={ig['_id']}")
    print("best time (Zernio):", json.dumps(bt, ensure_ascii=False)[:600])


def cmd_audit(a):
    """Read-only bundle for /page-audit: account, 30-day totals, follower history, audience (followers + engaged), online
    hours, best times, posting frequency vs engagement, content decay, every post's numbers. A failing piece is recorded,
    not fatal (new or small accounts lack some of them)."""
    ig = acc("instagram")
    if not ig:
        sys.exit("no Instagram account connected in Zernio")
    i = ig["_id"]; out = {"account": {k: ig.get(k) for k in ("username", "displayName", "followersCount", "accountType")}}
    def safe(name, path):
        try:
            out[name] = call("GET", path)
        except SystemExit as e:
            out[name] = {"error": str(e)[:300]}
    safe("insights30", f"/analytics/instagram/account-insights?accountId={i}")
    safe("followerHistory", f"/analytics/instagram/follower-history?accountId={i}")
    safe("audienceFollowers", f"/analytics/instagram/demographics?accountId={i}&metric=follower_demographics")
    safe("audienceEngaged", f"/analytics/instagram/demographics?accountId={i}&metric=engaged_audience_demographics")
    safe("onlineFollowers", f"/analytics/instagram/online-followers?accountId={i}")
    safe("bestTime", f"/analytics/best-time?accountId={i}")
    safe("postingFrequency", f"/analytics/posting-frequency?accountId={i}")
    safe("contentDecay", f"/analytics/content-decay?accountId={i}")
    posts, page = [], 1
    while page < 10:
        d = call("GET", f"/analytics?limit=50&page={page}&accountId={i}")
        for x in d.get("posts", []):
            m = x.get("analytics") or {}
            posts.append({"url": x.get("platformPostUrl"), "posted": x.get("publishedAt"), "type": x.get("mediaProductType"),
                          "caption": (x.get("content") or "")[:600], **{k: m.get(k) for k in ("views", "reach", "likes", "comments",
                          "shares", "saves", "reelsSkipRate", "igReelsAvgWatchTime", "videoDurationSeconds", "engagementRate")}})
        if page >= (d.get("pagination") or {}).get("pages", 1):
            break
        page += 1
    out["posts"] = posts
    path = Path(a.out or ROOT / "research/analytics/audit.json"); path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    missing = [k for k, v in out.items() if isinstance(v, dict) and "error" in v]
    print(f"audit data → {path} · {len(posts)} posts" + (f" · not available: {', '.join(missing)}" if missing else ""))


ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
sub = ap.add_subparsers(dest="cmd", required=True)
sub.add_parser("accounts").set_defaults(f=cmd_accounts)
s = sub.add_parser("upload"); s.add_argument("file"); s.set_defaults(f=cmd_upload)
s = sub.add_parser("draft"); m = s.add_mutually_exclusive_group(required=True)
m.add_argument("--video", help="the reel's public URL (from upload)"); m.add_argument("--images", nargs="+", metavar="URL", help="carousel slides' public URLs, in order")
s.add_argument("--caption", required=True); s.add_argument("--cover")
s.add_argument("--yt-video"); s.add_argument("--yt-title"); s.add_argument("--yt-desc"); s.set_defaults(f=cmd_draft)
s = sub.add_parser("schedule"); s.add_argument("post_id"); s.add_argument("at", help="UTC ISO, e.g. 2026-11-03T15:00:00Z"); s.set_defaults(f=cmd_schedule)
s = sub.add_parser("analytics"); s.add_argument("--out"); s.set_defaults(f=cmd_analytics)
sub.add_parser("insights").set_defaults(f=cmd_insights)
s = sub.add_parser("audit"); s.add_argument("--out"); s.set_defaults(f=cmd_audit)
a = ap.parse_args(); a.f(a)
