# 1.1.3
Non-full release.

## Additions
- Guard system tests

## Bugfixes
- Guard system would crash sometimes :c

# 1.1.2
New release! Now with improved stability and reader macros!

## Additions
- made a discord! go join it! 
- keyword map access. Basically (:x my-map) works now.
- Guard() functionality. Guard() checks the arguments you give in stdlib. This should improve stability. It is also usable from the language, too!
- refactored Clojette to be its own namespace, so that it doesn't pollute the globals.
- added multiple native functions to the natives list, including get-custom-object and poll-input.

## Bugfixes
- Added a missing ) to the end of the stdlib (oops)
- Fixed up the docs
- many, many more bugfixes I cant be bothered to list...

# 1.0.2
WIP, not a full release, but I am throwing changes here as they come.

## Additions
- Better docs! Go look at them!
- Moved stdlib to `/lib/clojette/*`
- Relicensed Clojette. Now you may link the library...
- More reader macros! Now with `x#` (auto-gensym), `#()` (anonymous functions), and map definitions through {}.
- Did I mention better map support? It was even mentioned in the docs before this behavior was in the language -.-

## Bugfixes
- many

# 1.0.1
Small update!

## Additions
- REPL prints errors and their stacktraces now!
- Actual documentation.
- Namespaces
- stack traces
- `while` macro
- `yield` and `format-columns` added to natives
- fixes to the test suite
- NS tests
- `/` handles unary reciprocal now

## Bugfixes
- fixes to the test suite
- fixed `recur`
- fixed `and`, now it returns on the first falsy value
- fixed `try/catch`

# 1.0.0
Initial release.
