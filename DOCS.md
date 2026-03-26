# Clojette Language Reference

Clojette is a Clojure-inspired Lisp that runs inside [GreyHack](https://greyhackgame.com/), implemented in GreyScript/MiniScript. If you've never written Lisp before, don't worry, because this document starts from the basics. If you already know Clojure, feel free to skip ahead to [Differences from Clojure](#differences-from-clojure).

---

## Table of Contents

0. [Lisp as a programming language](#lisp-as-a-programming-language)
1. [Getting Started](#getting-started)
2. [The Basics of Lisp Syntax](#the-basics-of-lisp-syntax)
3. [Data Types](#data-types)
4. [Special Forms](#special-forms)
5. [Functions](#functions)
6. [Control Flow](#control-flow)
7. [Loops and Recursion](#loops-and-recursion)
8. [Macros](#macros)
9. [Error Handling](#error-handling)
10. [Namespaces](#namespaces)
11. [GreyScript Interop](#greyscript-interop)
12. [Standard Library](#standard-library)
13. [Differences from Clojure](#differences-from-clojure)

---

## Lisp as a programming language
Before diving into syntax, it helps to understand what makes Lisp different from most languages. Understanding that will make it easier for you (or anyone else!) to understand this documentation.

In most languages, code and data are different things. You write code (`if x > 0 { ... }`), and you work with data (`[1, 2, 3]`). They look different, they behave differently, and you can't easily treat one as the other.

In Lisp however, code is data. A function call like `(+ 1 2)` is just a list, the same kind of list as `[1 2 3]`. The first element happens to be a function, and the rest are arguments. That's the whole rule. This is called `homoiconicity`.

This might seem like a curiosity, but leads to a powerful language. Because data is code, you can write code that writes code. This allows you, the programmer, to extend the language as its syntax.
This is what macros are, and it's why Lisps are uniquely powerful for building abstractions. When you get to the [Macros](#macros) section, this will matter a lot.

For now, the main idea is that lists in parentheses is either data or a function call.

## Getting Started

Copy `all.gs` into your GreyHack environment, build it, and you'll have a working Clojette runtime. When it starts, you'll see a REPL prompt:

```
Clojette>
```

Type any expression and press Enter. Type `exit`, `quit`, or `q` to leave.

**Loading a file from the REPL:**

```clojure
(import "/path/to/file.clj")
```

`import` reads the file, wraps it in `(do ...)`, and evaluates it in the current environment. Everything defined in the file becomes available in your session. This will be improved in future updates.

The stdlib is distributed separately from the runtime, so you'll need to copy those files from the `/src/` folder. This will, again, be improved in future updates.

---

## The Basics of Lisp Syntax

If you've never written Lisp before, the syntax can look strange at first. Do not fret. In lisp, everything is a list. Lisp languages are easy to parse due to their nature.

A list in parentheses is a function call. The first element is the function, and the rest are arguments.

```clojure
(+ 1 2)        ;; calls + with arguments 1 and 2 -> 3
(str "hello")  ;; calls str with "hello" -> "hello"
(+ 1 2 3 4)    ;; most functions accept any number of arguments; this returns 10
```

There is no operator precedence to worry about. The nesting of parentheses determines the order of evaluation.

```clojure
(+ 1 (* 2 3))  ;; multiply first, then add -> 7
```

**Comments** use `;`. By convention, use `;;` for explanatory comments.

```clojure
; This is a comment
(+ 1 2) ;; so is this
```

---

## Data Types

### Numbers

Clojette uses MiniScript's number type, which covers both integers and floats. In the future something like BigInteger might be implemented, who knows?

```clojure
42
3.14
-7
```

### Strings

Strings are double-quoted. Escape sequences with `\`.

```clojure
"hello"
"say \"hi\""
```

### Booleans

```clojure
true ;; actually 1
false ;; actually 0
```

### Null

`null` and `nil` are both the null value.

```clojure
null
nil
```

### Keywords
Keywords start with : and always evaluate to themselves - they are their own value. They are most commonly used as map keys or as sentinel values in cond.

```clojure
:name
:else
:ok
```

Keywords are useful as map keys because they're unambiguous and self-describing. See [Map operations](#map-operations) for how they're used in practice.

> Note: In Clojure, you can use a keyword as a function to look up values in a map: (:name my-map). This is not yet supported in Clojette. Use (get my-map :name) instead.

### Lists

Lists are the fundamental data structure in Clojette. As discussed before, the code itself is made out of lists. Lists are created with `(list ...)` or the `'(...)` quote syntax. Note that `(...)` without quoting is a *function call*, not a data literal. You can use `[...]` for literal sequences.

```clojure
(list 1 2 3)    ;; -> [1 2 3]
'(1 2 3)        ;; -> [1 2 3] (quoted, not evaluated)
```

### Vectors

Vectors are created with `[...]`. They are the preferred way to write literal sequences of data.

```clojure
[1 2 3]
["a" "b" "c"]
[]
```

Internally, lists and vectors are both MiniScript lists. The distinction is syntactic: `[...]` means "this is data," while `(...)` means "call the first element as a function."

Because both are the same at runtime, the only "real" difference is that `[]` gives the programmer an easier way to define a list without evaluating it. In other words, use `[...]` if you want pure data, and use `(...)` when you want to call something like a function.

In the future, Vectors will be immutable, meaning they can not be changed.

### Maps

Maps are hash maps created with `hash-map` or `{}` syntax (via `assoc`).

```clojure
(hash-map "name" "Alice" "age" 30)
;; -> {"name" "Alice", "age" 30}

(assoc {} :x 1 :y 2)
;; -> {:x 1, :y 2}
```

---

## Special Forms

Special forms are built into the evaluator. They do not evaluate all of their arguments like normal functions do.

### `def` / `define`

Binds a name to a value in the current namespace. Basically, this is how you make a variable.

```clojure
(def x 42)
(def greeting "hello")
```

### `let`

Creates local bindings. The binding vector alternates names and values. Bindings are sequential, meaning later ones can refer to earlier ones.

```clojure
(let [x 10
      y 20]
  (+ x y))
;; -> 30

(let [a 1
      b (+ a 1)]
  (* a b))
;; -> 2
```

The bindings only exist inside the `let` body.

### `fn`

Creates an anonymous function. 

```clojure
(fn [x] (* x x))          ;; a function that squares its argument
(fn [a b] (+ a b))        ;; two arguments
(fn [x & rest] rest)      ;; variadic: x is the first arg, rest is a list of the remaining
```

### `do`

Evaluates multiple expressions in order and returns the value of the last one. Useful for sequencing side effects.

```clojure
(do
  (println "one")
  (println "two")
  42)
;; prints "one", "two", returns 42
```

### `if`

```clojure
(if condition then-expr else-expr)
```

Evaluates `condition`. If truthy, evaluates and returns `then-expr`. Otherwise evaluates and returns `else-expr`. The `else-expr` is optional;; if omitted and the condition is falsy, `if` returns `null`.

```clojure
(if (> x 0) "positive" "non-positive")
(if true "yes")           ;; -> "yes"
(if false "yes")          ;; -> null
```

> Falsy values in Clojette: false and 0 are falsy, as you'd expect. Because Clojette runs on MiniScript, it inherits the MiniScript truthiness. This differs from standard Clojure, where false *and* nil are falsy. Be careful when using if with numbers that might be zero. MiniScript also implements T-norm fuzzy logic, which is beyond the scope of this documentation.

### `quote`

`quote` prevents a form from being evaluated. It returns the form as-is — as data.

```clojure
(quote (1 2 3))   ;; -> [1 2 3] (a list, not a function call)
'(1 2 3)          ;; shorthand for the same thing
'hello            ;; -> "hello" (the symbol, not a lookup)
```

#### Why might someone want this?
Normally, when you write (+ 1 2), Clojette evaluates it — it calls + with 1 and 2 and returns 3. But sometimes you want the list itself, not its result. Quoting is how you say "treat this as data, don't evaluate it."
This becomes important in two situations: creating literal lists of data, and writing macros (where you build up code as data before it runs). For everyday programming, you'll mostly use [...] vector syntax for data literals and won't need quote directly. When you start writing macros, it becomes essential.

The reason for `quote`'s existance is quite simple. Internally, `[...]` expands to `(array ...)` which we don't want when making a macro. `quote` gives you the list as-is, and lets you modify it as you want. In short, `quote` exists mainly for macros.

### `set!`

Mutates an existing binding. The binding must already exist (either via `def` or `let`). Returns the new value.

```clojure
(def counter 0)
(set! counter (+ counter 1))
counter ;; -> 1
```

Use sparingly. Mutation makes programs harder to reason about. Using `set!` is discouraged, since Clojette at its core encourages functional programming.

### `recur`

Jumps back to the nearest enclosing `loop` or `fn`, with new argument values. This is how Clojette does iteration without blowing the stack. See [Loops and Recursion](#loops-and-recursion). Technically this is unnecessary, since a callstack of around 1000 is still reasonably fast and blowing the callstack is reasonably difficult. If you manage to do that, I applaud you.

### `apply`

Calls a function with a list as its argument list.

```clojure
(apply + [1 2 3])   ;; -> 6
(apply str ["a" "b" "c"]) ;; -> "abc"
```

### `quasiquote`, `unquote`, `splice-unquote`

Used in macro writing. See [Macros](#macros).

---

## Functions

### Defining named functions

`defn` defines a function. It is functionally equivalent to `def fn`, and is actually implemented through the macro system.

```clojure
(defn square [x] (* x x))           ;; a function named square that squares its argument
(defn add [a b] (+ a b))            ;; two arguments
(defn variad [x & rest] rest)       ;; variadic: x is the first arg, rest is a list of the remaining

(defn square [n]
  (* n n))

(square 5) ;; -> 25
```

Multi-body functions (the body is an implicit `do`):

```clojure
(defn greet [name]
  (println (str "Hello, " name "!"))
  name)
```

### Variadic functions

Use `&` to collect remaining arguments into a list:

```clojure
(defn my-list [& args]
  args)

(my-list 1 2 3) ;; -> [1 2 3]

(defn first-and-rest [x & rest]
  (println x)
  rest)

(first-and-rest 1 2 3) ;; prints 1, returns [2 3]
```

### Closures

Functions capture the environment they were created in:

```clojure
(defn make-adder [n]
  (fn [x] (+ x n)))

(def add5 (make-adder 5))
(add5 10) ;; -> 15
```

### Higher-order functions

Functions are first-class values. Pass them around freely:

```clojure
(map (fn [x] (* x 2)) [1 2 3])  ;; -> [2 4 6]
(filter even? [1 2 3 4 5])      ;; -> [2 4]
(reduce + 0 [1 2 3 4 5])        ;; -> 15
```

---

## Control Flow

### `when` and `unless`

Convenience macros for one-armed conditionals:

```clojure
(when condition body)    ;; if condition, return body, else null
(unless condition body)  ;; if not condition, return body, else null

(when (> x 0)
  (println "positive"))

(unless (empty? xs)
  (car xs))
```

### `cond`

A multi-branch conditional. Clauses are tested in order;; the first truthy one wins. Use `:else` as a catch-all. For those coming from other languages, this is Clojette's version of the `switch` statement. (And yes, it is implemented as a macro, thanks for asking.)

```clojure
(cond
  (< x 0) "negative"
  (= x 0) "zero"
  :else   "positive")
```

### `and` and `or`

`and` evaluates expressions left to right and returns the last value if all are truthy, or the first falsy value:

```clojure
(and 1 2 3)       ;; -> 3
(and 1 false 3)   ;; -> false
```

`or` returns the first truthy value, or `false` if none are truthy:

```clojure
(or false false 3) ;; -> 3
(or false false)   ;; -> false
```

### Threading macros: `->` and `->>`

Threading macros clean up deeply nested function calls by making data flow left-to-right.

`->` threads the value as the **first** argument:

```clojure
;;; Without threading:
(str (upper-case (trim "  hello  ")))

;;; With ->:
(-> "  hello  "
    (trim)
    (upper-case)
    (str))
```

`->>` threads the value as the **last** argument:

```clojure
(->> [1 2 3 4 5]
     (filter odd?)
     (map (fn [x] (* x x)))
     (reduce + 0))
;; -> 35
```

---

## Loops and Recursion

GreyScript does not support tail-call optimization (TCO), so Clojette uses an explicit `recur`-based loop like Clojure does. Under the hood this becomes an actual loop, so you never blow the stack.

### `loop` and `recur`

`loop` establishes a recursion point with initial bindings. `recur` jumps back to it with new values.

```clojure
(loop [i 0 acc 0]
  (if (> i 10)
    acc
    (recur (+ i 1) (+ acc i))))
;; -> 55 (sum of 0..10)
```

The `defn` form also supports `recur` - it jumps back to the top of the function:

```clojure
(defn factorial [n]
  (loop [i n acc 1]
    (if (= i 0)
      acc
      (recur (- i 1) (* acc i)))))

(factorial 10) ;; -> 3628800
```

### `while`

A macro for imperative-style loops (built on `loop`/`recur`):

```clojure
(def i 0)
(while (< i 5)
  (println i)
  (set! i (+ i 1)))
```

---

## Macros

Macros are the most powerful feature of Lisp, and the most unique. They let you extend the language itself by writing code that runs at evaluation time to transform other code.

Macros are an advanced-ish topic, so if this is confusing to you, don't worry! You don't need to make your own macros all the time, and beginners can most of the time ignore macros. They become important for more advanced users though, so they are worth learning eventually.

### What is a macro, and why does it matter?

In Clojette (and Lisp in general) code is just data. Lisp consists of symbols and values. A macro is a function that receives unevaluated code as data, transforms it, and returns new code that then gets evaluated. 

This means you can add new syntax to the language. `when`, `unless`, `cond`, `->`, `loop` are all macros. They do not exist in the Clojette interpreter, instead they are defined in Clojette.

For example, let's look at `when`. We want `(when condition body)` to mean "if condition is true, evaluate body, otherwise return null." There's no way to write this as a regular function, because a regular function evaluates all its arguments before running. We need `body` to only evaluate if `condition` is true. A macro lets us do this.

### Defining macros

```clojure
(defmacro name [args...]
  body)
```

The arguments to a macro are the **unevaluated** forms. The macro returns a new form, which is then evaluated.

```clojure
(defmacro my-when [condition body]
  (list 'if condition body null))

(my-when (> x 0) (println "positive"))
;; expands to: (if (> x 0) (println "positive") null)
```

### Quasiquoting

Writing macros with `list` and `quote` gets verbose quickly. Quasiquoting is a cleaner way to build code templates.

- `\`` (backtick)   - This is quasiquote, it's like `quote`, but allows selective evaluation inside of it.
- `~`   - This is the unquote, it evaluates the expression inside a quasiquoted expression.
- `~@`  - This is the splice-unquote, it evaluates and splices the resulting list into the surrounding form.

Quasiquoted forms are templates that you can fill. `~` fills a spot in the template with a single value, whereas `~@` fills the spot by spreading a list into the template.

```clojure 
;; Without quasiquote:
(defmacro my-when [condition body]
  (list 'if condition body null))

;; With quasiquote — much cleaner:
(defmacro my-when [condition body]
  `(if ~condition ~body null))
```

### Variadic macros
Like functions, macros can use & to collect remaining arguments:
```clojure
(defmacro unless [condition & body]
  `(if ~condition null (do ~@body)))
```

### gensym and variable capture
There's a small problem that can bite you in macros. If a macro introduces a local binding, it might accidentally clash with a variable in the code that uses the macro.

Let's consider the following macro:
```clojure
(defmacro swap! [a b]
  `(let [tmp ~a]
     (set! ~a ~b)
     (set! ~b tmp)))
```

If the user has a variable named tmp, this macro will silently use theirs instead of creating a fresh one. This is called variable capture, and it's a well-known macro bug.

`gensym` generates a unique symbol name that is guaranteed not to clash with anything:
```clojure
(gensym)        ;; -> "G__1" (unique each time)
(gensym "tmp")  ;; -> "G__2tmp"
```

In production macros, use `gensym` for any local bindings:
```clojure
(defmacro swap! [a b]
  (let [tmp-name (gensym "tmp")]
    `(let [~tmp-name ~a]
       (set! ~a ~b)
       (set! ~b ~tmp-name))))
```

### How macros are looked up

Macros are stored in a global registry separate from the regular environment. When the evaluator encounters a list whose first element is a known macro name, it calls the macro with the unevaluated argument forms, then evaluates the result. This means macros are checked before regular function dispatch.

---

## Error Handling

Clojette propagates errors as values through the call stack and provides `try`/`catch` for recovery.

### `throw`

Raises an error with the given message:

```clojure
(throw "something went wrong")
(throw (str "bad value: " x))
```

### `try` / `catch`

```clojure
(try
  body
  (catch [binding] handler))
```

If `body` evaluates without error, `try` returns its value. If an error is thrown, the error message is bound to `binding` and `handler` is evaluated.

```clojure
(try
  (/ 1 0)
  (catch [e] (str "caught: " e)))
;; -> "caught: Division by zero"

(try
  (throw "oops")
  (catch [e] e))
;; -> "oops"
```

Errors include a stack trace that is printed at the top level if uncaught.

---

## Namespaces

Clojette has basic namespace support modelled after Clojure.

### `ns`

Switches the current namespace. Creates it if it doesn't exist.

```clojure
(ns my.app)
(def x 42)   ;; defined in my.app

(ns user)    ;; switch back to user
```

### Accessing across namespaces

Use `namespace/name` syntax:

```clojure
(ns tools)
(defn helper [] "I help")

(ns user)
(tools/helper) ;; -> "I help"
```

> **Note:** Namespace aliasing is supported in the evaluator but the `require`/`use` forms are not yet implemented. You can call into other namespaces with the full `ns/name` syntax.

---

## GreyScript Interop

Clojette can call any GreyScript/MiniScript value directly. This is how you interact with the game environment. Do note that incorrect usage of the GreyScript functions will crash the program, so you have to be careful with them. Clojette tries to perform error handling as much as possible, but occasionally that does fail.

### Calling methods on objects

Use `.methodName object args...`, the dot prefix signals a native method call:

```clojure
(.host_computer (get_shell))  ;; call host_computer() on the result of get_shell
```

### Chaining with `->`

The threading macro pairs naturally with interop:

```clojure
(-> (get_shell)
    (.host_computer)
    (.File "/etc/passwd")
    (.get_content)
    (println))
```

This is equivalent to:

```clojure
(println (.get_content (.File (.host_computer (get_shell)) "/etc/passwd")))
```

### Accessing properties

If a property is not a function, the dot call returns it directly:

```clojure
(def computer (.host_computer (get_shell)))
;; if computer has a field called "name":
(.name computer)  ;; -> the value of computer.name
```

### Built-in GreyScript functions

Many GreyScript globals are available directly in Clojette:

```clojure
get_shell       ;; the shell object
get_router      ;; the router object
nslookup        ;; DNS lookup
whois           ;; WHOIS query
is_valid_ip     ;; IP validation
is_lan_ip       ;; LAN IP check
active_user     ;; current user
home_dir        ;; home directory path
program_path    ;; path of the running program
current_path    ;; current working directory
parent_path     ;; parent of a path
get_abs_path    ;; resolve to absolute path
include_lib     ;; include a GreyHack library
time            ;; current Unix timestamp
current_date    ;; current date string
char            ;; character from code point
rnd             ;; seeded random number
val             ;; parse a string to a number
typeof          ;; type name of a value
globals         ;; global variable map
yield           ;; yield execution
exit            ;; exit the program
wait            ;; pause execution
```

These are native and are called like any other function:

```clojure
(time)                      ;; -> current time in game
(is_valid_ip "10.0.0.1")    ;; -> true
(char 65)                   ;; -> "A"
```

---

## Standard Library

### Arithmetic

| Function | Description |
|----------|-------------|
| `(+ a b ...)` | Addition |
| `(- a b ...)` | Subtraction;; `(- n)` negates |
| `(* a b ...)` | Multiplication |
| `(/ a b ...)` | Division |
| `(% a b)` | Modulo |
| `(mod a b)` | Modulo (alias) |
| `(** a b)` | Exponentiation |
| `(quot a b)` | Integer (truncating) division |
| `(inc n)` | Add 1 |
| `(dec n)` | Subtract 1 |
| `(abs n)` | Absolute value |
| `(max a b ...)` | Maximum |
| `(min a b ...)` | Minimum |
| `(floor n)` | Round down |
| `(ceil n)` | Round up |
| `(round n)` | Round to nearest |
| `(sqrt n)` | Square root |

### Comparison

| Function | Description |
|----------|-------------|
| `(= a b ...)` | Equality (all must be equal) |
| `(not= a b)` | Inequality |
| `(< a b ...)` | Strictly increasing |
| `(> a b ...)` | Strictly decreasing |
| `(<= a b ...)` | Non-decreasing |
| `(>= a b ...)` | Non-increasing |

Comparison functions accept multiple arguments and check them pairwise:

```clojure
(< 1 2 3 4)   ;; -> true (all pairs satisfy <)
(< 1 2 2 4)   ;; -> false (2 < 2 is false)
```

### Logic

| Function | Description |
|----------|-------------|
| `(not x)` | Boolean negation |
| `(and ...)` | Short-circuit and |
| `(or ...)` | Short-circuit or |

### List operations

| Function | Description |
|----------|-------------|
| `(list a b ...)` | Create a list |
| `(car lst)` | First element (error on empty) |
| `(cdr lst)` | All but first element |
| `(first lst)` | First element (null on empty) |
| `(second lst)` | Second element (null if missing) |
| `(rest lst)` | All but first (empty list if none) |
| `(last lst)` | Last element |
| `(nth lst n)` | Element at index n (0-based) |
| `(count lst)` | Number of elements |
| `(cons x lst)` | Prepend x to lst |
| `(conj lst x ...)` | Append x to lst |
| `(concat a b)` | Concatenate two lists |
| `(reverse lst)` | Reverse a list |
| `(flatten lst)` | Recursively flatten nested lists |
| `(take n lst)` | First n elements |
| `(drop n lst)` | All but first n elements |
| `(range start end)` | List of integers from start (inclusive) to end (exclusive) |
| `(empty? lst)` | True if null or length 0 |
| `(list? x)` | True if x is a list |

### Higher-order functions

| Function | Description |
|----------|-------------|
| `(map f lst)` | Apply f to each element, return new list |
| `(filter pred lst)` | Keep elements where pred returns true |
| `(reduce f init lst)` | Fold lst with f, starting from init |
| `(every? pred lst)` | True if pred is true for all elements |
| `(some? pred lst)` | True if pred is true for any element |
| `(apply f lst)` | Call f with elements of lst as arguments |

### Map operations

| Function | Description |
|----------|-------------|
| `(hash-map k v ...)` | Create a map from key/value pairs |
| `(get m k)` | Look up key k (null if missing) |
| `(get m k default)` | Look up k with a default value |
| `(assoc m k v ...)` | Return map with key/value pairs added |
| `(dissoc m k ...)` | Return map with keys removed |
| `(keys m)` | List of all keys |
| `(vals m)` | List of all values |
| `(contains? m k)` | True if key exists |
| `(map? x)` | True if x is a map |

### String operations

| Function | Description |
|----------|-------------|
| `(str a b ...)` | Concatenate values as strings |
| `(split s sep)` | Split string by separator |
| `(join lst sep)` | Join list into string with separator |
| `(trim s)` | Remove leading/trailing whitespace |
| `(upper-case s)` | Uppercase |
| `(lower-case s)` | Lowercase |
| `(replace s from to)` | Replace all occurrences of `from` with `to` |
| `(index-of s sub)` | Index of first occurrence of substring |
| `(subs s start)` | Substring from index |
| `(subs s start end)` | Substring from start to end (exclusive) |

### Type predicates

| Function | Description |
|----------|-------------|
| `(number? x)` | True if x is a number |
| `(string? x)` | True if x is a string |
| `(null? x)` | True if x is null |
| `(list? x)` | True if x is a list |
| `(map? x)` | True if x is a map |
| `(fn? x)` | True if x is a function or closure |
| `(true? x)` | True if x is exactly `true` |
| `(false? x)` | True if x is exactly `false` |
| `(zero? n)` | True if n = 0 |
| `(pos? n)` | True if n > 0 |
| `(neg? n)` | True if n < 0 |
| `(even? n)` | True if n is even |
| `(odd? n)` | True if n is odd |

### Function utilities

| Function | Description |
|----------|-------------|
| `(identity x)` | Returns x unchanged |
| `(constantly x)` | Returns a function that always returns x |
| `(complement f)` | Returns a function that negates f's result |
| `(comp f g)` | Returns `(fn [x] (f (g x)))` |

### I/O

| Function | Description |
|----------|-------------|
| `(println a b ...)` | Print arguments separated by spaces, with newline |
| `(user-input prompt)` | Read a line of input from the user |

---

## Differences from Clojure

Clojette is heavily inspired by Clojure but is not a complete implementation. Here's what's different:

### Missing features

- **No `#{}`** - set literals are not supported
- **No `#()` anonymous function reader macro** - use `(fn [x] ...)` instead
- **No `@` deref** - there are no atoms/refs/agents
- **No `require` / `use` / `import` for namespaces** - use the `ns/name` syntax directly, or `(import "path")` to load files. This will be rectified in future updates.
- **No lazy sequences** - All sequences are eager. This would be a hassle to implement. If there are enough requests for this, they may be implemented in a future update.
- **No persistent (structural-sharing) data structures** - maps and lists are mutable MiniScript values
- **No Java interop** - duh, interop is with GreyScript/MiniScript instead (see [GreyScript Interop](#greyscript-interop))
- **No protocol or multimethods**
- **No `loop` binding destructuring** - bindings in `loop` must be simple names
- **No keyword lookup** - `(:key map)` is not supported; use `(get map :key)` instead

### Behavioural differences
- **Falsy values** - 0 and `false` are falsy due to MiniScript's type system, unlike Clojure where only false and nil are falsy. `nil` is truthy in Clojette (????)
- **`and`** returns the last value if all truthy, or the first falsy value - same as Clojure, but note there is no `&&` short-circuit returning `nil`, it returns `false` on the falsy path
- **`or`** returns `false` (not `nil`) when no clause is truthy
- **fuzzy logic** - Clojette inherits fuzzy T-norm logic from MiniScript. This isn't in the Clojette spec, but oh well...
- **Vectors and lists are the same type** - `[1 2 3]` and `(list 1 2 3)` produce identical values; there is no distinction at runtime
- **`recur` is only valid inside `loop` or `fn`** - there is no TCO for arbitrary tail calls
- **Macros are global** - they live in a single global registry and are not namespace-scoped
- **`try/catch` binding syntax** - uses `(catch [e] ...)` rather than Clojure's `(catch ExceptionType e ...)`; there is no exception type dispatch

### Interop syntax

Clojure's Java interop uses `(.method obj)`. Clojette's GreyScript interop uses the same dot-prefix syntax, so this transfers directly; just substitute MiniScript objects for Java objects.

### What works the same

- `defn`, `fn`, `let`, `do`, `if`, `def`, `quote`, `quasiquote`, `~`, `~@`
- `->` and `->>`
- `cond`, `when`, `unless`
- `loop` / `recur`
- `try` / `catch` / `throw`
- `defmacro` with quasiquoting
- All standard collection functions (`map`, `filter`, `reduce`, `cons`, `car`, `cdr`, etc.)
- Keywords as self-evaluating values
- Variadic functions with `&`
- Closures and higher-order functions
- `set!` for mutation
- Namespaces with `ns` and `ns/name` access

---

*For questions, contributions, or bug reports, see `CONTRIBUTING.md`.*
