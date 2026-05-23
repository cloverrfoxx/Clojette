;;   Copyright (C) 2026 lattiahirvio
;;
;;   This file is part of Clojette.
;;   Clojette is licensed under GPLv3 with a special linking/importing exception.
;;   See LICENSE for details.
;;
;;   Clojette is free software: you can redistribute it and/or modify
;;   it under the terms of the GNU General Public License as published by
;;   the Free Software Foundation, either version 3 of the License, or
;;   any later version.
;;
;;   Clojette is distributed in the hope that it will be useful,
;;   but WITHOUT ANY WARRANTY; without even the implied warranty of
;;   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
;;   GNU General Public License for more details.
;;
;;   You should have received a copy of the GNU General Public License
;;   along with Clojette. If not, see <https://www.gnu.org/licenses/>.

;; Clojette Test Suite
(def pass-count 0)
(def fail-count 0)

(defn assert-eq [name expected actual]
  (if (= expected actual)
    (do
      (set! pass-count (+ pass-count 1))
      (println (str "  PASS: " name)))
    (do
      (set! fail-count (+ fail-count 1))
      (println (str "  FAIL: " name))
      (println (str "    expected: " expected))
      (println (str "    actual:   " actual)))))

(defn assert-true [name val]
  (assert-eq name true val))

(defn assert-false [name val]
  (assert-eq name false val))

(defn assert-null [name val]
  (assert-eq name null val))

(defn run-section [name]
  (println (str "\n-- " name " --")))

;; ============================================================
;; Arithmetic
;; ============================================================
(run-section "Arithmetic")
(assert-eq "addition"         6   (+ 1 2 3))
(assert-eq "subtraction"      1   (- 4 3))
(assert-eq "multiplication"   24  (* 2 3 4))
(assert-eq "division"         2   (/ 6 3))
(assert-eq "modulo"           1   (% 7 2))
(assert-eq "power"            8   (** 2 3))
(assert-eq "negate"           -5  (- 5))
(assert-eq "nested arith"     14  (+ (* 2 3) (- 10 4) (/ 6 3)))
(assert-eq "integer division" 3   (quot 7 2))

;; ============================================================
;; Comparison
;; ============================================================
(run-section "Comparison")
(assert-true  "="          (= 1 1))
(assert-false "= false"    (= 1 2))
(assert-true  "not="       (not= 1 2))
(assert-true  "<"          (< 1 2))
(assert-false "< false"    (< 2 1))
(assert-true  ">"          (> 2 1))
(assert-true  "<="         (<= 1 1))
(assert-true  ">="         (>= 2 1))
(assert-true  "chained <"  (< 1 2 3 4))
(assert-false "chained < false" (< 1 2 2 4))

;; ============================================================
;; Boolean logic
;; ============================================================
(run-section "Boolean logic")
(assert-true  "and true"   (and true true))
(assert-false "and false"  (and true false))
(assert-true  "or true"    (or false true))
(assert-false "or false"   (or false false))
(assert-true  "not false"  (not false))
(assert-false "not true"   (not true))
(assert-eq "and short-circuit" 3  (and 1 2 3))
(assert-eq "or short-circuit"  3  (or false false 3))
(assert-eq "and no args" true (and))
(assert-null "or no args" (or))

;; ============================================================
;; Variables and binding
;; ============================================================
(run-section "Variables and binding")
(def x 42)
(assert-eq "def"           42  x)
(def x 99)
(assert-eq "redef"         99  x)
(assert-eq "let"           10  (let [a 3 b 7] (+ a b)))
(assert-eq "let shadow"    5   (let [x 5] x))
(assert-eq "let no escape" 99  x)
(assert-eq "let sequential" 3  (let [a 1 b (+ a 1)] (+ a b)))

;; ============================================================
;; Functions
;; ============================================================
(run-section "Functions")
(defn square [n] (* n n))
(assert-eq "defn"          25  (square 5))
(assert-eq "fn literal"    9   ((fn [x] (* x x)) 3))
(assert-eq "closure"       10  (let [n 5] ((fn [x] (+ x n)) 5)))
(defn add [a b] (+ a b))
(assert-eq "multi-arg"     7   (add 3 4))
(defn make-adder [n] (fn [x] (+ x n)))
(def add5 (make-adder 5))
(assert-eq "higher order"  11  (add5 6))
(assert-eq "reader anon fn"
  9
  (#(* % %) 3))
(assert-true "too few args"
  (try
    (add 1)
    (catch [e] true)))

;; ============================================================
;; Variadics
;; ============================================================
(run-section "Variadics")
(defn my-list [& args] args)
(assert-eq "variadic"      [1 2 3]  (my-list 1 2 3))
(defn head-tail [x & rest] (list x rest))
(assert-eq "head-tail head" 1       (first (head-tail 1 2 3)))
(assert-eq "head-tail tail" [2 3]   (second (head-tail 1 2 3)))

;; ============================================================
;; Conditionals
;; ============================================================
(run-section "Conditionals")
(assert-eq "if true"       "yes"  (if true "yes" "no"))
(assert-eq "if false"      "no"   (if false "yes" "no"))
(assert-null "if no else"         (if false "yes"))
(assert-eq "when true"     "ok"   (when true "ok"))
(assert-null "when false"         (when false "ok"))
(assert-null "unless true"        (unless true "ok"))
(assert-eq "unless false"  "ok"   (unless false "ok"))
(assert-eq "cond first"    "a"    (cond true "a" false "b" :else "c"))
(assert-eq "cond second"   "b"    (cond false "a" true "b" :else "c"))
(assert-eq "cond else"     "c"    (cond false "a" false "b" :else "c"))
(assert-eq "cond body"     "a"    (cond (= 1 1) "a" (= 1 2) "b" :else "c"))
(defn func123 [num] 
  (cond 
    (= num 1) "a" 
    (= 1 2) "b" 
    :else "c"))
(assert-eq "cond in fun"   "a"    (func123 1))

;; ============================================================
;; List operations
;; ============================================================
(run-section "List operations")
(assert-eq "list"          [1 2 3]   (list 1 2 3))
(assert-eq "car"           1         (car [1 2 3]))
(assert-eq "cdr"           [2 3]     (cdr [1 2 3]))
(assert-eq "cons"          [0 1 2]   (cons 0 [1 2]))
(assert-eq "first"         1         (first [1 2 3]))
(assert-eq "second"        2         (second [1 2 3]))
(assert-eq "rest"          [2 3]     (rest [1 2 3]))
(assert-eq "nth"           3         (nth [1 2 3] 2))
(assert-eq "last"          3         (last [1 2 3]))
(assert-eq "count"         3         (count [1 2 3]))
(assert-true  "empty? true"          (empty? []))
(assert-false "empty? false"         (empty? [1]))
(assert-true  "list? true"           (list? [1 2]))
(assert-false "list? false"          (list? "nope"))
(assert-eq "conj"          [1 2 3]   (conj [1 2] 3))
(assert-eq "concat"        [1 2 3 4] (concat [1 2] [3 4]))
(assert-eq "reverse"       [3 2 1]   (reverse [1 2 3]))
(assert-eq "flatten"       [1 2 3 4] (flatten [1 [2 3] [4]]))
(assert-eq "take"          [1 2]     (take 2 [1 2 3 4]))
(assert-eq "drop"          [3 4]     (drop 2 [1 2 3 4]))

;; ============================================================
;; Higher order functions
;; ============================================================
(run-section "Higher order functions")
(assert-eq "map"           [2 4 6]       (map (fn [x] (* x 2)) [1 2 3]))
(assert-eq "filter"        [2 4]         (filter even? [1 2 3 4 5]))
(assert-eq "reduce"        15            (reduce + 0 [1 2 3 4 5]))
(assert-eq "every? true"   true          (every? even? [2 4 6]))
(assert-false "every? false"             (every? even? [2 3 6]))
(assert-true  "some? true"               (some? even? [1 2 3]))
(assert-false "some? false"              (some? even? [1 3 5]))
(assert-eq "apply"         6             (apply + [1 2 3]))
(assert-eq "comp"          4             ((comp square (fn [x] (+ x 1))) 1))
(assert-eq "identity"      42            (identity 42))
(assert-eq "constantly"    7             ((constantly 7) 1 2 3))
(assert-eq "complement"    false         ((complement even?) 2))
(assert-eq "apply user fn"
  5
  (apply add [2 3]))
(assert-true "apply non-list"
  (try
    (apply + 123)
    (catch [e] true)))

;; ============================================================
;; Recursion and loop/recur
;; ============================================================
(run-section "Recursion and loop/recur")
(defn factorial [n]
  (loop [i n acc 1]
    (if (= i 0)
      acc
      (recur (- i 1) (* acc i)))))
(assert-eq "factorial 0"   1      (factorial 0))
(assert-eq "factorial 5"   120    (factorial 5))
(assert-eq "factorial 10"  3628800 (factorial 10))

(defn fib [n]
  (loop [i n a 0 b 1]
    (if (= i 0)
      a
      (recur (- i 1) b (+ a b)))))
(assert-eq "fib 0"  0   (fib 0))
(assert-eq "fib 1"  1   (fib 1))
(assert-eq "fib 10" 55  (fib 10))

(assert-eq "range"  [0 1 2 3 4]  (reverse ( range 0 5)))
(assert-eq "large range count" 1000 (count (range 0 1000)))

;; ============================================================
;; Map/dict operations
;; ============================================================
(run-section "Map operations")
(def m (hash-map "a" 1 "b" 2 "c" 3))
(assert-eq "hash-map get"    1      (get m "a"))
(assert-eq "get missing"     null   (get m "z"))
(assert-eq "get default"     99     (get m "z" 99))
(assert-true  "contains? true"      (contains? m "a"))
(assert-false "contains? false"     (contains? m "z"))
(assert-eq "assoc"           4      (get (assoc m "d" 4) "d"))
(assert-false "dissoc"              (contains? (dissoc m "a") "a"))
(assert-true  "map? true"           (map? m))
(assert-false "map? false"          (map? [1 2 3]))
(assert-eq "map {} assoc"
  {:x 1 :y 2}
  (assoc {} :x 1 :y 2))
(assert-eq "map {} assoc 2"
  (hash-map :x 1 :y 2)
  (assoc {} :x 1 :y 2))
(assert-eq "hash-map eq {}"
  (hash-map)
  {})

(assert-eq "keyword lookup"
  1
  (:a {:a 1}))
(assert-eq "keyword lookup 2"
  1
  (:a {"a" 1}))
(assert-eq "nested literals"
  {"a" [1 2]}
  {"a" [1 2]})

;; ============================================================
;; String operations
;; ============================================================
(run-section "String operations")
(assert-eq "str"         "hello world"  (str "hello" " " "world"))
(assert-eq "str numbers" "42"           (str 42))
(assert-eq "split"       ["a" "b" "c"] (split "a,b,c" ","))
(assert-eq "join"        "a,b,c"       (join ["a" "b" "c"] ","))
(assert-eq "trim"        "hello"       (trim "  hello  "))
(assert-eq "upper-case"  "HELLO"       (upper-case "hello"))
(assert-eq "lower-case"  "hello"       (lower-case "HELLO"))
(assert-eq "replace"     "hXllo"       (replace "hello" "e" "X"))
(assert-eq "index-of"    2             (index-of "hello" "l"))
(assert-eq "subs"        "ell"         (subs "hello" 1 4))

;; ============================================================
;; Type predicates
;; ============================================================
(run-section "Type predicates")
(assert-true  "number? true"    (number? 42))
(assert-false "number? false"   (number? "42"))
(assert-true  "string? true"    (string? "hi"))
(assert-false "string? false"   (string? 42))
(assert-true  "null? true"      (null? null))
(assert-false "null? false"     (null? 0))
(assert-true  "fn? lambda"      (fn? (fn [x] x)))
(assert-true  "zero? true"      (zero? 0))
(assert-false "zero? false"     (zero? 1))
(assert-true  "pos? true"       (pos? 1))
(assert-false "pos? false"      (pos? -1))
(assert-true  "neg? true"       (neg? -1))
(assert-false "neg? false"      (neg? 1))
(assert-true  "even? true"      (even? 4))
(assert-false "even? false"     (even? 3))
(assert-true  "odd? true"       (odd? 3))
(assert-false "odd? false"      (odd? 4))

;; ============================================================
;; Math utils
;; ============================================================
(run-section "Math utils")
(assert-eq "inc"    6    (inc 5))
(assert-eq "dec"    4    (dec 5))
(assert-eq "abs"    5    (abs -5))
(assert-eq "max"    3    (max 1 3))
(assert-eq "min"    1    (min 1 3))
(assert-eq "floor"  3    (floor 3.7))
(assert-eq "ceil"   4    (ceil 3.2))
(assert-eq "round"  4    (round 3.6))
(assert-eq "sqrt"   4    (sqrt 16))

;; ============================================================
;; Macros
;; ============================================================
(run-section "Macros")
(defmacro my-and [a b]
  `(if ~a ~b false))
(assert-true  "custom macro true"   (my-and true true))
(assert-false "custom macro false"  (my-and true false))
(assert-false "custom macro short"  (my-and false true))

(defmacro swap! [a b]
  `(let [tmp ~a]
     (do
       (set! ~a ~b)
       (set! ~b tmp))))
(def p 1)
(def q 2)
(swap! p q)
(assert-eq "swap! p" 2 p)
(assert-eq "swap! q" 1 q)

(assert-eq "unquote"
  [1 2 3]
  `(1 ~(+ 1 1) 3))

(assert-eq "splice-unquote"
  [1 2 3 4]
  `(1 ~@[2 3] 4))

;; expects (a 1 2 3 b)
(defn test-splice []
  (let [x (list 1 2 3)]
    `(a ~@x b)))

(assert-eq "splice-unquote in function"
  ["a" 1 2 3 "b"]
  (test-splice))

;; expects (start 1 2 mid 3 4 end)
(defn test-splice-nested []
  (let [x (list 1 2)
        y (list 3 4)]
    `(start ~@x mid ~@y end)))

(assert-eq "splice-unquote in function 2"
  ["start" 1 2 "mid" 3 4 "end"]
  (test-splice))

;; (cond (= n 0) "zero" (= n 1) "one" :else "other")
(defn test-cond-splice [n]
  (let [clauses (list
                  (list '(= n 0) "zero")
                  (list '(= n 1) "one")
                  (list :else "other"))]
    `(cond ~@(car clauses) ~@(car (cdr clauses)) ~@(car (cdr (cdr clauses))))))

(assert-eq "splice unquote thingy"
  '(cond (= n 0) zero (= n 1) one :else other)
  (test-cond-splice 15))

;; ============================================================
;; Threading macros
;; ============================================================
(run-section "Threading macros")
(assert-eq "-> chain" 10   (-> 1 (+ 2) (+ 3) (+ 4)))
;; (assert-eq "->"   [2 4 6]  (-> [1 2 3] (map (fn [x] (* x 2)) )))
;; (assert-eq "->"   [2 4 6]  (-> [1 2 3] (map (fn [x] (* x 2)))))
(assert-eq "->>"  [2 4 6]  (->> [1 2 3] (map (fn [x] (* x 2)))))
(assert-eq "-> chain" 10   (-> 1 (+ 2) (+ 3) (+ 4)))

;; ============================================================
;; Error handling
;; ============================================================
(run-section "Error handling")
(assert-eq "try success"   42
  (try 42 (catch [e] -1)))
(assert-eq "try catch"     "caught"
  (try (throw "oops") (catch [e] "caught")))
(assert-eq "catch message" "oops"
  (try (throw "oops") (catch [e] e)))
(assert-eq "nested try"    "inner"
  (try
    (try (throw "inner") (catch [e] e))
    (catch [e] "outer")))
(defn explode [] (throw "boom"))
(defn wrapper [] (explode))
(assert-true "error trace exists"
  (try
    (wrapper)
    (catch [e]
      (contains? (:trace e) "wrapper"))))

;; ============================================================
;; do and sequencing
;; ============================================================
(run-section "do and sequencing")
(assert-eq "do returns last" 3
  (do 1 2 3))
(def side-effect 0)
(do
  (set! side-effect 1)
  (set! side-effect 2)
  (set! side-effect 3))
(assert-eq "do side effects" 3 side-effect)

;; ============================================================
;; set!
;; ============================================================
(run-section "set!")
(def counter 0)
(set! counter (+ counter 1))
(set! counter (+ counter 1))
(assert-eq "set! mutates" 2 counter)
(assert-eq "set! in let"  10
  (let [x 5]
    (set! x (* x 2))
    x))

;; ============================================================
;; namespaces
;; ============================================================
(run-section "namespaces")
(ns test.ns)
(def x 42)
(ns user)
(assert-eq "ns qualified lookup" 42 test.ns/x)

;; ============================================================
;; native functions
;; ============================================================
(run-section "native functions")
(assert-eq "rnd test" "0.995347" (str (rnd 12)))
(assert-eq "get_shell" "shell" get_shell)
(assert-true "valid ip" (is_valid_ip "127.0.0.1"))
(assert-eq "get file" "file" (str (-> (get_shell) (.host_computer) (.File "/etc/passwd"))))

;; ============================================================
;; Guard system
;; ============================================================
(run-section "Guard system")

;; Valid call returns null (no error)
(assert-null "guard valid types"
  (guard "*" ["number"] [1 2 3]))

;; Type mismatch should throw → caught
(assert-true "guard type mismatch throws"
  (try
    (guard "*" ["number"] [1 "bad"])
    (catch [e] true)))

;; Arity mismatch should throw → caught
(assert-true "guard arity mismatch throws"
  (try
    (guard "3" ["number" "number" "number"] [1 2])
    (catch [e] true)))

;; Variadic arity OK
(assert-null "guard variadic arity ok"
  (guard "*" ["number"] [1 2 3 4]))

;; Default error includes function name
(assert-eq "guard default error includes name"
  true
  (try
    (guard "*" ["number"] [1 "x"] "myfn")
    (catch [e]
      (contains? (:message e) "myfn"))))

;; Custom message overrides default
(assert-eq "guard custom error message"
  "bad input"
  (try
    (guard "*" ["number"] [1 "x"] "myfn" "bad input")
    (catch [e] (:message e))))

;; Trailing type reuse works
(assert-true "guard trailing type reuse"
  (try
    (guard "*" ["number" "string"] [1 "ok" 2 "ok2"])
    (catch [e] true)))

;; Quoted list inputs supported
(assert-null "guard quoted list input"
  (guard "*" '(number) '(1 2 3)))

;; First failure stops execution
(assert-eq "guard stops at first error"
  true
  (try
    (guard "*" ["number"] ["bad" "also bad"])
    (catch [e] true)))


;; ============================================================
;; Quasiquote / unquote / splice
;; ============================================================
(run-section "Quasiquote")

(assert-eq "quasiquote atom"
42
`42)

(assert-eq "quasiquote simple list"
'(1 2 3)
`(1 2 3))

(assert-eq "unquote expression"
'(1 3 3)
`(1 ~(+ 1 2) 3))

(assert-eq "splice-unquote"
'(1 2 3 4)
`(1 ~@(list 2 3) 4))

(assert-eq "nested quasiquote"
'(a (b 3))
`(a (b ~(+ 1 2))))

(assert-true "splice-unquote non-list throws"
(try
`(1 ~@123 4)
(catch [e] true)))

;; ============================================================
;; apply edge cases
;; ============================================================
(run-section "apply edge cases")

(assert-eq "apply user fn"
7
(apply add '(3 4)))

(assert-eq "apply variadic"
'(1 2 3)
(apply my-list '(1 2 3)))

(assert-eq "apply empty"
0
(apply + '()))

(assert-true "apply non-list throws"
(try
(apply + 123)
(catch [e] true)))

;; ============================================================
;; and/or semantics
;; ============================================================
(run-section "and/or semantics")

(assert-eq "and identity"
true
(and))

(assert-null "or identity"
(or))

(assert-eq "and returns last truthy"
99
(and true 1 99))

(assert-eq "or returns first truthy"
77
(or false null 77 88))

(def sidefx 0)

(and false (set! sidefx 123))
(assert-eq "and short-circuit side effects"
0
sidefx)

(or true (set! sidefx 456))
(assert-eq "or short-circuit side effects"
0
sidefx)

;; ============================================================
;; Keyword lookup syntax
;; ============================================================
(run-section "Keyword lookup")

(def km {:a 1 :b 2})

(assert-eq "keyword lookup exact"
1
(:a km))

(assert-eq "keyword lookup string fallback"
123
(:x {"x" 123}))

(assert-true "keyword missing throws"
(try
(:zzz km)
(catch [e] true)))

;; ============================================================
;; Function arity
;; ============================================================
(run-section "Function arity")

(assert-true "too few args"
(try
(+ 1)
(catch [e] true)))

(assert-true "too many args"
(try
(% 1 2 3)
(catch [e] true)))

(assert-eq "variadic zero args"
true
(try (my-list) (catch [e] true)))

(assert-eq "variadic one arg"
'(1)
(my-list 1))

;; ============================================================
;; recur edge cases
;; ============================================================
(run-section "recur edge cases")

(assert-eq "recur outside loop throws"
  "recur"
(try
(recur 1)
(catch [e] true)))

(assert-true "recur arity mismatch"
(try
(loop [x 1 y 2]
(recur 1))
(catch [e] true)))

;; ============================================================
;; Error propagation
;; ============================================================
(run-section "Error propagation")

(defn explode []
(throw "boom"))

(defn wrapper []
(explode))

(assert-eq "simple throw message"
"boom"
(try
(explode)
(catch [e] (:message e))))

(assert-eq "nested throw propagation"
"boom"
(try
(wrapper)
(catch [e] (:message e) )))

;; ============================================================
;; Macro edge cases
;; ============================================================
(run-section "Macro edge cases")

(defmacro unless2 [G__cond & G__body]
`(if ~G__cond
null
(do ~@G__body)))

(assert-eq "variadic macro"
42
(unless2 false
1
2
42))

(defmacro identity-macro [G__x1]
G__x1)

(assert-eq "macro returns atom"
123
(identity-macro 123))

;; ============================================================
;; Nested literal structures
;; ============================================================
(run-section "Nested literals")

(assert-eq "nested vectors"
'((1 2) (3 4))
'([1 2] [3 4]))

(assert-eq "nested maps"
{"a" {"b" 2}}
{"a" {"b" 2}})

(assert-eq "mixed nested structures"
{"nums" [1 2 3]}
{"nums" [1 2 3]})

;; ============================================================
;; set! failure cases
;; ============================================================
(run-section "set! failures")

(assert-true "set! undefined var"
(try
(set! DOES_NOT_EXIST 123)
(catch [e] true)))

;; ============================================================
;; Results
;; ============================================================
(println "")
(println "========================================")
(println (str "Results: " pass-count " passed, " fail-count " failed"))
(if (= fail-count 0)
  (println "All tests passed!")
  (println (str fail-count " tests FAILED")))
(println "========================================")
