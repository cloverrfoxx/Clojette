//   Copyright (C) 2026 lattiahirvio
//
//   This file is part of Clojette.
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

__runtimeTag__ = function	
end function

lispError = function(msg)
	print("ERROR: "+ msg)
    return {"classID": "error", "__tag__": @__runtimeTag__, "message": msg}
end function

import_code("/home/<user>/clojette/clojette-env.src")    // sets up globalEnv + natives = {}
import_code("/home/<user>/clojette/clojette-stdlib.src")  // adds Clojette builtins
import_code("/home/<user>/clojette/clojette-core.src")    // eval, parse etc
import_code("/home/<user>/clojette/clojette-interop.src") // registers native GH functions

// boot the stdlib
macros = "(import ./macros.lisp)"
stdlib = "(import ./stdlib.lisp)"
tests = "(import ./tests.lisp)"
eval(parse(macros), globalEnv)
eval(parse(stdlib), globalEnv)
eval(parse(tests), globalEnv)

// REPL
while true
    input = user_input("Clojette> ")
    if input == "exit" or input == "quit" or input == "q" then break
    result = eval(parse(input), globalEnv)
    print(result)
end while
