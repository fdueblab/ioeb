#!/usr/bin/env python3
"""Create the coordinated IOEB platform production release.

The script is intentionally conservative: it validates and prints the release
plan by default. Add --execute to create GitHub Releases, which will trigger
the production deploy workflows in each repository.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import re
import shlex
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.parse
from pathlib import Path
from typing import Any


VERSION_RE = re.compile(r"^v\d{4}\.\d{2}\.\d{2}(?:\.\d+)?$")
FIXED_REF_RE = re.compile(r"^[0-9a-fA-F]{7,40}$")

DEFAULT_RELEASE_ORDER = ["backend", "agent", "frontend"]
DEFAULT_WORKFLOWS = {
    "fdueblab/ioeb_backend": ["CI"],
    "fdueblab/Micro-Agent": ["CI"],
    "fdueblab/ioeb": ["CI", "Build & Deploy Docs"],
}


class ReleaseError(RuntimeError):
    pass


def run(cmd: list[str], *, check: bool = True) -> subprocess.CompletedProcess[str]:
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if check and proc.returncode != 0:
        rendered = " ".join(shlex.quote(part) for part in cmd)
        raise ReleaseError(
            f"Command failed: {rendered}\nSTDOUT:\n{proc.stdout}\nSTDERR:\n{proc.stderr}"
        )
    return proc


def gh_json(args: list[str], *, attempts: int = 3) -> Any:
    last_error = ""
    for attempt in range(1, attempts + 1):
        proc = run(["gh", *args], check=False)
        if proc.returncode == 0:
            try:
                return json.loads(proc.stdout)
            except json.JSONDecodeError:
                last_error = f"gh did not return JSON for args {args}: {proc.stdout}"
        else:
            rendered = " ".join(shlex.quote(part) for part in ["gh", *args])
            last_error = (
                f"Command failed: {rendered}\n"
                f"STDOUT:\n{proc.stdout}\nSTDERR:\n{proc.stderr}"
            )
        if attempt < attempts:
            time.sleep(min(2 ** (attempt - 1), 5))
    raise ReleaseError(last_error)


def load_manifest(path: str) -> dict[str, Any]:
    if path == "-":
        return json.load(sys.stdin)
    with Path(path).open("r", encoding="utf-8") as fh:
        return json.load(fh)


def normalize_components(raw_components: Any) -> list[dict[str, Any]]:
    if isinstance(raw_components, dict):
        components = []
        for name, value in raw_components.items():
            if not isinstance(value, dict):
                raise ReleaseError(f"Component {name!r} must be an object")
            components.append({"name": name, **value})
        return components

    if isinstance(raw_components, list):
        components = []
        for value in raw_components:
            if not isinstance(value, dict):
                raise ReleaseError("Each component must be an object")
            components.append(value)
        return components

    raise ReleaseError("Manifest must contain components as a list or object")


def ordered_components(manifest: dict[str, Any]) -> list[dict[str, Any]]:
    components = normalize_components(manifest.get("components"))
    order = manifest.get("releaseOrder") or DEFAULT_RELEASE_ORDER
    order_index = {name: index for index, name in enumerate(order)}
    return sorted(
        components,
        key=lambda item: (order_index.get(item.get("name"), len(order_index)), item.get("name", "")),
    )


def validate_manifest(manifest: dict[str, Any]) -> tuple[str, list[dict[str, Any]]]:
    version = manifest.get("version")
    if not isinstance(version, str) or not VERSION_RE.fullmatch(version):
        raise ReleaseError("version must match vYYYY.MM.DD or vYYYY.MM.DD.N")

    components = ordered_components(manifest)
    if not components:
        raise ReleaseError("Manifest must contain at least one component")

    seen_names: set[str] = set()
    for component in components:
        name = component.get("name")
        repo = component.get("repo")
        ref = component.get("ref")
        if not isinstance(name, str) or not name:
            raise ReleaseError("Each component needs a non-empty name")
        if name in seen_names:
            raise ReleaseError(f"Duplicate component name: {name}")
        seen_names.add(name)
        if not isinstance(repo, str) or "/" not in repo:
            raise ReleaseError(f"Component {name} needs repo in owner/name form")
        if not isinstance(ref, str) or not ref:
            raise ReleaseError(f"Component {name} needs a commit ref")

    return version, components


def ensure_gh_ready() -> None:
    if shutil.which("gh") is None:
        raise ReleaseError("GitHub CLI gh is required")
    run(["gh", "auth", "status"])


def resolve_commit(repo: str, ref: str) -> str:
    encoded = urllib.parse.quote(ref, safe="")
    data = gh_json(["api", f"repos/{repo}/commits/{encoded}"])
    sha = data.get("sha")
    if not isinstance(sha, str) or not re.fullmatch(r"[0-9a-f]{40}", sha):
        raise ReleaseError(f"Could not resolve {repo}@{ref} to a commit SHA")
    return sha


def release_exists(repo: str, version: str) -> bool:
    return run(["gh", "release", "view", version, "--repo", repo], check=False).returncode == 0


def tag_target_sha(repo: str, version: str) -> str | None:
    encoded = urllib.parse.quote(version, safe="")
    proc = run(["gh", "api", f"repos/{repo}/git/ref/tags/{encoded}"], check=False)
    if proc.returncode != 0:
        return None

    data = json.loads(proc.stdout)
    obj = data.get("object") or {}
    obj_type = obj.get("type")
    obj_sha = obj.get("sha")
    if obj_type == "commit":
        return obj_sha
    if obj_type == "tag" and obj_sha:
        tag_data = gh_json(["api", f"repos/{repo}/git/tags/{obj_sha}"])
        target = tag_data.get("object") or {}
        return target.get("sha")
    return obj_sha


def render_release_notes(
    manifest: dict[str, Any],
    component: dict[str, Any],
    resolved: dict[str, str],
) -> str:
    version = manifest["version"]
    summary = manifest.get("summary", "")
    checks = manifest.get("checks", [])
    rollback = manifest.get("rollback", {})

    lines = [
        f"# IOEB Platform {version}",
        "",
        "This GitHub Release is part of the coordinated IOEB production release.",
        "",
        f"- Component: {component['name']}",
        f"- Repository: {component['repo']}",
        f"- Requested ref: {component['ref']}",
        f"- Resolved commit: {resolved[component['name']]}",
    ]
    if component.get("deploys"):
        lines.append(f"- Deploy targets: {', '.join(component['deploys'])}")
    if summary:
        lines.extend(["", "## Summary", "", str(summary)])
    if checks:
        lines.extend(["", "## Pre-release Checks", ""])
        lines.extend(f"- {item}" for item in checks)
    if rollback:
        lines.extend(["", "## Rollback", ""])
        for key, value in rollback.items():
            lines.append(f"- {key}: {value}")

    compact_manifest = {
        "version": manifest.get("version"),
        "releaseOrder": manifest.get("releaseOrder"),
        "components": manifest.get("components"),
        "checks": manifest.get("checks"),
        "rollback": manifest.get("rollback"),
    }
    lines.extend(
        [
            "",
            "## Manifest",
            "",
            "```json",
            json.dumps(compact_manifest, ensure_ascii=False, indent=2),
            "```",
            "",
        ]
    )
    return "\n".join(lines)


def create_release(
    manifest: dict[str, Any],
    component: dict[str, Any],
    resolved: dict[str, str],
    *,
    skip_existing: bool,
) -> bool:
    repo = component["repo"]
    version = manifest["version"]
    sha = resolved[component["name"]]

    existing_tag_sha = tag_target_sha(repo, version)
    if existing_tag_sha and existing_tag_sha != sha:
        raise ReleaseError(
            f"{repo} already has tag {version} at {existing_tag_sha}, expected {sha}"
        )

    if release_exists(repo, version):
        if skip_existing:
            print(f"skip existing release: {repo} {version}")
            return False
        raise ReleaseError(f"{repo} already has release {version}")

    notes = render_release_notes(manifest, component, resolved)
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", delete=False) as fh:
        fh.write(notes)
        notes_file = fh.name

    title = f"IOEB Platform {version}"
    if component["name"] != "frontend":
        title = f"{title} ({component['name']})"

    try:
        run(
            [
                "gh",
                "release",
                "create",
                version,
                "--repo",
                repo,
                "--target",
                sha,
                "--title",
                title,
                "--notes-file",
                notes_file,
            ]
        )
    finally:
        try:
            os.unlink(notes_file)
        except OSError:
            pass

    print(f"created release: {repo} {version} @ {sha[:12]}")
    return True


def parse_time(value: str) -> dt.datetime:
    return dt.datetime.fromisoformat(value.replace("Z", "+00:00"))


def wait_for_workflow(
    repo: str,
    workflow: str,
    sha: str,
    created_after: dt.datetime,
    *,
    timeout_seconds: int,
    poll_interval: int,
) -> None:
    deadline = time.monotonic() + timeout_seconds
    matched_run: dict[str, Any] | None = None

    while time.monotonic() < deadline:
        runs = gh_json(
            [
                "run",
                "list",
                "--repo",
                repo,
                "--workflow",
                workflow,
                "--event",
                "release",
                "--limit",
                "20",
                "--json",
                "databaseId,workflowName,status,conclusion,headSha,createdAt,url",
            ]
        )
        candidates = []
        for item in runs:
            if item.get("headSha") != sha:
                continue
            created_at = parse_time(item["createdAt"])
            if created_at >= created_after - dt.timedelta(minutes=2):
                candidates.append(item)
        if candidates:
            candidates.sort(key=lambda item: item["createdAt"], reverse=True)
            matched_run = candidates[0]
            status = matched_run.get("status")
            conclusion = matched_run.get("conclusion")
            url = matched_run.get("url")
            print(f"{repo} {workflow}: {status} {conclusion or ''} {url}".rstrip())
            if status == "completed":
                if conclusion == "success":
                    return
                raise ReleaseError(f"{repo} {workflow} finished with {conclusion}: {url}")

        time.sleep(poll_interval)

    if matched_run:
        raise ReleaseError(f"Timed out waiting for {repo} {workflow}: {matched_run.get('url')}")
    raise ReleaseError(f"Timed out waiting for {repo} {workflow} run to appear")


def print_plan(
    manifest: dict[str, Any],
    components: list[dict[str, Any]],
    resolved: dict[str, str],
) -> None:
    print(f"Release plan: {manifest['version']}")
    for index, component in enumerate(components, start=1):
        name = component["name"]
        repo = component["repo"]
        ref = component["ref"]
        workflows = component.get("releaseWorkflows") or DEFAULT_WORKFLOWS.get(repo, [])
        print(f"{index}. {name}: {repo}@{ref} -> {resolved[name]}")
        if component.get("deploys"):
            print(f"   deploys: {', '.join(component['deploys'])}")
        if workflows:
            print(f"   waits for: {', '.join(workflows)}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("manifest", help="Path to platform release manifest JSON, or - for stdin")
    parser.add_argument("--execute", action="store_true", help="Create GitHub Releases")
    parser.add_argument("--yes", action="store_true", help="Skip interactive confirmation")
    parser.add_argument("--skip-existing", action="store_true", help="Skip releases that already exist")
    parser.add_argument("--allow-floating-refs", action="store_true", help="Allow branch names with --execute")
    parser.add_argument("--wait", action=argparse.BooleanOptionalAction, default=True)
    parser.add_argument("--timeout", type=int, default=1800, help="Workflow wait timeout per workflow")
    parser.add_argument("--poll-interval", type=int, default=15, help="Workflow polling interval")
    args = parser.parse_args()

    ensure_gh_ready()
    manifest = load_manifest(args.manifest)
    version, components = validate_manifest(manifest)
    manifest["version"] = version

    resolved = {component["name"]: resolve_commit(component["repo"], component["ref"]) for component in components}
    print_plan(manifest, components, resolved)

    floating = [
        component
        for component in components
        if not FIXED_REF_RE.fullmatch(component["ref"])
    ]
    if floating:
        names = ", ".join(f"{item['name']}={item['ref']}" for item in floating)
        message = f"Floating refs detected: {names}"
        if args.execute and not args.allow_floating_refs:
            raise ReleaseError(message + ". Replace them with commit SHAs or pass --allow-floating-refs.")
        print("warning:", message)

    if not args.execute:
        print("dry run only; add --execute to create releases")
        return 0

    if not args.yes:
        answer = input(f"Create production releases for {version}? Type {version} to continue: ")
        if answer.strip() != version:
            print("aborted")
            return 1

    for component in components:
        release_started_at = dt.datetime.now(dt.timezone.utc)
        created = create_release(
            manifest,
            component,
            resolved,
            skip_existing=args.skip_existing,
        )
        if created and args.wait:
            workflows = component.get("releaseWorkflows") or DEFAULT_WORKFLOWS.get(component["repo"], [])
            for workflow in workflows:
                wait_for_workflow(
                    component["repo"],
                    workflow,
                    resolved[component["name"]],
                    release_started_at,
                    timeout_seconds=args.timeout,
                    poll_interval=args.poll_interval,
                )

    print(f"platform release complete: {version}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except ReleaseError as exc:
        print(f"error: {exc}", file=sys.stderr)
        raise SystemExit(1)
