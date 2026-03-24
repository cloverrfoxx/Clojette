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

// Environment setup, very cool.
makeEnv = function(outerEnv)
    e = {}
    e.locals = {}
    e.get = function(name)
      if self.locals.hasIndex(name) then return @self.locals[name]
      if outerEnv != null then return outerEnv.get(name)
      return lispError("Undefined in the env: " + name)
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
    	return lispError("Cannot set! undefined variable: " + name)
	  end function
    return e
end function

bindArgs = function(argNames, params, baseEnv)
    newEnv = makeEnv(baseEnv)
    
    // No args expected
    if argNames.len == 0 then
        if params.len > 0 then
            return lispError("Wrong number of args: expected 0, got " + params.len)
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
            return lispError("Wrong number of args: expected at least " + restIdx + ", got " + params.len)
        end if
        for i in range(0, restIdx-1)
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
            return lispError("Wrong number of args: expected " + argNames.len + ", got " + params.len)
        end if
        for i in range(0, argNames.len-1)
            newEnv.set(argNames[i], params[i])
        end for
    end if
    
    return newEnv
end function

Env = {}
globalEnv = makeEnv(null)
// In the MiniScript bootstrap, before the REPL
globalEnv.locals["__recur_sentinel__"] = {"classID": "recur", "args": null}
globalEnv.locals["__gensym_counter__"] = 0
globalEnv.locals["macros"] = {}
globalEnv.locals["__namespaces__"] = {"user": {}}
globalEnv.locals["__current_ns__"] = "user"
globalEnv.locals["__ns_aliases__"] = {"user": {}}
globalEnv.natives = {}
