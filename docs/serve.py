#!/usr/bin/env python3

import os
import sys

from pathlib import Path

from twisted.web.server import Site, GzipEncoderFactory
from twisted.web.static import File
from twisted.web.resource import Resource, EncodingResourceWrapper
from twisted.internet import reactor

SERVE_DIR = Path(".")

def watch():
    from watchdog.observers import Observer
    from watchdog.events import FileSystemEventHandler
    class OnDirectoryChanged(FileSystemEventHandler):
        def on_modified(self, event):
            if event.event_type != 'modified':
                return
            print(f'{event.src_path} was modified\nrestarting...')
            os.execl(sys.executable, *([sys.executable]+sys.argv))
    handler = OnDirectoryChanged(reactor)
    observer = Observer()
    observer.schedule(handler, path='.', recursive=True)
    observer.start()

def serve():
    port = 8000
    webdir = File(SERVE_DIR)
    webdir.contentTypes['.wasm'] = 'application/wasm'
    wrapped = EncodingResourceWrapper(webdir, [GzipEncoderFactory()])
    print("Serving at http://localhost:8000")
    reactor.listenTCP(port, Site(wrapped))
    reactor.run()

if __name__ == "__main__":
      serve()
