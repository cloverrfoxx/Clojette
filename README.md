# Clojette
Clojette is an opinionated and feature-full Clojure-like Lisp for GreyHack written in GreyScript/MiniScript. Clojette supports runtime-expanded macros, quasiquoting, splice unquoting, threading macros, and MiniScript interop. Many of the language features are implemented as they are in Clojure, so anyone familiar with Clojure will feel at home with Clojette. Clojette has keywords, let bindings, string literals, and other such features.

# Why?
I made Clojette in around 4 days. As you all know, GreyHack uses MiniScript as its scripting language. I absolutely loathe the language. What does a programmer do in that situation? He of course, makes his own... Clojette is a lisp for the simple reason that I started learning Lisp around a week ago and got the inspiration to write my own Lisp. I have been meaning to write my own language for the game for as long as I have known about the horrors of GreyScript. And so naturally, I wrote a Lisp for GreyScript. Clojette was written in around ~30 or so hours of active development time. The interpreter core was done on day 1 in around 3 hours, and additions such as macros were added on day 2. The current environment model is modelled after the Structure and Interpretation of Computer Programs (SICP) Lisp environment model. To know more, go read the book.

# Running the language
To run the language, copy `all.gs` into your game environment. Then build `all.gs`, and you'll have a Clojette runtime. To modify what files Clojette runs, you can easily modify it to load any file you want. Alternatively, you can use the REPL to import files using the `import` special form like this; `(import "/path/to/file.clj")`. In the future (possibly as early as 1.0.1) I will add better runtime usage. Currently the language includes the runtime and the standard library, along with the test suite.

# Syntax
For info on the syntax, refer to `DOCS.md`. It has comprehensive details on the language, its syntax, and its differences to Clojure.

# Roadmap
There are currently a few features that are needed.

1. Runtime gensym. Macros need this.
2. Runtime macroexpand.
3. Persistent vectors. I am quite sure that other peristent data structures could be useful too.
4. Stack traces to try/catch. This is simple to add.
5. `#{}`, `@` deref, and `#()` reader macros.
6. Expose `eval()` to the user.

# Contributing
Pull requests are welcome. To get to know the ins and outs of contributing, check out `CONTRIBUTING.md`. Also make sure to run the tests before making a pull requests. All tests should pass, and if they do not pass, any PR will not be accepted. To make sure regressions do not happen, the test suite MUST pass before a PR is accepted.

# Acknowledgements
Although I did not know about [Glosure](https://github.com/mahocitrus/Glosure) when I started the project, it is the first Lisp that was implemented in GreyScript. Big props to mahocitrus.

# Resources
Here are a few resources for learning Lisp. Clojette intentionally feels a lot like Clojure, so I am also linking Clojure resources here.


https://www.clojure.org/guides/getting_started

https://www.clojure.org/guides/learn/clojure

https://hypirion.com/musings/understanding-persistent-vector-pt-1

https://gigamonkeys.com/book/syntax-and-semantics.html

## Training problems
https://projecteuler.net/archives;page=1

## books
https://www.braveclojure.com/foreword/

https://annas-archive.gd/md5/ca4e2ea298f40bffd95757bda1eed297

https://gigamonkeys.com/book/

## Wikipedia articles...
https://en.wikipedia.org/wiki/Purely_functional_programming

https://en.wikipedia.org/wiki/Functional_programming

https://en.wikipedia.org/wiki/Lisp_(programming_language)

https://en.wikipedia.org/wiki/Clojure

## Implementing lisp:
https://norvig.com/lispy.html

https://norvig.com/jscheme.html

https://github.com/nukata/lisp-in-typescript

https://maryrosecook.com/blog/post/little-lisp-interpreter

https://github.com/Indy9000/lisper

[(in Japanese)](https://web.archive.org/web/20101007171742/http://www.aoky.net/articles/peter_norvig/lispy.htm)

https://zenn.dev/ytaki0801/articles/042cfa374223b3a5c03c

https://qiita.com/41semicolon/items/d59f00ebb70b14fdb4e3


