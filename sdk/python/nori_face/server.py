"""Static bundle server plus the websocket control channel.

Both run on background threads so ``Face`` stays an ordinary synchronous object
that robot code can call from anywhere.
"""

from __future__ import annotations

import asyncio
import json
import logging
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any, Callable, Dict, Optional, Set

log = logging.getLogger("nori_face")


class _BundleHandler(SimpleHTTPRequestHandler):
    """Serves the built renderer, with pack.json injected from memory so the
    installed bundle directory stays read-only."""

    def __init__(self, *args: Any, pack_bytes: bytes = b"", **kwargs: Any) -> None:
        self._pack_bytes = pack_bytes
        super().__init__(*args, **kwargs)

    def do_GET(self) -> None:  # noqa: N802 - stdlib naming
        if self.path.split("?")[0] == "/pack.json":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(self._pack_bytes)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(self._pack_bytes)
            return
        super().do_GET()

    def log_message(self, fmt: str, *args: Any) -> None:
        log.debug("http: " + fmt, *args)


class BundleServer:
    def __init__(self, directory: Path, pack_json: str, port: int = 0) -> None:
        self._directory = str(directory)
        self._pack_bytes = pack_json.encode("utf-8")
        self._requested_port = port
        self._httpd: Optional[ThreadingHTTPServer] = None
        self._thread: Optional[threading.Thread] = None

    @property
    def port(self) -> int:
        if self._httpd is None:
            raise RuntimeError("server not started")
        return self._httpd.server_address[1]

    def start(self) -> None:
        handler = partial(
            _BundleHandler, directory=self._directory, pack_bytes=self._pack_bytes
        )
        self._httpd = ThreadingHTTPServer(("127.0.0.1", self._requested_port), handler)
        self._httpd.daemon_threads = True
        self._thread = threading.Thread(
            target=self._httpd.serve_forever, name="nori-http", daemon=True
        )
        self._thread.start()
        log.debug("bundle server on http://127.0.0.1:%s", self.port)

    def close(self) -> None:
        if self._httpd is not None:
            self._httpd.shutdown()
            self._httpd.server_close()
            self._httpd = None
        if self._thread is not None:
            self._thread.join(timeout=2)
            self._thread = None


class ControlServer:
    """Websocket channel the renderer connects back on.

    Broadcast-only in practice: the SDK is the source of truth and the page
    merely acknowledges. Acks are surfaced through ``on_ack`` for tests.
    """

    def __init__(self, port: int = 8765, on_ack: Optional[Callable[[Dict[str, Any]], None]] = None) -> None:
        self._requested_port = port
        self._on_ack = on_ack
        self._clients: Set[Any] = set()
        self._loop: Optional[asyncio.AbstractEventLoop] = None
        self._thread: Optional[threading.Thread] = None
        self._server: Any = None
        self._ready = threading.Event()
        self._last_sent: Optional[Dict[str, Any]] = None
        self._port: int = port

    @property
    def port(self) -> int:
        return self._port

    @property
    def client_count(self) -> int:
        return len(self._clients)

    def start(self, timeout: float = 5.0) -> None:
        self._thread = threading.Thread(target=self._run, name="nori-ws", daemon=True)
        self._thread.start()
        if not self._ready.wait(timeout):
            raise RuntimeError("websocket server failed to start")

    def _run(self) -> None:
        import websockets

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        self._loop = loop

        async def start() -> None:
            # websockets >= 12 passes only the connection; older versions add a path.
            async def handler(ws: Any, *_: Any) -> None:
                await self._serve(ws)

            self._server = await websockets.serve(handler, "127.0.0.1", self._requested_port)
            self._port = self._server.sockets[0].getsockname()[1]

        try:
            loop.run_until_complete(start())
            self._ready.set()
            loop.run_forever()
        except Exception:  # pragma: no cover - surfaced via the ready timeout
            log.exception("websocket server stopped")
        finally:
            self._ready.set()
            try:
                loop.run_until_complete(loop.shutdown_asyncgens())
            except Exception:  # noqa: BLE001
                pass
            loop.close()

    async def _serve(self, ws: Any) -> None:
        self._clients.add(ws)
        log.debug("renderer connected (%s total)", len(self._clients))
        try:
            # Bring a reconnecting page back in sync with the current state.
            if self._last_sent is not None:
                await ws.send(json.dumps(self._last_sent))
            async for raw in ws:
                if self._on_ack is None:
                    continue
                try:
                    self._on_ack(json.loads(raw))
                except (ValueError, TypeError):
                    continue
        except Exception:  # noqa: BLE001 - a dropped client must not kill the loop
            log.debug("renderer connection error", exc_info=True)
        finally:
            self._clients.discard(ws)

    def send_state(self, state_id: str) -> None:
        self.broadcast({"type": "set", "state": state_id})

    def broadcast(self, payload: Dict[str, Any]) -> None:
        self._last_sent = payload
        loop = self._loop
        if loop is None or loop.is_closed():
            return
        asyncio.run_coroutine_threadsafe(self._broadcast(payload), loop)

    async def _broadcast(self, payload: Dict[str, Any]) -> None:
        if not self._clients:
            return
        message = json.dumps(payload)
        for ws in list(self._clients):
            try:
                await ws.send(message)
            except Exception:  # noqa: BLE001
                self._clients.discard(ws)

    def close(self) -> None:
        loop = self._loop
        if loop is None or loop.is_closed():
            return

        async def shutdown() -> None:
            for ws in list(self._clients):
                try:
                    await ws.close()
                except Exception:  # noqa: BLE001
                    pass
            if self._server is not None:
                self._server.close()
                try:
                    await asyncio.wait_for(self._server.wait_closed(), timeout=2)
                except Exception:  # noqa: BLE001
                    pass

        # Let the server finish closing before stopping the loop, or its close
        # coroutine is destroyed mid-flight and leaks the listening socket.
        try:
            asyncio.run_coroutine_threadsafe(shutdown(), loop).result(timeout=3)
        except Exception:  # noqa: BLE001
            pass

        loop.call_soon_threadsafe(loop.stop)
        if self._thread is not None:
            self._thread.join(timeout=3)
            self._thread = None
        self._loop = None
        self._server = None
