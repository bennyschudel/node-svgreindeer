# SvgRenindeer

This little tools lets you render a folder of SVG's into PNG's.

The conversion part is based on the [svg2png](https://github.com/domenic/svg2png) from [@domenic](https://github.com/domenic).

## Usage

```shell
> svgreindeer [input_dir] [output_dir]

    // custom scaling
> svgreindeer [input_dir] [output_dir] -s [scale|0.1÷4]

    // custom style
> svgreindeer [input_dir] [output_dir] --style='* { fill: chocolate; }'
```


## Config

Place a *svgreindeer.yml* within your EXECUTION folder.

```
input_dir: [input_dir]
output_dir: [output_dir]
scale: [scale|0.1÷4]
style: |
  * { fill: chocolate; }
verbose: true
```

Feel free to hide your config file by adding a . in front of the filename.


## Custom styles

You can set a global custom style that is injected into the svg before rendering.
Additionally you can specify a **[FOLDER_NAME].css** or **[FILE_NAME].svg.css** file.

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


## Author

02.04.2014
Benny Schudel (@benny)