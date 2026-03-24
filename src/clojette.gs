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
  if msg == null then return {"classID": "error", "__tag__": @__runtimeTag__, "message": "Null"}
  return {"classID": "error", "__tag__": @__runtimeTag__, "message": msg}
end function

import_code("/home/<user>/clojette-dev/clojette-env.src")     // sets up globalEnv + natives = {}
import_code("/home/<user>/clojette-dev/clojette-stdlib.src")  // adds Clojette builtins
import_code("/home/<user>/clojette-dev/clojette-core.src")    // eval, parse etc
import_code("/home/<user>/clojette-dev/clojette-interop.src") // registers native GH functions

tests = false

// boot the stdlib
// DONE: move to a set place in the filesystem.
stdlib = "(do (import /lib/clojette/macros.clj) (import /lib/clojette/stdlib.clj))"
tests = "(import /lib/clojette/tests.clj)"
eval(parse(stdlib), globalEnv)
if tests == true then 
	eval(parse(tests), globalEnv)
end if

// REPL
while true
    input = user_input("Clojette> ")
    if input == "exit" or input == "quit" or input == "q" then break
    result = eval(parse(input), globalEnv)
    if isError(@result) then
      print("ERROR: " + result["message"])
      if result.hasIndex("trace") and result["trace"].len > 0 then
        for frame in result["trace"]
          print(frame)
        end for
      end if
    else
      print(result)
    end if
end while
