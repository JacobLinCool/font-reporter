# font-reporter

Generate report of a font.

Input formats: `ttf`, `otf`, `woff`, `woff2`
Output formats: `json`, `text`, `html`, `pdf`

## Example

See [example](example)

## Install

```sh
npm i -g font-reporter
```

## Usage

```sh
font-reporter --help
```

## Docker

There are two images are available:

- `jacoblincool/font-reporter:lite`: lightweight version, without PDF generator. (default output format: `HTML`)
- `jacoblincool/font-reporter:latest`: full version, with PDF generator. (default output format: `PDF`)

You can find them on [Docker Hub](https://hub.docker.com/r/jacoblincool/font-reporter/) or GHCR.

### Docker Usage

```sh
# Generate PDF reports of all fonts in the current directory
docker run --rm -v "$(pwd):/data" jacoblincool/font-reporter
```

```sh
# Generate HTML reports of all fonts in the current directory
docker run --rm -v "$(pwd):/data" jacoblincool/font-reporter -f html
```
