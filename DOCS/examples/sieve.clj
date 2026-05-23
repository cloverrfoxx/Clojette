(ns sieve)

(defn prime? [n]
  (if (< n 2)
    false
    (loop [i 2]
      (cond
        (> (* i i) n) true
        (= (% n i) 0) false
        :else (recur (+ i 1))))))

(defn sieve [list]
  (filter prime? list))

(defn main [amount]
  (sieve (range 0 (+ 1 amount)))

(main 100)
