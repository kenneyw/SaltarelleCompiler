# Saltarelle C# to JavaScript Compiler #

This compiler can compile C# into JavaScript. By doing this you can leverage all the advantages of C#, such as static type checking, IntelliSense (the kind that works) and lambda expressions when writing code for the browser. **Never, ever, experience an 'object does not support this property or method' again!!**.

Saltarelle is not an entire framework for web application development (such as GWT), rather it consists of a compiler and a small runtime library that only contains the things necessary for the language features to work. It is, however, designed with interoperability in mind so you can use any existing JavaScript framework with it. It comes with support for jQuery, and other libraries can be used either by authoring an import library (which is just a class / set of classes with special attributes on their members) or by using they 'dynamic' feature of C# 4.

The compiler comes as a command line utility, with options similar to those of csc.exe, and as an MSBuild task (and a corresponding .targets file). 

To get started compiling, see the Getting Started guide in the wiki.

## Current State ##

The compiler currently works quite well. I still need to test it more in practice before I am ready to release it officially, but there are no known issues except for the features that are on the unsupported list.

### Supported features ###

Many, hopefully everything that is not on the unsupported list. For example, it does support the following C# features:

* ref parameters,
* Type inference,
* generics,
* anonymous types,
* lambdas,
* user-defined operators,
* method and constructor overloads,
* Object and collection initializers,
* foreach,
* using,
* Exception handling (although the handling of script exceptions could be improved in the runtime library),
* Named and default arguments,
* C# Variable capture semantics, so if you declare a variable in an inner block and capture it, the captured variable will not be changed when the variable is changed by an outer scope,
* Ensures that expressions are always evaluated left to right, as the C# standard specifies,
* Automatically implemented properties (and events),
* Nullable types (and lifted operators),
* ... and many more.

### Unsupported features ###

Currently it does not support

* LINQ (as in the Enumerable class that contains all extension methods). This will be solved by writing an import library for [JSLINQ](http://jslinq.codeplex.com/) or [Linq.js](http://linqjs.codeplex.com/).
* Query expressions (eg. from a in b select a.name).
* goto (incl. goto case).
* yield break / yield return.
* await (C# 5).
* Multi-dimensional arrays.
* Expression trees
* operator true / operator false (does anybody use these?)
* "extern alias"
* Clipped integer type (short/byte). It will correctly use integers such that when you assign a double to an integer, or divide two integers, the result will be an integer, but it does not support an integer type which can only have values in the range 0-65535
* Checked/unchecked
* User-defined value types (structs)

All these things are on the todo list to address, in the approximate order above, but not until after the official release.

Also, it does not support things that just don't make sense in JavaScript, such as

* pointers
* lock (object) {}

## Credits ##

Saltarelle builds on the tradition of compiling C# to JavaScript pioneered by Script# [https://github.com/nikhilk/scriptsharp](Script#), and also uses a modified version of that project's runtime library. The metadata used to create import libraries is also the same as in Script#.

All analysis of the C# code is done using [https://github.com/icsharpcode/NRefactory](NRefactory), which in turn uses mcs (the compiler from the [http://www.mono-project.com](mono) project and (https://github.com/jbevain/cecil)[Mono.Cecil].

## License ##

The entire project is licensed under the [http://www.apache.org/licenses/LICENSE-2.0.html](Apache License 2.0), which is a [http://www.apache.org/foundation/license-faq.html#WhatDoesItMEAN](very permissive) license, so there is no issue using the software in any kind of application, commercial or non-commercial. The reason for this license is that it is the one used in the runtime library (which is licensed by Nikhil Kothari, not me).