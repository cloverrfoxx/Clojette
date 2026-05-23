(ns fibonacci)

(defn fibonacci [a b count]
  (if (= count 100)
    nil
    (do
      (println a)
      (fibonacci b (+ a b) (+ count 1)))))

(defn main []
  (fibonacci 0 1 0))

(main)
