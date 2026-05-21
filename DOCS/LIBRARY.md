# Using Clojette as a library

You've read the language reference. Now, you want to use Clojette as a library or as a programming tool? Great. This document will go over the how to use Clojette in your programs, and how to structure Clojette programs.

# Installing the language
Installing Clojette for use is very simple. There are two ways you can install the language. The first way is easier and recommended to those who just want to use the language. The second way is for developers who want to develop with the language.

If you have already installed Clojette, you may want to skip to #writing-clojette-programs

## ...as a prebuilt runtime
You can copy the `all.gs` file into your game, and then you can build said file using `CodeEditor.exe` or the `build` command. **Remember to mark the executable as importable!**.

## ...from source
For this, you may want to install [Greybel](https://github.com/ayecue/greybel-js). Greybel will help with the process of installing the language, although it is not strictly necessary.

1. Go into `src/` and copy each file into the folder (IN THE GAME!) you want to build the language from. While making the various files, make sure to name them .src as the game expects that.
2. Edit `clojette.src`'s import lines. You should change `<user>` to the name of the user you use in the game. For example if your username was "john", you would change each mention of `<user>` into `john`.
3. Open `clojette.src` in CodeEditor.exe and build it. **MAKE SURE TO MARK THE FILE AS IMPORTABLE!**
4. Name the resulting file as `clojette.so`. Place it into `/lib/`
5. Make a new folder under `/lib/` named `clojette`. Now copy the files named `macros.clj` and `stdlib.clj` in to `/lib/clojette/`. All Clojette libraries will be expected to be added here. Each time you embed Clojette into a project, you should look at `/lib/clojette.so`.
6. Your installation of Clojette is ready. You can now embed Clojette in your program. Now you can build `clojette-repl.src` to get a Clojette Read-Eval-Print loop. The source file also demonstrates how to embed Clojette into your own code.

The runtime you are using is responsible for loading the standard library, and any other libraries you may need by default. It is recommended you use the default runtime. 

At the end of everything you should end up with these files:
```
/lib/clojette.so
/lib/clojette/macros.clj
/lib/clojette/stdlib.clj
```

# Writing Clojette programs
Now, let's talk a bit about the structure of Clojette programs.

## Structure
By default Clojette runs inside the default namespace, `user`. In your programs, you might want to make your own namespaces that correspond to the file you are writing your code in. This can be achieved by using `ns`. `ns` creates a new namespace, which can be accessed by its name.

The main function should be named `main`. Of course that function can be named anything, but that is the language convention. You'll need to call it manually yourself similar to Python, as the interpreter doesn't enforce this. 

### Project structure
Projects are expected to have some structure. Here is the default project structure:
```
project/
project/src/
project/src/utils/
project/src/main.clj

```

### Hello World
Let's write our first program, shall we? Writing a hello world in Clojette is quite simple. As you saw in the language reference, you can simply call `println`, but we're going to write a simple program that has a function!

```clojure
(ns hello)

(defn main []
  (println "Hello from Clojette!"))

(main)
```

Here we are creating a namespace called `hello` and defining a function named `main`. The function takes no arguments and prints "Hello from Clojette!". After that, we call the function. Pretty simple, all in all.

## Importing
Clojette has multiple tools that help creating modular programs. One of the most useful ones is the `import` special form. You can invoke `import` by giving it a path to whatever Clojette file you want. The path can be relative *or* absolute. How `import` works, is it evaluates all the code in the given file. If there is code inside the imported file besides function and variable definitions, that code will get ran. In the future Clojette will get better tools such as `:require`.


# Troubleshooting
Here are a few common pitfalls you might encounter. Hopefully not though...

## "I can't build the REPL"
If you can't build the REPL, you might have forgotten to mark clojette.so as importable.

## "I can't use any macros laid out in the usage manual"
You might not have loaded the `macros.clj` file. 

## 
