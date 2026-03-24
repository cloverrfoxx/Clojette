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

// sentinels for the env, lets us use special forms from macros.
// Yes this is a non-ideal, but what can you do? 
// TODO: fix
globalEnv.locals["do"] = "do"
globalEnv.locals["if"] = "if"
globalEnv.locals["def"] = "def"
globalEnv.locals["fn"] = "fn"
globalEnv.locals["let"] = "let"
globalEnv.locals["quote"] = "quote"
globalEnv.locals["set!"] = "set!"

//
// Clojette Builtins - MiniScript host layer
//
globalEnv.locals["gensym"] = function(args)
    prefix = "G__"
    if args.len > 0 then prefix = args[0]
    __gensym_counter__ = globalEnv.locals["__gensym_counter__"] + 1
    globalEnv.locals["__gensym_counter__"] = __gensym_counter__
    return prefix + __gensym_counter__
end function

// Arithmetic
globalEnv.locals["+"] = function(args)
    sum = 0
    if args.len == 0 then return 0
    for i in range(0, args.len-1)
        sum = sum + args[i]
    end for
    return sum
end function

globalEnv.locals["-"] = function(args)
    if args.len == 0 then return lispError("- requires at least 1 argument")
    if args.len == 1 then return -args[0]
    result = args[0]
    if args.len > 1 then
        for i in range(1, args.len-1)
            result = result - args[i]
        end for
    end if
    return result
end function

globalEnv.locals["*"] = function(args)
    prod = 1
    if args.len == 0 then return 1
    for i in range(0, args.len-1)
        prod = prod * args[i]
    end for
    return prod
end function

globalEnv.locals["/"] = function(args)
    if args.len == 0 then return lispError("/ requires at least 1 argument")
    if args.len == 1 then
        if args[0] == 0 then return lispError("Division by zero")
        return 1 / args[0]
    end if
    result = args[0]
    for i in range(1, args.len-1)
        if args[i] == 0 then return lispError("Division by zero")
        result = result / args[i]
    end for
    return result
end function
 

globalEnv.locals["%"] = function(args)
    if args.len != 2 then return lispError("% requires exactly 2 arguments")
    if args[1] == 0 then return lispError("Modulo by zero")
    return args[0] % args[1]
end function

globalEnv.locals["mod"] = function(args)
    if args.len != 2 then return lispError("mod requires exactly 2 arguments")
    if args[1] == 0 then return lispError("Modulo by zero")
    return args[0] % args[1]
end function

globalEnv.locals["**"] = function(args)
    if args.len != 2 then return lispError("** requires exactly 2 arguments")
    return args[0] ^ args[1]
end function

globalEnv.locals["quot"] = function(args)
    if args.len != 2 then return lispError("quot requires exactly 2 arguments")
    if args[1] == 0 then return lispError("Division by zero")
    return floor(args[0] / args[1])
end function

// Comparison
globalEnv.locals["="] = function(args)
    if args.len < 2 then return lispError("= requires at least 2 arguments")
    for i in range(1, args.len-1)
        if args[i] != args[0] then return false
    end for
    return true
end function

globalEnv.locals["not="] = function(args)
    if args.len != 2 then return lispError("not= requires exactly 2 arguments")
    return args[0] != args[1]
end function

globalEnv.locals["<"] = function(args)
    if args.len < 2 then return lispError("< requires at least 2 arguments")
    for i in range(1, args.len-1)
        if args[i-1] >= args[i] then return false
    end for
    return true
end function

globalEnv.locals[">"] = function(args)
    if args.len < 2 then return lispError("> requires at least 2 arguments")
    for i in range(1, args.len-1)
        if args[i-1] <= args[i] then return false
    end for
    return true
end function

globalEnv.locals["<="] = function(args)
    if args.len < 2 then return lispError("<= requires at least 2 arguments")
    for i in range(1, args.len-1)
        if args[i-1] > args[i] then return false
    end for
    return true
end function

globalEnv.locals[">="] = function(args)
    if args.len < 2 then return lispError(">= requires at least 2 arguments")
    for i in range(1, args.len-1)
        if args[i-1] < args[i] then return false
    end for
    return true
end function

globalEnv.locals["not"] = function(args)
    if args.len != 1 then return lispError("not requires exactly 1 argument")
    return not args[0]
end function

// List operations
globalEnv.locals["list"] = function(args)
	if args == null then return lispError("Args for list is null!")
  return [] + args
end function

globalEnv.locals["car"] = function(args)
    if args.len != 1 then return lispError("car requires exactly 1 argument")
    lst = args[0]
    if lst == null or lst.len == 0 then return lispError("car called on empty list")
    return lst[0]
end function

globalEnv.locals["cdr"] = function(args)
    if args.len != 1 then return lispError("cdr requires exactly 1 argument")
    lst = args[0]
    if lst == null or lst.len == 0 then return []  // was: lispError
    if lst.len == 1 then return []
    return lst[1:]
end function

globalEnv.locals["cons"] = function(args)
    if args.len != 2 then return lispError("cons requires exactly 2 arguments")
    if args[1] == null then return [args[0]]
    return [args[0]] + args[1]
end function

globalEnv.locals["first"] = function(args)
    if args.len != 1 then return lispError("first requires exactly 1 argument")
    lst = args[0]
    if lst == null or lst.len == 0 then return null
    return lst[0]
end function

globalEnv.locals["second"] = function(args)
    if args.len != 1 then return lispError("second requires exactly 1 argument")
    lst = args[0]
    if lst == null or lst.len < 2 then return null
    return lst[1]
end function

globalEnv.locals["rest"] = function(args)
    if args.len != 1 then return lispError("rest requires exactly 1 argument")
    lst = args[0]
    if lst == null or lst.len <= 1 then return []
    return lst[1:]
end function

globalEnv.locals["conj"] = function(args)
    if args.len < 2 then return lispError("conj requires at least 2 arguments")
    result = args[0]
    if result == null then result = []
    if args.len > 1 then
        for i in range(1, args.len-1)
            result = result + [args[i]]
        end for
    end if
    return result
end function

globalEnv.locals["concat"] = function(args)
    result = []
    if args.len == 0 then return result
    for i in range(0, args.len-1)
        if args[i] != null then result = result + args[i]
    end for
    return result
end function

globalEnv.locals["empty?"] = function(args)
	if isError(args) then return args
    if args.len != 1 then return lispError("empty? requires exactly 1 argument")
    lst = args[0]
    if lst == null then return true
    return lst.len == 0
end function

globalEnv.locals["count"] = function(args)
    if args.len != 1 then return lispError("count requires exactly 1 argument")
    if args[0] == null then return 0
    return args[0].len
end function

globalEnv.locals["list?"] = function(args)
    if args.len != 1 then return lispError("list? requires exactly 1 argument")
    return args[0] isa list
end function

globalEnv.locals["nth"] = function(args)
    if args.len != 2 then return lispError("nth requires exactly 2 arguments")
    lst = args[0]
    n = args[1]
    if lst == null or n >= lst.len then return lispError("nth index out of bounds")
    return lst[n]
end function

globalEnv.locals["get"] = function(args)
    if args.len < 2 then return lispError("get requires at least 2 arguments")
    coll = args[0]
    key = args[1]
    if coll == null then return null
    if not coll.hasIndex(key) then
        if args.len == 3 then return args[2]
        return null
    end if
    return @coll[key]
end function

// Map/dict operations
globalEnv.locals["hash-map"] = function(args)
    result = {}
    if args.len == 0 then return result
    if args.len % 2 != 0 then return lispError("hash-map requires even number of arguments")
    for i in range(0, args.len-1, 2)
        result[args[i]] = @args[i+1]
    end for
    return result
end function

globalEnv.locals["assoc"] = function(args)
    if args.len < 3 then return lispError("assoc requires at least 3 arguments")
    result = {}
    if args[0] != null then
        for kv in args[0]
            result[kv.key] = @kv.value
        end for
    end if
    if args.len > 1 then
        for i in range(1, args.len-1, 2)
            result[args[i]] = @args[i+1]
        end for
    end if
    return result
end function

globalEnv.locals["dissoc"] = function(args)
    if args.len < 2 then return lispError("dissoc requires at least 2 arguments")
    result = {}
    for kv in args[0]
        result[kv.key] = @kv.value
    end for
    if args.len > 1 then
        for i in range(1, args.len-1)
            result.remove(args[i])
        end for
    end if
    return result
end function

globalEnv.locals["keys"] = function(args)
    if args.len != 1 then return lispError("keys requires exactly 1 argument")
    if args[0] == null then return []
    result = []
    for kv in args[0]
        result.push(kv.key)
    end for
    return result
end function

globalEnv.locals["vals"] = function(args)
    if args.len != 1 then return lispError("vals requires exactly 1 argument")
    if args[0] == null then return []
    result = []
    for kv in args[0]
        result.push(@kv.value)
    end for
    return result
end function

globalEnv.locals["map?"] = function(args)
    if args.len != 1 then return lispError("map? requires exactly 1 argument")
    return args[0] isa map
end function

globalEnv.locals["contains?"] = function(args)
    if args.len != 2 then return lispError("contains? requires exactly 2 arguments")
    if args[0] == null then return false
    return args[0].hasIndex(args[1])
end function

// Type checks
globalEnv.locals["number?"] = function(args)
    if args.len != 1 then return lispError("number? requires exactly 1 argument")
    return args[0] isa number
end function

globalEnv.locals["string?"] = function(args)
    if args.len != 1 then return lispError("string? requires exactly 1 argument")
    return args[0] isa string
end function

globalEnv.locals["null?"] = function(args)
    if args.len != 1 then return lispError("null? requires exactly 1 argument")
    return args[0] == null
end function

globalEnv.locals["fn?"] = function(args)
    if args.len != 1 then return lispError("fn? requires exactly 1 argument")
    if args[0] isa funcRef then return true
    return args[0] isa map and args[0].hasIndex("classID") and args[0]["classID"] == "fn"
end function

globalEnv.locals["true?"] = function(args)
    if args.len != 1 then return lispError("true? requires exactly 1 argument")
    return args[0] == true
end function

globalEnv.locals["false?"] = function(args)
    if args.len != 1 then return lispError("false? requires exactly 1 argument")
    return args[0] == false
end function

// Math
globalEnv.locals["floor"] = function(args)
    if args.len != 1 then return lispError("floor requires exactly 1 argument")
    return floor(args[0])
end function

globalEnv.locals["ceil"] = function(args)
    if args.len != 1 then return lispError("ceil requires exactly 1 argument")
    return ceil(args[0])
end function

globalEnv.locals["round"] = function(args)
    if args.len != 1 then return lispError("round requires exactly 1 argument")
    return round(args[0])
end function

globalEnv.locals["abs"] = function(args)
    if args.len != 1 then return lispError("abs requires exactly 1 argument")
    return abs(args[0])
end function

globalEnv.locals["sqrt"] = function(args)
    if args.len != 1 then return lispError("sqrt requires exactly 1 argument")
    return sqrt(args[0])
end function

globalEnv.locals["max"] = function(args)
    if args.len < 1 then return lispError("max requires at least 1 argument")
    result = args[0]
    if args.len > 1 then
        for i in range(1, args.len-1)
            if args[i] > result then result = args[i]
        end for
    end if
    return result
end function

globalEnv.locals["min"] = function(args)
    if args.len < 1 then return lispError("min requires at least 1 argument")
    result = args[0]
    if args.len > 1 then
        for i in range(1, args.len-1)
            if args[i] < result then result = args[i]
        end for
    end if
    return result
end function

// String operations
globalEnv.locals["str"] = function(args)
    result = ""
    if args.len == 0 then return result
    for i in range(0, args.len-1)
        result = result + str(args[i])
    end for
    return result
end function

globalEnv.locals["split"] = function(args)
    if args.len != 2 then return lispError("split requires exactly 2 arguments")
    return args[0].split(args[1])
end function

globalEnv.locals["join"] = function(args)
  if @args.len != 2 then return lispError("join requires exactly 2 arguments")
  if typeof(@args) != "list" then return lispError("Expected a list, got " + typeof(@args))
  return args[0].join(args[1])
end function

globalEnv.locals["trim"] = function(args)
    if args.len != 1 then return lispError("trim requires exactly 1 argument")
    return args[0].trim
end function

globalEnv.locals["index-of"] = function(args)
    if args.len != 2 then return lispError("index-of requires exactly 2 arguments")
    return args[0].indexOf(args[1])
end function

globalEnv.locals["subs"] = function(args)
    if args.len < 2 then return lispError("subs requires at least 2 arguments")
    if args.len == 2 then return args[0][args[1]:]
    return args[0][args[1]:args[2]]
end function

globalEnv.locals["upper-case"] = function(args)
    if args.len != 1 then return lispError("upper-case requires exactly 1 argument")
    return args[0].upper
end function

globalEnv.locals["lower-case"] = function(args)
    if args.len != 1 then return lispError("lower-case requires exactly 1 argument")
    return args[0].lower
end function

globalEnv.locals["replace"] = function(args)
    if args.len != 3 then return lispError("replace requires exactly 3 arguments")
    haystack = args[0]
    needle = args[1]
    replacement = args[2]
    if needle == "" then return lispError("replace: needle cannot be empty")
    return haystack.replace(needle, replacement)
end function

// I/O
globalEnv.locals["println"] = function(args)
    if args.len == 0 then
        print("")
        return null
    end if
    parts = []
    for i in range(0, args.len-1)
        parts.push(str(@args[i]))
    end for
    print(parts.join(" "))
    return null
end function

globalEnv.locals["user-input"] = function(args)
    if args.len > 0 then return user_input(args[0])
    return user_input("")
end function

// Apply - needed for higher order functions
globalEnv.locals["apply"] = function(args)
    if args.len != 2 then return lispError("apply requires exactly 2 arguments")
    fn = @args[0]
    argList = args[1]
    if not argList isa list then return lispError("apply requires a list as second argument")
    return callFunction(@fn, argList, "apply")
end function

globalEnv.locals["take-keys"] = function(args)
    bindings = args[0]
    if bindings isa list and bindings.len > 0 and bindings[0] == "array" then
        bindings = bindings[1:]
    end if
    result = []
    for i in range(0, bindings.len-1, 2)
        result.push(bindings[i])
    end for
    return result
end function

globalEnv.locals["take-vals"] = function(args)
    bindings = args[0]
    if bindings isa list and bindings.len > 0 and bindings[0] == "array" then
        bindings = bindings[1:]
    end if
    result = []
    for i in range(1, bindings.len-1, 2)
        result.push(bindings[i])
    end for
    return result
end function

// Constants
globalEnv.locals["true"] = true
globalEnv.locals["false"] = false
globalEnv.locals["null"] = null
globalEnv.locals["nil"] = null
