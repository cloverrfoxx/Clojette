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

// helpers
atom = function(token)
	// We dereference the token to not invoke anything by accident
  if @token isa number then return token
	if @token isa funcRef then return lispError("Tried evaluating funcRef as an atom?")
	// Return full string literal
	if token[0] == """" then return token
    num = token.val
    if str(num) == token then return num
    return token
end function

// We can check if a given result is an error; we want error handling
isError = function(val)
  if not @val isa map then return false
  // We know that the op is a map, and potentially is an error; safe to handle without deref 
  if @val.hasIndex("classID") and @val["classID"] == "error" then
    if not @val.hasIndex("__tag__") then return false
    return @val["__tag__"] == @__runtimeTag__
  end if
	return false
end function

addTrace = function(err, frame)
    if not err.hasIndex("trace") then err["trace"] = []
    err["trace"].push(frame)
    return err
end function

isRuntimeObject = function(val)
    if not @val isa map then return false
    if not val.hasIndex("__tag__") then return false
    return @val["__tag__"] == @__runtimeTag__
end function

// There was an error here, where we were trying to check if op was a funcRef
// that check was not dereferenced and we called it directly -_-
// Lesson learned, always deref your functions
callFunction = function(op, args, name, isNative=false)
    if isError(@op) then return @op
    
    // User-defined Clojette fn
    if @op isa map then
        if op.hasIndex("classID") and op["classID"] == "fn" then
            while true
                newEnv = bindArgs(op["args"], args, op["env"])
                if isError(@newEnv) then return newEnv
                result = null
                for bodyExpr in op["body"]
                    result = eval(bodyExpr, newEnv)
                    if isError(@result) then return addTrace(@result, "in " + name)
                end for
                // check if recur was signalled
                if result isa map and result.hasIndex("classID") and result["classID"] == "recur" then
                    args = result["args"]
                else
                    return result
                end if
            end while
        end if
    end if

    // funcRef - either stdlib or native MiniScript
    if @op isa funcRef or typeof(@op) == "function" then
        if isNative then
            if args.len == 0 then return @op()
            if args.len == 1 then return @op(args[0])
            if args.len == 2 then return @op(args[0], args[1])
            if args.len == 3 then return @op(args[0], args[1], args[2])
            if args.len == 4 then return @op(args[0], args[1], args[2], args[3])
            if args.len == 5 then return @op(args[0], args[1], args[2], args[3], args[4])
            return lispError("Native functions support at most 5 arguments")
        else
            return op(@args)
        end if
    end if
    
    return lispError("Not a function: " + name)
end function

evalQuasiquote = function(exp, env)
    // not a list, just return it as-is (like quote)
    if not @exp isa list then return exp
    // empty list
    if @exp.len == 0 then return exp
    
    // unquote: evaluate and return
    if exp[0] == "unquote" then
		result = eval(exp[1], env)
    if isError(@result) then return result
		return result
    end if
    
    // walk the list, handling splice-unquote
    result = []
    for i in range(0, exp.len-1)
        item = exp[i]
        if item isa list and item.len > 0 and item[0] == "splice-unquote" then
          spliced = eval(item[1], env)
          if isError(@spliced) then return spliced
          if not @spliced isa list then return lispError("splice-unquote requires a list, got: " + typeof(@spliced))
            if spliced.len > 0 then
              for j in range(0, spliced.len-1)
                result.push(spliced[j])
              end for
            end if
        else
    	    item = evalQuasiquote(@item, env)
    		  if isError(@item) then return item
    		  result.push(@item)
        end if
    end for
    return result
end function

// Convert a string of characters into a list of tokens
tokenize = function(chars)
    tokens = []
    //if tokens.len == 0 then return lispError("Unexpected EOF")
    //if isError(tokens[0]) then return tokens.pull  // propagate tokenizer errors
    i = 0
    while i < chars.len
      c = chars[i]
		  if c == """" then
    		tok = c
    		i = i + 1
    		while i < chars.len and chars[i] != """"
        	if chars[i] == "\" then
            tok = tok + chars[i]
            i = i + 1
            if i < chars.len then tok = tok + chars[i]
        	else
            tok = tok + chars[i]
        	end if
        	i = i + 1
    		end while
    		if i >= chars.len then
        	tokens.push(lispError("Unterminated string literal: " + tok))
        	return tokens
    		end if
    		tok = tok + """"
    		tokens.push(tok)
        else if c == "(" or c == ")" or c == "[" or c == "]" then
          tokens.push(c)
        else if c == "~" then
          if i + 1 < chars.len and chars[i+1] == "@" then
            tokens.push("~@")
            i = i + 1
          else
            tokens.push("~")
          end if
        else if c == "'" or c == "`" then
            tokens.push(c)
        else if c == " " or c == char(9) or c == char(10) or c == char(13) then
            // whitespace, skip
        else if c == ";" then
            // comment, skip to end of line
            while i < chars.len and chars[i] != char(10)
              i = i + 1
            end while
        else
          tok = c
          while i + 1 < chars.len and " ()[]{}""';`," .indexOf(chars[i+1]) == null
            i = i + 1
            tok = tok + chars[i]
          end while
          tokens.push(tok.trim)
        end if
        i = i + 1
    end while
    return tokens
end function


//  @Doc
//  Takes in a list
//  Reads tokens
//  Is recursive
//
readFromTokens = function(tokens)
    // We don't want an empty list
    if tokens.len == 0 then return lispError("Unexpected EOF")
    // We also dont want anything that is NOT a list
    if not @tokens isa list then return lispError("Not a list")
    token = tokens.pull
    
    // We encountered a symbol, parse it recursively
	  if token == "(" then
    	L = []
    	while tokens.len > 0 and tokens[0] != ")"
        item = readFromTokens(tokens)
        if isError(@item) then return item
        L.push(item)
    	end while
    	if tokens.len == 0 then return lispError("Unexpected EOF while reading list")
    	tokens.pull  // consume the )
    	return L

  else if token == "[" then
      L = []
      while tokens.len > 0 and tokens[0] != "]"
          item = readFromTokens(tokens)
          if isError(@item) then return item
          L.push(item)
      end while
      if tokens.len == 0 then return lispError("Unexpected EOF while reading vector")
      tokens.pull  // consume the ]
      return ["array"] + L
      
      else if token == ")" then
  		return lispError("Unexpected )")
      else if token == "]" then
        return lispError("Unexpected ]")
  
    // quote tokens for macroing around
  	else if token == "'" then
    	inner = readFromTokens(tokens)
    	if isError(@inner) then return inner
      return ["quote", inner]
  	else if token == "`" then
      inner = readFromTokens(tokens)
      if isError(@inner) then return inner
      return ["quasiquote", inner]
  	else if token == "~@" then
      inner = readFromTokens(tokens)
      if isError(@inner) then return inner
      return ["splice-unquote", inner]
  	else if token == "~" then
      inner = readFromTokens(tokens)
      if isError(@inner) then return inner
      return ["unquote", inner]
    // Return an atom, we can let the MiniScript type coercion do everything for us
    else 
  	return atom(token)
  end if
end function

parse = function(code)
    // print("parse function!")
    tokens = tokenize(code)
    result = readFromTokens(tokens)
    if isError(@result) then return result
    if tokens.len > 0 then return lispError("Unexpected trailing tokens: " + tokens.join(" "))
    return result
end function

eval = function(exp, env)
	if @exp isa number then return exp
	if @exp == null then return null

    if @exp isa list then
      if exp.len == 0 then return exp

      first = exp[0]

      // handle special forms first

		if first == "quasiquote" then
    	return evalQuasiquote(exp[1], env)
		end if

		// Game interop
		if first isa string and first[0] == "." then
    	methodName = first[1:]
    	obj = eval(exp[1], env)
    	if @obj == null then return lispError("null object in interop call ." + methodName)
			if isError(@obj) then return addTrace(@obj, "in " + first) // Check for errors!    

    		fn = @obj[methodName]
    
    		if not (@fn isa funcRef) then return @fn
    
    		args = []
    		if exp.len > 2 then
        	for i in range(2, exp.len-1)
					  result = eval(exp[i], env)
					  if isError(@result) then return @result
            args.push(@result)
        	end for
    		end if

    		// pass obj as self, then spread remaining args
    		if args.len == 0 then return fn(@obj)
    		if args.len == 1 then return fn(@obj, args[0])
    		if args.len == 2 then return fn(@obj, args[0], args[1])
    		if args.len == 3 then return fn(@obj, args[0], args[1], args[2])
    		if args.len == 4 then return fn(@obj, args[0], args[1], args[2], args[3])
    		return lispError("Too many arguments for native method")
		end if
	
		if first == "array" then
    		result = []
    		if exp.len > 1 then
        		for i in range(1, exp.len-1)
            		val = eval(exp[i], env)
            		if isError(@val) then return val
            		result.push(val)
        		end for
    		end if
   		return result
		end if
	
		if first == "import" then
			path = exp[1]  // don't eval, take the raw token
    	// strip quotes if present
    	if path[0] == """" then path = path[1:-1]

    	//path = eval(exp[1], env)
    	hostComputer = get_shell.host_computer
			fpath = get_abs_path(path)
    	f = hostComputer.File(fpath)
    	
      if f == null then return lispError("Error: file not found: " + path)
    	if f.is_binary then return lispError("Error: cannot import binary file: " + path)
    	contents = f.get_content
    	if contents == null then return lispError("Error: no read permission: " + path)
    	wrapped = "(do " + contents + ")"
			result = parse(wrapped)
			if isError(@result) then return result
    	return eval(result, env)
		end if
	
		if first == "set!" then
    	name = exp[1]
    	value = eval(exp[2], env)
			if isError(@value) then return value
    		return env.setExisting(name, value)
		end if

		if globalEnv.locals["macros"].hasIndex(first) then
    	macroFn = globalEnv.locals["macros"][first]  // no .get!
   		newExp = macroFn(exp[1:])
			res = eval(newExp, env)
			if isError(@res) then return res
    		return res
		end if

		if first == "defmacro" then
    		name = exp[1]
    		argNames = exp[2]
    		if argNames isa list and argNames.len > 0 and argNames[0] == "array" then
        		argNames = argNames[1:]
    		end if
    		body = exp[3]
    		closedEnv = env
    
			macroFn = function(forms)
    			__argNames = argNames  // capture locally
    			__body = body          // capture locally
    			__closedEnv = closedEnv
    			newEnv = makeEnv(__closedEnv)
    			if __argNames.len > 0 and forms.len > 0 then
        			for i in range(0, __argNames.len-1)
            			if __argNames[i] == "&" then
                			restName = __argNames[i+1]
                			if i >= forms.len then
                    		newEnv.set(restName, [])
                			else
                    			newEnv.set(restName, forms[i:])
                			end if
                			break
            			end if
            			if i >= forms.len then
                			newEnv.set(__argNames[i], null)
            			else
                			newEnv.set(__argNames[i], forms[i])
            			end if
        			end for
    			end if
    			return eval(__body, newEnv)
			end function
    
    		globalEnv.locals["macros"][name] = @macroFn
    		return name
		end if
	
		if first == "recur" then
    		args = []
    		if exp.len > 1 then
        		for i in range(1, exp.len-1)
        			result = eval(exp[i], env)
       				if isError(result) then return result
        			args.push(result)
        		end for
    		end if
    		return {"classID": "recur", "args": args}
		end if
	
		// try/catch special form in eval
		if first == "try" then
    		body = exp[1]
    		result = eval(body, env)
    		if isError(@result) then
    		    if exp.len < 3 then return result
    		    catchClause = exp[2]
        		catchBindings = catchClause[1]
        		if catchBindings isa list and catchBindings.len > 0 and catchBindings[0] == "array" then
        		    catchBindings = catchBindings[1:]
        		end if
        		catchEnv = makeEnv(env)
        		if catchBindings.len > 0 then
        		    catchEnv.set(catchBindings[0], result["message"])
        		end if
        		return eval(catchClause[2], catchEnv)
    		end if
    		return result
		end if

		if first == "throw" then
    		msg = eval(exp[1], env)
    		if isError(msg) then return msg
    		return lispError(msg)
		end if
	
		if first == "apply" then
    		fn = eval(exp[1], env)
    		argList = eval(exp[2], env)
			  if isError(@fn) then return fn
			  if isError(@argList) then return argList
    		if not @argList isa list then return lispError("Apply requires a list as second argument")
    		isNative = globalEnv.natives.hasIndex(exp[1])
        res = callFunction(@fn, @argList, @exp[1], isNative)
        if isError(@res) then return addTrace(@res, "in " + first) 
    		return res
		end if
	
		if first == "and" then
    		result = true
			  if exp.len > 1 then
    			for i in range(1, exp.len-1)
        		result = eval(exp[i], env)
					if isError(@result) then return result
					if not result then return result
    			end for
			  end if
    		return result
		end if

		if first == "or" then
    		if exp.len == 1 then return null  // (or) with no args
    		for i in range(1, exp.len-1)
        		result = eval(exp[i], env)
				if isError(@result) then return result
        		if result then return result  // short circuit, return truthy value
    		end for
    		return false
		end if

        if first == "quote" then
            return exp[1]
        end if

		if first == "let" then
    		bindings = exp[1]
    		if bindings isa list and bindings.len > 0 and bindings[0] == "array" then
        		bindings = bindings[1:]
    		end if
    		body = exp[2]
    		newEnv = makeEnv(env)
    		if bindings.len > 0 then
        		for i in range(0, bindings.len-1, 2)
            		value = eval(bindings[i+1], newEnv)
            		if isError(@value) then return value
            		newEnv.set(bindings[i], value)
        		end for
    		end if
    		return eval(body, newEnv)
		end if
	
		if first == "do" then
    		result = null
    		if exp.len > 1 then
        		for i in range(1, exp.len-1)
            		result = eval(exp[i], env)
					if isError(@result) then return result
        		end for
    		end if
    		return result
		end if
	
      if first == "if" then
        cond = eval(exp[1], env)
			  if isError(@cond) then return cond
        if @cond then
          return eval(exp[2], env)
			  else
    		  if exp.len > 3 then return eval(exp[3], env)
    			return null
			  end if
      end if

		if first == "ns" then
			nsName = exp[1]
    	if nsName isa list then nsName = exp[1][1]  // handle quoted ns names
   		namespaces = globalEnv.locals["__namespaces__"]
    	if not namespaces.hasIndex(nsName) then
        namespaces[nsName] = {}
        globalEnv.locals["__ns_aliases__"][nsName] = {}
    	end if
    	globalEnv.locals["__current_ns__"] = nsName
    	return nsName
		end if

		if first == "def" or first == "define" then
    	name = exp[1]
    	value = eval(exp[2], env)
    	if isError(@value) then return value
			currentNs = globalEnv.locals["__current_ns__"]
			globalEnv.locals["__namespaces__"][currentNs][name] = @value
    	env.set(name, value)
    	return value
		end if

		if first == "fn" then
    	params = exp[1]
    	if params isa list and params.len > 0 and params[0] == "array" then
      		params = params[1:]
    	end if
    	return {"classID": "fn", "args": params, "body": exp[2:], "env": env}
		end if
        
		// normal function call
		op = eval(first, env)
		if isError(@op) then return op
		args = []
		if exp.len > 1 then
    	for i in range(1, exp.len-1)
      	val = eval(exp[i], env)
			  if isError(@val) then return val
        args.push(@val)
    	end for
		end if
		isNative = globalEnv.natives.hasIndex(first)
    res = callFunction(@op, @args, @first, isNative)
    if isError(@res) then return addTrace(@res, " in " + first)
		return res
	  
    else if @exp isa string then
    	// keywords are self-evaluating
    	if exp[0] == ":" then return exp
    	if exp[0] == """" then return exp[1:-1]  // string literal, strip quotes

		if exp.indexOf("/") != null then
    	parts = exp.split("/")
    	if parts.len == 2 and parts[0] != "" and parts[1] != "" then
      	alias = parts[0]
      	sym = parts[1]
      	currentNs = globalEnv.locals["__current_ns__"]
      	aliases = globalEnv.locals["__ns_aliases__"][currentNs]
      	if aliases.hasIndex(alias) then
          fullNs = aliases[alias]
      	else
        	fullNs = alias
      	end if
      	namespaces = globalEnv.locals["__namespaces__"]
      	if not namespaces.hasIndex(fullNs) then return lispError("No such namespace: " + fullNs)
      	if not namespaces[fullNs].hasIndex(sym) then return lispError("No such var: " + exp)
      	return @namespaces[fullNs][sym]
   		end if
		end if

    	return env.get(@exp)  // walks the chain, errors if not found
    else
        return exp
    end if
end function
