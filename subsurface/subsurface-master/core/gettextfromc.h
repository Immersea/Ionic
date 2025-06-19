// SPDX-License-Identifier: GPL-2.0
#ifndef GETTEXTFROMC_H
#define GETTEXTFROMC_H

#ifdef __EMSCRIPTEN__
// Stub QCoreApplication and translation macros for WebAssembly build
inline const char* trGettext(const char* text) { return text; }
#define Q_DECLARE_TR_FUNCTIONS(Class)
class QCoreApplication {};
#else
#include <QCoreApplication>
const char *trGettext(const char *text);
#define Q_DECLARE_TR_FUNCTIONS(Class) Q_COREAPP_STARTUP_FUNCTION
#endif

#endif // GETTEXTFROMC_H
