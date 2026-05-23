(ns word-count)

(def text "one two two three three three")

(def words (split text " "))

(defn count-word [word words]
  (count
    (filter (fn [w] (= w word)) words)))

(defn main []
  (println (count-word "three" words)))

(main)
