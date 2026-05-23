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

;; List operations - stack-safe via loop/recur
(defn map [f coll]
  (loop [remaining coll acc []]
    (if (empty? remaining)
      (reverse acc)
      (recur (cdr remaining) (cons (f (car remaining)) acc)))))

(defn filter [pred coll]
  (loop [remaining coll acc []]
    (if (empty? remaining)
      (reverse acc)
      (if (pred (car remaining))
        (recur (cdr remaining) (cons (car remaining) acc))
        (recur (cdr remaining) acc)))))

(defn reduce [f init coll]
  (loop [remaining coll acc init]
    (if (empty? remaining)
      acc
      (recur (cdr remaining) (f acc (car remaining))))))

(defn every? [pred coll]
  (loop [remaining coll]
    (if (empty? remaining)
      true
      (if (pred (car remaining))
        (recur (cdr remaining))
        false))))

(defn some? [pred coll]
  (loop [remaining coll]
    (if (empty? remaining)
      false
      (if (pred (car remaining))
        true
        (recur (cdr remaining))))))

(defn nth [coll n]
  (loop [remaining coll i n]
    (if (= i 0)
      (car remaining)
      (recur (cdr remaining) (- i 1)))))

(defn last [coll]
  (loop [remaining coll]
    (if (empty? (cdr remaining))
      (car remaining)
      (recur (cdr remaining)))))

(defn reverse [coll]
  (loop [remaining coll acc []]
    (if (empty? remaining)
      acc
      (recur (cdr remaining) (cons (car remaining) acc)))))

(defn range [start end]
  (loop [i start acc []]
    (if (>= i end)
      acc
      (recur (+ i 1) (cons i acc)))))

(defn concat [a b]
  (loop [remaining (reverse a) acc b]
    (if (empty? remaining)
      acc
      (recur (cdr remaining) (cons (car remaining) acc)))))

(defn flatten [coll]
  (loop [remaining coll acc []]
    (if (empty? remaining)
      (reverse acc)
      (if (list? (car remaining))
        (recur (concat (car remaining) (cdr remaining)) acc)
        (recur (cdr remaining) (cons (car remaining) acc))))))

(defn take [n coll]
  (loop [remaining coll i n acc []]
    (if (or (= i 0) (empty? remaining))
      (reverse acc)
      (recur (cdr remaining) (- i 1) (cons (car remaining) acc)))))

(defn drop [n coll]
  (loop [remaining coll i n]
    (if (or (= i 0) (empty? remaining))
      remaining
      (recur (cdr remaining) (- i 1)))))

(defn first [xs]
  (if (empty? xs)
    null
    (car xs)))

(defn seq [x]
  (cond
    (null? x) null

    (list? x)
    (if (empty? x)
      null
      x)

    (string? x)
    (let [len (count x)]
      (loop [i 0
             acc []]
        (if (>= i len)
          (if (empty? acc) null acc)
          (recur (+ i 1)
                 (conj acc (subs x i (+ i 1)))))))

    :else
    null))

;; Math utils
(defn even? [n] (= (% n 2) 0))
(defn odd? [n] (not (even? n)))
(defn zero? [n] (= n 0))
(defn pos? [n] (> n 0))
(defn neg? [n] (< n 0))
(defn inc [n] (+ n 1))
(defn dec [n] (- n 1))

(defn max [x & xs]
  (reduce
    (fn [a b]
      (if (> a b) a b))
    x
    xs))

;; Function utils
(defn identity [x] x)
(defn constantly [x] (fn [& _] x))
(defn complement [f] (fn [& args] (not (apply f args))))
(defn comp [f g] (fn [x] (f (g x))))

;; I/O
(defn slurp [path]
  (let [computer (.host_computer (get_shell))
        file (.File computer path)]
    (if (null? file)
      (throw (str "slurp: no such file: " path))
      (let [content (.get_content file)]
        (if (null? content)
          (throw (str "slurp: cannot read file (binary or no permission): " path))
          content)))))

(defn spit [path content]
  (let [computer (.host_computer (get_shell))
        existing (.File computer path)]
    (if (null? existing)
      ;; File doesn't exist, so we create it first
      (let [parent (parent_path path)
            fname  (last (split path "/"))
            result (.touch computer parent fname)]
        (if (string? result)
          (throw (str "spit: could not create file: " result))
          (.set_content (.File computer path) content)))
      (.set_content existing content))))

(defn spit-append [path content]
  (let [existing (try (slurp path) (catch [_] ""))]
    (spit path (str existing content))))

(defn file-seq [path]
  (let [computer (.host_computer (get_shell))
        entry    (.File computer path)]
    (if (null? entry)
      (throw (str "file-seq: path not found: " path))
      (if (.is_folder entry)
        (let [files   (.get_files   entry)
              folders (.get_folders entry)]
          (concat
            [entry]
            (reduce concat []
              (map (fn [f] (file-seq (.path f))) folders))
            (if (null? files) [] files)))
        [entry]))))

(defn file-exists? [path]
  (let [computer (.host_computer (get_shell))]
    (not (null? (.File computer path)))))

(defn make-parents [path]
  (let [computer (.host_computer (get_shell))
        segments (filter (fn [s] (not (= s ""))) (split path "/"))]
    (loop [parts segments current ""]
      (when (not (empty? parts))
        (let [next-path (str current "/" (first parts))]
          (when (null? (.File computer next-path))
            (.create_folder computer current (first parts)))
          (recur (rest parts) next-path))))))

(defn path-join [& parts]
  (let [joined (join "/" parts)]
    (replace joined "//" "/")))

(defn file-name [path]
  (last (split path "/")))

(defn file-ext [path]
  (let [name (file-name path)
        dot  (last-index-of name ".")]
    (if (< dot 0) "" (subs name (inc dot)))))

(defn strip-ext [path]
  (let [dot (last-index-of path ".")]
    (if (< dot 0) path (subs path 0 dot))))

;; String functions
(defn starts-with? [s prefix]
  (= (subs s 0 (count prefix)) prefix))

(defn ends-with? [s suffix]
  (let [offset (- (count s) (count suffix))]
    (if (< offset 0) false
      (= (subs s offset) suffix))))

(defn blank? [s]
  (or (null? s) (= (trim s) "")))

(defn pad-left [s n ch]
  (let [deficit (- n (count s))]
    (if (<= deficit 0) s
      (str (join "" (map (fn [_] ch) (range 0 deficit))) s))))

(defn pad-right [s n ch]
  (let [deficit (- n (count s))]
    (if (<= deficit 0) s
      (str s (join "" (map (fn [_] ch) (range 0 deficit)))))))

(defn capitalize [s]
  (if (blank? s) s
    (str (upper-case (subs s 0 1)) (lower-case (subs s 1)))))

;; Very useful for parsing GreyScript output:
(defn lines [s]
  (split s "\n"))

(defn unlines [coll]
  (join coll "\n"))

;; Collection utilities
;; Clojure: (partition 3 [1 2 3 4 5 6]) -> ((1 2 3) (4 5 6))
(defn partition [n coll]
  (loop [remaining coll acc []]
    (if (empty? remaining)
      acc
      (recur (drop n remaining)
             (conj acc (take n remaining))))))

;; (group-by even? [1 2 3 4]) -> {true [2 4] false [1 3]}
(defn group-by [f coll]
  (reduce
    (fn [m x]
      (let [k (f x)]
        (assoc m k (conj (get m k []) x))))
    {}
    coll))

;; (frequencies [:a :b :a :c :a :b]) -> {:a 3 :b 2 :c 1}
(defn frequencies [coll]
  (reduce
    (fn [m x] (assoc m x (inc (get m x 0))))
    {}
    coll))

;; (zip [1 2 3] [:a :b :c]) -> [[1 :a] [2 :b] [3 :c]]
(defn zip [a b]
  (map (fn [pair] pair)
       (map list a b)))

;; (zipmap [:a :b] [1 2]) -> {:a 1 :b 2}
(defn zipmap [keys vals]
  (reduce
    (fn [m pair] (assoc m (first pair) (second pair)))
    {}
    (zip keys vals)))

;; (distinct [1 2 1 3 2]) -> [1 2 3]
(defn distinct [coll]
  (reduce
    (fn [acc x]
      (if (some? (fn [y] (= x y)) acc)
        acc
        (conj acc x)))
    []
    coll))

;; (flatten-1 [[1 2] [3 4]]) — one level only, unlike flatten
(defn flatten-1 [coll]
  (reduce concat [] coll))

;; (index-by :name [{:name "a"} {:name "b"}])
;; -> {"a" {:name "a"} "b" {:name "b"}}
(defn index-by [f coll]
  (reduce (fn [m x] (assoc m (f x) x)) {} coll))

;; (sorted-by :age [{:age 3} {:age 1}])
(defn sorted-by [f coll]
  (let [pairs (map (fn [x] [(f x) x]) coll)]
    ;; bubble sort — good enough for small GreyHack lists
    (map second
         (reduce
           (fn [acc _]
             (loop [xs acc result []]
               (if (< (count xs) 2)
                 (concat result xs)
                 (if (<= (first (first xs)) (first (second xs)))
                   (recur (rest xs) (conj result (first xs)))
                   (recur (cons (first xs) (rest (rest xs)))
                          (conj result (second xs)))))))
           pairs
           (range 0 (count pairs))))))

;; Map operations
;; (select-keys {:a 1 :b 2 :c 3} [:a :c]) -> {:a 1 :c 3}
(defn select-keys [m ks]
  (reduce (fn [acc k]
            (if (contains? m k)
              (assoc acc k (get m k))
              acc))
          {} ks))

;; (rename-keys {:a 1} {:a :b}) -> {:b 1}
(defn rename-keys [m kmap]
  (reduce (fn [acc [old-k new-k]]
            (if (contains? acc old-k)
              (-> acc
                  (assoc new-k (get acc old-k))
                  (dissoc old-k))
              acc))
          m
          (zip (keys kmap) (vals kmap))))

;; (update {:count 0} :count inc)
(defn update [m k f & args]
  (assoc m k (apply f (cons (get m k) args))))

;; (merge {:a 1} {:b 2} {:a 99}) -> {:a 99 :b 2}
(defn merge [& maps]
  (reduce (fn [acc m]
            (reduce (fn [a k] (assoc a k (get m k)))
                    acc
                    (keys m)))
          {}
          maps))

(defn memoize [f]
  (let [cache (hash-map)]
    (fn [& args]
      (let [k (str args)]
        (if (contains? cache k)
          (get cache k)
          (let [result (apply f args)]
            (set! cache (assoc cache k result))
            result))))))

;; Atoms!
(defn atom [init]
  (hash-map :value init))

(defn deref [a]
  (get a :value))

(defn swap! [a f & args]
  (let [new-val (apply f (cons (deref a) args))]
    (set! a (assoc a :value new-val))
    new-val))

(defn reset! [a v]
  (set! a (assoc a :value v))
  v)

;; Transducers
;; Single-pass map+filter+reduce
(defn transduce [xforms f init coll]
  (let [xf (apply comp xforms)]
    (reduce (xf f) init coll)))

(defn mapping [f]
  (fn [rf]
    (fn [acc x] (rf acc (f x)))))

(defn filtering [pred]
  (fn [rf]
    (fn [acc x] (if (pred x) (rf acc x) acc))))

(defn taking [n]
  (let [count (atom 0)]
    (fn [rf]
      (fn [acc x]
        (if (< @count n)
          (do (set! count (inc @count)) (rf acc x))
          acc)))))

(defn keep [f coll]
  (filter (fn [x] (not (null? x)))
          (map f coll)))

(defn mapcat [f coll]
  (flatten-1 (map f coll)))

;; Error handling
;; Wrap a value as ok or err, no exceptions to catch at call site
(defn ok [v]   (hash-map :ok true  :value v))
(defn err [msg](hash-map :ok false :error msg))
(defn ok? [r]  (get r :ok))

;; Greyhack specific functions
(defn open-ports [computer]
  (filter (fn [p] (not (.is_closed p)))
          (.get_ports computer)))

(defn root? []
  (= (active_user) "root"))

(defn try-connect [ip port user pass]
  (try
    (let [sh (.connect_service (get_shell) ip port user pass)]
      (if (null? sh)
        (throw "null shell")
        sh))
    (catch [e] null)))

(defn get-in [m path]
  (reduce (fn [cur k]
            (if (null? cur) null
              (get cur k)))
          m path))

(defn assoc-in [m path v]
  (if (= (count path) 1)
    (assoc m (first path) v)
    (assoc m (first path)
             (assoc-in (get m (first path) {})
                       (rest path) v))))

(defn update-in [m path f & args]
  (assoc-in m path
    (apply f (cons (get-in m path) args))))

(defn retry [n f & args]
  (loop [attempts n last-err null]
    (if (= attempts 0)
      (throw (str "retry: exhausted after " n " attempts: " last-err))
      (let [result (try (apply f args)
                        (catch [e] e))]
        (if (null? (:message result))
          result
          (recur (dec attempts) (:message result)))))))
