(ns fizzbuzz)

(defn div-15? [num] 
  (= 0 (mod num 3) (mod num 5)))

(defn main [number]
  (cond
    (div-15? number) "fizzbuzz"
    (% number 3) "fizz"
    (% number 5) "buzz"))

(main 15)
