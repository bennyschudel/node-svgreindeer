# SvgRenindeer

This little tools lets you render a folder of SVG's into PNG's.

The conversion part is based on the [svg2png](https://github.com/domenic/svg2png) from [@domenic](https://github.com/domenic).

## Usage

```bash
> svgreindeer [input_src] -o [output_dir]

  # custom scaling
> svgreindeer [input_src] -o [output_dir] -s [scale|0.1÷4]

  # remove base dir from output
> svgreindeer [input_src] -o [output_dir] -b [base_dir] -s [scale|0.1÷4]

  # custom style
> svgreindeer [input_src] -o [output_dir] --style='* { fill: chocolate; }'
```


## Config

Place a **svgreindeer.yml** within your EXECUTION folder.

```yaml
verbose: true
input_src: [input_src]
output_dir: [output_dir]
base_dir: [base_dir]
scale: [scale|0.1÷4]
style: |
  * { fill: chocolate; }
```

Feel free to hide your config file by adding a . in front of the filename.


## Custom styles

You can set a global custom style that is injected into the svg before rendering.
Additionally you can specify a **FOLDER_NAME.css** or **FILE_NAME.svg.css** file.

example:
```
.
├── icons
│   ├── icon-arrow.svg
│   ├── icon-arrow.svg
│   ├── icon-bubble.svg
│   ├── icon-clock.svg
│   └── icon-clock.svg.css
└── icons.css
```


## About

Feedback welcome! Contact me [@bennyschudel](https://github.com/bennyschudel) or follow me on [twitter](http://twitter.com/bennyschudel).


Copyright (c) 2014 Benny Schudel - [MIT-License](https://raw.github.com/bennyschudel/node-svgmule/master/LICENSE)