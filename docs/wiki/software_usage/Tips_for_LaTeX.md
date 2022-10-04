---
title: Tips for paper writing with LaTeX
authors: 朱嘉欣
comments: true
---

# Tips for paper writing with LaTeX

## cross referece

What should we do if we want to cite the figures or tables in supplmentary material? Use the `xr` package!

Firstly, put the following into the preamble of the SI:

```latex
%Number supplementary material with an S
\renewcommand{\thepage}{S\arabic{page}}
\renewcommand{\thesection}{S\arabic{section}} 
\renewcommand{\thetable}{S\arabic{table}} 
\renewcommand{\thefigure}{S\arabic{figure}}
\renewcommand{\theequation}{S\arabic{equation}}
```

Then, you can refer to the Figures with `Figure Sxxx` in your SI file. To cite them in your main text, you can use `\ref`, by adding the following to the main file:

```latex
%%Crossreferencing to the SI
\usepackage{xr}
\externaldocument[SI-]{<path to folder in which you have the SI>}
```

Now you can reference figures in the SI as 

```latex
\ref{SI-<label you gave the figure in the SI>}
```

Be cautious: You need to recompile both the paper and the SI after doing so.

For overleaf users, please refer to [here](https://www.overleaf.com/learn/how-to/Cross_referencing_with_the_xr_package_in_Overleaf).

**Thanks for the suggestion from Dr. Katharina Doblhoff-Dier in Leiden University.**

