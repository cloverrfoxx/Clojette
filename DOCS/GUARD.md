# `guard`
Guard is the type checking library Clojette uses. This document outlines how to use Guard and how it works.


Guard validates function arguments by checking:

* arity (argument count)
* argument types

Returns:

* `null` if validation succeeds
* `lispError(...)` if validation fails

---

## Signature

```javascript"
guard(arity, types, args)
```

| Parameter | Description               |
| --------- | ------------------------- |
| `arity`   | Arity signature string    |
| `types`   | List of expected types    |
| `args`    | Argument list to validate |

---

# Arity Signatures

| Signature | Meaning                   |
| --------- | ------------------------- |
| `"0"`     | exactly 0 arguments       |
| `"1"`     | exactly 1 argument        |
| `"2+"`    | 2 or more arguments       |
| `"1-4"`   | between 1 and 4 arguments |
| `"*"`     | any number of arguments   |

---

# Type Specifications

Types are checked positionally.

```javascript"
["string", "number"]
```

means:

```javascript
arg0 = string
arg1 = number
```

---

## Variadic Type Repetition

If more arguments exist than type specifications,
the final type repeats.

Example:

```javascript
guard("1+", ["number"], args)
```

means:

```text 
(number number number ...)
```

Example:

```javascript
guard("2+", ["string", "number"], args)
```

means:

```text
(string number number number ...)
```

---

# Union Types

Nested lists represent unions.

```javascript
[["string", "number"]]
```

means:

```text
string OR number
```

Example:

```javascript
guard("1+", [["string", "number"]], args)
```

Accepts:

* strings
* numbers

Rejects:

* maps
* lists
* functions

---

# Examples

## Fixed Arity

```javascript id="s8mz9f"
err = guard("2", ["number"], args)
if isError(err) then return err
```

Requires exactly 2 numbers.

---

## Variadic

```javascript
err = guard("1+", ["string"], args)
if isError(err) then return err
```

Requires 1 or more strings.

---

## Mixed Types

```javascript
err = guard(
    "2+",
    ["string", "number"],
    args
)
```

Requires:

```text id="6h78s2"
(string number number ...)
```

---

## Union Types

```javascript
err = guard(
    "1+",
    [["string", "list", "number"]],
    args
)
```

Accepts strings, lists, or numbers.

Rejects maps.

---

# Supported Types

Built-in:

* `"number"`
* `"string"`
* `"list"`
* `"map"`
* `"function"`
* `"null"`

Custom runtime types:

* `"error"`

Additional custom types may be added through `realTypeof`.

---

# Typical Usage Pattern

```javascript
myFunction = function(args)

    err = guard("2", ["number"], args)
    if isError(err) then return err

    // Safe to use args here

    return args[0] + args[1]
end function
```

This prevents stdlib functions from crashing on invalid input.

