//   Copyright (C) 2026 lattiahirvio
//
//   This file is part of Clojette.
//   Clojette is licensed under GPLv3 with a special linking/importing exception.
//   See LICENSE for details.
//
//   Clojette is free software: you can redistribute it and/or modify
//   it under the terms of the GNU General Public License as published by
//   the Free Software Foundation, either version 3 of the License, or
//   any later version.
//
//   Clojette is distributed in the hope that it will be useful,
//   but WITHOUT ANY WARRANTY; without even the implied warranty of
//   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//   GNU General Public License for more details.
//
//   You should have received a copy of the GNU General Public License
//   along with Clojette. If not, see <https://www.gnu.org/licenses/>.

// Import the runtime
import_code("<path-to-runtime>")

// boot the stdlib
// DONE: move to a set place in the filesystem.
stdlib = "(do (import /lib/clojette/macros.clj) (import /lib/clojette/stdlib.clj))"
tests = "(import /lib/clojette/tests.clj)"
clojette.eval(clojette.parse(stdlib), clojette.globalEnv)
if clojette.tests == true then 
	clojette.eval(clojette.parse(tests), clojette.globalEnv)
end if

clojette.repl()
