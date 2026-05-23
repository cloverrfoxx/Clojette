(ns palindrome)

(defn palindrome? [word]
  (= word (str (reverse (seq word)))))

(defn main [word]
  (if (palindrome? word)
    (println
      (str "the word " word " is a palindrome!"))
    (println
      (str "the word " word " is not a palindrome!"))))
