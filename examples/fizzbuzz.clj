(ns fizzbuzz)

(defn main [number]
  (cond
    (= number 15) "fizzbuzz"
    (% number 3) "fizz"
    (% number 5) "buzz"))

(main 15)
