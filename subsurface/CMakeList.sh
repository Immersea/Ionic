#!/usr/bin/env bash
set -e

# Determine script directory and switch to it
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# (1) Recupera tutti gli importer e parser XML (compatibile con BSD find)
SRC=$(find "$SCRIPT_DIR/subsurface-master/core" -type f \( -name 'import-*.cpp' -o -name 'parser-xml.cpp' \))

if [ -z "$SRC" ]; then
  echo "Error: No source files found in $SCRIPT_DIR/subsurface-master/core"
  exit 1
fi

# (2) Compila in un unico bundle WASM+JS
emcc $SRC \
  -Icore \
  -O3 \
  -s MODULARIZE=1 \
  -s EXPORT_NAME="createSubsurfaceImporter" \
  -s EXPORTED_FUNCTIONS="[
    '_import_csv','_import_uddf','_import_ssrf',
    '_import_divelogs_de','_import_jdive','_import_liquivision',
    '_import_suunto','_import_divesoft','_import_datatrak',
    '_import_mkvi','_import_apd','_import_ostc','_import_dl7',
    '_import_logtrak','_import_asd',
    '_malloc','_free'
  ]" \
  -s EXPORTED_RUNTIME_METHODS="['UTF8ToString']" \
  -o subsurface-importer.js