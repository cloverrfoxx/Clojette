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

// Guards
realTypeof = function(anyObject)

    if @anyObject == null then return "null"

    // Custom fn object type
    if @anyObject isa map then
        if @anyObject.hasIndex("classID") and @anyObject["classID"] == "fn" then
            return "function"
        end if
    end if

    objectType = @anyObject * 0

    if objectType == "" then return "string"
    if objectType == [] then return "list"
    if @anyObject == {} then return "map"

    for i in @anyObject
        return "map"
    end for

    if objectType == null then return "function"

    return "number"
end function

checkArity = function(sig, argc)

    if sig == "*" then return true

    if sig[sig.len-1] == "+" then
        min = val(sig[:-1])
        return argc >= min
    end if

    dash = sig.indexOf("-")

    if dash != null then
        min = val(sig[:dash])
        max = val(sig[dash+1:])
        return argc >= min and argc <= max
    end if

    return argc == val(sig)
end function

matchesType = function(expected, actual)
    if expected isa list then
        for t in expected
            if t == "all" then return true
            if t == "any" then
              if actual == "null" then return false
              if actual == "function" then return false
              return true
            end if
            if t == actual then return true
        end for
        return false
    end if

    return expected == actual
end function

guard = function(arity, types, args, argname = null, message=null)
    argc = args.len

    if not checkArity(arity, argc) then
        if argname != null then return lispError(argname + ": invalid arity")
        return lispError("invalid arity")
    end if

    for i in range(0, argc-1)
        actual = realTypeof(args[i])

        if i >= types.len then
            expected = types[types.len-1]
        else
            expected = types[i]
        end if

        if not matchesType(expected, actual) then
            if message == null then return lispError(message)
            if argname != null then return lispError(argname + ": expected " + str(expected) + ", got " + actual)
            return lispError("expected " + str(expected) + ", got " + actual)
        end if
    end for

    return null
end function

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
    err = guard("*", [["number", "string", "list", "map"]], args, "+")
    if isError(err) then return err
    
    sum = 0
    if args.len == 0 then return 0
    for i in range(0, args.len-1)
        sum = sum + args[i]
    end for
    return sum
end function

globalEnv.locals["-"] = function(args)
    err = guard("1+", [["number", "string"]], args, "-")
    if isError(err) then return err

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
    err = guard("*", [["number", "string", "list"]], args, "*")
    if isError(err) then return err

    prod = 1
    if args.len == 0 then return 1
    for i in range(0, args.len-1)
        prod = prod * args[i]
    end for
    return prod
end function

globalEnv.locals["/"] = function(args)
    err = guard("1+", [["number", "string", "list"]], args, "/")
    if isError(err) then return err
      
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
    err = guard("2", ["number"], args, "%")
    if isError(err) then return err

    if args[1] == 0 then return lispError("Modulo by zero")
    return args[0] % args[1]
end function

globalEnv.locals["mod"] = function(args)
    err = guard("2", ["number"], args, "mod")
    if isError(err) then return err

    if args[1] == 0 then return lispError("Modulo by zero")
    return args[0] % args[1]
end function

globalEnv.locals["**"] = function(args)
    err = guard("2", ["number"], args, "**")
    if isError(err) then return err
    return args[0] ^ args[1]
end function

globalEnv.locals["quot"] = function(args)
    err = guard("2", ["number"], args, "quot")
    if isError(err) then return err

    if args.len != 2 then return lispError("quot requires exactly 2 arguments")
    if args[1] == 0 then return lispError("Division by zero")
    return floor(args[0] / args[1])
end function

// Comparison
globalEnv.locals["="] = function(args)
    err = guard("2+", ["any"], args)
    if isError(err) then return err

    for i in range(1, args.len-1)
        if args[i] != args[0] then return false
    end for
    return true
end function

globalEnv.locals["not="] = function(args)
    err = guard("2", ["any"], args)
    if isError(err) then return err
    return args[0] != args[1]
end function

globalEnv.locals["<"] = function(args)
    err = guard("2+", ["any"], args)
    if isError(err) then return err
    for i in range(1, args.len-1)
        if args[i-1] >= args[i] then return false
    end for
    return true
end function

globalEnv.locals[">"] = function(args)
    err = guard("2+", ["any"], args)
    if isError(err) then return err
    for i in range(1, args.len-1)
        if args[i-1] <= args[i] then return false
    end for
    return true
end function

globalEnv.locals["<="] = function(args)
    err = guard("2+", ["any"], args)
    if isError(err) then return err
    for i in range(1, args.len-1)
        if args[i-1] > args[i] then return false
    end for
    return true
end function

globalEnv.locals[">="] = function(args)
    err = guard("2+", ["any"], args)
    if isError(err) then return err
    for i in range(1, args.len-1)
        if args[i-1] < args[i] then return false
    end for
    return true
end function

globalEnv.locals["not"] = function(args)
    err = guard("1", ["any"], args)
    if isError(err) then return err
    if args.len != 1 then return lispError("not requires exactly 1 argument")
    return not args[0]
end function

// List operations
globalEnv.locals["list"] = function(args)
  err = guard("*", ["any"], args, "list")
  if isError(err) then return err
  return [] + args
end function

globalEnv.locals["car"] = function(args)
    err = guard("1", ["list"], args, "car")
    if isError(err) then return err

    lst = args[0]
    if lst == null or lst.len == 0 then return lispError("car called on empty list")
    return lst[0]
end function

globalEnv.locals["cdr"] = function(args)
    err = guard("1", ["list"], args, "cdr")
    if isError(err) then return err

    lst = args[0]
    if len(lst) <= 1 then return []
    return lst[1:]
end function

globalEnv.locals["cons"] = function(args)
    err = guard("2", ["any", ["list", "null"]], args, "cons")
    if args[1] == null then return [args[0]]
    return [args[0]] + args[1]
end function

globalEnv.locals["first"] = function(args)
    err = guard("1", ["list"], args, "first")
    if isError(err) then return err

    lst = args[0]
    if lst == null or lst.len == 0 then return null
    return lst[0]
end function

globalEnv.locals["second"] = function(args)
    err = guard("1", ["list"], args, "second")
    if isError(err) then return err

    lst = args[0]
    if lst == null then return null
    return lst[1]
end function

globalEnv.locals["rest"] = function(args)
    err = guard("1", ["list"], args, "rest")
    if isError(err) then return err

    lst = args[0]
    if lst.len <= 1 then return []
    return lst[1:]
end function

globalEnv.locals["conj"] = function(args)
    err = guard("2+", [["list", "null"], "any"], args, "conj")
    if isError(err) then return err

    result = args[0]
    if result == null then result = []
    for i in range(1, args.len-1)
      result = result + [args[i]]
    end for
    return result
end function

globalEnv.locals["concat"] = function(args)
    err = guard("*", [["list", "null"]], args, "concat")
    if isError(err) then return err

    result = []
    if args.len == 0 then return result
    for i in range(0, args.len-1)
        if args[i] != null then result = result + args[i]
    end for
    return result
end function

globalEnv.locals["empty?"] = function(args)
    err = guard("1",[["list", "string", "map", "null"]], args, "empty?")
    if isError(err) then return err

    lst = args[0]
    if lst == null then return true
    return lst.len == 0
end function

globalEnv.locals["count"] = function(args)
    err = guard("1", [["list", "string", "map"]], args, "count")
    if isError(err) then return err
    return args[0].len
end function

globalEnv.locals["list?"] = function(args)
    err = guard("1", ["any"], args, "list?")
    if isError(err) then return err
    return args[0] isa list
end function

globalEnv.locals["nth"] = function(args)
    err = guard("2", ["list", "number"], args, "nth")
    if isError(err) then return err

    lst = args[0]
    n = args[1]
    if lst == null or n >= lst.len then return lispError("nth index out of bounds")
    return lst[n]
end function

globalEnv.locals["get"] = function(args)
    err = guard("2-3", [["list", "map", "string", "null"], "any", "any"], args, "get")
    if isError(err) then return err

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
    err = guard("*", ["any"], args, "hash-map")
    if isError(err) then return err

    result = {}
    if args.len == 0 then return result
    if args.len % 2 != 0 then return lispError("hash-map requires even number of arguments")
    for i in range(0, args.len-1, 2)
        result[args[i]] = @args[i+1]
    end for
    return result
end function

globalEnv.locals["assoc"] = function(args)
    err = guard("3+", [["map", "null"], "any"], args, "assoc")
    if isError(err) then return err
    result = {}
    if args[0] != null then
        for kv in args[0]
            result[kv.key] = @kv.value
        end for
    end if
    for i in range(1, args.len-1, 2)
        result[args[i]] = @args[i+1]
    end for
    return result
end function

globalEnv.locals["dissoc"] = function(args)
    err = guard("2+", ["map", "any"], args, "dissoc")
    if isError(err) then return err

    result = {}
    for kv in args[0]
        result[kv.key] = @kv.value
    end for
    for i in range(1, args.len-1)
        result.remove(args[i])
    end for
    return result
end function

globalEnv.locals["keys"] = function(args)
    err = guard("1", [["map", "null"]], args, "keys")
    if isError(err) then return err

    if args[0] == null then return []
    result = []
    for kv in args[0]
        result.push(kv.key)
    end for
    return result
end function

globalEnv.locals["vals"] = function(args)
    err = guard("1", [["map", "null"]], args, "vals")
    if isError(err) then return err

    if args[0] == null then return []
    result = []
    for kv in args[0]
        result.push(@kv.value)
    end for
    return result
end function

globalEnv.locals["map?"] = function(args)
    err = guard("1", ["all"], args, "map?")
    if isError(err) then return err
    
    if args.len != 1 then return lispError("map? requires exactly 1 argument")
    return args[0] isa map
end function

globalEnv.locals["contains?"] = function(args)
    err = guard("2", [["map", "list", "string", "null"], "any"], args, "contains")
    if args.len != 2 then return lispError("contains? requires exactly 2 arguments")
    if args[0] == null then return false
    return args[0].hasIndex(args[1])
end function

// Type checks
globalEnv.locals["number?"] = function(args)
    err = guard("1", ["all"], args, "number?")
    if isError(err) then return err
    return args[0] isa number
end function

globalEnv.locals["string?"] = function(args)
    err = guard("1", ["all"], args, "string?")
    if isError(err) then return err
    return args[0] isa string
end function

globalEnv.locals["null?"] = function(args)
    err = guard("1", ["all"], args, "null?")
    if isError(err) then return err
    return args[0] == null
end function

globalEnv.locals["fn?"] = function(args)
    err = guard("1", ["all"], args, "fn?")
    if isError(err) then return err
    if args[0] isa funcRef then return true
    return args[0] isa map and args[0].hasIndex("classID") and args[0]["classID"] == "fn"
end function

globalEnv.locals["true?"] = function(args)
    err = guard("1", ["all"], args, "true?")
    if isError(err) then return err
    return args[0] == true
end function

globalEnv.locals["false?"] = function(args)
    err = guard("1", ["all"], args, "false?")
    if isError(err) then return err
    return args[0] == false
end function

// Math
globalEnv.locals["floor"] = function(args)
    err = guard("1", ["number"], args)
    if isError(err) then return err
    return floor(args[0])
end function

globalEnv.locals["ceil"] = function(args)
    err = guard("1", ["number"], args)
    if isError(err) then return err
    return ceil(args[0])
end function

globalEnv.locals["round"] = function(args)
    err = guard("1", ["number"], args)
    if isError(err) then return err
    return round(args[0])
end function

globalEnv.locals["abs"] = function(args)
    err = guard("1", ["number"], args)
    if isError(err) then return err
    return abs(args[0])
end function

globalEnv.locals["sqrt"] = function(args)
    err = guard("1", ["number"], args)
    if isError(err) then return err
    return sqrt(args[0])
end function

globalEnv.locals["max"] = function(args)
    err = guard("1+", ["number"], args)
    if isError(err) then return err
    result = args[0]
    if args.len > 1 then
        for i in range(1, args.len-1)
            if args[i] > result then result = args[i]
        end for
    end if
    return result
end function

globalEnv.locals["min"] = function(args)
    err = guard("1+", ["number"], args)
    if isError(err) then return err
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
    err = guard("*", ["all"], args)
    if isError(err) then return err
    result = ""
    if args.len == 0 then return result
    for i in range(0, args.len-1)
        result = result + str(args[i])
    end for
    return result
end function

globalEnv.locals["split"] = function(args)
    err = guard("2", ["string", "string"], args)
    if isError(err) then return err
    return args[0].split(args[1])
end function

globalEnv.locals["join"] = function(args)
    err = guard("2", ["list", "string"], args)
    if isError(err) then return err
    return args[0].join(args[1])
end function

globalEnv.locals["trim"] = function(args)
    err = guard("1", ["string"], args)
    if isError(err) then return err
    return args[0].trim
end function

globalEnv.locals["index-of"] = function(args)
    err = guard("2", ["string", "string"], args)
    if isError(err) then return err
    if args.len != 2 then return lispError("index-of requires exactly 2 arguments")
    return args[0].indexOf(args[1])
end function

globalEnv.locals["subs"] = function(args)
    err = guard("2-3", ["string", "number", "number"], args)
    if isError(err) then return err
    if args.len == 2 then return args[0][args[1]:]
    return args[0][args[1]:args[2]]
end function

globalEnv.locals["upper-case"] = function(args)
    err = guard("1", ["string"], args)
    if isError(err) then return err
    return args[0].upper
end function

globalEnv.locals["lower-case"] = function(args)
    err = guard("1", ["string"], args)
    if isError(err) then return err
    return args[0].lower
end function

globalEnv.locals["replace"] = function(args)
    err = guard("3", ["string", "string", "string"], args)
    if isError(err) then return err
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
    err = guard("2", ["function", "list"], args)
    if isError(err) then return err
    fn = @args[0]
    argList = args[1]
    return callFunction(@fn, argList, "apply")
end function

globalEnv.locals["take-keys"] = function(args)
    err = guard("1", ["any"], args)
    if isError(err) then return err

    bindings = args[0]
    if bindings isa list and len(bindings) > 0 and bindings[0] == "array" then
        bindings = bindings[1:]
    end if
    result = []
    for i in range(0, len(bindings)-1, 2)
        result.push(bindings[i])
    end for
    return result
end function

globalEnv.locals["take-vals"] = function(args)
    err = guard("1", ["any"], args)
    if isError(err) then return err

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
