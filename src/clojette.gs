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

// This is the runtime
// Import this to embed it into your program

// Clojette is now a class because we don't want to pollute the globals
clojette = {}

clojette.__runtimeTag__ = function
end function

clojette.lispError = function(msg)
  if msg == null then return {"classID": "error", "__tag__": self.@__runtimeTag__, "message": "Null"}
  return {"classID": "error", "__tag__": self.@__runtimeTag__, "message": msg}
end function

import_code("/home/<user>/clojette-dev/clojette-env.src")     // sets up globalEnv + natives = {}
import_code("/home/<user>/clojette-dev/clojette-stdlib.src")  // adds Clojette builtins
import_code("/home/<user>/clojette-dev/clojette-core.src")    // eval, parse etc
import_code("/home/<user>/clojette-dev/clojette-interop.src") // registers native GH functions

clojette.tests = false

// REPL
clojette.repl = function(prompt="Clojette> ")
  while true
      input = user_input(prompt)
      if input == "exit" or input == "quit" or input == "q" then break
      result = self.eval(self.parse(input), self.globalEnv)
      if self.isError(@result) then
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
end function

// Expose a function that evaluates code that is given to it :p
clojette.eval_clojette = function(code, env=self.globalEnv)
  return self.eval(self.parse(code), env)
end function
