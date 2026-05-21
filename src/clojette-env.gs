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

// Environment setup, very cool.
clojette.makeEnv = function(outerEnv)
    e = {}
    e.locals = {}
    e.get = function(name)
      if self.locals.hasIndex(name) then return @self.locals[name]
      if outerEnv != null then return outerEnv.get(name)
      return clojette.lispError("Undefined in the env: " + name)
    end function
    e.set = function(name, value)
        self.locals[name] = @value
    end function
    e.setExisting = function(name, value)
      if self.locals.hasIndex(name) then
        self.locals[name] = value
        return @value
      end if
      if outerEnv != null then return outerEnv.setExisting(name, @value)
      return clojette.lispError("Cannot set! undefined variable: " + name)
	  end function
    return e
end function

clojette.bindArgs = function(argNames, params, baseEnv)
    newEnv = self.makeEnv(baseEnv)
    
    // No args expected
    if argNames.len == 0 then
      if params.len > 0 then
        return self.lispError("Wrong number of args: expected 0, got " + params.len)
      end if
      return newEnv
    end if
    
    // Find & position if present
    restIdx = null
    for i in range(0, argNames.len-1)
      if argNames[i] == "&" then
        restIdx = i
        break
      end if
    end for
    
    if restIdx != null then
        // Variadic: minimum arity is everything before the &
        if params.len < restIdx then
            return self.lispError("Wrong number of args: expected at least " + restIdx + ", got " + params.len)
        end if
        for i in range(0, restIdx-1)
            // we can safely access restIdx, but since params can be of len 0, and if params is empty, accessing anything would crash; we do not want that, so we error.
            if params.len == 0 then return self.lispError("Cannot bind arguments for function [" + argNames.join(", ") + "]: expected at least 1 argument, got " + params.len)
            newEnv.set(argNames[i], params[i])
        end for
        restName = argNames[restIdx+1]
        // Gracefully bind empty list if no rest args provided
        if restIdx >= params.len then
            newEnv.set(restName, [])
        else
            newEnv.set(restName, params[restIdx:])
        end if
    else
        // Exact arity required
        if params.len != argNames.len then
            return self.lispError("Wrong number of args: expected " + argNames.len + ", got " + params.len)
        end if
        for i in range(0, argNames.len-1)
            newEnv.set(argNames[i], params[i])
        end for
    end if
    
    return newEnv
end function

//clojette.Env = {}
clojette.globalEnv = clojette.makeEnv(null)
// In the MiniScript bootstrap, before the REPL
clojette.globalEnv.locals["__recur_sentinel__"] = {"classID": "recur", "args": null}
clojette.globalEnv.locals["__gensym_counter__"] = 0
clojette.globalEnv.locals["macros"] = {}
clojette.globalEnv.locals["__namespaces__"] = {"user": {}}
clojette.globalEnv.locals["__current_ns__"] = "user"
clojette.globalEnv.locals["__ns_aliases__"] = {"user": {}}
clojette.globalEnv.natives = {}
