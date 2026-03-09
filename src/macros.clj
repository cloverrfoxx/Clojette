;;   Copyright (C) 2026 lattiahirvio
;;
;;   This file is part of Clojette.
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

;; Core standard library macros. These are important.
;; TODO: Add gensym in the macro expansion step
(defmacro defn [n# p# & b#]
  `(def ~n# (fn ~p# (do ~@b#))))

(defmacro loop [bindings# body#]
  `((fn [~@(take-keys bindings#)] ~body#)
    ~@(take-vals bindings#)))

(defmacro when [c# b#]
  `(if ~c# ~b# null))

(defmacro unless [cond body]
  `(if ~cond null ~body))

(defmacro -> [x & forms]
  (if (empty? forms)
    x
    ((fn [form rest-forms]
       ((fn [threaded]
          `(-> ~threaded ~@rest-forms))
        (if (list? form)
          `(~(car form) ~x ~@(cdr form))
          `(~form ~x))))
     (car forms)
     (cdr forms))))

(defmacro ->> [x & forms]
  (if (empty? forms)
    x
    ((fn [form rest-forms]
       ((fn [threaded]
          `(->> ~threaded ~@rest-forms))
        (if (list? form)
          `(~(car form) ~@(cdr form) ~x)
          `(~form ~x))))
     (car forms)
     (cdr forms))))

(defmacro cond [& clauses]
  (if (empty? clauses)
    null
    (if (= (car clauses) :else)
      (second clauses)
      `(if ~(car clauses) ~(second clauses)
         (cond ~@(rest (rest clauses)))))))

(defmacro doto [obj & forms]
  `(let [o# ~obj]
     ~@(map (fn [f] `(~(car f) o# ~@(cdr f))) forms)
     o#))
